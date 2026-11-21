import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Clock, Cpu, Info } from 'lucide-react';

export interface PredictionResultData {
  predicted_class: 'healthy' | 'parkinson';
  model: string;
  model_score: number;
  parkinson_probability: number;
  healthy_probability: number;
  processing_time_ms: number;
}

export interface PredictionResultProps {
  result: PredictionResultData | null;
  imagePreview: string | null;
}

const CIRCLE_R = 54;
const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_R;

function ProbabilityRing({ value, color }: { value: number; color: string }) {
  const [animated, setAnimated] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setAnimated(value), 120);
    return () => clearTimeout(timer);
  }, [value]);

  const dash = (animated / 100) * CIRCUMFERENCE;

  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      {/* Background track */}
      <circle cx="70" cy="70" r={CIRCLE_R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
      {/* Progress arc */}
      <circle
        cx="70"
        cy="70"
        r={CIRCLE_R}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${CIRCUMFERENCE}`}
        strokeDashoffset={0}
        transform="rotate(-90 70 70)"
        style={{ transition: 'stroke-dasharray 1.1s cubic-bezier(0.4,0,0.2,1)', filter: `drop-shadow(0 0 10px ${color})` }}
      />
      {/* Center text */}
      <text
        x="70"
        y="68"
        textAnchor="middle"
        dominantBaseline="middle"
        fill={color}
        fontSize="22"
        fontWeight="700"
        fontFamily="Manrope, sans-serif"
      >
        {Math.round(animated)}%
      </text>
      <text
        x="70"
        y="88"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="rgba(255,255,255,0.4)"
        fontSize="10"
        fontFamily="Inter, sans-serif"
      >
        confidence
      </text>
    </svg>
  );
}

function ProbabilityBar({ label, value, color }: { label: string; value: number; color: string }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 200);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <span className="text-xs text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>{label}</span>
        <span className="text-xs font-semibold" style={{ color, fontFamily: 'Manrope, sans-serif' }}>
          {value.toFixed(1)}%
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${width}%`, background: color, boxShadow: `0 0 10px ${color}80` }}
        />
      </div>
    </div>
  );
}

const PredictionResult: React.FC<PredictionResultProps> = ({ result, imagePreview }) => {
  const isHealthy = result?.predicted_class === 'healthy';
  const accentColor = isHealthy ? '#22c55e' : '#f59e0b';
  const accentBorder = isHealthy ? 'border-green-500/30' : 'border-amber-500/30';
  const accentBg = isHealthy ? 'bg-green-500/5' : 'bg-amber-500/5';
  const accentGlow = isHealthy
    ? 'shadow-[0_0_40px_rgba(34,197,94,0.1)]'
    : 'shadow-[0_0_40px_rgba(245,158,11,0.1)]';

  const parkProb = result ? result.parkinson_probability * 100 : 0;
  const healthyProb = result ? result.healthy_probability * 100 : 0;
  const confidence = isHealthy ? healthyProb : parkProb;

  return (
    <AnimatePresence>
      {result && (
        <motion.div
          key="result"
          initial={{ opacity: 0, scale: 0.88, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -10 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className={`rounded-2xl border ${accentBorder} ${accentBg} ${accentGlow} backdrop-blur-lg bg-[rgba(17,24,39,0.85)] overflow-hidden`}
        >
          {/* Header */}
          <div className={`flex items-center gap-3 px-6 py-4 border-b border-white/5`}>
            <div
              className="flex items-center justify-center w-10 h-10 rounded-xl"
              style={{ background: `${accentColor}18` }}
            >
              {isHealthy
                ? <CheckCircle2 size={22} style={{ color: accentColor }} />
                : <AlertTriangle size={22} style={{ color: accentColor }} />
              }
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest" style={{ fontFamily: 'Inter, sans-serif' }}>
                Classification Result
              </p>
              <h3
                className="text-base font-bold text-white leading-tight"
                style={{ fontFamily: 'Manrope, sans-serif', color: accentColor }}
              >
                {isHealthy ? 'Healthy Pattern Detected' : "Parkinson's Pattern Detected"}
              </h3>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Top section: ring + image */}
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Confidence ring */}
              <div className="flex flex-col items-center gap-2 shrink-0">
                <ProbabilityRing value={confidence} color={accentColor} />
                <span
                  className="text-xs text-gray-500 text-center max-w-[130px]"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Model classified this drawing as{' '}
                  <span style={{ color: accentColor }} className="font-semibold">
                    {isHealthy ? 'Healthy' : "Parkinson's"}
                  </span>
                  -class
                </span>
              </div>

              {/* Image preview */}
              {imagePreview && (
                <div className="flex-1 w-full">
                  <img
                    src={imagePreview}
                    alt="Analyzed drawing"
                    className="w-full max-h-[180px] object-contain rounded-xl border border-white/10 bg-black/40"
                  />
                </div>
              )}
            </div>

            {/* Probability bars */}
            <div className="space-y-3">
              <ProbabilityBar label="Healthy Probability" value={healthyProb} color="#22c55e" />
              <ProbabilityBar label="Parkinson's Probability" value={parkProb} color="#f59e0b" />
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                <Cpu size={13} className="text-cyan-400" />
                <span className="text-xs text-gray-300" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {result.model}
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                <Clock size={13} className="text-violet-400" />
                <span className="text-xs text-gray-300" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {result.processing_time_ms.toFixed(0)} ms
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                <span className="text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Score: {(result.model_score * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Medical disclaimer */}
            <div className="flex gap-2.5 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
              <Info size={15} className="text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-400/80 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                <span className="font-semibold text-amber-400">Research only.</span> This result is
                generated by an AI model for research purposes and does not constitute a medical
                diagnosis. Consult a qualified neurologist for any clinical concerns.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PredictionResult;
