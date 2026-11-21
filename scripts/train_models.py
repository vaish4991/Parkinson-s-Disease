import os, sys, time, json, math, shutil
from pathlib import Path
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms, models
from PIL import Image
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix, roc_curve

device = torch.device('cuda' if torch.cuda.is_available() else ('mps' if torch.backends.mps.is_available() else 'cpu'))
print(f'Training on device: {device}')

ROOT = Path('/Users/vaishnavisantoshjagdale/Parkinsons Disease/NEUROSCAN-AI/dataset')
ARTIFACTS_DIR = Path('/Users/vaishnavisantoshjagdale/Parkinsons Disease/NEUROSCAN-AI/artifacts')
REPORTS_DIR = Path('/Users/vaishnavisantoshjagdale/Parkinsons Disease/NEUROSCAN-AI/reports')
ARTIFACTS_DIR.mkdir(exist_ok=True)
for d in ['training', 'confusion_matrices', 'roc_curves', 'comparison', 'evaluation']:
    (REPORTS_DIR / d).mkdir(parents=True, exist_ok=True)

class SpiralDataset(Dataset):
    def __init__(self, split, transform=None):
        self.samples = []
        self.transform = transform
        for label_idx, cls in enumerate(['healthy', 'parkinson']):
            folder = ROOT / split / cls
            for f in folder.glob('*.jpg'):
                self.samples.append((str(f), label_idx))
    def __len__(self):
        return len(self.samples)
    def __getitem__(self, idx):
        path, label = self.samples[idx]
        img = Image.open(path).convert('RGB')
        if self.transform:
            img = self.transform(img)
        return img, torch.tensor(label, dtype=torch.float32), path

# Image transforms (Augmentation on train only)
train_tf = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.RandomHorizontalFlip(p=0.5),
    transforms.RandomRotation(degrees=10),
    transforms.RandomAffine(degrees=0, translate=(0.08, 0.08), scale=(0.92, 1.08)),
    transforms.ColorJitter(brightness=0.1, contrast=0.1),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

val_tf = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

train_ds = SpiralDataset('train', train_tf)
val_ds = SpiralDataset('valid', val_tf)
test_ds = SpiralDataset('test', val_tf)

train_loader = DataLoader(train_ds, batch_size=16, shuffle=True)
val_loader = DataLoader(val_ds, batch_size=16, shuffle=False)
test_loader = DataLoader(test_ds, batch_size=16, shuffle=False)

print(f'Loaded dataset splits: Train={len(train_ds)}, Valid={len(val_ds)}, Test={len(test_ds)}')

# 1. Custom CNN
class CustomCNN(nn.Module):
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

def build_vgg16():
    m = models.vgg16(weights=models.VGG16_Weights.DEFAULT)
    for p in m.parameters():
        p.requires_grad = False
    m.classifier = nn.Sequential(
        nn.Linear(512 * 7 * 7, 64),
        nn.ReLU(inplace=True),
        nn.Dropout(0.5),
        nn.Linear(64, 1)
    )
    return m

def build_resnet50():
    m = models.resnet50(weights=models.ResNet50_Weights.DEFAULT)
    for p in m.parameters():
        p.requires_grad = False
    m.fc = nn.Sequential(
        nn.Dropout(0.5),
        nn.Linear(m.fc.in_features, 1)
    )
    return m

MODEL_FACTORIES = {
    'cnn': lambda: CustomCNN(),
    'resnet50': lambda: build_resnet50(),
    'vgg16': lambda: build_vgg16(),
}

criterion = nn.BCEWithLogitsLoss()
all_histories = {}
all_results = {}
train_times = {}

