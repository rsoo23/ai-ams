from fastapi import APIRouter, Body, HTTPException

router = APIRouter()

# @router.post("/extract-text")
# async def extract_text(s3_bucket: str = Body(...), s3_key: str = Body(...)):
#     """
#     Extract text from a document in S3 using AWS Textract.
#     Example frontend call:
#         POST /api/v1/textract/extract-text
#         Body: {"s3_bucket": "my-bucket", "s3_key": "docs/file.pdf"}
#         Response: {"extracted_text": "Sample text...", "confidence": 0.95}
#     """
#     from app.services.textract import extract_text_from_document
#     try:
#         text = extract_text_from_document(s3_bucket, s3_key)
#         if not text:
#             raise HTTPException(status_code=404, detail="No text extracted")
#         return {"extracted_text": text, "confidence": 0.95}  # Mock confidence
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Textract error: {str(e)}")

@router.get("/test") # TEST ENDPOINT
async def test():
    from app.services.textract import service_test 
    return {"text": service_test()}