import json
import boto3
from app.database import get_db
from app.models.models import JournalEntry
from sqlalchemy.orm import Session, joinedload
from fastapi.responses import StreamingResponse
from .textract_endpoints import extract_text_from_pdf
from app.crud.crud import AccountCRUD, JournalEntryCRUD
from app.utils import validate_user_id, validate_filename
from fastapi import APIRouter, UploadFile, HTTPException, Depends
from .bedrock_endpoints import identify_transactions, validate_transaction
from app.models.schemas import AccountSchema, PromptSchema, JournalEntrySchema, JournalEntryLineSchema
from app.config import AWS_REGION, S3_BUCKET_NAME

FILE_SIZE_LIMIT = 10 * 1024 * 1024  # 10MB

router = APIRouter()
s3_client = boto3.client('s3', region_name=AWS_REGION)

@router.get("/accounts", response_model=list[AccountSchema])
async def list_accounts(db: Session = Depends(get_db)):
	accounts = AccountCRUD.get_accounts(db)
	return accounts


### MAIN FLOW ENDPOINTS ###

@router.post("/upload-and-process")
async def upload_and_process(user_id: str, file: UploadFile, db: Session = Depends(get_db)):
	try:
		file_name = file.filename
		file_content = await file.read()
		if not file_content:
			raise HTTPException(status_code=400, detail="Empty file uploaded.")

		upload_details = await upload_to_s3(user_id, file_name, file_content)
		extraction_details = await extract_text_from_pdf(file_content)
		accounts = await list_accounts(db)
		llm_response = await identify_transactions(PromptSchema(message=extraction_details["data"]), accounts)

		try:
			llm_response_json = json.loads(llm_response["response"])
			journal_entries = JournalEntrySchema(**llm_response_json[0])
		except json.JSONDecodeError:
			raise HTTPException(status_code=500, detail="LLM response is not valid JSON.")

		validation = await validate_transaction(PromptSchema(message=llm_response["response"]))

		return {
			"s3_key": upload_details["s3_key"],
			"data": journal_entries,
			"validation": validation
		}

	except Exception as e:
		raise HTTPException(status_code=500, detail=f"Error uploading/processing file: {str(e)}")


### RDS JOURNAL ENTRY ENDPOINTS ###

@router.get("/journal-entry")
async def get_journal_entries(db: Session = Depends(get_db)):
	try:
		entries = db.query(JournalEntry).options(joinedload(JournalEntry.lines)).all()
		return [
			JournalEntrySchema(
				date=entry.date.isoformat(),
				reference=entry.reference,
				description=entry.description,
				lines=[
					JournalEntryLineSchema(
						account_code=line.account_code,
						debit=line.debit,
						credit=line.credit,
						description=line.description,
					)
					for line in entry.lines
				]
			)
			for entry in entries
		]
	except Exception as e:
		raise HTTPException(status_code=500, detail=f"Error fetching journal entries: {str(e)}")

@router.post("/journal-entry")
async def submit_journal_entry(journal_entry: JournalEntrySchema, db: Session = Depends(get_db)):
	try:
		with db.begin():
			entry = JournalEntryCRUD.create_journal_entry(
				db=db,
				date=journal_entry.date,
				reference=journal_entry.reference,
				description=journal_entry.description
			)

			for line in journal_entry.lines:
				JournalEntryCRUD.add_journal_line(
					db=db,
					journal_entry_id=entry.id,
					account_code=int(line.account_code),
					debit=line.debit,
					credit=line.credit,
					description=line.description
				)
		db.refresh(entry)
		return {"status": "success"}
	except Exception as e:
		db.rollback()
		raise HTTPException(status_code=500, detail=f"Error submitting journal entry: {str(e)}")


### S3 ENDPOINTS ###

@router.get("/s3")
async def get_s3_object(s3_key: str):
	s3_response = s3_client.get_object(Bucket=S3_BUCKET_NAME, Key=s3_key)
	return StreamingResponse(s3_response['Body'], media_type='application/pdf', headers={"Content-Disposition": f"inline; filename={s3_key.split('/')[-1]}"})

@router.post("/s3")
async def upload_to_s3(user_id: str, file_name: str, file_content: bytes):
	"""
	Upload a file to S3 after validation (PDF or image, max size 10MB).
	Example frontend call:
		POST /v0/db/s3
		Form-data: file=@path/to/file.pdf
		Response: {"filename": "file.pdf", "s3_bucket": "my-bucket", "s3_key": "documents/{userId}/file.pdf", "user_id": "{userId}"}
	"""
	try:
		validate_user_id(user_id)
		validate_filename(file_name)

		if len(file_content) > FILE_SIZE_LIMIT:
			raise HTTPException(status_code=400, detail="File size exceeds 10MB limit.")

		s3_key = f"documents/{user_id}/{file_name}"
		s3_client.put_object(Bucket=S3_BUCKET_NAME, Key=s3_key, Body=file_content)
		
		return {
			"s3_key": s3_key,
			"user_id": user_id
		}
	except Exception as e:
		raise HTTPException(status_code=500, detail=f"Error uploading file: {str(e)}")

@router.get("/s3-list")
async def list_user_files(user_id: str):
	"""
	List all files for a given user in S3.
	Example frontend call:
		GET /v0/db/s3-list-files?user_id={userId}
		Response: {"files": ["file1.pdf", "image1.png"]}
	"""
	try:
		validate_user_id(user_id)

		prefix = f"documents/{user_id}/"
		response = s3_client.list_objects_v2(Bucket=S3_BUCKET_NAME, Prefix=prefix)
		files = []
		if 'Contents' in response:
			for obj in response['Contents']:
				filename = obj['Key'].replace(prefix, '', 1)
				if filename:  # Exclude the prefix folder itself
					files.append(filename)

		return {"files": files}
	except Exception as e:
		raise HTTPException(status_code=500, detail=f"Error listing files: {str(e)}")