// Core prediction types
export interface PredictionResult {
  success: boolean
  predicted_class: 'healthy' | 'parkinson'
  model: string
  model_score: number
  parkinson_probability: number
  healthy_probability: number
  processing_time_ms: number
  timestamp?: string
}

// Dataset statistics
export interface DatasetSplit {
  total: number
  healthy: number
  parkinson: number
}

export interface DatasetStats {
  total_images: number
  splits: {
    train: DatasetSplit
    validation: DatasetSplit
    test: DatasetSplit
  }
  classes: {
    healthy: { total: number; label: number }
    parkinson: { total: number; label: number }
  }
}

// Model metrics
export interface ClassMetrics {
  precision: number
  recall: number
  f1: number
  support: number
}

export interface ModelMetrics {
  accuracy: number
  roc_auc: number
  precision: number
  recall: number
  f1_score: number
  specificity?: number
  confusion_matrix: number[][]
  class_report?: {
    healthy: ClassMetrics
    parkinson: ClassMetrics
  }
  cross_val_scores?: number[]
  cross_val_mean?: number
  training_time_seconds?: number
}

// Model information
export interface ModelInfo {
  name: string
  display_name: string
  description: string
  architecture: string
  input_size: number[]
  parameters?: number
  accuracy?: number
  is_best?: boolean
}

// API health
export interface HealthStatus {
  status: string
  model_ready: boolean
  available_models: string[]
  api_version: string
  uptime_seconds?: number
}

// Prediction history entry
export interface PredictionHistoryEntry {
  id: string
  timestamp: string
  filename: string
  result: PredictionResult
  imageUrl?: string
}

// Chart data types
export interface ChartDataPoint {
  name: string
  value: number
  fill?: string
}

export interface TimeSeriesPoint {
  time: string
  value: number
}

// Confusion matrix
export interface ConfusionMatrix {
  true_positives: number
  true_negatives: number
  false_positives: number
  false_negatives: number
}

// Upload state
export type UploadStatus = 'idle' | 'uploading' | 'processing' | 'success' | 'error'

// API response wrapper
export interface ApiResponse<T> {
  data: T
  status: number
  message?: string
}

// Navigation item
export interface NavItem {
  label: string
  path: string
  icon?: string
}

// Feature card
export interface Feature {
  icon: string
  title: string
  description: string
  stat?: string
  statLabel?: string
}

// Step in how-it-works
export interface ProcessStep {
  number: string
  title: string
  description: string
  details: string[]
}

// Research reference
export interface ResearchRef {
  title: string
  authors: string
  journal: string
  year: number
  doi?: string
}
