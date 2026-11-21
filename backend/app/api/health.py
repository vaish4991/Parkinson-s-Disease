from fastapi import APIRouter
from app.services.model_loader import ModelLoader

router = APIRouter()


@router.get("/health")
def health_check():
    models_available = ModelLoader.available_models()
    return {
        "status": "online",
        "model_ready": ModelLoader.is_ready(),
        "available_models": models_available,
        "api_version": "1.0.0",
    }
