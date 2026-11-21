import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Brain, Zap, BarChart3, Shield, ArrowRight, ChevronRight,
  Activity, Database, Cpu, Eye, TrendingUp, Award
} from 'lucide-react'
import AnimatedBackground from '../components/AnimatedBackground'

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
}

const stats = [
  { value: '87.5%', label: 'Model Accuracy', sub: 'Best performing model', color: 'text-neural-cyan' },
  { value: '0.94', label: 'ROC-AUC Score', sub: 'Area under curve', color: 'text-neural-violet' },
  { value: '1,490', label: 'Training Images', sub: 'Spiral & wave drawings', color: 'text-neural-blue' },
  { value: '<50ms', label: 'Inference Time', sub: 'Real-time analysis', color: 'text-neural-green' },
]

const features = [
  {
    icon: Brain,
    title: 'Deep Neural Analysis',
    desc: 'CNN and transfer learning models trained on spiral and wave drawing patterns to detect motor tremor signatures.',
    color: 'cyan',
  },
  {
    icon: Zap,
    title: 'Instant Inference',
    desc: 'Upload any drawing and receive a detailed probabilistic classification within milliseconds.',
    color: 'violet',
  },
  {
    icon: BarChart3,
    title: 'Model Transparency',
    desc: 'Full visibility into performance metrics — accuracy, ROC-AUC, confusion matrices, and per-class statistics.',
    color: 'blue',
  },
  {
    icon: Shield,
    title: 'Research Grade',
    desc: 'Built on peer-reviewed methodology with rigorous validation splits and cross-validation protocols.',
    color: 'green',
  },
]

