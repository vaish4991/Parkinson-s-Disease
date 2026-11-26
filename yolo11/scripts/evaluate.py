"""
NEUROSCAN AI — YOLO11 Independent Test Evaluation
Author: Senior AI/ML Engineer
Evaluates the best trained YOLO11 checkpoint on the held-out test split (40 images)
"""

import os
import json
import time
from pathlib import Path
import numpy as np
import pandas as pd
from PIL import Image
import torch
from ultralytics import YOLO

from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, roc_curve, auc, classification_report
)

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
DATASET_DIR = PROJECT_ROOT / "dataset"
TEST_DIR = DATASET_DIR / "test"
YOLO_DIR = PROJECT_ROOT / "yolo11"
WEIGHTS_PATH = YOLO_DIR / "weights" / "best.pt"
OUTPUT_DIR = YOLO_DIR / "reports" / "evaluation"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

plt.style.use('dark_background')
CYAN = '#00f2fe'
VIOLET = '#a855f7'
WHITE = '#ffffff'
SLATE = '#94a3b8'

def evaluate_yolo11():
    print("=" * 65)
    print("      NEUROSCAN AI — YOLO11 INDEPENDENT TEST EVALUATION")
    print("=" * 65)
    
    if not WEIGHTS_PATH.exists():
        raise FileNotFoundError(f"Model weights not found at {WEIGHTS_PATH}. Train the model first.")
        
    print(f"\n[1] Loading trained YOLO11 checkpoint: {WEIGHTS_PATH}")
    model = YOLO(str(WEIGHTS_PATH))
    
    # Class names mapping in model
    class_names = model.names
    print(f"    Model Classes: {class_names}")
    
    # Ensure mapping: 0 -> healthy, 1 -> parkinson
    name_to_idx = {name.lower(): idx for idx, name in class_names.items()}
    healthy_idx = name_to_idx.get('healthy', 0)
    parkinson_idx = name_to_idx.get('parkinson', 1)
    
    y_true = []
    y_pred = []
    y_prob = []
    latencies = []
    file_records = []
    
    # Load Test Images
    test_healthy = sorted((TEST_DIR / "healthy").glob("*.*"))
    test_parkinson = sorted((TEST_DIR / "parkinson").glob("*.*"))
    
    print(f"\n[2] Evaluating on Independent Test Dataset ({len(test_healthy)} Healthy, {len(test_parkinson)} Parkinson):")
    
    all_test = [(p, 0) for p in test_healthy] + [(p, 1) for p in test_parkinson]
    
    for img_path, true_label in all_test:
        if img_path.suffix.lower() not in ['.jpg', '.jpeg', '.png', '.bmp']:
            continue
            
        t0 = time.time()
        results = model(str(img_path), verbose=False)
        dt = (time.time() - t0) * 1000.0
        latencies.append(dt)
        
        probs = results[0].probs
        top1_idx = int(probs.top1)
        pred_label = 0 if top1_idx == healthy_idx else 1
        
        # Probability for Parkinson (class 1)
        p_parkinson = float(probs.data[parkinson_idx].item())
        p_healthy = float(probs.data[healthy_idx].item())
        
        y_true.append(true_label)
        y_pred.append(pred_label)
        y_prob.append(p_parkinson)
        
        file_records.append({
            "filename": img_path.name,
            "true_class": "healthy" if true_label == 0 else "parkinson",
            "pred_class": "healthy" if pred_label == 0 else "parkinson",
            "healthy_prob": round(p_healthy, 4),
            "parkinson_prob": round(p_parkinson, 4),
            "latency_ms": round(dt, 2)
        })
        
    y_true = np.array(y_true)
    y_pred = np.array(y_pred)
    y_prob = np.array(y_prob)
    
    # Metrics computation
    acc = accuracy_score(y_true, y_pred)
    prec_macro = precision_score(y_true, y_pred, average='macro', zero_division=0)
    rec_macro = recall_score(y_true, y_pred, average='macro', zero_division=0)
    f1_macro = f1_score(y_true, y_pred, average='macro', zero_division=0)
    
    prec_parkinson = precision_score(y_true, y_pred, pos_label=1, zero_division=0)
    rec_parkinson = recall_score(y_true, y_pred, pos_label=1, zero_division=0)
    f1_parkinson = f1_score(y_true, y_pred, pos_label=1, zero_division=0)
    
    cm = confusion_matrix(y_true, y_pred)
    tn, fp, fn, tp = cm.ravel()
    
    specificity = tn / (tn + fp) if (tn + fp) > 0 else 0.0
    sensitivity = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    
    fpr, tpr, thresholds = roc_curve(y_true, y_prob)
    roc_auc = auc(fpr, tpr)
    
    avg_latency = float(np.mean(latencies))
    
    report_str = classification_report(y_true, y_pred, target_names=['Healthy', 'Parkinson'], digits=4)
    
    print("\n[3] Empirical Test Performance Summary:")
    print(f"    Accuracy:            {acc * 100:.2f}%")
    print(f"    Macro Precision:     {prec_macro:.4f}")
    print(f"    Macro Recall:        {rec_macro:.4f}")
    print(f"    Macro F1-Score:      {f1_macro:.4f}")
    print(f"    Parkinson Recall:    {rec_parkinson:.4f} (Sensitivity)")
    print(f"    Healthy Recall:      {specificity:.4f} (Specificity)")
    print(f"    ROC-AUC Score:       {roc_auc:.4f}")
    print(f"    Avg Inference Latency: {avg_latency:.2f} ms")
    print(f"    Confusion Matrix:    TN={tn}, FP={fp}, FN={fn}, TP={tp}")
    print("\nDetailed Classification Report:")
    print(report_str)
    
    # ------------------ Plot 1: Confusion Matrix ------------------
    fig, ax = plt.subplots(figsize=(6, 5))
    cax = ax.matshow(cm, cmap='Blues', alpha=0.85)
    fig.colorbar(cax)
    
    for (i, j), z in np.ndenumerate(cm):
        ax.text(j, i, f'{z}', ha='center', va='center',
                fontsize=16, fontweight='bold',
                color='white' if z > (cm.max()/2) else 'black')
        
    ax.set_xticks([0, 1])
    ax.set_yticks([0, 1])
    ax.set_xticklabels(['Pred: Healthy', 'Pred: Parkinson'], fontsize=11, fontweight='bold')
    ax.set_yticklabels(['True: Healthy', 'True: Parkinson'], fontsize=11, fontweight='bold')
    ax.set_title("YOLO11 Confusion Matrix (Test Set: N=40)", fontsize=13, fontweight='bold', pad=20)
    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "confusion_matrix.png", dpi=300)
    plt.close()
    
    # ------------------ Plot 2: ROC Curve ------------------
    fig, ax = plt.subplots(figsize=(7, 6))
    ax.plot(fpr, tpr, color=CYAN, linewidth=2.5, label=f'YOLO11 (AUC = {roc_auc:.4f})')
    ax.plot([0, 1], [0, 1], color=SLATE, linestyle='--', linewidth=1.5, label='Random Guess (AUC = 0.5000)')
    ax.fill_between(fpr, tpr, alpha=0.15, color=CYAN)
    ax.set_title("Receiver Operating Characteristic (ROC) Curve", fontsize=13, fontweight='bold', pad=15)
    ax.set_xlabel("False Positive Rate (1 - Specificity)", fontsize=11)
    ax.set_ylabel("True Positive Rate (Sensitivity)", fontsize=11)
    ax.legend(loc='lower right', facecolor='#111827', edgecolor='none')
    ax.grid(alpha=0.2, linestyle='--')
    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "roc_curve.png", dpi=300)
    plt.close()

    # ------------------ Plot 3: Precision, Recall, F1 Bar Chart ------------------
    fig, ax = plt.subplots(figsize=(8, 5))
    metrics_names = ['Accuracy', 'Precision', 'Recall\n(Sensitivity)', 'F1-Score', 'Specificity']
    metrics_vals = [acc, prec_parkinson, rec_parkinson, f1_parkinson, specificity]
    bar_colors = [CYAN, '#3b82f6', VIOLET, '#ec4899', '#10b981']
    
    bars = ax.bar(metrics_names, [v * 100 for v in metrics_vals], color=bar_colors, edgecolor='white', width=0.5)
    ax.set_ylim(0, 110)
    ax.set_ylabel("Score (%)", fontsize=11)
    ax.set_title("YOLO11 Performance Metrics (Parkinson Class / Test Set)", fontsize=13, fontweight='bold', pad=15)
    for b in bars:
        h = b.get_height()
        ax.annotate(f'{h:.1f}%',
                    xy=(b.get_x() + b.get_width() / 2, h),
                    xytext=(0, 4), textcoords="offset points",
                    ha='center', va='bottom', fontsize=10, fontweight='bold')
    ax.grid(axis='y', alpha=0.2, linestyle='--')
    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "precision_recall_f1.png", dpi=300)
    plt.close()

    # Save results to JSON & CSV
    eval_results = {
        "model": "YOLO11-cls",
        "checkpoint": str(WEIGHTS_PATH),
        "test_samples": int(len(y_true)),
        "accuracy": round(float(acc), 4),
        "precision_macro": round(float(prec_macro), 4),
        "recall_macro": round(float(rec_macro), 4),
        "f1_score_macro": round(float(f1_macro), 4),
        "precision_parkinson": round(float(prec_parkinson), 4),
        "recall_parkinson": round(float(rec_parkinson), 4),
        "f1_score_parkinson": round(float(f1_parkinson), 4),
        "specificity": round(float(specificity), 4),
        "roc_auc": round(float(roc_auc), 4),
        "confusion_matrix": {
            "true_negatives": int(tn),
            "false_positives": int(fp),
            "false_negatives": int(fn),
            "true_positives": int(tp)
        },
        "fpr": [round(float(v), 4) for v in fpr],
        "tpr": [round(float(v), 4) for v in tpr],
        "avg_latency_ms": round(avg_latency, 2)
    }

    with open(OUTPUT_DIR / "yolo11_evaluation_metrics.json", "w") as f:
        json.dump(eval_results, f, indent=2)
        
    df_metrics = pd.DataFrame([{
        "Model": "YOLO11-cls",
        "Accuracy": round(float(acc), 4),
        "Precision": round(float(prec_macro), 4),
        "Recall": round(float(rec_macro), 4),
        "F1_Score": round(float(f1_macro), 4),
        "Specificity": round(float(specificity), 4),
        "ROC_AUC": round(float(roc_auc), 4),
        "Avg_Latency_ms": round(avg_latency, 2)
    }])
    df_metrics.to_csv(OUTPUT_DIR / "yolo11_evaluation_metrics.csv", index=False)
    
    with open(OUTPUT_DIR / "classification_report.txt", "w") as f:
        f.write(report_str)

    # Save per-image predictions CSV
    pd.DataFrame(file_records).to_csv(OUTPUT_DIR / "test_predictions_per_image.csv", index=False)
    
    print(f"\n[OK] Evaluation outputs saved to {OUTPUT_DIR}")
    return eval_results

if __name__ == '__main__':
    evaluate_yolo11()
