import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SectionTutorial } from '../config/sectionMeta';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  icon: string;
  title: string;
  tutorial: SectionTutorial;
}

export default function SectionTutorialModal({ isOpen, onClose, icon, title, tutorial }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700/30">
              <div className="flex items-center gap-2">
                <span className="text-xl">{icon}</span>
                <h3 className="text-white font-bold text-sm">{title}</h3>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-gray-700/50 hover:bg-gray-600/50 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                aria-label="Close tutorial"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              <div>
                <p className="text-[10px] text-cyan-400 uppercase tracking-wider font-bold mb-1">What it shows</p>
                <p className="text-gray-300 text-xs leading-relaxed">{tutorial.whatItShows}</p>
              </div>
              <div>
                <p className="text-[10px] text-amber-400 uppercase tracking-wider font-bold mb-1">How to read it</p>
                <p className="text-gray-300 text-xs leading-relaxed">{tutorial.howToRead}</p>
              </div>
              <div>
                <p className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold mb-1">Trading tip</p>
                <p className="text-gray-300 text-xs leading-relaxed">{tutorial.tradingTip}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