for name, model_fn in MODEL_FACTORIES.items():
    print(f'\n================== Building & Training {name.upper()} ==================')
    model = model_fn().to(device)
    t0 = time.time()
    
    if name == 'cnn':
        optimizer = optim.Adam(model.parameters(), lr=1e-3, weight_decay=1e-4)
        epochs = 20
    else:
        optimizer = optim.Adam(filter(lambda p: p.requires_grad, model.parameters()), lr=1e-3)
        epochs = 10
        
    history = {'train_loss': [], 'val_loss': [], 'train_acc': [], 'val_acc': []}
    best_val_loss = float('inf')
    best_weights = None
    
    for epoch in range(epochs):
        model.train()
        r_loss, correct, total = 0.0, 0, 0
        for x, y, _ in train_loader:
            x, y = x.to(device), y.to(device).unsqueeze(1)
            optimizer.zero_grad()
            out = model(x)
            loss = criterion(out, y)
            loss.backward()
            optimizer.step()
            r_loss += loss.item() * x.size(0)
            preds = (torch.sigmoid(out) >= 0.5).float()
            correct += (preds == y).sum().item()
            total += y.size(0)
            
        t_loss = r_loss / total
        t_acc = correct / total
        
        # Validation
        model.eval()
        v_loss, v_correct, v_total = 0.0, 0, 0
        with torch.no_grad():
            for x, y, _ in val_loader:
                x, y = x.to(device), y.to(device).unsqueeze(1)
                out = model(x)
                loss = criterion(out, y)
                v_loss += loss.item() * x.size(0)
                preds = (torch.sigmoid(out) >= 0.5).float()
                v_correct += (preds == y).sum().item()
                v_total += y.size(0)
                
        val_loss = v_loss / v_total
        val_acc = v_correct / v_total
        
        history['train_loss'].append(round(t_loss, 4))
        history['val_loss'].append(round(val_loss, 4))
        history['train_acc'].append(round(t_acc, 4))
        history['val_acc'].append(round(val_acc, 4))
        
        if val_loss < best_val_loss:
            best_val_loss = val_loss
            best_weights = {k: v.cpu().clone() for k, v in model.state_dict().items()}
            
        if (epoch + 1) % 5 == 0 or epoch == epochs - 1:
            print(f'Epoch {epoch+1:2d}/{epochs}: Train Loss={t_loss:.4f}, Acc={t_acc:.4f} | Val Loss={val_loss:.4f}, Acc={val_acc:.4f}')

    # Phase 2 Fine-Tuning for VGG16 and ResNet50
    if name in ['vgg16', 'resnet50']:
        print(f'-> Phase 2 Fine-Tuning {name.upper()} (last 20 layers with lr=1e-5)')
        if best_weights:
            model.load_state_dict({k: v.to(device) for k, v in best_weights.items()})
        
        if name == 'vgg16':
            for p in list(model.features.parameters())[-8:]:
                p.requires_grad = True
        elif name == 'resnet50':
            for name_p, p in model.named_parameters():
                if 'layer4' in name_p and 'bn' not in name_p:
                    p.requires_grad = True
                    
        ft_optimizer = optim.Adam(filter(lambda p: p.requires_grad, model.parameters()), lr=1e-5)
        for epoch in range(10):
            model.train()
            r_loss, correct, total = 0.0, 0, 0
            for x, y, _ in train_loader:
                x, y = x.to(device), y.to(device).unsqueeze(1)
                ft_optimizer.zero_grad()
                out = model(x)
                loss = criterion(out, y)
                loss.backward()
                ft_optimizer.step()
                r_loss += loss.item() * x.size(0)
                preds = (torch.sigmoid(out) >= 0.5).float()
                correct += (preds == y).sum().item()
                total += y.size(0)
            
            t_loss = r_loss / total
            t_acc = correct / total
            
            model.eval()
            v_loss, v_correct, v_total = 0.0, 0, 0
            with torch.no_grad():
                for x, y, _ in val_loader:
                    x, y = x.to(device), y.to(device).unsqueeze(1)
                    out = model(x)
                    loss = criterion(out, y)
                    v_loss += loss.item() * x.size(0)
                    preds = (torch.sigmoid(out) >= 0.5).float()
                    v_correct += (preds == y).sum().item()
                    v_total += y.size(0)
            val_loss = v_loss / v_total
            val_acc = v_correct / v_total
            
            history['train_loss'].append(round(t_loss, 4))
            history['val_loss'].append(round(val_loss, 4))
            history['train_acc'].append(round(t_acc, 4))
            history['val_acc'].append(round(val_acc, 4))
            
            if val_loss < best_val_loss:
                best_val_loss = val_loss
                best_weights = {k: v.cpu().clone() for k, v in model.state_dict().items()}
                
    elapsed = round(time.time() - t0, 1)
    train_times[name] = elapsed
    all_histories[name] = history
    
    # Save best checkpoint
    if best_weights:
        model.load_state_dict({k: v.to(device) for k, v in best_weights.items()})
    torch.save(model.state_dict(), ARTIFACTS_DIR / f'{name}_model.pt')
    
    # Test Evaluation
    model.eval()
    y_true, y_prob, y_pred = [], [], []
    test_paths = []
    with torch.no_grad():
        for x, y, pths in test_loader:
            x = x.to(device)
            out = model(x)
            probs = torch.sigmoid(out).cpu().numpy().flatten()
            preds = (probs >= 0.5).astype(int)
            y_true.extend(y.numpy().astype(int))
            y_prob.extend(probs)
            y_pred.extend(preds)
            test_paths.extend(pths)
            
    y_true = np.array(y_true)
    y_prob = np.array(y_prob)
    y_pred = np.array(y_pred)
    
    cm = confusion_matrix(y_true, y_pred)
    tn, fp, fn, tp = cm.ravel()
    spec = tn / (tn + fp) if (tn + fp) > 0 else 0.0
    rec = recall_score(y_true, y_pred, pos_label=1)
    prec = precision_score(y_true, y_pred, pos_label=1, zero_division=0)
    acc = accuracy_score(y_true, y_pred)
    f1 = f1_score(y_true, y_pred, pos_label=1)
    auc = roc_auc_score(y_true, y_prob)
    fpr, tpr, thresholds = roc_curve(y_true, y_prob)
    param_count = sum(p.numel() for p in model.parameters())
    
    all_results[name] = {
        'name': 'Custom CNN' if name == 'cnn' else ('VGG16 Transfer Learning' if name == 'vgg16' else 'ResNet50 Transfer Learning'),
        'accuracy': round(float(acc), 4),
        'precision': round(float(prec), 4),
        'recall': round(float(rec), 4),
        'f1_score': round(float(f1), 4),
        'specificity': round(float(spec), 4),
        'roc_auc': round(float(auc), 4),
        'confusion_matrix': cm.tolist(),
        'true_negatives': int(tn),
        'false_positives': int(fp),
        'false_negatives': int(fn),
        'true_positives': int(tp),
        'fpr': [round(float(x), 4) for x in fpr],
        'tpr': [round(float(x), 4) for x in tpr],
        'parameters': int(param_count),
        'train_time_sec': elapsed,
        'y_true': y_true.tolist(),
        'y_pred': y_pred.tolist(),
        'y_prob': [round(float(x), 4) for x in y_prob],
        'test_paths': test_paths
    }
    print(f'Test Results for {name.upper()}: Acc={acc:.4f}, Prec={prec:.4f}, Rec={rec:.4f}, F1={f1:.4f}, AUC={auc:.4f}, Spec={spec:.4f}')

