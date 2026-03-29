from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routes import auth, projects, ai, dashboard

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ProjectPilot",
    description="AI-powered platform for academic projects",
    version="1.0.0"
)

import os
from fastapi.staticfiles import StaticFiles

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if not os.path.exists("uploads"):
    os.makedirs("uploads")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include Routers
app.include_router(auth.router, prefix="/api", tags=["Authentication"])
app.include_router(projects.router, prefix="/api/projects", tags=["Projects"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI Processing"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the ProjectPilot API"}
