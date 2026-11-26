"""
NEUROSCAN AI — YOLO11 Standalone Inference Script
Author: Senior AI/ML Engineer
Use: python yolo11/scripts/predict.py --image path/to/drawing.jpg
"""

import sys
import argparse
import time
from pathlib import Path
from PIL import Image
from ultralytics import YOLO

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
DEFAULT_WEIGHTS = PROJECT_ROOT / "yolo11" / "weights" / "best.pt"

def predict_single_image(image_path: str, weights_path: str = None):
    if weights_path is None:
        weights_path = str(DEFAULT_WEIGHTS)
        
    p_img = Path(image_path)
    if not p_img.exists():
        raise FileNotFoundError(f"Input image not found: {image_path}")
    if not Path(weights_path).exists():
        raise FileNotFoundError(f"YOLO11 weights not found: {weights_path}")
        
    model = YOLO(weights_path)
    class_names = model.names
    
    t0 = time.time()
    results = model(str(p_img), verbose=False)
    latency_ms = (time.time() - t0) * 1000.0
    
    probs = results[0].probs
    top1_idx = int(probs.top1)
    predicted_class = class_names[top1_idx]
    confidence = float(probs.top1conf.item()) * 100.0
    
    # Extract probability dictionary
    prob_dict = {
        class_names[i]: round(float(probs.data[i].item()), 4)
        for i in range(len(class_names))
    }
    
    output = {
        "image": p_img.name,
        "predicted_class": predicted_class,
        "confidence_pct": round(confidence, 2),
        "class_probabilities": prob_dict,
        "latency_ms": round(latency_ms, 2),
        "disclaimer": "Investigational pattern recognition research only. Not a medical diagnosis."
    }
    return output

def main():
    parser = argparse.ArgumentParser(description="Run YOLO11 Parkinson Drawing Inference")
    parser.add_argument("--image", type=str, required=True, help="Path to spiral drawing image")
    parser.add_argument("--weights", type=str, default=None, help="Path to trained YOLO11 weights (best.pt)")
    args = parser.parse_args()
    
    res = predict_single_image(args.image, args.weights)
    print("\n" + "="*50)
    print("      NEUROSCAN AI — YOLO11 INFERENCE RESULT")
    print("="*50)
    print(f"  Input Image:     {res['image']}")
    print(f"  Prediction:      {res['predicted_class'].upper()}")
    print(f"  Confidence:      {res['confidence_pct']:.2f}%")
    print(f"  Probabilities:   {res['class_probabilities']}")
    print(f"  Inference Speed: {res['latency_ms']} ms")
    print("="*50 + "\n")

if __name__ == '__main__':
    main()