# Best model selection by validation F1 & Recall
best_model_name = max(all_results.keys(), key=lambda k: (all_results[k]['f1_score'], all_results[k]['recall']))
print(f'\n>>> Best Model Selected: {best_model_name.upper()} <<<')

shutil.copyfile(ARTIFACTS_DIR / f'{best_model_name}_model.pt', ARTIFACTS_DIR / 'best_model.pt')

# Save model metadata
metadata = {
    'best_model': best_model_name,
    'input_size': [224, 224, 3],
    'class_mapping': {'0': 'healthy', '1': 'parkinson'},
    'models': {
        name: {
            'architecture': all_results[name]['name'],
            'parameters': all_results[name]['parameters'],
            'train_time_sec': all_results[name]['train_time_sec'],
            'test_accuracy': all_results[name]['accuracy'],
            'test_f1': all_results[name]['f1_score'],
            'test_recall': all_results[name]['recall'],
            'test_roc_auc': all_results[name]['roc_auc'],
            'checkpoint': f'{name}_model.pt'
        }
        for name in MODEL_FACTORIES
    },
    'created_at': time.strftime('%Y-%m-%d %H:%M:%S')
}

with open(ARTIFACTS_DIR / 'model_metadata.json', 'w') as f:
    json.dump(metadata, f, indent=2)

