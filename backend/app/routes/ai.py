import uuid
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from sqlalchemy.orm import Session
from .. import models, schemas, auth
from ..database import get_db
from ..services.ai_tasks import process_report_task

router = APIRouter()

@router.post("/generate-report/{project_id}", response_model=schemas.ReportResponse)
def generate_report(project_id: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    project = db.query(models.Project).filter(models.Project.id == project_id, models.Project.owner_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Has a report already been triggered?
    existing_report = db.query(models.Report).filter(models.Report.project_id == project_id).first()
    if existing_report and existing_report.status in [models.TaskStatus.pending.value, models.TaskStatus.processing.value]:
        # Just return the pending/processing report
        return existing_report
        
    task_id = str(uuid.uuid4())
    
    # Create or update report
    if existing_report:
        report = existing_report
        report.task_id = task_id
        report.status = models.TaskStatus.pending.value
    else:
        report = models.Report(project_id=project.id, task_id=task_id)
        db.add(report)
        
    db.commit()
    db.refresh(report)

    # Queue background processing
    background_tasks.add_task(process_report_task, task_id, project_id)

    return report

@router.get("/task-status/{task_id}", response_model=schemas.ReportResponse)
def get_task_status(task_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    # Validate user owns report project
    report = db.query(models.Report).join(models.Project).filter(models.Report.task_id == task_id, models.Project.owner_id == current_user.id).first()
    
    if not report:
        raise HTTPException(status_code=404, detail="Task or report not found")
        
    return report
