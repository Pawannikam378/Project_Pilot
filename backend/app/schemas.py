from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    plan: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class ReportResponse(BaseModel):
    id: str
    task_id: Optional[str] = None
    status: str
    abstract: Optional[str] = None
    introduction: Optional[str] = None
    methodology: Optional[str] = None
    results: Optional[str] = None
    conclusion: Optional[str] = None
    plagiarism_score: Optional[float] = None
    similar_projects: Optional[str] = None
    ppt_url: Optional[str] = None
    viva_questions: Optional[str] = None
    key_points: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class ProjectResponse(BaseModel):
    id: str
    title: str
    original_filename: str
    created_at: datetime
    reports: List[ReportResponse] = []
    
    class Config:
        from_attributes = True

class UsageResponse(BaseModel):
    id: str
    month_year: str
    upload_count: int
    report_count: int
    
    class Config:
        from_attributes = True
