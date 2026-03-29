import os
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db
from ..utils.storage import save_upload_file
from ..utils.file_parser import extract_text

router = APIRouter()

@router.post("/upload-project", response_model=schemas.ProjectResponse, status_code=status.HTTP_201_CREATED)
async def upload_project(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Check usage limits
    usage = db.query(models.Usage).filter(models.Usage.user_id == current_user.id).first()
    if not usage:
        raise HTTPException(status_code=400, detail="Usage record missing")

    if current_user.plan == "free" and usage.upload_count >= 3:
        raise HTTPException(status_code=402, detail="Upload limit reached for free plan")

    if not file.filename.endswith(('.pdf', '.docx', '.pptx')):
        raise HTTPException(status_code=400, detail="Only PDF, DOCX, and PPTX files are supported")

    # 1. Save file (Local or S3)
    file_location = save_upload_file(file)

    # 2. Extract Text
    extracted_text = extract_text(file_location)

    # 3. Create Project Record
    new_project = models.Project(
        owner_id=current_user.id,
        title=file.filename,
        original_filename=file.filename,
        file_url=file_location,
        file_key=str(uuid.uuid4()),
        extracted_text=extracted_text,
    )
    db.add(new_project)
    
    # Update usage
    usage.upload_count += 1
    
    db.commit()
    db.refresh(new_project)
    
    return new_project

@router.get("/", response_model=List[schemas.ProjectResponse])
def get_projects(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    projects = db.query(models.Project).filter(models.Project.owner_id == current_user.id).all()
    return projects

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(project_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    project = db.query(models.Project).filter(models.Project.id == project_id, models.Project.owner_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    db.delete(project)
    db.commit()
    return None
