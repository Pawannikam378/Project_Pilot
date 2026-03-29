import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "ProjectPilot"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./sql_app.db")
    
    # Auth
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super_secret_fallback_key_for_local_dev")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
    
    # Demo Mode
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "True").lower() in ("true", "1", "t")
    
    # External APIs
    OPENAI_API_KEY: str | None = os.getenv("OPENAI_API_KEY")
    
    # AWS S3
    AWS_ACCESS_KEY_ID: str | None = os.getenv("AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY: str | None = os.getenv("AWS_SECRET_ACCESS_KEY")
    AWS_REGION: str | None = os.getenv("AWS_REGION")
    AWS_BUCKET_NAME: str | None = os.getenv("AWS_BUCKET_NAME")
    
    # Payments
    RAZORPAY_KEY_ID: str | None = os.getenv("RAZORPAY_KEY_ID")
    RAZORPAY_KEY_SECRET: str | None = os.getenv("RAZORPAY_KEY_SECRET")

    # Local storage for Demo mode
    LOCAL_UPLOAD_DIR: str = "uploads"

settings = Settings()