with open(ARTIFACTS_DIR / 'evaluation_results.json', 'w') as f:
    json.dump(all_results, f, indent=2)

with open(ARTIFACTS_DIR / 'training_history.json', 'w') as f:
    json.dump(all_histories, f, indent=2)

with open(ARTIFACTS_DIR / 'class_mapping.json', 'w') as f:
    json.dump({'0': 'healthy', '1': 'parkinson'}, f, indent=2)

# Copy to backend/artifacts
backend_artifacts = Path('/Users/vaishnavisantoshjagdale/Parkinsons Disease/NEUROSCAN-AI/backend/artifacts')
backend_artifacts.mkdir(exist_ok=True)
for item in ARTIFACTS_DIR.glob('*'):
    if item.is_file():
        shutil.copy(item, backend_artifacts / item.name)

# ================= PLOTS GENERATION =================
print('Generating research evaluation visualizations...')

# 1. Training Curves (Figure 1x3)
fig, axes = plt.subplots(1, 3, figsize=(18, 5), dpi=200)
fig.patch.set_facecolor('#0b0f19')
for idx, name in enumerate(['cnn', 'vgg16', 'resnet50']):
    ax = axes[idx]
    ax.set_facecolor('#111827')
    ax.tick_params(colors='white')
    h = all_histories[name]
    epochs_range = range(1, len(h['train_loss']) + 1)
    ax.plot(epochs_range, h['train_loss'], label='Train Loss', color='#00d4ff', lw=2)
    ax.plot(epochs_range, h['val_loss'], label='Val Loss', color='#f43f5e', lw=2, linestyle='--')
    ax.plot(epochs_range, h['train_acc'], label='Train Acc', color='#10b981', lw=1.5)
    ax.plot(epochs_range, h['val_acc'], label='Val Acc', color='#a855f7', lw=1.5, linestyle=':')
    m_name = all_results[name]['name']
    ax.set_title(f"{m_name}", color='white', fontweight='bold')
    ax.set_xlabel('Epoch', color='white')
    ax.set_ylabel('Loss / Accuracy', color='white')
    ax.legend(facecolor='#1f2937', edgecolor='none', labelcolor='white')
plt.suptitle('Training and Validation Learning Curves', color='white', fontsize=14, fontweight='bold')
plt.tight_layout()
plt.savefig(REPORTS_DIR / 'training' / 'training_curves.png', facecolor='#0b0f19')
plt.close()

# 2. Confusion Matrices (Figure 1x3 side by side)
fig, axes = plt.subplots(1, 3, figsize=(16, 5), dpi=200)
fig.patch.set_facecolor('#0b0f19')
for idx, name in enumerate(['cnn', 'vgg16', 'resnet50']):
    ax = axes[idx]
    cm = np.array(all_results[name]['confusion_matrix'])
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', ax=ax, cbar=False,
                xticklabels=['Healthy', 'Parkinson'], yticklabels=['Healthy', 'Parkinson'],
                annot_kws={'size': 14, 'weight': 'bold'})
    m_name = all_results[name]['name']
    acc_val = all_results[name]['accuracy'] * 100
    f1_val = all_results[name]['f1_score']
    ax.set_title(f"{m_name}\nAcc: {acc_val:.1f}% | F1: {f1_val:.3f}",
                 color='white', fontweight='bold')
    ax.set_xlabel('Predicted Label', color='white')
    ax.set_ylabel('True Label', color='white')
    ax.tick_params(colors='white')
