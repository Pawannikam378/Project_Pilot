import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, Float, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum

from .database import Base

class PlanType(str, enum.Enum):
    free = "free"
    pro = "pro"

class TaskStatus(str, enum.Enum):
    pending = "pending"
    processing = "processing"
    completed = "completed"
    failed = "failed"

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Simple subscription model built-in
    plan = Column(String, default=PlanType.free.value)

    projects = relationship("Project", back_populates="owner", cascade="all, delete-orphan")
    usage = relationship("Usage", back_populates="user", uselist=False, cascade="all, delete-orphan")

class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    file_url = Column(String)  # S3 or local path
    file_key = Column(String)  # Identifier
    extracted_text = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner_id = Column(String, ForeignKey("users.id"))
    owner = relationship("User", back_populates="projects")
    
    reports = relationship("Report", back_populates="project", cascade="all, delete-orphan")

class Report(Base):
    __tablename__ = "reports"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey("projects.id"))
    
    task_id = Column(String, index=True) # Async processing UUID indicator
    status = Column(String, default=TaskStatus.pending.value)
    
    # Generated elements
    abstract = Column(Text)
    introduction = Column(Text)
    methodology = Column(Text)
    results = Column(Text)
    conclusion = Column(Text)
    
    plagiarism_score = Column(Float)
    similar_projects = Column(Text)  # JSON or comma separated
    
    ppt_url = Column(String)
    
    viva_questions = Column(Text)  # JSON list
    key_points = Column(Text)  # JSON list

    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="reports")

class Usage(Base):
    __tablename__ = "usage"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), unique=True)
    
    month_year = Column(String) # format: YYYY-MM
    upload_count = Column(Integer, default=0)
    report_count = Column(Integer, default=0)

    user = relationship("User", back_populates="usage")
