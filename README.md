# 🧠 NEUROSCAN AI
### Deep Learning and Explainable AI for Parkinson's Disease Drawing-Image Pattern Classification

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB.svg?style=flat&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6.svg?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![PyTorch](https://img.shields.io/badge/Framework-PyTorch%20%2B%20TensorFlow-EE4C2C.svg?style=flat&logo=pytorch)](https://pytorch.org)
[![TailwindCSS](https://img.shields.io/badge/Styling-TailwindCSS%203.4-38B2AC.svg?style=flat&logo=tailwind-css)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **"Decoding patterns. Advancing neurological research."**  
> *NEUROSCAN AI* is an advanced computer-vision research platform designed to evaluate deep learning architectures for detecting motor impairment signatures in digitized spiral and wave drawings.

---

## 📑 Table of Contents

1. [Executive Summary & Research Definition](#-executive-summary--research-definition)
2. [Dataset Demographics & Clinical Characteristics](#-dataset-demographics--clinical-characteristics)
3. [Critical Research Finding: Participant-Level Data Leakage](#-critical-research-finding-participant-level-data-leakage)
4. [Deep Learning Model Architectures](#-deep-learning-model-architectures)
5. [Data Preprocessing & Augmentation Protocol](#-data-preprocessing--augmentation-protocol)
6. [Empirical Evaluation & Benchmark Results](#-empirical-evaluation--benchmark-results)
7. [System Architecture & Full-Stack Deployment](#-system-architecture--full-stack-deployment)
8. [Google Colab GPU Training Guide](#-google-colab-gpu-training-guide)
9. [Local Development & Quickstart](#-local-development--quickstart)
10. [REST API Documentation](#-rest-api-documentation)
11. [Limitations & Ethical Boundaries](#-limitations--ethical-boundaries)

---

## 🔬 Executive Summary & Research Definition

Parkinson's disease (PD) is characterized by insidious neurodegeneration of dopaminergic neurons in the substantia nigra, precipitating progressive resting tremors, rigidity, bradykinesia, and micrographia. Hand-drawn spirals and meanders reveal micro-tremors and kinematic dysregulation long before overt clinical onset.

**NEUROSCAN AI** benchmarks three deep convolutional learning paradigms against 204 digitized drawings:
1. **Custom CNN from Scratch**: Baseline model with 3 convolutional blocks, batch normalization, spatial dropout, and dense heads.
2. **VGG16 Transfer Learning**: Deep 16-layer representation utilizing ImageNet features with fine-tuned top convolutional layers.
3. **ResNet50 Residual Architecture**: 50-layer deep bottleneck residual network with frozen Batch Normalization to prevent small-batch covariate shift.

---

## 📊 Dataset Demographics & Clinical Characteristics

The dataset consists of **204 standardized spiral drawings** across two balanced cohorts:
- **Healthy Controls**: 102 drawings (50.0%)
- **Parkinson's Subjects**: 102 drawings (50.0%)

### Partition Distribution:
| Split | Healthy Drawings | Parkinson Drawings | Total Images | Ratio |
|---|:---:|:---:|:---:|:---:|
| **Training** | 65 | 68 | 133 | 65.2% |
| **Validation** | 19 | 12 | 31 | 15.2% |
| **Held-Out Test** | 18 | 22 | 40 | 19.6% |
| **Total** | **102** | **102** | **204** | **100.0%** |

- **Channels**: 3 (RGB format)
- **Spatial Dimensions**: Varying dimensions (Width: 253–512px, Height: 138–516px).
- **Corrupted Headers / Files**: 0 detected (100% verified integrity).
- **Exact Byte-Identical Duplicates**: 0 detected.

---

## ⚠️ Critical Research Finding: Participant-Level Data Leakage

During programmatic filename regex analysis (`^(V\d+[A-Z])`), filename tokens such as `V02HE01` and `V02HO03` were decoded:
- `V02` = Volunteer / Participant ID
- `H` = Healthy control (`P` = Parkinson patient)
- `E` / `O` = Exam trial condition
- `01` / `02` = Drawing task number

### Key Audit Finding:
**25 out of 28 participant groups have drawings scattered across train, validation, and test splits.**
For example:
- `V02H` has drawings in **Train**, **Validation**, and **Test**.
- `V04H`, `V07H`, `V08H`, `V09H`, `V55H` appear in **Train**, **Validation**, and **Test**.
- `V04P`, `V07P`, `V09P`, `V11P`, `V14P` appear across multiple splits.

### Academic Reporting Compliance:
Following **CLAIM 2024** (*Checklist for Artificial Intelligence in Medical Imaging*) and **TRIPOD+AI** guidelines, held-out test accuracy evaluates **drawing-level pattern recognition** for seen participants rather than **subject-independent clinical generalization**. We report this transparently to prevent over-optimistic generalization claims.

---

## 🏗️ Deep Learning Model Architectures

```
           +---------------------------------------------+
           |       Input Drawing Tensor (224×224×3)      |
           +---------------------------------------------+
                                  |
            +---------------------+---------------------+
            |                     |                     |
            v                     v                     v
   +------------------+  +------------------+  +------------------+
   |    Custom CNN    |  |      VGG16       |  |     ResNet50     |
   |   (From Scratch) |  | (ImageNet Base)  |  |  (Residual Base) |
   +------------------+  +------------------+  +------------------+
   | 3× Conv2D (3×3)  |  | Frozen Backbone  |  | Frozen Backbone  |
   | BatchNorm & ReLU |  | GlobalAvgPool2D  |  | Frozen BatchNorm |
   | MaxPool2D (2×2)  |  | Dropout (0.5)    |  | GlobalAvgPool2D  |
   | Dropout (0.5)    |  | Top 20 Layers FT |  | Top 20 Layers FT |
   | Dense (64, ReLU) |  | Dense (1, Sig)   |  | Dense (1, Sig)   |
   | Dense (1, Sig)   |  |                  |  |                  |
   +------------------+  +------------------+  +------------------+
            |                     |                     |
            +---------------------+---------------------+
                                  |
                                  v
           +---------------------------------------------+
           |       Binary Cross-Entropy Sigmoid Head     |
           |      (Healthy: 0  |  Parkinson: 1)          |
           +---------------------------------------------+
```

### Model Specifications:
1. **Custom CNN from Scratch**:
   - Rescaling layer $(1/255)$
   - Conv2D(32, 3x3) $\rightarrow$ BatchNorm $\rightarrow$ MaxPool2D(2x2)
   - Conv2D(64, 3x3) $\rightarrow$ BatchNorm $\rightarrow$ MaxPool2D(2x2)
   - Conv2D(128, 3x3) $\rightarrow$ BatchNorm $\rightarrow$ MaxPool2D(2x2)
   - Flatten $\rightarrow$ Dropout(0.5) $\rightarrow$ Dense(64, ReLU) $\rightarrow$ Dense(1, Sigmoid)
   - Total Parameters: **~6,493,121**

2. **VGG16 Transfer Learning**:
   - ImageNet pretrained feature extractor (`include_top=False`)
   - Phase 1: Frozen backbone + custom classification head with Adam $(lr=10^{-3})$
   - Phase 2: Unfreeze last 20 layers with fine-tuning Adam $(lr=10^{-5})$
   - Total Parameters: **~14,714,689**

3. **ResNet50 Residual Architecture**:
   - 50-layer deep bottleneck residual architecture
   - Phase 1: Classification head training with Adam $(lr=10^{-3})$
   - Phase 2: Fine-tuning top 20 layers with Adam $(lr=10^{-5})$ with **frozen BatchNorm layers** to prevent running mean/variance collapse on small clinical batches.
   - Total Parameters: **~23,508,033**

---

## 🧹 Data Preprocessing & Augmentation Protocol

### Preprocessing Pipeline:
1. **EXIF Transposition**: Automatically corrects camera or scanner orientation metadata.
2. **Color Mode Standardization**: Explicit conversion to 3-channel RGB.
3. **Spatial Resampling**: High-fidelity Lanczos interpolation to canonical $224 \times 224$ pixels.
4. **Tensor Normalization**: Standard ImageNet channel scaling ($\mu = [0.485, 0.456, 0.406]$, $\sigma = [0.229, 0.224, 0.225]$).

### Domain-Safe Augmentation (Training Split Only):
- **Horizontal Reflection**: Random flip ($p=0.5$).
- **Controlled Rotation**: Maximum $\pm 10^\circ$ (large rotations distort continuous tremor signatures).
- **Affine Translation & Scaling**: $\pm 8\%$ translation and $0.92–1.08\times$ zoom.
- **Color Jitter**: $\pm 10\%$ brightness and contrast variation.
- **Validation & Test Isolation**: Never subjected to synthetic distortions.

---

## 📈 Empirical Evaluation & Benchmark Results

Every architecture was evaluated on the **identical held-out test cohort** (40 images: 18 Healthy Controls, 22 Parkinson Subjects).

### Mathematical Formulas:
$$\text{Accuracy} = \frac{\text{TP} + \text{TN}}{\text{TP} + \text{TN} + \text{FP} + \text{FN}}$$
$$\text{Precision} = \frac{\text{TP}}{\text{TP} + \text{FP}}$$
$$\text{Recall (Sensitivity)} = \frac{\text{TP}}{\text{TP} + \text{FN}}$$
$$\text{Specificity} = \frac{\text{TN}}{\text{TN} + \text{FP}}$$
$$\text{F1-Score} = 2 \times \frac{\text{Precision} \times \text{Recall}}{\text{Precision} + \text{Recall}}$$

### Held-Out Test Set Performance:
| Architecture | Test Accuracy | Precision | Recall (Sens.) | F1-Score | Specificity | ROC-AUC | Parameters |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **ResNet50 (Best)** | **82.50%** | **100.0%** | **68.18%** | **0.8108** | **100.0%** | **0.8889** | 23.5M |
| **VGG16** | 77.50% | 80.00% | 72.73% | 0.7600 | 83.33% | 0.8409 | 14.7M |
| **Custom CNN** | 45.00% | 0.00% | 0.00% | 0.0000 | 100.0% | 0.2778 | 6.5M |

### Best Model Selection:
**ResNet50** was selected as the primary production model based on validation F1-score and zero false positives (100% specificity on healthy controls). The custom CNN trained from scratch on 133 images suffered from severe underfitting due to the lack of pre-learned edge representations.

---

## 🖥️ System Architecture & Full-Stack Deployment

```
                    +------------------------------+
                    |    Browser Client (User)     |
                    +------------------------------+
                                   |
                                   v
                    +------------------------------+
                    |  React 18 + Vite Frontend    |
                    |  TailwindCSS + Framer Motion |
                    |  (Port: 5173 or Vercel)      |
                    +------------------------------+
                                   |
                           REST API (JSON/HTTP)
                                   |
                                   v
                    +------------------------------+
                    |    FastAPI Python Backend    |
                    |    (Port: 8000 or Render)    |
                    +------------------------------+
                                   |
                   +---------------+---------------+
                   |                               |
                   v                               v
        +--------------------+           +--------------------+
        |  PyTorch Runtime   |           | TensorFlow Runtime |
        |  (.pt Checkpoints) |           | (.keras Artifacts) |
        +--------------------+           +--------------------+
                   |                               |
                   +---------------+---------------+
                                   |
                                   v
                    +------------------------------+
                    |   Artifacts & Reports Cache  |
                    |   (model_metadata.json, ...) |
                    +------------------------------+
```

---

## 🚀 Local Development & Quickstart

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+ (Python 3.10–3.14 supported)

### 1. Clone & Set Up Dataset
```bash
git clone https://github.com/your-username/neuroscan-ai.git
cd neuroscan-ai
```

### 2. Start FastAPI Backend
```bash
cd backend
python3 -m pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
API Documentation will be live at: `http://localhost:8000/docs`

### 3. Start React Frontend
```bash
cd ../frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🌐 REST API Documentation

### Endpoints:
- `GET /api/health` — Checks backend status and model readiness.
- `GET /api/dataset-stats` — Returns exact split counts and class balance.
- `GET /api/models` — Lists available trained checkpoints and metadata.
- `GET /api/metrics` — Returns test set accuracy, confusion matrices, and ROC curves.
- `GET /api/model-info` — Detailed architectural layer descriptions.
- `POST /api/predict` — Multipart image upload for real-time inference.

### Sample Prediction Request:
```bash
curl -X POST "http://localhost:8000/api/predict" \
     -F "file=@sample_drawing.jpg" \
     -F "model=best"
```

### Sample Prediction Response:
```json
{
  "success": true,
  "predicted_class": "healthy",
  "model": "best",
  "framework": "pytorch",
  "model_score": 0.6137,
  "parkinson_probability": 0.3863,
  "healthy_probability": 0.6137,
  "processing_time_ms": 31.8,
  "note": "Experimental deep learning pattern recognition only. Not a medical diagnosis."
}
```

---

## ☁️ Google Colab GPU Training Guide

To reproduce the TensorFlow/Keras training pipeline on Google Colab with GPU acceleration:
1. Open Google Colab: [colab.research.google.com](https://colab.research.google.com)
2. Upload `notebooks/Parkinsons_Disease_Training.ipynb`.
3. Set Runtime $\rightarrow$ Change runtime type $\rightarrow$ **T4 GPU**.
4. Upload `dataset/Parkinson Disease detection.v1i.folder.zip` directly or mount Google Drive.
5. Run all 16 numbered sections to train CNN, VGG16, and ResNet50.
6. The notebook automatically exports `best_model.keras`, `evaluation_results.json`, and ROC curves to your Google Drive.

---

## ⚠️ Limitations & Ethical Boundaries

1. **Non-Diagnostic Tool**: NEUROSCAN AI is an academic engineering research project. It does not provide clinical diagnoses.
2. **Sample Size Limitations**: Evaluated on 204 images. Real clinical translation requires multi-center trials with thousands of patient samples.
3. **Static 2D vs. Dynamic Kinematics**: Scanned drawings do not capture dynamic pen pressure, velocity, or air-time trajectories.

---

## 📜 Citation & Academic Standards

- **CLAIM 2024**: Checklist for Artificial Intelligence in Medical Imaging.
- **TRIPOD+AI**: Transparent Reporting of a multivariable prediction model of Individual Prognosis Or Diagnosis + Artificial Intelligence.
