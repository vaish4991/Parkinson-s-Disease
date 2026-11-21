import os
import json
import logging
from pathlib import Path
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

# Conditional imports for TensorFlow and PyTorch
try:
    import tensorflow as tf
except ImportError:
    tf = None

try:
    import torch
    import torch.nn as nn
    from torchvision import models
except ImportError:
    torch = None
    nn = None
    models = None


class CustomCNN(nn.Module if nn else object):
    def __init__(self):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),
            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),
            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),
        )
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Dropout(0.5),
            nn.Linear(128 * 28 * 28, 64),
            nn.ReLU(inplace=True),
            nn.Linear(64, 1)
        )

    def forward(self, x):
        return self.classifier(self.features(x))


def create_model_for_state_dict(sd: dict):
    """Dynamically determine model architecture from state_dict keys."""
    keys = list(sd.keys())
    if any("layer1" in k for k in keys):
        m = models.resnet50()
        m.fc = nn.Sequential(nn.Dropout(0.5), nn.Linear(m.fc.in_features, 1))
        return m
    elif any("features.28" in k or "features.26" in k or "features.24" in k for k in keys):
        m = models.vgg16()
        m.classifier = nn.Sequential(
            nn.Linear(512 * 7 * 7, 64),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
            nn.Linear(64, 1)
        )
        return m
    else:
        return CustomCNN()


class ModelLoader:
    _models: Dict[str, Any] = {}
    _model_frameworks: Dict[str, str] = {}
    _metadata: dict = {}
    _evaluation: dict = {}
    _initialized: bool = False

    @classmethod
    def initialize(cls):
        # Resolve artifacts dir across possible paths
        search_dirs = [
            Path(os.getenv("ARTIFACTS_DIR", "./artifacts")),
            Path(__file__).resolve().parent.parent.parent / "artifacts",
            Path(__file__).resolve().parent.parent.parent.parent / "artifacts",
            Path("/Users/vaishnavisantoshjagdale/Parkinsons Disease/NEUROSCAN-AI/artifacts"),
            Path("/Users/vaishnavisantoshjagdale/Parkinsons Disease/NEUROSCAN-AI/backend/artifacts"),
        ]

        artifacts_dir = None
        for d in search_dirs:
            if d.exists() and (list(d.glob("*.pt")) or list(d.glob("*.keras"))):
                artifacts_dir = d
                break

        if not artifacts_dir:
            artifacts_dir = search_dirs[0]

        logger.info(f"Loading models from resolved artifacts directory: {artifacts_dir.resolve()}")

        # 1. Attempt PyTorch Model Loading
        if torch is not None:
            device = torch.device("mps" if torch.backends.mps.is_available() else "cpu")
            pt_files = {
                "best": "best_model.pt",
                "resnet50": "resnet50_model.pt",
                "cnn": "cnn_model.pt",
                "vgg16": "vgg16_model.pt",
            }
            for name, filename in pt_files.items():
                p = artifacts_dir / filename
                if p.exists():
                    try:
                        sd = torch.load(str(p), map_location="cpu")
                        m = create_model_for_state_dict(sd)
                        m.load_state_dict(sd)
                        m.to(device)
                        m.eval()
                        cls._models[name] = m
                        cls._model_frameworks[name] = "pytorch"
                        logger.info(f"Loaded PyTorch model '{name}' from {p}")
                    except Exception as e:
                        logger.warning(f"Could not load PyTorch weights for '{name}': {e}")

        # 2. Attempt TensorFlow Model Loading if present
        if tf is not None:
            tf_files = {
                "best": "best_model.keras",
                "cnn": "cnn_model.keras",
                "vgg16": "vgg16_model.keras",
                "resnet50": "resnet50_model.keras",
            }
            for name, filename in tf_files.items():
                p = artifacts_dir / filename
                if p.exists():
                    try:
                        cls._models[name] = tf.keras.models.load_model(str(p))
                        cls._model_frameworks[name] = "tensorflow"
                        logger.info(f"Loaded TensorFlow model '{name}' from {p}")
                    except Exception as e:
                        logger.error(f"Failed to load TF model '{name}': {e}")

        # Load metadata JSON
        meta_path = artifacts_dir / "model_metadata.json"
        if meta_path.exists():
            try:
                with open(meta_path) as f:
                    cls._metadata = json.load(f)
                logger.info("Loaded model_metadata.json")
            except Exception as e:
                logger.error(f"Failed to read model_metadata.json: {e}")

        # Load evaluation results JSON
        eval_path = artifacts_dir / "evaluation_results.json"
        if eval_path.exists():
            try:
                with open(eval_path) as f:
                    cls._evaluation = json.load(f)
                logger.info("Loaded evaluation_results.json")
            except Exception as e:
                logger.error(f"Failed to read evaluation_results.json: {e}")

        cls._initialized = True
        logger.info(f"ModelLoader initialized. Available models: {list(cls._models.keys())}")

    @classmethod
    def get_model(cls, name: str = "best"):
        if name in cls._models:
            return cls._models[name], cls._model_frameworks.get(name, "unknown")
        if "best" in cls._models:
            return cls._models["best"], cls._model_frameworks.get("best", "unknown")
        if cls._models:
            k = next(iter(cls._models))
            return cls._models[k], cls._model_frameworks.get(k, "unknown")
        return None, None

    @classmethod
    def is_ready(cls) -> bool:
        return bool(cls._models)

    @classmethod
    def available_models(cls) -> list:
        return list(cls._models.keys())

    @classmethod
    def get_metadata(cls) -> dict:
        return cls._metadata

    @classmethod
    def get_evaluation(cls) -> dict:
        return cls._evaluation
