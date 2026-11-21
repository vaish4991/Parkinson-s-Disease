import React from 'react'
import { motion } from 'framer-motion'
import {
  FileText, ShieldAlert, Award, Microscope, Brain, GitBranch,
  BookOpen, CheckCircle, AlertTriangle, Lightbulb, Compass, ExternalLink
} from 'lucide-react'
import AnimatedBackground from '../components/AnimatedBackground'

export default function About() {
  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <AnimatedBackground />

      <div className="relative max-w-6xl mx-auto z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neural-violet/30 bg-neural-violet/10 text-neural-violet text-xs font-mono mb-4 shadow-glow-violet">
            <Microscope className="w-3.5 h-3.5" />
            ACADEMIC RESEARCH & SCIENTIFIC SPECIFICATION
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Research & <span className="text-transparent bg-clip-text bg-gradient-to-r from-neural-cyan via-neural-violet to-pink-500">Methodology</span>
          </h1>
          <p className="text-lg text-slate-300">
            A comprehensive overview of our deep learning investigation into spiral-drawing motor impairment markers,
            experimental evaluation standards, and data integrity audits.
          </p>
        </div>

        {/* Executive Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 rounded-2xl bg-neural-surface/80 border border-slate-800 backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-neural-cyan/15 text-neural-cyan flex items-center justify-center mb-4 border border-neural-cyan/30">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Research Objective</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Investigate whether modern convolutional architectures can distinguish between healthy controls and
              Parkinsonian motor tremor signatures purely from digitized spiral drawings without manual feature engineering.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-neural-surface/80 border border-slate-800 backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-neural-violet/15 text-neural-violet flex items-center justify-center mb-4 border border-neural-violet/30">
              <GitBranch className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Comparative Benchmarks</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Side-by-side empirical comparison of an inductive-bias-free Custom CNN (from scratch), VGG16 (deep transfer learning),
              and ResNet50 (residual bottleneck with frozen BatchNorm).
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-neural-surface/80 border border-slate-800 backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-pink-500/15 text-pink-400 flex items-center justify-center mb-4 border border-pink-500/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Clinical Integrity</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Adherence to CLAIM 2024 and TRIPOD+AI standards. Transparent documentation of participant-level split distribution,
              leakage vulnerabilities, and non-diagnostic research limitations.
            </p>
          </div>
        </div>

        {/* Section 1: Dataset & Leakage Discovery */}
        <div className="p-8 rounded-2xl bg-neural-surface/80 border border-slate-800 backdrop-blur-md mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-6 bg-neural-cyan rounded-full" />
            <h2 className="text-xl font-bold text-white">1. Dataset Distribution & Participant Audit</h2>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed mb-6">
            The experimental dataset comprises exactly 204 spiral drawing images, partitioned into an exactly balanced 102 Healthy
            control drawings and 102 Parkinson's disease subject drawings. In the canonical dataset partition:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-neural-dark border border-slate-800">
              <span className="text-xs font-mono text-neural-cyan">TRAINING COHORT</span>
              <p className="text-2xl font-bold text-white mt-1">133 Images</p>
              <p className="text-xs text-slate-400 mt-1">65 Healthy (48.9%) | 68 Parkinson (51.1%)</p>
            </div>
            <div className="p-4 rounded-xl bg-neural-dark border border-slate-800">
              <span className="text-xs font-mono text-neural-violet">VALIDATION COHORT</span>
              <p className="text-2xl font-bold text-white mt-1">31 Images</p>
              <p className="text-xs text-slate-400 mt-1">19 Healthy (61.3%) | 12 Parkinson (38.7%)</p>
            </div>
            <div className="p-4 rounded-xl bg-neural-dark border border-slate-800">
              <span className="text-xs font-mono text-neural-green">HELD-OUT TEST COHORT</span>
              <p className="text-2xl font-bold text-white mt-1">40 Images</p>
              <p className="text-xs text-slate-400 mt-1">18 Healthy (45.0%) | 22 Parkinson (55.0%)</p>
            </div>
          </div>

          {/* Alert Callout on Leakage */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-amber-300 mb-1">Key Research Finding: Participant-Level Cross-Split Overlap</h4>
              <p className="text-xs text-amber-200/80 leading-relaxed">
                Automated regex parsing revealed that filename codes (such as <code className="text-white bg-black/40 px-1 py-0.5 rounded">V02HE01</code>, <code className="text-white bg-black/40 px-1 py-0.5 rounded">V02HO03</code>)
                encode specific volunteer identifiers (<code className="text-white bg-black/40 px-1 py-0.5 rounded">V02</code>). In the original split, 25 out of 28 participant groups have drawings scattered across train,
                valid, and test splits. Therefore, held-out test performance evaluates drawing-level discrimination for seen subjects rather than
                completely independent unseen subject generalization. Following CLAIM 2024 recommendations, we document this prominently.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Model Architectures */}
        <div className="p-8 rounded-2xl bg-neural-surface/80 border border-slate-800 backdrop-blur-md mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-6 bg-neural-violet rounded-full" />
            <h2 className="text-xl font-bold text-white">2. Deep Learning Architectural Specifications</h2>
          </div>

          <div className="space-y-6">
            <div className="p-5 rounded-xl bg-neural-dark border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-neural-cyan">Model 1: Custom CNN from Scratch</h3>
                <span className="text-xs font-mono text-slate-400">~6.5M Parameters</span>
              </div>
              <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                Designed according to the specification in <code className="text-neural-cyan font-mono">cnn_models.pdf</code>.
                Consists of 3 sequential convolutional blocks with 32, 64, and 128 3×3 filters, each accompanied by Batch Normalization,
                ReLU activation, and 2×2 Max-Pooling. The classification head employs heavy Spatial Dropout (0.5), a 64-unit Dense ReLU layer,
                and a single Sigmoid output neuron.
              </p>
              <div className="flex flex-wrap gap-2 text-[11px] font-mono text-slate-400">
                <span className="px-2 py-0.5 rounded bg-slate-800">Adam (lr=1e-3)</span>
                <span className="px-2 py-0.5 rounded bg-slate-800">BCE Loss</span>
                <span className="px-2 py-0.5 rounded bg-slate-800">Rescaling (1/255)</span>
                <span className="px-2 py-0.5 rounded bg-slate-800">Dropout (0.5)</span>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-neural-dark border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-neural-violet">Model 2: VGG16 Transfer Learning & Fine-Tuning</h3>
                <span className="text-xs font-mono text-slate-400">~14.7M Parameters</span>
              </div>
              <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                Utilizes the 16-layer VGG network initialized with ImageNet weights. Phase 1 freezes the convolutional backbone while training
                a custom Global Average Pooling and Dropout classification head. Phase 2 selectively unfreezes the final 20 convolutional layers
                with a reduced learning rate of 1e-5 to adapt visual features to pencil-stroke line dynamics without catastrophic forgetting.
              </p>
              <div className="flex flex-wrap gap-2 text-[11px] font-mono text-slate-400">
                <span className="px-2 py-0.5 rounded bg-slate-800">ImageNet Pretrained</span>
                <span className="px-2 py-0.5 rounded bg-slate-800">Phase 1: Frozen Base (lr=1e-3)</span>
                <span className="px-2 py-0.5 rounded bg-slate-800">Phase 2: Fine-Tuning (lr=1e-5)</span>
                <span className="px-2 py-0.5 rounded bg-slate-800">VGG16 Preprocess</span>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-neural-dark border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-neural-green">Model 3: ResNet50 Residual Architecture</h3>
                <span className="text-xs font-mono text-slate-400">~23.5M Parameters</span>
              </div>
              <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                Deploys 50-layer deep bottleneck residual blocks with skip connections. To mitigate covariate drift on small-batch clinical datasets,
                all Batch Normalization layers remain strictly frozen during Phase 2 fine-tuning. This preserves running mean and variance statistics
                while adapting final bottleneck weights with learning rate 1e-5.
              </p>
              <div className="flex flex-wrap gap-2 text-[11px] font-mono text-slate-400">
                <span className="px-2 py-0.5 rounded bg-slate-800">Residual Skip Connections</span>
                <span className="px-2 py-0.5 rounded bg-slate-800">Frozen BatchNorm in Phase 2</span>
                <span className="px-2 py-0.5 rounded bg-slate-800">ResNet50 Preprocess</span>
                <span className="px-2 py-0.5 rounded bg-slate-800">GlobalAvgPool</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Evaluation Metrics & Formulas */}
        <div className="p-8 rounded-2xl bg-neural-surface/80 border border-slate-800 backdrop-blur-md mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-6 bg-neural-blue rounded-full" />
            <h2 className="text-xl font-bold text-white">3. Mathematical Evaluation Framework</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-neural-dark border border-slate-800">
              <span className="text-xs font-mono text-neural-cyan">RECALL (SENSITIVITY)</span>
              <p className="font-mono text-sm text-white mt-1">TP / (TP + FN)</p>
              <p className="text-xs text-slate-400 mt-2">Critical medical metric: measures percentage of Parkinsonian cases correctly flagged.</p>
            </div>
            <div className="p-4 rounded-xl bg-neural-dark border border-slate-800">
              <span className="text-xs font-mono text-neural-violet">SPECIFICITY</span>
              <p className="font-mono text-sm text-white mt-1">TN / (TN + FP)</p>
              <p className="text-xs text-slate-400 mt-2">Screens healthy controls without generating unnecessary clinical anxiety or referrals.</p>
            </div>
            <div className="p-4 rounded-xl bg-neural-dark border border-slate-800">
              <span className="text-xs font-mono text-neural-green">F1-SCORE</span>
              <p className="font-mono text-sm text-white mt-1">2 · (Prec · Rec) / (Prec + Rec)</p>
              <p className="text-xs text-slate-400 mt-2">Harmonic mean used as primary model selection criterion on validation set.</p>
            </div>
            <div className="p-4 rounded-xl bg-neural-dark border border-slate-800">
              <span className="text-xs font-mono text-pink-400">ACCURACY</span>
              <p className="font-mono text-sm text-white mt-1">(TP + TN) / Total</p>
              <p className="text-xs text-slate-400 mt-2">Overall proportion of drawings correctly assigned on the balanced test cohort.</p>
            </div>
            <div className="p-4 rounded-xl bg-neural-dark border border-slate-800">
              <span className="text-xs font-mono text-amber-400">PRECISION</span>
              <p className="font-mono text-sm text-white mt-1">TP / (TP + FP)</p>
              <p className="text-xs text-slate-400 mt-2">Reliability of a positive flag; percentage of flagged drawings truly Parkinson.</p>
            </div>
            <div className="p-4 rounded-xl bg-neural-dark border border-slate-800">
              <span className="text-xs font-mono text-cyan-300">ROC-AUC</span>
              <p className="font-mono text-sm text-white mt-1">∫ TPR(FPR) d(FPR)</p>
              <p className="text-xs text-slate-400 mt-2">Threshold-independent discrimination capacity across all confidence boundaries.</p>
            </div>
          </div>
        </div>

        {/* Section 4: Limitations and Responsible AI */}
        <div className="p-8 rounded-2xl bg-gradient-to-br from-neural-surface/80 to-red-950/20 border border-red-500/20 backdrop-blur-md mb-8">
          <div className="flex items-center gap-3 mb-4">
            <ShieldAlert className="w-6 h-6 text-red-400" />
            <h2 className="text-xl font-bold text-white">4. Limitations & Research Boundaries</h2>
          </div>
          <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <p>
              • <strong>Small Cohort Size:</strong> The dataset comprises 204 total drawings. While sufficient for university research and prototype validation, large-scale clinical deployment requires thousands of multi-center clinical trials.
            </p>
            <p>
              • <strong>Static 2D Images vs. Dynamic Kinematics:</strong> Scanned images lack dynamic kinematic signals (pen tip pressure, velocity, azimuth angle, on-surface vs. in-air trajectory) that provide significant diagnostic signal in movement disorder clinics.
            </p>
            <p>
              • <strong>Non-Diagnostic Disclaimer:</strong> This system is strictly an academic research and engineering prototype. Model confidence scores represent mathematical pattern similarity within the supplied dataset and must never be interpreted as clinical diagnoses.
            </p>
          </div>
        </div>

        {/* Section 5: Future Scope */}
        <div className="p-8 rounded-2xl bg-neural-surface/80 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-6">
            <Lightbulb className="w-6 h-6 text-neural-cyan" />
            <h2 className="text-xl font-bold text-white">5. Future Scope & Research Trajectory</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-300">
            <div className="p-4 rounded-xl bg-neural-dark border border-slate-800">
              <h4 className="font-semibold text-neural-cyan mb-1">Subject-Independent K-Fold Cross-Validation</h4>
              <p className="text-slate-400">Implement strict GroupKFold based on participant identifiers so that no individual's drawings appear in both train and validation folds.</p>
            </div>
            <div className="p-4 rounded-xl bg-neural-dark border border-slate-800">
              <h4 className="font-semibold text-neural-violet mb-1">Temporal Kinematic Integration</h4>
              <p className="text-slate-400">Incorporate high-frequency Wacom or Apple Pencil sensor streams (200Hz sampling of pressure and velocity) with 1D-CNN or LSTM architectures.</p>
            </div>
            <div className="p-4 rounded-xl bg-neural-dark border border-slate-800">
              <h4 className="font-semibold text-neural-green mb-1">Vision Transformer (ViT) Exploration</h4>
              <p className="text-slate-400">Evaluate self-attention models on high-resolution stroke patches to capture long-range geometric irregularity in drawing loops.</p>
            </div>
            <div className="p-4 rounded-xl bg-neural-dark border border-slate-800">
              <h4 className="font-semibold text-pink-400 mb-1">On-Device Edge Inference</h4>
              <p className="text-slate-400">Quantize weights into INT8 TFLite/CoreML formats for zero-latency local mobile tablet screening without cloud transmission.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
