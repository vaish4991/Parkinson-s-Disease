"""
Test suite for NEUROSCAN AI FastAPI backend.

Run with:
    cd backend
    pytest tests/ -v
"""
import io
import pytest
from fastapi.testclient import TestClient
from PIL import Image

# ---------------------------------------------------------------------------
# App import – ModelLoader.initialize() will be called via lifespan, but
# TestClient triggers startup/shutdown automatically.
# ---------------------------------------------------------------------------
from app.main import app

client = TestClient(app)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_png_bytes(width: int = 224, height: int = 224, color: tuple = (255, 255, 255)) -> bytes:
    """Create an in-memory white PNG image of the given size."""
    img = Image.new("RGB", (width, height), color=color)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


# ---------------------------------------------------------------------------
# Health endpoint
# ---------------------------------------------------------------------------

def test_health_returns_200():
    response = client.get("/api/health")
    assert response.status_code == 200


def test_health_response_shape():
    data = client.get("/api/health").json()
    assert data["status"] == "online"
    assert "model_ready" in data
    assert "available_models" in data
    assert isinstance(data["available_models"], list)
    assert data["api_version"] == "1.0.0"


# ---------------------------------------------------------------------------
# Dataset stats endpoint
# ---------------------------------------------------------------------------

def test_dataset_stats_returns_200():
    response = client.get("/api/dataset-stats")
    assert response.status_code == 200


def test_dataset_stats_total_images():
    data = client.get("/api/dataset-stats").json()
    assert data["total_images"] == 204


def test_dataset_stats_splits_present():
    data = client.get("/api/dataset-stats").json()
    assert "splits" in data
    for split in ("train", "validation", "test"):
        assert split in data["splits"]


# ---------------------------------------------------------------------------
# Metrics endpoint
# ---------------------------------------------------------------------------

def test_metrics_returns_200():
    response = client.get("/api/metrics")
    assert response.status_code == 200


def test_metrics_response_has_available_key():
    data = client.get("/api/metrics").json()
    assert "available" in data


# ---------------------------------------------------------------------------
# Models / analytics endpoints
# ---------------------------------------------------------------------------

def test_get_models_returns_200():
    response = client.get("/api/models")
    assert response.status_code == 200


def test_get_models_has_available_models():
    data = client.get("/api/models").json()
    assert "available_models" in data
    assert isinstance(data["available_models"], list)


def test_model_info_returns_200():
    response = client.get("/api/model-info")
    assert response.status_code == 200


def test_model_info_has_all_architectures():
    data = client.get("/api/model-info").json()
    for arch in ("cnn", "vgg16", "resnet50"):
        assert arch in data["models"]


# ---------------------------------------------------------------------------
# Prediction endpoint – validation paths
# ---------------------------------------------------------------------------

def test_predict_no_file_returns_422():
    """POST without any file must fail with 422 Unprocessable Entity."""
    response = client.post("/api/predict")
    assert response.status_code == 422


def test_predict_invalid_extension_returns_400():
    """Uploading a .txt file must be rejected with 400."""
    fake_txt = io.BytesIO(b"not an image at all")
    response = client.post(
        "/api/predict",
        files={"file": ("test.txt", fake_txt, "text/plain")},
        data={"model": "best"},
    )
    assert response.status_code == 400


def test_predict_valid_png_returns_200_or_503():
    """
    Uploading a valid 224×224 PNG must return:
    - 200 with prediction data   – when model artifacts are present, OR
    - 503                        – when artifacts are absent (CI environment).
    Both outcomes are acceptable; a 500 or 400 is a bug.
    """
    png_bytes = _make_png_bytes()
    response = client.post(
        "/api/predict",
        files={"file": ("spiral.png", io.BytesIO(png_bytes), "image/png")},
        data={"model": "best"},
    )
    assert response.status_code in (200, 503), (
        f"Unexpected status {response.status_code}: {response.text}"
    )


def test_predict_200_response_shape():
    """When a 200 is returned, verify all expected keys are present."""
    png_bytes = _make_png_bytes()
    response = client.post(
        "/api/predict",
        files={"file": ("spiral.png", io.BytesIO(png_bytes), "image/png")},
        data={"model": "best"},
    )
    if response.status_code == 200:
        data = response.json()
        assert data["success"] is True
        assert "predicted_class" in data
        assert data["predicted_class"] in ("healthy", "parkinson")
        assert "parkinson_probability" in data
        assert "healthy_probability" in data
        assert "model_score" in data
        assert "processing_time_ms" in data


# ---------------------------------------------------------------------------
# Root endpoint
# ---------------------------------------------------------------------------

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "version" in data
