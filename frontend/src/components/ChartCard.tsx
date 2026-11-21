import React from 'react';
import { motion } from 'framer-motion';

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, subtitle, children, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className={`
        relative rounded-2xl border border-white/10
        bg-[rgba(17,24,39,0.8)] backdrop-blur-lg
        shadow-lg overflow-hidden
        ${className}
      `}
    >
      {/* Subtle top glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />

      {/* Header */}
      {(title || subtitle) && (
        <div className="px-6 pt-5 pb-4 border-b border-white/5">
          {title && (
            <h3
              className="text-sm font-semibold text-white/90 leading-tight"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              {title}
            </h3>
          )}
          {subtitle && (
            <p
              className="mt-0.5 text-xs text-gray-500"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Chart content */}
      <div className="px-6 py-5">{children}</div>
    </motion.div>
  );
};

export default ChartCard;
