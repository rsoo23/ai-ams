import boto3
from app.config import AWS_REGION

# textract_client = boto3.client('textract', region_name=AWS_REGION)
# s3_client = boto3.client('s3', region_name=AWS_REGION)

# def extract_text_from_document(s3_bucket: str, s3_key: str) -> str:
#     """
#     Extract text from a document in S3 using Textract.
#     Args:
#         s3_bucket: S3 bucket name (e.g., 'my-bucket').
#         s3_key: S3 object key (e.g., 'docs/file.pdf').
#     Returns: Extracted text as a string.
#     """
#     response = textract_client.detect_document_text(
#         Document={'S3Object': {'Bucket': s3_bucket, 'Name': s3_key}}
#     )
#     text = ' '.join([block['Text'] for block in response['Blocks'] if block['BlockType'] == 'LINE'])
#     return text

def service_test():
	return "Some text extracted"