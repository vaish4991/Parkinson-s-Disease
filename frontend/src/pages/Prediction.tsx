import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap, ChevronDown, Info, Loader2, RotateCcw, AlertTriangle,
  Cpu, CheckCircle2, ShieldCheck, Activity, Image as ImageIcon
} from 'lucide-react'
import toast from 'react-hot-toast'
import UploadZone from '../components/UploadZone'
import PredictionResult from '../components/PredictionResult'
import { predictImage, healthCheck } from '../services/api'
import type { PredictionResult as PredResult } from '../types'

const MODEL_OPTIONS = [
  {
    value: 'best',
    label: 'Best Model (Auto-select)',
    badge: 'Recommended',
    desc: 'Automatically chooses the highest-performing architecture (ResNet50: 82.5% accuracy)',
  },
  {
    value: 'resnet50',
    label: 'ResNet50 Transfer Learning',
    badge: '82.5% Acc',
    desc: '50-layer deep residual network with frozen BatchNorm and fine-tuned top layers',
  },
  {
    value: 'vgg16',
    label: 'VGG16 Transfer Learning',
    badge: 'Transfer',
    desc: '16-layer VGG ImageNet backbone with fine-tuned convolutional feature maps',
  },
  {
    value: 'cnn',
    label: 'Custom CNN from Scratch',
    badge: 'Scratch',
    desc: '3-block convolutional network trained exclusively on drawing strokes',
  },
]

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function Prediction() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [model, setModel] = useState('best')
  const [status, setStatus] = useState<Status>('idle')
  const [result, setResult] = useState<PredResult | null>(null)
  const [modelOpen, setModelOpen] = useState(false)
  const [apiOnline, setApiOnline] = useState<boolean | null>(null)
  const [modelReady, setModelReady] = useState<boolean | null>(null)

  useEffect(() => {
    healthCheck()
      .then((res) => {
        setApiOnline(res.data.status === 'online')
        setModelReady(res.data.model_ready)
      })
      .catch(() => {
        setApiOnline(false)
        setModelReady(false)
      })
  }, [])

  const handleFileSelect = useCallback((f: File) => {
    setFile(f)
    setResult(null)
    setStatus('idle')
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(f)
  }, [])

  const handleRemove = useCallback(() => {
    setFile(null)
    setPreview(null)
    setResult(null)
    setStatus('idle')
  }, [])

  const handleAnalyze = async () => {
    if (!file) {
      toast.error('Please upload a spiral drawing first')
      return
    }
    setStatus('loading')
    setResult(null)
    try {
      const res = await predictImage(file, model)
      setResult(res.data)
      setStatus('success')
      toast.success('Inference completed successfully!')
    } catch (err: any) {
      setStatus('error')
      const msg = err?.response?.data?.detail || 'Inference request failed. Please check backend status.'
      toast.error(msg)
    }
  }

  const selectedModelObj = MODEL_OPTIONS.find((m) => m.value === model) || MODEL_OPTIONS[0]

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neural-cyan/30 bg-neural-cyan/10 text-neural-cyan text-xs font-mono mb-3 shadow-glow-cyan">
          <Zap className="w-3.5 h-3.5" />
          NEURO-VISION INFERENCE LABORATORY
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          AI Spiral Drawing <span className="text-transparent bg-clip-text bg-gradient-to-r from-neural-cyan via-neural-blue to-neural-violet">Pattern Classifier</span>
        </h1>
        <p className="text-slate-400 text-sm mt-2">
          Upload a digitized hand-drawn spiral to analyze motor tremor characteristics through deep neural networks
        </p>
      </div>

      {/* Backend Alert if Offline or Models Pending */}
      {apiOnline === false && (
        <div className="mb-8 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-xs">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>FastAPI backend appears to be offline at http://localhost:8000. Start the server using <code className="bg-black/50 px-1.5 py-0.5 rounded font-mono text-white">uvicorn app.main:app --reload</code>.</span>
        </div>
      )}

      {/* Two-Panel Core Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        {/* LEFT PANEL: Upload & Preview */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-neural-surface/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-xl flex-1 flex flex-col">
            <h2 className="text-base font-bold text-white mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-neural-cyan" />
                Input Image Upload
              </span>
              {file && (
                <button
                  onClick={handleRemove}
                  className="text-xs text-rose-400 hover:text-rose-300 font-mono transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Remove Image
                </button>
              )}
            </h2>

            <div className="flex-1 flex flex-col justify-center">
              <UploadZone
                selectedFile={file}
                preview={preview}
                onFileSelect={handleFileSelect}
                onRemove={handleRemove}
              />
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Model Selection & Analysis Controls */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-neural-surface/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-xl flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-neural-violet" />
                Inference Configuration
              </h2>

              {/* Model Dropdown Selector */}
              <div className="relative mb-6">
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                  Select Deep Learning Model
                </label>
                <button
                  type="button"
                  onClick={() => setModelOpen(!modelOpen)}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-700 bg-neural-dark hover:border-neural-cyan/50 transition-colors text-left"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm">{selectedModelObj.label}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neural-cyan/15 text-neural-cyan border border-neural-cyan/30">
                        {selectedModelObj.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{selectedModelObj.desc}</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${modelOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {modelOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute z-20 mt-2 w-full rounded-xl border border-slate-700 bg-neural-black/95 backdrop-blur-xl shadow-2xl p-1.5 space-y-1"
                    >
                      {MODEL_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setModel(opt.value)
                            setModelOpen(false)
                          }}
                          className={`w-full text-left p-3 rounded-lg transition-colors flex items-center justify-between ${
                            model === opt.value
                              ? 'bg-neural-cyan/15 border border-neural-cyan/30 text-white'
                              : 'hover:bg-neural-surface text-slate-300'
                          }`}
                        >
                          <div>
                            <p className="text-xs font-bold text-white">{opt.label}</p>
                            <p className="text-[11px] text-slate-400">{opt.desc}</p>
                          </div>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                            {opt.badge}
                          </span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Architecture Info Callout */}
              <div className="p-4 rounded-xl bg-neural-dark border border-slate-800/80 mb-6 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Target Resolution:</span>
                  <span className="font-mono text-white">224 × 224 × 3 RGB</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Normalization:</span>
                  <span className="font-mono text-neural-cyan">Lanczos + ImageNet Tensor</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Decision Threshold:</span>
                  <span className="font-mono text-white">0.50 (BCE Sigmoid)</span>
                </div>
              </div>
            </div>

            {/* Analyze CTA Button */}
            <div>
              <button
                disabled={!file || status === 'loading'}
                onClick={handleAnalyze}
                className="w-full py-4 rounded-xl font-bold text-sm tracking-wide transition-all shadow-glow-cyan flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-neural-cyan via-neural-blue to-neural-violet text-white hover:opacity-90 active:scale-[0.99]"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Executing Deep Neural Inference...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    <span>Analyze Drawing Patterns</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Prediction Result Experience */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <PredictionResult result={result} imagePreview={preview} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
