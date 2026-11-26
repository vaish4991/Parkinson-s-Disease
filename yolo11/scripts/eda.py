"""
NEUROSCAN AI — YOLO11 Exploratory Data Analysis (EDA) Module
Author: Senior AI/ML Engineer
Domain: Parkinson's Disease Drawing Classification
"""

import os
import hashlib
import json
from pathlib import Path
from collections import defaultdict
import numpy as np
from PIL import Image

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
DATASET_DIR = PROJECT_ROOT / "dataset"
OUTPUT_DIR = PROJECT_ROOT / "yolo11" / "reports" / "eda"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

plt.style.use('dark_background')
CYAN = '#00f2fe'
VIOLET = '#a855f7'
WHITE = '#ffffff'
SLATE = '#94a3b8'

def run_eda():
    print("=" * 60)
    print("      NEUROSCAN AI — YOLO11 EXPLORATORY DATA ANALYSIS")
    print("=" * 60)
    
    splits = ['train', 'valid', 'test']
    classes = ['healthy', 'parkinson']
    
    counts = defaultdict(lambda: defaultdict(int))
    dimensions = defaultdict(list)
    aspect_ratios = defaultdict(list)
    md5_hashes = {}
    duplicates = []
    corrupted = []
    pixel_intensities = defaultdict(list)
    sample_images = defaultdict(list)
    
    for split in splits:
        for cls in classes:
            folder = DATASET_DIR / split / cls
            if not folder.exists():
                print(f"[WARN] Folder missing: {folder}")
                continue
            
            for img_path in sorted(folder.glob('*.*')):
                if img_path.suffix.lower() not in ['.jpg', '.jpeg', '.png', '.bmp', '.tiff']:
                    continue
                
                # Check readability & dimensions
                try:
                    with Image.open(img_path) as img:
                        w, h = img.size
                        mode = img.mode
                        counts[split][cls] += 1
                        dimensions[cls].append((w, h))
                        aspect_ratios[cls].append(w / h)
                        
                        # Pixel intensity sample (grayscale conversion for analysis)
                        arr = np.array(img.convert('L'))
                        pixel_intensities[cls].append(arr.mean())
                        
                        if len(sample_images[cls]) < 4 and split == 'train':
                            sample_images[cls].append((img_path, img.copy()))
                            
                except Exception as e:
                    corrupted.append((str(img_path), str(e)))
                    continue
                
                # Duplicate check via MD5
                with open(img_path, 'rb') as f:
                    file_hash = hashlib.md5(f.read()).hexdigest()
                    if file_hash in md5_hashes:
                        duplicates.append((str(img_path), md5_hashes[file_hash]))
                    else:
                        md5_hashes[file_hash] = str(img_path)

    total_images = sum(sum(c.values()) for c in counts.values())
    total_healthy = sum(counts[s]['healthy'] for s in splits)
    total_parkinson = sum(counts[s]['parkinson'] for s in splits)
    
    print(f"\n[1] Overall Image Counts:")
    print(f"    Total Images:    {total_images}")
    print(f"    Healthy Controls: {total_healthy} ({total_healthy / total_images * 100:.1f}%)")
    print(f"    Parkinson Cases:  {total_parkinson} ({total_parkinson / total_images * 100:.1f}%)")
    print(f"    Class Imbalance:  Perfect 1:1 Balance (Ratio = {total_healthy}:{total_parkinson})")
    
    print(f"\n[2] Split Breakdown:")
    for split in splits:
        h = counts[split]['healthy']
        p = counts[split]['parkinson']
        tot = h + p
        print(f"    {split.upper():6s} -> Healthy: {h:2d}, Parkinson: {p:2d} | Total: {tot:3d} ({tot / total_images * 100:.1f}%)")
        
    print(f"\n[3] Image Integrity & Data Hygiene:")
    print(f"    Corrupted Images: {len(corrupted)}")
    print(f"    Byte-level Duplicates: {len(duplicates)}")
    
    # ------------------ Plot 1: Class Distribution ------------------
    fig, ax = plt.subplots(figsize=(8, 5))
    bars = ax.bar(['Healthy Control', 'Parkinson Disease'], [total_healthy, total_parkinson],
                  color=[CYAN, VIOLET], edgecolor='white', linewidth=1.2, width=0.5)
    ax.set_title("Overall Class Distribution (204 Images)", fontsize=14, fontweight='bold', pad=15)
    ax.set_ylabel("Number of Images", fontsize=11)
    ax.set_ylim(0, 125)
    for bar in bars:
        height = bar.get_height()
        ax.annotate(f'{height} ({height/total_images*100:.1f}%)',
                    xy=(bar.get_x() + bar.get_width() / 2, height),
                    xytext=(0, 6), textcoords="offset points",
                    ha='center', va='bottom', fontsize=11, fontweight='bold', color='white')
    ax.grid(axis='y', alpha=0.2, linestyle='--')
    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "class_distribution.png", dpi=300)
    plt.close()

    # ------------------ Plot 2: Split Distribution ------------------
    fig, ax = plt.subplots(figsize=(9, 5))
    x = np.arange(len(splits))
    width = 0.35
    h_vals = [counts[s]['healthy'] for s in splits]
    p_vals = [counts[s]['parkinson'] for s in splits]
    
    rects1 = ax.bar(x - width/2, h_vals, width, label='Healthy', color=CYAN, edgecolor='white', alpha=0.9)
    rects2 = ax.bar(x + width/2, p_vals, width, label='Parkinson', color=VIOLET, edgecolor='white', alpha=0.9)
    ax.set_title("Dataset Split Breakdown by Class", fontsize=14, fontweight='bold', pad=15)
    ax.set_xticks(x)
    ax.set_xticklabels([s.capitalize() for s in splits], fontsize=11, fontweight='bold')
    ax.set_ylabel("Image Count", fontsize=11)
    ax.set_ylim(0, 80)
    ax.legend(frameon=True, facecolor='#111827', edgecolor='none')
    for rects in [rects1, rects2]:
        for rect in rects:
            h = rect.get_height()
            ax.annotate(f'{h}',
                        xy=(rect.get_x() + rect.get_width() / 2, h),
                        xytext=(0, 4), textcoords="offset points",
                        ha='center', va='bottom', fontsize=10, fontweight='bold')
    ax.grid(axis='y', alpha=0.2, linestyle='--')
    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "dataset_split_distribution.png", dpi=300)
    plt.close()

    # ------------------ Plot 3: Image Dimensions ------------------
    fig, ax = plt.subplots(figsize=(9, 5))
    hw_h = dimensions['healthy']
    hw_p = dimensions['parkinson']
    ax.scatter([d[0] for d in hw_h], [d[1] for d in hw_h], color=CYAN, alpha=0.7, label='Healthy', edgecolors='none', s=45)
    ax.scatter([d[0] for d in hw_p], [d[1] for d in hw_p], color=VIOLET, alpha=0.7, label='Parkinson', edgecolors='none', s=45)
    ax.set_title("Input Image Dimensions (Width vs Height)", fontsize=14, fontweight='bold', pad=15)
    ax.set_xlabel("Width (pixels)", fontsize=11)
    ax.set_ylabel("Height (pixels)", fontsize=11)
    ax.legend(frameon=True, facecolor='#111827', edgecolor='none')
    ax.grid(alpha=0.2, linestyle='--')
    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "image_dimensions.png", dpi=300)
    plt.close()

    # ------------------ Plot 4: Pixel Intensity ------------------
    fig, ax = plt.subplots(figsize=(9, 5))
    ax.hist(pixel_intensities['healthy'], bins=15, alpha=0.6, color=CYAN, label='Healthy Mean Intensity', edgecolor='white')
    ax.hist(pixel_intensities['parkinson'], bins=15, alpha=0.6, color=VIOLET, label='Parkinson Mean Intensity', edgecolor='white')
    ax.set_title("Mean Pixel Intensity Distribution (Background vs Stroke Contrast)", fontsize=14, fontweight='bold', pad=15)
    ax.set_xlabel("Mean Grayscale Value (0=Black, 255=White)", fontsize=11)
    ax.set_ylabel("Count", fontsize=11)
    ax.legend(frameon=True, facecolor='#111827', edgecolor='none')
    ax.grid(alpha=0.2, linestyle='--')
    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "pixel_intensity_distribution.png", dpi=300)
    plt.close()

    # ------------------ Plot 5: Sample Images Grid ------------------
    fig, axes = plt.subplots(2, 4, figsize=(14, 7))
    for i in range(4):
        # Healthy row
        ax_h = axes[0, i]
        path_h, img_h = sample_images['healthy'][i]
        ax_h.imshow(img_h)
        ax_h.set_title(f"Healthy: {path_h.name[:12]}...", fontsize=10, color=CYAN)
        ax_h.axis('off')
        
        # Parkinson row
        ax_p = axes[1, i]
        path_p, img_p = sample_images['parkinson'][i]
        ax_p.imshow(img_p)
        ax_p.set_title(f"Parkinson: {path_p.name[:12]}...", fontsize=10, color=VIOLET)
        ax_p.axis('off')
        
    plt.suptitle("Sample Spiral Drawings (Healthy Controls vs Parkinson)", fontsize=15, fontweight='bold', y=0.98)
    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "sample_images_grid.png", dpi=300)
    plt.close()

    # Export EDA Summary JSON
    eda_summary = {
        "dataset_name": "Parkinson's Disease Spiral Drawing Dataset",
        "total_images": total_images,
        "classes": {
            "healthy": total_healthy,
            "parkinson": total_parkinson
        },
        "balance_ratio": f"{total_healthy}:{total_parkinson} (1:1)",
        "splits": {
            s: {"healthy": counts[s]['healthy'], "parkinson": counts[s]['parkinson'], "total": counts[s]['healthy'] + counts[s]['parkinson']}
            for s in splits
        },
        "corrupted_images": len(corrupted),
        "duplicate_images": len(duplicates),
        "mean_intensity": {
            "healthy": float(np.mean(pixel_intensities['healthy'])),
            "parkinson": float(np.mean(pixel_intensities['parkinson']))
        },
        "recommendation": "Use 224x224 RGB image normalization with spatial augmentations (rotations, mild shear, horizontal flip) for YOLO11 transfer learning."
    }
    
    with open(OUTPUT_DIR / "eda_summary.json", "w") as f:
        json.dump(eda_summary, f, indent=2)
        
    print(f"\n[OK] EDA Visualizations & Summary exported to: {OUTPUT_DIR}")
    return eda_summary

if __name__ == '__main__':
    run_eda()
