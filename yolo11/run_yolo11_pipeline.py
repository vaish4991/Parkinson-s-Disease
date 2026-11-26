"""
NEUROSCAN AI — Master YOLO11 End-to-End Pipeline Runner
Author: Senior AI/ML Engineer
Executes: EDA -> Train -> Evaluate -> Compare -> Test Predictions
"""

import sys
import time
from pathlib import Path

# Add scripts directory to path
SCRIPTS_DIR = Path(__file__).resolve().parent / "scripts"
sys.path.insert(0, str(SCRIPTS_DIR))

from eda import run_eda
from train import train_yolo11
from evaluate import evaluate_yolo11
from compare import compare_models
from predict import predict_single_image

def main():
    t_start = time.time()
    print("\n" + "#" * 70)
    print("   NEUROSCAN AI: ULTRALYTICS YOLO11 INTEGRATION PIPELINE")
    print("#" * 70)
    
    # 1. Exploratory Data Analysis
    print("\n>>> STAGE 1: EXPLORATORY DATA ANALYSIS (EDA) <<<")
    eda_summary = run_eda()
    
    # 2. Model Training
    print("\n>>> STAGE 2: YOLO11 CLASSIFICATION MODEL TRAINING <<<")
    train_results = train_yolo11(epochs=25, batch=16, imgsz=224, patience=10)
    
    # 3. Independent Test Set Evaluation
    print("\n>>> STAGE 3: INDEPENDENT TEST SET EVALUATION (N=40) <<<")
    eval_results = evaluate_yolo11()
    
    # 4. Comparative Benchmark with Existing Models
    print("\n>>> STAGE 4: CROSS-MODEL BENCHMARK COMPARISON <<<")
    comparison_df = compare_models()
    
    # 5. Sample Inference Verification
    print("\n>>> STAGE 5: SAMPLE INFERENCE VERIFICATION <<<")
    sample_healthy = Path(__file__).resolve().parent.parent / "dataset" / "test" / "healthy"
    sample_parkinson = Path(__file__).resolve().parent.parent / "dataset" / "test" / "parkinson"
    
    h_img = sorted(sample_healthy.glob("*.*"))[0]
    p_img = sorted(sample_parkinson.glob("*.*"))[0]
    
    res_h = predict_single_image(str(h_img))
    res_p = predict_single_image(str(p_img))
    
    print(f"Sample Healthy Test:   {h_img.name} -> Pred: {res_h['predicted_class'].upper()} (Conf: {res_h['confidence_pct']}%, Latency: {res_h['latency_ms']}ms)")
    print(f"Sample Parkinson Test: {p_img.name} -> Pred: {res_p['predicted_class'].upper()} (Conf: {res_p['confidence_pct']}%, Latency: {res_p['latency_ms']}ms)")
    
    total_time = round(time.time() - t_start, 2)
    print("\n" + "=" * 70)
    print(f"   YOLO11 PIPELINE SUCCESSFULLY COMPLETED IN {total_time}s")
    print("=" * 70 + "\n")

if __name__ == '__main__':
    main()
