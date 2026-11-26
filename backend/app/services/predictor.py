import numpy as np
from PIL import Image, ImageOps
import io
import time
from app.services.model_loader import ModelLoader

try:
    import torch
    from torchvision import transforms
except ImportError:
    torch = None
    transforms = None

CLASS_NAMES = {0: "healthy", 1: "parkinson"}

# Standard inference transformation for PyTorch
if transforms:
    pytorch_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
else:
    pytorch_transform = None


def preprocess_image_tensor(image_bytes: bytes, framework: str = "pytorch"):
    img = Image.open(io.BytesIO(image_bytes))
    img = ImageOps.exif_transpose(img)
    img = img.convert("RGB")

    if framework == "pytorch" and pytorch_transform:
        tensor = pytorch_transform(img).unsqueeze(0)
        return tensor
    else:
        # Standard TensorFlow / NumPy 224x224 RGB
        img = img.resize((224, 224), Image.LANCZOS)
        arr = np.array(img, dtype=np.float32) / 255.0
        return np.expand_dims(arr, axis=0)


def predict(image_bytes: bytes, model_name: str = "best") -> dict:
    start = time.time()
    model, framework = ModelLoader.get_model(model_name)

    if model is None:
        raise ValueError("Selected model is not available in artifacts directory.")

    if framework == "ultralytics":
        img = Image.open(io.BytesIO(image_bytes))
        img = ImageOps.exif_transpose(img)
        img = img.convert("RGB")
        res = model.predict(img, verbose=False)[0]
        probs = res.probs
        parkinson_idx = 1
        for idx, name in res.names.items():
            if "parkinson" in str(name).lower():
                parkinson_idx = idx
                break
        prob = float(probs.data[parkinson_idx].cpu().item())
    elif framework == "pytorch":
        tensor_input = preprocess_image_tensor(image_bytes, framework)
        device = next(model.parameters()).device
        tensor_input = tensor_input.to(device)
        model.eval()
        with torch.no_grad():
            out = model(tensor_input)
            prob = float(torch.sigmoid(out).cpu().item())
    elif framework == "tensorflow":
        tensor_input = preprocess_image_tensor(image_bytes, framework)
        prob = float(model.predict(tensor_input, verbose=0)[0][0])
    else:
        raise ValueError(f"Unsupported framework: {framework}")

    pred_class = 1 if prob >= 0.5 else 0
    class_label = CLASS_NAMES[pred_class]
    confidence_score = prob if pred_class == 1 else (1.0 - prob)
    elapsed_ms = round((time.time() - start) * 1000, 1)

    return {
        "predicted_class": class_label,
        "model": model_name,
        "framework": framework,
        "model_score": round(confidence_score, 4),
        "parkinson_probability": round(prob, 4),
        "healthy_probability": round(1.0 - prob, 4),
        "processing_time_ms": elapsed_ms,
        "note": "Experimental deep learning pattern recognition only. Not a medical diagnosis."
    }
