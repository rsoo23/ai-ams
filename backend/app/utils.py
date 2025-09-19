import os
from fastapi import HTTPException


def validate_user_id(user_id: str):
	if not user_id or user_id.__len__() == 0:
		raise HTTPException(status_code=400, detail="Invalid user_id")

def validate_filename(filename: str):
	if not filename:
		raise HTTPException(status_code=400, detail="Filename cannot be empty.")
	allowed_extensions = {".pdf", ".png", ".jpg", ".jpeg"}
	file_extension = os.path.splitext(filename)[1].lower()
	if file_extension not in allowed_extensions:
		raise HTTPException(status_code=400, detail="Invalid file type. Only PDF, PNG, and JPEG are allowed.")