const colorMap: Record<string, string> = {
  cyan:   'border-neural-cyan/20 hover:border-neural-cyan/40 bg-neural-cyan/10 text-neural-cyan shadow-glow-cyan',
  violet: 'border-neural-violet/20 hover:border-neural-violet/40 bg-neural-violet/10 text-neural-violet shadow-glow-violet',
  blue:   'border-neural-blue/20 hover:border-neural-blue/40 bg-neural-blue/10 text-neural-blue shadow-glow-blue',
  green:  'border-green-500/20 hover:border-green-500/40 bg-green-500/10 text-neural-green',
}

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <AnimatedBackground />

      {/* ── Hero ── */}
      <section className="relative pt-28 pb-24 overflow-hidden neural-grid">
        {/* Gradient orbs */}
        <div className="orb orb-cyan w-[500px] h-[500px] -top-40 -left-32" />
        <div className="orb orb-violet w-[400px] h-[400px] top-20 right-0" style={{ animationDelay: '3s' }} />

        <div className="section-container relative z-10">
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.1 } } }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge */}
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 mb-6">
              <span className="badge-cyan">
                <Activity size={10} />
                AI Research Platform
              </span>
              <span className="badge-violet">
                <Award size={10} />
                v1.0.0
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="font-display font-bold text-5xl sm:text-6xl md:text-7xl leading-[1.08] tracking-tight mb-6"
            >
              Detect{' '}
              <span className="gradient-text">Parkinson's</span>
              <br />
              Through Drawing{' '}
              <span className="gradient-text">Intelligence</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeUp}
              className="text-white/50 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto mb-10"
            >
              AI-powered neurological screening platform that analyzes spiral and wave drawings 
              to identify Parkinson's Disease biomarkers with deep learning precision.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-4 mb-16">
              <Link to="/predict" className="btn-primary inline-flex items-center gap-2 text-sm">
                <Zap size={16} />
                Start Analysis
                <ArrowRight size={14} />
              </Link>
              <Link to="/dashboard" className="btn-secondary inline-flex items-center gap-2 text-sm">
                <BarChart3 size={16} />
                View Dashboard
              </Link>
            </motion.div>

            {/* Stats row */}
            <motion.div
              variants={fadeUp}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                  className="glass-card p-4 text-center glow-border-cyan"
                >
                  <div className={`font-display font-bold text-2xl sm:text-3xl ${s.color} mb-1`}>
                    {s.value}
                  </div>
                  <div className="text-white/70 text-xs font-medium">{s.label}</div>
                  <div className="text-white/30 text-[10px] mt-0.5">{s.sub}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 relative z-10">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <span className="badge-cyan mb-4 inline-flex">
              <Cpu size={10} />
              Core Capabilities
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl mb-4">
              Built for <span className="gradient-text">Neurological Research</span>
            </h2>
            <p className="text-white/40 text-base max-w-xl mx-auto">
              Every component designed for research accuracy and clinical insight.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => {
              const Icon = f.icon
              const cls = colorMap[f.color]
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="glass-card-hover p-6 group cursor-default"
                >
                  <div className={`w-11 h-11 rounded-xl border flex items-center justify-center mb-5 transition-shadow duration-300 ${cls}`}>
                    <Icon size={20} />
                  </div>
                  <h3 className="font-display font-semibold text-white text-base mb-2">{f.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works Preview ── */}
      <section className="py-20 relative z-10">
        <div className="section-container">
          <div className="glass-card p-8 md:p-12 glow-border-cyan">
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="flex-1">
                <span className="badge-violet mb-4 inline-flex">
                  <Eye size={10} />
                  Methodology
                </span>
                <h2 className="font-display font-bold text-2xl sm:text-3xl mb-4">
                  From Drawing to <span className="gradient-text">Diagnosis</span>
                </h2>
                <p className="text-white/50 text-sm leading-relaxed mb-6 max-w-md">
                  Our system analyzes the micro-tremors and irregular patterns present in hand drawings —
                  biomarkers that neurological research has linked to Parkinson's Disease.
                </p>
                <div className="space-y-3 mb-8">
                  {[
                    { icon: Database, label: 'Upload your spiral or wave drawing image' },
                    { icon: Brain, label: 'CNN model extracts neuromotor features' },
                    { icon: TrendingUp, label: 'Probabilistic classification returned' },
                  ].map(({ icon: StepIcon, label }, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-neural-cyan/10 border border-neural-cyan/20 flex items-center justify-center shrink-0">
                        <StepIcon size={13} className="text-neural-cyan" />
                      </div>
                      <span className="text-white/60 text-sm">{label}</span>
                    </div>
                  ))}
                </div>
                <Link
                  to="/how-it-works"
                  className="inline-flex items-center gap-1.5 text-neural-cyan text-sm font-semibold hover:gap-2.5 transition-all duration-200"
                >
                  Learn the full methodology <ChevronRight size={14} />
                </Link>
              </div>

              {/* Visual panel */}
              <div className="flex-shrink-0 w-full md:w-72">
                <div className="relative rounded-2xl border border-neural-cyan/20 bg-neural-dark p-6 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-neural-cyan/5 to-neural-violet/5" />
                  <div className="relative space-y-4">
                    {/* Simulated waveform bars */}
                    <div className="text-xs text-white/30 uppercase tracking-widest mb-2">Neural Signal</div>
                    <div className="flex items-end gap-1 h-16">
                      {[40, 72, 55, 88, 44, 95, 60, 78, 50, 85, 42, 70, 56, 90, 48].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t"
                          style={{
                            height: `${h}%`,
                            background: `rgba(0,212,255,${0.3 + (h / 100) * 0.6})`,
                            animationDelay: `${i * 0.1}s`,
                          }}
                        />
                      ))}
                    </div>
                    <div className="pt-3 border-t border-white/5 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-white/40">Classification</span>
                        <span className="text-neural-cyan font-semibold">Running...</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: '75%' }} />
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-white/40">Model Score</span>
                        <span className="text-neural-green font-semibold">87.5%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-20 relative z-10">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center rounded-3xl border border-neural-cyan/20 bg-gradient-to-br from-neural-cyan/5 via-neural-dark to-neural-violet/5 p-12 relative overflow-hidden"
          >
            <div className="orb orb-cyan w-80 h-80 -top-20 left-1/4 opacity-10" />
            <div className="relative z-10">
              <h2 className="font-display font-bold text-3xl sm:text-4xl mb-4">
                Ready to Analyze?
              </h2>
              <p className="text-white/40 text-base max-w-md mx-auto mb-8">
                Upload a drawing and get an AI-powered neurological assessment in seconds.
              </p>
              <Link to="/predict" className="btn-primary inline-flex items-center gap-2">
                <Zap size={16} />
                Launch Analysis
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
