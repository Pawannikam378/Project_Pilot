import os
import uuid
import shutil
from fastapi import UploadFile
from ..config import settings
import boto3

def save_upload_file(upload_file: UploadFile) -> str:
    # If Demo Mode or No AWS Keys, save locally
    if settings.DEMO_MODE or not settings.AWS_BUCKET_NAME:
        if not os.path.exists(settings.LOCAL_UPLOAD_DIR):
            os.makedirs(settings.LOCAL_UPLOAD_DIR)
        
        file_extension = upload_file.filename.split(".")[-1]
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_location = os.path.join(settings.LOCAL_UPLOAD_DIR, unique_filename)
        
        with open(file_location, "wb+") as file_object:
            shutil.copyfileobj(upload_file.file, file_object)
            
        return file_location
    else:
        # AWS S3 Upload Logic here
        s3 = boto3.client(
            "s3",
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION
        )
        file_extension = upload_file.filename.split(".")[-1]
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        
        s3.upload_fileobj(upload_file.file, settings.AWS_BUCKET_NAME, unique_filename)
        url = f"https://{settings.AWS_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com/{unique_filename}"
        return url
