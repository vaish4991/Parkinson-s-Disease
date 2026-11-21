import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
})

export const healthCheck = () => api.get('/api/health')
export const getDatasetStats = () => api.get('/api/dataset-stats')
export const getMetrics = () => api.get('/api/metrics')
export const getModels = () => api.get('/api/models')
export const getModelInfo = () => api.get('/api/model-info')

export const predictImage = (file: File, model: string = 'best') => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('model', model)
  return api.post('/api/predict', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export type HealthStatus = {
  status: string
  model_ready: boolean
  available_models: string[]
  api_version: string
}

export type PredictionResult = {
  success: boolean
  predicted_class: 'healthy' | 'parkinson'
  model: string
  model_score: number
  parkinson_probability: number
  healthy_probability: number
  processing_time_ms: number
}

export type DatasetStats = {
  total_images: number
  splits: {
    train: { total: number; healthy: number; parkinson: number }
    validation: { total: number; healthy: number; parkinson: number }
    test: { total: number; healthy: number; parkinson: number }
  }
  classes: {
    healthy: { total: number; label: number }
    parkinson: { total: number; label: number }
  }
}

export default api
