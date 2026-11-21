import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

type ColorVariant = 'cyan' | 'violet' | 'blue' | 'green';

export interface StatCardProps {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  description?: string;
  color?: ColorVariant;
  animate?: boolean;
}

const COLOR_MAP: Record<ColorVariant, { glow: string; border: string; iconBg: string; text: string }> = {
  cyan:   { glow: 'shadow-cyan-500/20',   border: 'hover:border-cyan-500/40',   iconBg: 'bg-cyan-500/10',   text: 'text-cyan-400'   },
  violet: { glow: 'shadow-violet-500/20', border: 'hover:border-violet-500/40', iconBg: 'bg-violet-500/10', text: 'text-violet-400' },
  blue:   { glow: 'shadow-blue-500/20',   border: 'hover:border-blue-500/40',   iconBg: 'bg-blue-500/10',   text: 'text-blue-400'   },
  green:  { glow: 'shadow-green-500/20',  border: 'hover:border-green-500/40',  iconBg: 'bg-green-500/10',  text: 'text-green-400'  },
};

function useCounter(target: number, duration = 1600, enabled = true): number {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) {
      setCount(target);
      return;
    }
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration, enabled]);

  return count;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  value,
  label,
  description,
  color = 'cyan',
  animate = true,
}) => {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const styles = COLOR_MAP[color];

  const isNumeric = typeof value === 'number';
  const counted = useCounter(isNumeric ? (value as number) : 0, 1600, animate && inView && isNumeric);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const displayValue = isNumeric && animate ? counted : value;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`
        relative group rounded-2xl border border-white/10 bg-[rgba(17,24,39,0.8)]
        backdrop-blur-lg p-6 cursor-default
        hover:border-white/20 ${styles.border}
        shadow-lg ${styles.glow}
        hover:shadow-xl transition-all duration-300
      `}
    >
      {/* Background glow on hover */}
      <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-white/[0.02] to-transparent`} />

      <div className="relative flex flex-col gap-4">
        {/* Icon */}
        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${styles.iconBg} ${styles.text} ring-1 ring-inset ring-white/10`}>
          {icon}
        </div>

        {/* Value */}
        <div>
          <p
            className={`text-3xl font-bold ${styles.text} leading-none tracking-tight`}
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            {displayValue}
          </p>
          <p
            className="mt-1.5 text-sm font-medium text-white/70"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {label}
          </p>
        </div>

        {description && (
          <p
            className="text-xs text-gray-500 leading-relaxed border-t border-white/5 pt-3"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {description}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;
