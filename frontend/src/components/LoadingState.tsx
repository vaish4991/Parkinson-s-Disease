import React from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit } from 'lucide-react';

export type LoadingType = 'scanning' | 'spinner' | 'pulse';

export interface LoadingStateProps {
  message?: string;
  type?: LoadingType;
}

/* ── Scanning type ── */
function ScanningLoader() {
  return (
    <div className="relative w-48 h-24 overflow-hidden rounded-xl bg-black/40 border border-cyan-500/20">
      {/* Grid lines */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="absolute left-0 right-0 h-px bg-cyan-500/10"
          style={{ top: `${(i + 1) * 16.67}%` }}
        />
      ))}
      {[...Array(7)].map((_, i) => (
        <div
          key={i}
          className="absolute top-0 bottom-0 w-px bg-cyan-500/10"
          style={{ left: `${(i + 1) * 12.5}%` }}
        />
      ))}

      {/* Scan line */}
      <motion.div
        className="absolute top-0 bottom-0 w-0.5 rounded-full"
        style={{
          background: 'linear-gradient(to bottom, transparent, rgba(0,212,255,0.9), transparent)',
          boxShadow: '0 0 16px 4px rgba(0,212,255,0.4)',
        }}
        initial={{ left: '0%' }}
        animate={{ left: ['0%', '100%', '0%'] }}
        transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
      />

      {/* Corner brackets */}
      <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-400/60 rounded-tl" />
      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-400/60 rounded-tr" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-400/60 rounded-bl" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-400/60 rounded-br" />
    </div>
  );
}

/* ── Spinner type ── */
function SpinnerLoader() {
  return (
    <div className="relative w-16 h-16">
      {/* Outer ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400 border-r-cyan-500/60"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        style={{ boxShadow: '0 0 20px rgba(0,212,255,0.3)' }}
      />
      {/* Inner ring */}
      <motion.div
        className="absolute inset-2 rounded-full border-2 border-transparent border-b-violet-400 border-l-violet-500/60"
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: 1.4, ease: 'linear' }}
      />
      {/* Center dot */}
      <div
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(0,212,255,0.8)]" />
      </div>
    </div>
  );
}

/* ── Pulse type ── */
function PulseLoader() {
  return (
    <div className="relative flex items-center justify-center w-20 h-20">
      {/* Ripple rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-cyan-500/40"
          initial={{ width: 20, height: 20, opacity: 1 }}
          animate={{ width: 72, height: 72, opacity: 0 }}
          transition={{
            repeat: Infinity,
            duration: 2,
            delay: i * 0.65,
            ease: 'easeOut',
          }}
        />
      ))}
      {/* Core icon */}
      <motion.div
        animate={{ scale: [1, 1.12, 1] }}
        transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
        className="relative z-10 flex items-center justify-center w-12 h-12 rounded-full bg-cyan-500/15 border border-cyan-500/40"
        style={{ boxShadow: '0 0 24px rgba(0,212,255,0.3)' }}
      >
        <BrainCircuit size={22} className="text-cyan-400" />
      </motion.div>
    </div>
  );
}

const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Processing…',
  type = 'scanning',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col items-center justify-center gap-5 py-8"
    >
      {type === 'scanning' && <ScanningLoader />}
      {type === 'spinner' && <SpinnerLoader />}
      {type === 'pulse' && <PulseLoader />}

      {message && (
        <div className="text-center space-y-1">
          <motion.p
            className="text-sm font-medium text-white/70"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {message}
          </motion.p>
          <div className="flex items-center justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1 h-1 rounded-full bg-cyan-500/60"
                animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
                transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2, ease: 'easeInOut' }}
              />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default LoadingState;
