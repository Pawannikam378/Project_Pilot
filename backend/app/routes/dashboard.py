from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from .. import models, schemas, auth
from ..database import get_db

router = APIRouter()

@router.get("/user-stats")
def get_user_stats(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    projects_count = db.query(models.Project).filter(models.Project.owner_id == current_user.id).count()
    
    # Reports count per project owned by active user
    reports_count = db.query(models.Report).join(models.Project).filter(
        models.Project.owner_id == current_user.id,
        models.Report.status == 'completed'
    ).count()

    return {
        "projects_count": projects_count,
        "reports_generated": reports_count,
        "plan_status": current_user.plan.capitalize()
    }

@router.get("/usage", response_model=schemas.UsageResponse)
def get_usage(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    usage_record = db.query(models.Usage).filter(models.Usage.user_id == current_user.id).first()
    return usage_record
