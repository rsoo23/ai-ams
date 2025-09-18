import os

RDS_ENDPOINT = os.getenv('RDS_ENDPOINT', '')
RDS_DB_NAME = os.getenv('RDS_DB_NAME', '')
RDS_USERNAME = os.getenv('RDS_USERNAME', '')
RDS_PASSWORD = os.getenv('RDS_PASSWORD', '')
AWS_REGION = 'as-southeast-1'
S3_BUCKET_NAME = os.getenv('S3_BUCKET_NAME', '')
S3_KEY = os.getenv('S3_KEY', '')