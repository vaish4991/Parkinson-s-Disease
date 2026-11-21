import React from 'react';
import { motion } from 'framer-motion';

export interface ConfusionMatrixProps {
  matrix: [[number, number], [number, number]]; // [[TN, FP], [FN, TP]]
  labels: ['Healthy', 'Parkinson'];
  modelName: string;
}

interface CellConfig {
  value: number;
  total: number;
  abbr: string;
  fullLabel: string;
  isCorrect: boolean;
}

const ConfusionMatrix: React.FC<ConfusionMatrixProps> = ({ matrix, labels, modelName }) => {
  const [[TN, FP], [FN, TP]] = matrix;
  const total = TN + FP + FN + TP;

  const pct = (n: number) => total > 0 ? ((n / total) * 100).toFixed(1) : '0.0';

  const cells: CellConfig[] = [
    { value: TN, total, abbr: 'TN', fullLabel: 'True Negative', isCorrect: true },
    { value: FP, total, abbr: 'FP', fullLabel: 'False Positive', isCorrect: false },
    { value: FN, total, abbr: 'FN', fullLabel: 'False Negative', isCorrect: false },
    { value: TP, total, abbr: 'TP', fullLabel: 'True Positive', isCorrect: true },
  ];

  return (
    <div className="space-y-5">
      {/* Title */}
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-widest" style={{ fontFamily: 'Inter, sans-serif' }}>
          Confusion Matrix
        </p>
        <p className="text-sm font-semibold text-white/80 mt-0.5" style={{ fontFamily: 'Manrope, sans-serif' }}>
          {modelName}
        </p>
      </div>

      {/* Axis labels + Grid */}
      <div className="flex gap-3">
        {/* Y-axis label */}
        <div className="flex items-center justify-center">
          <span
            className="text-[10px] text-gray-500 uppercase tracking-widest"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontFamily: 'Inter, sans-serif' }}
          >
            Actual
          </span>
        </div>

        <div className="flex-1">
          {/* X-axis labels */}
          <div className="grid grid-cols-2 gap-1 mb-1 ml-[72px]">
            {labels.map((l) => (
              <div key={l} className="text-center">
                <span className="text-[11px] text-gray-400 font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {l}
                </span>
              </div>
            ))}
          </div>
          <p className="text-center text-[10px] text-gray-600 uppercase tracking-widest mb-2 ml-[72px]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Predicted
          </p>

          {/* Row labels + cells */}
          {[0, 1].map((row) => (
            <div key={row} className="flex items-center gap-1 mb-1">
              {/* Row label */}
              <div className="w-[68px] shrink-0 text-right pr-2">
                <span className="text-[11px] text-gray-400 font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {labels[row]}
                </span>
              </div>
              {[0, 1].map((col) => {
                const cellIdx = row * 2 + col;
                const cell = cells[cellIdx];
                return (
                  <motion.div
                    key={col}
                    initial={{ opacity: 0, scale: 0.85 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: cellIdx * 0.07 }}
                    className={`
                      flex-1 aspect-square flex flex-col items-center justify-center rounded-xl
                      border transition-all duration-300 cursor-default group
                      ${cell.isCorrect
                        ? 'border-cyan-500/30 bg-cyan-500/10 hover:border-cyan-400/50 hover:bg-cyan-500/15'
                        : 'border-red-500/25 bg-red-500/8 hover:border-red-400/40 hover:bg-red-500/12'
                      }
                    `}
                    style={{
                      boxShadow: cell.isCorrect
                        ? '0 0 20px rgba(0,212,255,0.08)'
                        : '0 0 20px rgba(239,68,68,0.06)',
                    }}
                  >
                    <span
                      className={`text-xl font-bold leading-none ${cell.isCorrect ? 'text-cyan-400' : 'text-red-400'}`}
                      style={{ fontFamily: 'Manrope, sans-serif' }}
                    >
                      {cell.value}
                    </span>
                    <span
                      className="text-[10px] text-gray-500 mt-1"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {pct(cell.value)}%
                    </span>
                    <span
                      className={`text-[9px] font-semibold uppercase tracking-wider mt-0.5 ${cell.isCorrect ? 'text-cyan-500/70' : 'text-red-400/70'}`}
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {cell.abbr}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 pt-1">
        {cells.map((c) => (
          <div key={c.abbr} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-sm"
              style={{ background: c.isCorrect ? 'rgba(0,212,255,0.5)' : 'rgba(239,68,68,0.5)' }}
            />
            <span className="text-[11px] text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
              {c.abbr} – {c.fullLabel}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConfusionMatrix;
