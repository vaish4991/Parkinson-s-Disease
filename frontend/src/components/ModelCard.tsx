import React from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, CheckCircle2, XCircle, Loader2, ChevronRight } from 'lucide-react';

export interface ModelMetrics {
  accuracy?: number;
  f1?: number;
  recall?: number;
  precision?: number;
  roc_auc?: number;
}

export interface ModelCardProps {
  name: string;
  architecture: string;
  parameters: string;
  preprocessing: string;
  metrics?: ModelMetrics;
  status: 'trained' | 'unavailable' | 'loading';
  selected?: boolean;
  onSelect?: () => void;
}

const STATUS_CONFIG = {
  trained: {
    icon: <CheckCircle2 size={13} />,
    label: 'Trained',
    classes: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  },
  unavailable: {
    icon: <XCircle size={13} />,
    label: 'Unavailable',
    classes: 'text-gray-500 bg-gray-500/10 border-gray-500/30',
  },
  loading: {
    icon: <Loader2 size={13} className="animate-spin" />,
    label: 'Loading',
    classes: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  },
};

function MetricBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-[11px] text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>
          {label}
        </span>
        <span className="text-[11px] font-semibold text-cyan-400" style={{ fontFamily: 'Manrope, sans-serif' }}>
          {(value * 100).toFixed(1)}%
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
          initial={{ width: 0 }}
          whileInView={{ width: `${value * 100}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
          style={{ boxShadow: '0 0 8px rgba(0,212,255,0.4)' }}
        />
      </div>
    </div>
  );
}

const ModelCard: React.FC<ModelCardProps> = ({
  name,
  architecture,
  parameters,
  preprocessing,
  metrics,
  status,
  selected = false,
  onSelect,
}) => {
  const statusCfg = STATUS_CONFIG[status];
  const isSelectable = status === 'trained' && !!onSelect;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      whileHover={isSelectable ? { y: -3, transition: { duration: 0.18 } } : {}}
      onClick={isSelectable ? onSelect : undefined}
      className={`
        relative group rounded-2xl border backdrop-blur-lg bg-[rgba(17,24,39,0.8)]
        transition-all duration-300
        ${isSelectable ? 'cursor-pointer' : 'cursor-default'}
        ${selected
          ? 'border-cyan-500/50 shadow-[0_0_30px_rgba(0,212,255,0.15)] bg-cyan-500/5'
          : 'border-white/10 hover:border-white/20 shadow-lg hover:shadow-[0_0_25px_rgba(0,212,255,0.08)]'
        }
      `}
    >
      {/* Selected glow overlay */}
      {selected && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none" />
      )}

      <div className="relative p-6 space-y-5">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300
                ${selected ? 'bg-cyan-500/20 shadow-[0_0_16px_rgba(0,212,255,0.3)]' : 'bg-white/5 group-hover:bg-cyan-500/10'}
              `}
            >
              <BrainCircuit size={20} className={`transition-colors duration-300 ${selected ? 'text-cyan-300' : 'text-cyan-500/70 group-hover:text-cyan-400'}`} />
            </div>
            <div>
              <h3
                className="text-sm font-bold text-white leading-tight"
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                {name}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                {architecture}
              </p>
            </div>
          </div>

          {/* Status badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border shrink-0 ${statusCfg.classes}`}
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {statusCfg.icon}
            {statusCfg.label}
          </span>
        </div>

        {/* Info rows */}
        <div className="space-y-1.5 text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>
          <div className="flex justify-between gap-2">
            <span className="text-gray-500">Parameters</span>
            <span className="text-gray-300 font-medium">{parameters}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-gray-500">Preprocessing</span>
            <span className="text-gray-300 font-medium text-right max-w-[160px]">{preprocessing}</span>
          </div>
        </div>

        {/* Metrics */}
        {metrics && Object.keys(metrics).length > 0 && (
          <div className="space-y-2.5 pt-1 border-t border-white/5">
            {metrics.accuracy !== undefined && (
              <MetricBar label="Accuracy" value={metrics.accuracy} />
            )}
            {metrics.f1 !== undefined && (
              <MetricBar label="F1 Score" value={metrics.f1} />
            )}
            {metrics.recall !== undefined && (
              <MetricBar label="Recall" value={metrics.recall} />
            )}
            {metrics.precision !== undefined && (
              <MetricBar label="Precision" value={metrics.precision} />
            )}
            {metrics.roc_auc !== undefined && (
              <MetricBar label="ROC-AUC" value={metrics.roc_auc} />
            )}
          </div>
        )}

        {/* Select CTA */}
        {isSelectable && !selected && (
          <div className="flex items-center gap-1 text-xs text-cyan-500/60 group-hover:text-cyan-400 transition-colors duration-200 pt-1">
            <span style={{ fontFamily: 'Inter, sans-serif' }}>Select model</span>
            <ChevronRight size={13} />
          </div>
        )}
        {selected && (
          <div className="flex items-center gap-1 text-xs text-cyan-400 pt-1">
            <CheckCircle2 size={13} />
            <span style={{ fontFamily: 'Inter, sans-serif' }}>Selected</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ModelCard;
