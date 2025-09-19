import os
import boto3
from fastapi import APIRouter, UploadFile, File, HTTPException

from config import AWS_REGION, S3_BUCKET_NAME


router = APIRouter()
s3_client = boto3.client('s3', region_name=AWS_REGION)

@router.post("/store-s3")  # UNTESTED
async def upload_to_s3(user_id: str, file: UploadFile = File(...)):
    """
    Upload a file to S3 after validation (PDF or image, max size 10MB).
    Example frontend call:
        POST /v0/db/store-s3
        Form-data: file=@path/to/file.pdf
        Response: {"filename": "file.pdf", "s3_bucket": "my-bucket", "s3_key": "documents/{userId}/file.pdf", "user_id": "{userId}"}
    """
    try:
        if not user_id or user_id.__len__() == 0:
            raise HTTPException(status_code=400, detail="Invalid user_id")
        allowed_extensions = {".pdf", ".png", ".jpg", ".jpeg"}
        file_extension = os.path.splitext(file.filename)[1].lower()
        if file_extension not in allowed_extensions:
            raise HTTPException(status_code=400, detail="Invalid file type. Only PDF, PNG and JPEG are allowed.")

        file_content = await file.read()
        if len(file_content) > 10 * 1024 * 1024:  # 10MB limit
            raise HTTPException(status_code=400, detail="File size exceeds 10MB limit.")

        s3_key = f"documents/{user_id}/{file.filename}"
        s3_client.put_object(Bucket=S3_BUCKET_NAME, Key=s3_key, Body=file_content)
        
        return {
            "filename": file.filename,
            "s3_bucket": S3_BUCKET_NAME,
            "s3_key": s3_key,
            "user_id": user_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"S3 upload error: {str(e)}")

@router.get("/test")  # TEST ENDPOINT
async def test():
    return {"data": ["data0", "data1", "data2"]}