"""
NEUROSCAN AI — YOLO11 Training Pipeline
Author: Senior AI/ML Engineer
Model: Ultralytics YOLO11 Classification (yolo11n-cls.pt)
"""

import os
import shutil
import time
from pathlib import Path
import pandas as pd
import torch
from ultralytics import YOLO

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
DATASET_DIR = PROJECT_ROOT / "dataset"
YOLO_DIR = PROJECT_ROOT / "yolo11"
WEIGHTS_DIR = YOLO_DIR / "weights"
REPORTS_DIR = YOLO_DIR / "reports" / "training"
RUNS_DIR = YOLO_DIR / "runs"

WEIGHTS_DIR.mkdir(parents=True, exist_ok=True)
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

plt.style.use('dark_background')
CYAN = '#00f2fe'
VIOLET = '#a855f7'
GREEN = '#10b981'

def detect_device():
    """Automatically detect best available acceleration device."""
    if torch.backends.mps.is_available():
        device = 'mps'
        print("[DEVICE] Apple Silicon Metal Performance Shaders (MPS) detected & enabled.")
    elif torch.cuda.is_available():
        device = 0
        print(f"[DEVICE] NVIDIA CUDA GPU detected: {torch.cuda.get_device_name(0)}")
    else:
        device = 'cpu'
        print("[DEVICE] CPU fallback selected.")
    return device

def train_yolo11(epochs=25, batch=16, imgsz=224, patience=10):
    print("=" * 65)
    print("      NEUROSCAN AI — ULTRALYTICS YOLO11 CLASSIFICATION TRAINING")
    print("=" * 65)
    
    device = detect_device()
    
    # Initialize YOLO11 pretrained classification model
    print("\n[1] Initializing YOLO11n-cls (Ultralytics pretrained backbone)...")
    model = YOLO("yolo11n-cls.pt")
    
    print(f"\n[2] Training on dataset: {DATASET_DIR.resolve()}")
    print(f"    Epochs:   {epochs}")
    print(f"    Batch:    {batch}")
    print(f"    ImgSize:  {imgsz}x{imgsz}")
    print(f"    Patience: {patience} (Early stopping)")
    print(f"    Device:   {device}")
    
    t0 = time.time()
    
    # Execute Ultralytics training
    results = model.train(
        data=str(DATASET_DIR),
        epochs=epochs,
        batch=batch,
        imgsz=imgsz,
        patience=patience,
        device=device,
        project=str(RUNS_DIR),
        name="train_exp",
        exist_ok=True,
        seed=42,
        workers=2,
        verbose=True
    )
    
    train_duration = round(time.time() - t0, 2)
    print(f"\n[OK] Training completed in {train_duration}s")
    
    # Archive Checkpoints
    best_pt = RUNS_DIR / "train_exp" / "weights" / "best.pt"
    last_pt = RUNS_DIR / "train_exp" / "weights" / "last.pt"
    
    if best_pt.exists():
        shutil.copy(best_pt, WEIGHTS_DIR / "best.pt")
        print(f"[SAVED] Best checkpoint -> {WEIGHTS_DIR / 'best.pt'}")
    if last_pt.exists():
        shutil.copy(last_pt, WEIGHTS_DIR / "last.pt")
        print(f"[SAVED] Last checkpoint -> {WEIGHTS_DIR / 'last.pt'}")

    # Process and Plot Training Logs
    csv_log = RUNS_DIR / "train_exp" / "results.csv"
    if csv_log.exists():
        shutil.copy(csv_log, REPORTS_DIR / "training_log.csv")
        df = pd.read_csv(csv_log)
        df.columns = [c.strip() for c in df.columns]
        
        fig, axes = plt.subplots(1, 2, figsize=(14, 5))
        
        # Loss Curves
        if 'train/loss' in df.columns and 'val/loss' in df.columns:
            axes[0].plot(df['epoch'], df['train/loss'], label='Train Loss', color=CYAN, linewidth=2)
            axes[0].plot(df['epoch'], df['val/loss'], label='Val Loss', color=VIOLET, linewidth=2)
            axes[0].set_title("YOLO11 Training & Validation Loss", fontsize=12, fontweight='bold')
            axes[0].set_xlabel("Epoch", fontsize=10)
            axes[0].set_ylabel("Cross-Entropy Loss", fontsize=10)
            axes[0].legend(facecolor='#111827', edgecolor='none')
            axes[0].grid(alpha=0.2, linestyle='--')
            
        # Accuracy Curves
        if 'metrics/accuracy_top1' in df.columns:
            axes[1].plot(df['epoch'], df['metrics/accuracy_top1'] * 100, label='Validation Top-1 Accuracy (%)', color=GREEN, linewidth=2)
            axes[1].set_title("YOLO11 Validation Accuracy Progression", fontsize=12, fontweight='bold')
            axes[1].set_xlabel("Epoch", fontsize=10)
            axes[1].set_ylabel("Accuracy (%)", fontsize=10)
            axes[1].legend(facecolor='#111827', edgecolor='none')
            axes[1].grid(alpha=0.2, linestyle='--')
            
        plt.tight_layout()
        plot_path = REPORTS_DIR / "training_curves.png"
        plt.savefig(plot_path, dpi=300)
        plt.close()
        print(f"[OK] Training plots generated -> {plot_path}")

    return {
        "train_time_sec": train_duration,
        "best_weights": str(WEIGHTS_DIR / "best.pt"),
        "last_weights": str(WEIGHTS_DIR / "last.pt"),
    }

if __name__ == '__main__':
    train_yolo11()
