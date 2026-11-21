from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    ALLOWED_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000", "https://neuroscan-ai.vercel.app"]
    ARTIFACTS_DIR: str = os.getenv("ARTIFACTS_DIR", "./artifacts")
    MAX_FILE_SIZE_MB: int = 10
    DEFAULT_MODEL: str = "best"  # best, cnn, vgg16, resnet50
    
    class Config:
        env_file = ".env"

settings = Settings()
