import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Menu, X, Scan } from 'lucide-react';

interface NavLink {
  label: string;
  path: string;
}

const NAV_LINKS: NavLink[] = [
  { label: 'Overview', path: '/' },
  { label: 'AI Analysis', path: '/predict' },
  { label: 'Model Lab', path: '/models' },
  { label: 'How It Works', path: '/how-it-works' },
  { label: 'Research', path: '/research' },
];

const Navbar: React.FC = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'backdrop-blur-xl bg-black/60 border-b border-white/10 shadow-[0_4px_30px_rgba(0,212,255,0.05)]'
          : 'backdrop-blur-md bg-black/40 border-b border-white/5'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group select-none">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-cyan-500/30 blur-md group-hover:bg-cyan-400/50 transition-all duration-300" />
            <BrainCircuit
              size={28}
              className="relative text-cyan-400 group-hover:text-cyan-300 transition-colors duration-300"
            />
          </div>
          <span
            className="text-lg font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-500 bg-clip-text text-transparent"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            NEUROSCAN AI
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <ul className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.path);
            return (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${
                    active
                      ? 'text-cyan-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {/* Hover bg */}
                  <span className="absolute inset-0 rounded-lg bg-white/0 group-hover:bg-white/5 transition-all duration-200" />
                  <span className="relative">{link.label}</span>
                  {/* Active indicator */}
                  {active && (
                    <motion.span
                      layoutId="nav-active-indicator"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-4/5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full shadow-[0_0_8px_rgba(0,212,255,0.8)]"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* CTA + Mobile Toggle */}
        <div className="flex items-center gap-3">
          <Link
            to="/predict"
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-[0_0_20px_rgba(0,212,255,0.3)] hover:shadow-[0_0_28px_rgba(0,212,255,0.5)] transition-all duration-200 select-none"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <Scan size={16} />
            Analyze Image
          </Link>

          <button
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle mobile menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden border-t border-white/5 bg-black/70 backdrop-blur-xl"
          >
            <ul className="flex flex-col px-4 py-3 gap-1">
              {NAV_LINKS.map((link, i) => {
                const active = isActive(link.path);
                return (
                  <motion.li
                    key={link.path}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      to={link.path}
                      className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        active
                          ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20'
                          : 'text-gray-300 hover:text-white hover:bg-white/5'
                      }`}
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                );
              })}
              <motion.li
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: NAV_LINKS.length * 0.05 }}
                className="mt-2"
              >
                <Link
                  to="/predict"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-[0_0_20px_rgba(0,212,255,0.3)] transition-all duration-200"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <Scan size={16} />
                  Analyze Image
                </Link>
              </motion.li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
