from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from app.services.predictor import predict
from app.services.model_loader import ModelLoader
from PIL import Image
import io

router = APIRouter()

ALLOWED_EXTENSIONS = {"jpeg", "jpg", "png"}
MAX_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("/predict")
async def predict_image(
    file: UploadFile = File(...),
    model: str = Form(default="best"),
):
    # Read file contents
    contents = await file.read()

    # Validate file size
    if len(contents) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Max 10MB.")

    # Validate file extension
    filename = file.filename or ""
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: '{ext}'. Please upload a JPG or PNG image.",
        )

    # Validate that the bytes are actually an image using PIL
    try:
        with Image.open(io.BytesIO(contents)) as img:
            img_format = (img.format or "").lower()
            if img_format not in ("jpeg", "png"):
                raise HTTPException(status_code=400, detail="File is not a valid JPEG or PNG image.")
    except Exception:
        raise HTTPException(status_code=400, detail="Corrupted image file or unsupported image binary.")

    # Check model readiness
    if not ModelLoader.is_ready():
        raise HTTPException(
            status_code=503,
            detail="Model artifacts are not loaded. Please train models first and place artifacts in the artifacts/ directory.",
        )

    # Resolve model key
    available = ModelLoader.available_models()
    model_key = model if model in available else "best"
    if model_key not in available:
        model_key = available[0] if available else None

    try:
        result = predict(contents, model_key)
        return {"success": True, **result}
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference failed: {str(e)}")

