# Model Performance Benchmark Comparison

| Model | Architecture | Accuracy | Precision | Recall | F1_Score | Specificity | ROC_AUC | Latency_ms |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| VGG16 (Fine-Tuned) | 16-Layer Sequential Backbone | 0.8500 | 0.9444 | 0.7727 | 0.8500 | 0.9444 | 0.8965 | 35.20 ms |
| ResNet50 (Fine-Tuned) | 50-Layer Residual Bottleneck | 0.8250 | 1.0000 | 0.6818 | 0.8108 | 1.0000 | 0.8763 | 28.50 ms |
| Ultralytics YOLO11 | YOLO11 C3k2 Vision Backbone | 0.8000 | 0.8000 | 0.8030 | 0.7995 | 0.8333 | 0.9116 | 9.16 ms |
| Custom CNN (Scratch) | 3 Conv Blocks + Dropout | 0.5500 | 0.5500 | 1.0000 | 0.7097 | 0.0000 | 0.5000 | 13.80 ms |

**Best Overall Performer:** VGG16 (Fine-Tuned)
