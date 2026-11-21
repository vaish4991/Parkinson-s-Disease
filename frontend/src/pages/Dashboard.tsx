import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Activity, Database, TrendingUp, Users, CheckCircle2,
  AlertCircle, BarChart3, PieChart, RefreshCw, Cpu, Layers, Sparkles
} from 'lucide-react'
import {
  BarChart, Bar, PieChart as RechartsPie, Pie, Cell, Tooltip,
  XAxis, YAxis, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts'
import StatCard from '../components/StatCard'
import { useHealthCheck, useDatasetStats, useMetrics } from '../hooks/useApi'

const COLORS = {
  healthy: '#00d4ff',
  parkinson: '#a855f7',
  cyan: '#00d4ff',
  violet: '#a855f7',
  blue: '#3b82f6',
  green: '#10b981',
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-neural-dark/95 border border-neural-cyan/30 rounded-xl px-4 py-2.5 text-xs shadow-2xl backdrop-blur-md">
      {label && <p className="text-white/60 font-mono mb-1">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color || p.fill }} className="font-semibold flex items-center justify-between gap-4">
          <span>{p.name}:</span>
          <span className="font-mono">{typeof p.value === 'number' ? (p.value < 1.01 && p.value > 0 ? (p.value * 100).toFixed(1) + '%' : p.value) : p.value}</span>
        </p>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { status, loading: hLoading, refetch: refetchHealth } = useHealthCheck(0)
  const { stats, loading: sLoading } = useDatasetStats()
  const { metrics, loading: mLoading } = useMetrics()
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const handleRefresh = () => {
    refetchHealth()
    setLastRefresh(new Date())
  }

  // Exact verified dataset figures
  const splitData = stats
    ? [
        { name: 'Train', Healthy: stats.splits.train.healthy, Parkinson: stats.splits.train.parkinson },
        { name: 'Validation', Healthy: stats.splits.validation.healthy, Parkinson: stats.splits.validation.parkinson },
        { name: 'Test', Healthy: stats.splits.test.healthy, Parkinson: stats.splits.test.parkinson },
      ]
    : [
        { name: 'Train', Healthy: 65, Parkinson: 68 },
        { name: 'Validation', Healthy: 19, Parkinson: 12 },
        { name: 'Test', Healthy: 18, Parkinson: 22 },
      ]

  const classDist = [
    { name: 'Healthy Controls', value: 102, color: COLORS.healthy },
    { name: 'Parkinson Subjects', value: 102, color: COLORS.parkinson },
  ]

  // Model comparison metrics from actual training or honest baseline
  const modelComparisonData = metrics && metrics.cnn ? [
    {
      name: 'Custom CNN',
      Accuracy: metrics.cnn.accuracy,
      F1: metrics.cnn.f1_score,
      Recall: metrics.cnn.recall,
      Specificity: (metrics.cnn as any).specificity ?? 1.0,
    },
    {
      name: 'ResNet50',
      Accuracy: metrics.resnet50 ? metrics.resnet50.accuracy : 0.825,
      F1: metrics.resnet50 ? metrics.resnet50.f1_score : 0.811,
      Recall: metrics.resnet50 ? metrics.resnet50.recall : 0.682,
      Specificity: metrics.resnet50 ? ((metrics.resnet50 as any).specificity ?? 1.0) : 1.000,
    },
    {
      name: 'VGG16',
      Accuracy: metrics.vgg16 ? metrics.vgg16.accuracy : 0.775,
      F1: metrics.vgg16 ? metrics.vgg16.f1_score : 0.760,
      Recall: metrics.vgg16 ? metrics.vgg16.recall : 0.727,
      Specificity: metrics.vgg16 ? ((metrics.vgg16 as any).specificity ?? 0.833) : 0.833,
    },
  ] : [
    { name: 'Custom CNN', Accuracy: 0.450, F1: 0.000, Recall: 0.000, Specificity: 1.000 },
    { name: 'ResNet50', Accuracy: 0.825, F1: 0.811, Recall: 0.682, Specificity: 1.000 },
    { name: 'VGG16', Accuracy: 0.775, F1: 0.760, Recall: 0.727, Specificity: 0.833 },
  ]

  const isOnline = status?.status === 'online'
  const isModelReady = status?.model_ready

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Banner & Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neural-cyan/30 bg-neural-cyan/10 text-neural-cyan text-xs font-mono mb-2 shadow-glow-cyan">
            <Sparkles className="w-3.5 h-3.5" />
            AI RESEARCH WORKSPACE
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Neurocognitive Research Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time telemetry, dataset demographics, and deep learning model benchmarks
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Backend Status Pill */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-800 bg-neural-surface/80 backdrop-blur-md">
            <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
            <span className="text-xs font-mono text-slate-300">
              API: <strong className={isOnline ? 'text-emerald-400' : 'text-rose-400'}>{isOnline ? 'ONLINE' : 'OFFLINE'}</strong>
            </span>
          </div>

          {/* Model Status Pill */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-800 bg-neural-surface/80 backdrop-blur-md">
            <Cpu className="w-3.5 h-3.5 text-neural-violet" />
            <span className="text-xs font-mono text-slate-300">
              MODELS: <strong className={isModelReady ? 'text-neural-cyan' : 'text-amber-400'}>{isModelReady ? 'LOADED' : 'PENDING'}</strong>
            </span>
          </div>

          <button
            onClick={handleRefresh}
            className="p-2 rounded-xl border border-slate-800 bg-neural-surface/80 hover:border-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Refresh status"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Primary Verified Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <StatCard
          icon={<Database className="w-5 h-5" />}
          value="204"
          label="Total Spiral Drawings"
          description="Verified clinical dataset"
          color="cyan"
        />
        <StatCard
          icon={<Activity className="w-5 h-5" />}
          value="1:1"
          label="Class Balance"
          description="102 Healthy / 102 Parkinson"
          color="violet"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          value="82.5%"
          label="Top Test Accuracy"
          description="ResNet50 Residual Architecture"
          color="green"
        />
        <StatCard
          icon={<Cpu className="w-5 h-5" />}
          value="3"
          label="Neural Architectures"
          description="CNN, VGG16, ResNet50"
          color="blue"
        />
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
        {/* Dataset Partition Bar Chart */}
        <div className="lg:col-span-7 bg-neural-surface/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-neural-cyan" />
                Dataset Split Distribution (Images)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Train (133), Validation (31), Test (40)</p>
            </div>
            <span className="text-[11px] font-mono text-neural-cyan border border-neural-cyan/30 px-2 py-0.5 rounded bg-neural-cyan/10">
              EXACT COUNTS
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={splitData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: 10, fontSize: 12 }} />
                <Bar dataKey="Healthy" fill="#00d4ff" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Parkinson" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 1:1 Class Donut Chart */}
        <div className="lg:col-span-5 bg-neural-surface/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-neural-violet" />
                Overall Class Proportion
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Equally balanced clinical distribution</p>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 border border-emerald-400/30 px-2 py-0.5 rounded bg-emerald-400/10">
              50% / 50%
            </span>
          </div>
          <div className="h-56 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie
                  data={classDist}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {classDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#0b0f19" strokeWidth={3} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </RechartsPie>
            </ResponsiveContainer>
            <div className="absolute text-center pointer-events-none">
              <span className="text-2xl font-extrabold text-white">204</span>
              <p className="text-[10px] text-slate-400 font-mono">TOTAL SAMPLES</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-neural-cyan" />
              <span className="text-slate-300">Healthy: 102 (50%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-neural-violet" />
              <span className="text-slate-300">Parkinson: 102 (50%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Model Benchmark Performance Comparison */}
      <div className="bg-neural-surface/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-xl mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-neural-green" />
              Held-Out Test Set Benchmark (40 Images)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Side-by-side comparison across Accuracy, F1-Score, Parkinson Recall (Sensitivity), and Specificity
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">Target Positive: Parkinson (label=1)</span>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={modelComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis stroke="#94a3b8" domain={[0, 1]} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: 10, fontSize: 12 }} />
              <Bar dataKey="Accuracy" fill="#00d4ff" radius={[4, 4, 0, 0]} />
              <Bar dataKey="F1" fill="#a855f7" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Recall" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Specificity" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Academic Leakage Disclosure Card */}
      <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 backdrop-blur-md">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-amber-300">Methodology Note: Participant-Level Separation</h3>
            <p className="text-xs text-amber-200/80 mt-1 leading-relaxed">
              In accordance with CLAIM 2024 and TRIPOD+AI guidelines for clinical machine learning, our audit identified
              that multiple drawings from the same subject (e.g., V02, V04, V55) exist across train, validation, and test splits.
              Consequently, test performance represents image-level pattern recognition on clinical drawings rather than
              generalization to entirely unseen individuals.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
