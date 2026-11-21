import React from 'react';
import { Link } from 'react-router-dom';
import { BrainCircuit, ExternalLink } from 'lucide-react';

const NAV_COLUMNS = [
  {
    heading: 'Platform',
    links: [
      { label: 'Overview', to: '/' },
      { label: 'AI Analysis', to: '/predict' },
      { label: 'Model Lab', to: '/models' },
    ],
  },
  {
    heading: 'Learn',
    links: [
      { label: 'How It Works', to: '/how-it-works' },
      { label: 'Research', to: '/research' },
    ],
  },
];

const TECH_STACK = [
  { label: 'TensorFlow', color: 'text-orange-400 border-orange-400/30 bg-orange-400/5' },
  { label: 'React', color: 'text-cyan-400 border-cyan-400/30 bg-cyan-400/5' },
  { label: 'FastAPI', color: 'text-green-400 border-green-400/30 bg-green-400/5' },
  { label: 'TypeScript', color: 'text-blue-400 border-blue-400/30 bg-blue-400/5' },
  { label: 'Python', color: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/5' },
];

const Footer: React.FC = () => {
  return (
    <footer className="relative mt-auto border-t border-white/5">
      {/* Top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-2/3 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand column */}
          <div className="md:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2 mb-4 group select-none">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-sm group-hover:bg-cyan-400/35 transition-all duration-300" />
                <BrainCircuit size={24} className="relative text-cyan-400" />
              </div>
              <span
                className="text-base font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-500 bg-clip-text text-transparent"
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                NEUROSCAN AI
              </span>
            </Link>
            <p
              className="text-sm text-gray-400 leading-relaxed max-w-xs mb-6"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Decoding patterns. Advancing neurological research.
            </p>

            {/* Tech Stack Badges */}
            <div className="flex flex-wrap gap-2">
              {TECH_STACK.map((tech) => (
                <span
                  key={tech.label}
                  className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${tech.color}`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {tech.label}
                </span>
              ))}
            </div>
          </div>

          {/* Nav Columns */}
          {NAV_COLUMNS.map((col) => (
            <div key={col.heading}>
              <h4
                className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4"
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                {col.heading}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-gray-400 hover:text-cyan-400 transition-colors duration-200 inline-flex items-center gap-1 group"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {link.label}
                      <ExternalLink
                        size={11}
                        className="opacity-0 group-hover:opacity-60 transition-opacity duration-200"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-5 py-4 mb-8">
          <p
            className="text-xs text-amber-400/80 leading-relaxed"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <span className="font-semibold text-amber-400">⚠ Research Tool Only.</span> NEUROSCAN
            AI is an experimental research platform intended solely for academic and research
            purposes. It is NOT a certified medical diagnostic device and should NOT be used for
            clinical decision-making, diagnosis, or treatment. Always consult a qualified medical
            professional for any health concerns.
          </p>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/5">
          <p
            className="text-xs text-gray-600"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            © {new Date().getFullYear()} NEUROSCAN AI. All rights reserved.
          </p>
          <p
            className="text-xs text-gray-700"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Built with neural precision for research excellence.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
