import boto3
from app.database import get_db
from sqlalchemy.orm import Session
from app.crud.crud import AccountCRUD
from .bedrock_endpoints import identify_transactions
from .textract_endpoints import extract_text_from_pdf
from app.utils import validate_user_id, validate_filename
from app.models.schemas import AccountSchema, PromptSchema
from fastapi import APIRouter, UploadFile, HTTPException, Depends
from app.config import AWS_REGION, S3_BUCKET_NAME

FILE_SIZE_LIMIT = 10 * 1024 * 1024  # 10MB

router = APIRouter()
s3_client = boto3.client('s3', region_name=AWS_REGION)

@router.get("/accounts", response_model=list[AccountSchema])
async def list_accounts(db: Session = Depends(get_db)):
	accounts = AccountCRUD.get_accounts(db)
	return accounts

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

		return {
			"filename": upload_details["filename"],
			"s3_key": upload_details["s3_key"],
			"data": llm_response["response"],
		}

	except Exception as e:
		raise HTTPException(status_code=500, detail=f"Error uploading/processing file: {str(e)}")

@router.post("/s3-store-file")
async def upload_to_s3(user_id: str, file_name: str, file_content: bytes):
	"""
	Upload a file to S3 after validation (PDF or image, max size 10MB).
	Example frontend call:
		POST /v0/db/s3-store-file
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
			"filename": file_name,
			"s3_key": s3_key,
			"user_id": user_id
		}
	except Exception as e:
		raise HTTPException(status_code=500, detail=f"Error uploading file: {str(e)}")

@router.get("/s3-list-files")
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

@router.get("/test")  # TEST ENDPOINT
async def test():
	return {"data": ["data0", "data1", "data2"]}