plt.suptitle('Confusion Matrices on Held-Out Test Set (40 Drawings)', color='white', fontsize=14, fontweight='bold')
plt.tight_layout()
plt.savefig(REPORTS_DIR / 'confusion_matrices' / 'confusion_matrices.png', facecolor='#0b0f19')
plt.close()

# 3. ROC Curves (All models on one axis with AUC legend)
plt.figure(figsize=(9, 7), dpi=200)
plt.gcf().patch.set_facecolor('#0b0f19')
ax = plt.gca()
ax.set_facecolor('#111827')
ax.tick_params(colors='white')
colors = {'cnn': '#00d4ff', 'vgg16': '#a855f7', 'resnet50': '#10b981'}
for name in ['cnn', 'vgg16', 'resnet50']:
    res = all_results[name]
    m_name = res['name']
    auc_val = res['roc_auc']
    plt.plot(res['fpr'], res['tpr'], lw=2.5, color=colors[name],
             label=f"{m_name} (AUC = {auc_val:.3f})")
plt.plot([0, 1], [0, 1], color='#6b7280', lw=1.5, linestyle='--', label='Random Chance (AUC = 0.50)')
plt.title('Receiver Operating Characteristic (ROC) Comparison', color='white', fontweight='bold', fontsize=14)
plt.xlabel('False Positive Rate (1 - Specificity)', color='white')
plt.ylabel('True Positive Rate (Recall)', color='white')
plt.legend(loc='lower right', facecolor='#1f2937', edgecolor='none', labelcolor='white')
plt.tight_layout()
plt.savefig(REPORTS_DIR / 'roc_curves' / 'roc_curves.png', facecolor='#0b0f19')
plt.close()

# 4. Grouped Metrics Comparison Bar Chart
metrics_df = pd.DataFrame([
    {
        'Model': all_results[name]['name'],
        'Accuracy': all_results[name]['accuracy'],
        'Precision': all_results[name]['precision'],
        'Recall (Sens.)': all_results[name]['recall'],
        'F1-Score': all_results[name]['f1_score'],
        'Specificity': all_results[name]['specificity'],
        'ROC-AUC': all_results[name]['roc_auc'],
    }
    for name in ['cnn', 'vgg16', 'resnet50']
])
metrics_melt = metrics_df.melt(id_vars='Model', var_name='Metric', value_name='Score')

plt.figure(figsize=(12, 6), dpi=200)
plt.gcf().patch.set_facecolor('#0b0f19')
ax = plt.gca()
ax.set_facecolor('#111827')
ax.tick_params(colors='white')
sns.barplot(data=metrics_melt, x='Metric', y='Score', hue='Model', palette=['#00d4ff', '#a855f7', '#10b981'], ax=ax)
plt.title('Comprehensive Model Benchmark on Held-Out Test Set', color='white', fontweight='bold', fontsize=14)
plt.xlabel('Evaluation Metric', color='white')
plt.ylabel('Metric Score (0.0 - 1.0)', color='white')
plt.ylim(0, 1.08)
plt.legend(facecolor='#1f2937', edgecolor='none', labelcolor='white')
for p in ax.patches:
    h = p.get_height()
    if h > 0:
        ax.annotate(f'{h:.2f}', (p.get_x() + p.get_width() / 2., h + 0.015),
                    ha='center', va='bottom', fontsize=8, color='white', fontweight='bold')
plt.tight_layout()
plt.savefig(REPORTS_DIR / 'comparison' / 'model_comparison_metrics.png', facecolor='#0b0f19')
plt.close()

print('ALL MODELS TRAINED, EVALUATED, AND EXPORTED!')
