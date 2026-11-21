from fastapi import APIRouter, HTTPException
from app.services.model_loader import ModelLoader
import json
import os
from pathlib import Path

router = APIRouter()


@router.get("/metrics")
def get_metrics():
    evaluation = ModelLoader.get_evaluation()

    # Fallback: read directly from disk if not cached in memory
    if not evaluation:
        path = Path(os.getenv("ARTIFACTS_DIR", "./artifacts")) / "evaluation_results.json"
        if path.exists():
            try:
                with open(path) as f:
                    evaluation = json.load(f)
            except Exception:
                pass

    if not evaluation:
        return {
            "available": False,
            "message": "Models not yet trained. Run the Colab notebook to generate evaluation results.",
        }

    return {"available": True, "data": evaluation}


@router.get("/models")
def get_models():
    metadata = ModelLoader.get_metadata()
    available = ModelLoader.available_models()

    # Optionally attach training history
    history_path = Path(os.getenv("ARTIFACTS_DIR", "./artifacts")) / "training_history.json"
    history = {}
    if history_path.exists():
        try:
            with open(history_path) as f:
                history = json.load(f)
        except Exception:
            pass

    return {
        "available_models": available,
        "metadata": metadata,
        "training_history": history,
    }


@router.get("/model-info")
def get_model_info():
    return {
        "models": {
            "cnn": {
                "name": "Custom CNN",
                "architecture": "CNN from Scratch",
                "layers": [
                    "Conv2D×3",
                    "BatchNorm×3",
                    "MaxPool×3",
                    "Dropout(0.5)",
                    "Dense(64)",
                    "Dense(1,sigmoid)",
                ],
                "parameters": "~500K",
                "preprocessing": "Rescaling(1/255)",
            },
            "vgg16": {
                "name": "VGG16",
                "architecture": "VGG16 Transfer Learning",
                "layers": [
                    "VGG16 Base (ImageNet)",
                    "GlobalAvgPool2D",
                    "Dropout(0.5)",
                    "Dense(1,sigmoid)",
                ],
                "parameters": "~14.7M",
                "preprocessing": "vgg16.preprocess_input",
            },
            "resnet50": {
                "name": "ResNet50",
                "architecture": "ResNet50 Transfer Learning",
                "layers": [
                    "ResNet50 Base (ImageNet)",
                    "GlobalAvgPool2D",
                    "Dropout(0.5)",
                    "Dense(1,sigmoid)",
                ],
                "parameters": "~23.5M",
                "preprocessing": "resnet50.preprocess_input",
            },
        }
    }
