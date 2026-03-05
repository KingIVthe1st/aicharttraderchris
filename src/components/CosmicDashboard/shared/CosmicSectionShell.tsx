import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionTutorialModal from './SectionTutorialModal';
import type { SectionMeta } from '../config/sectionMeta';

interface Props {
  meta: SectionMeta;
  index: number;
  children: React.ReactNode;
}

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: 'easeOut' as const },
  }),
};

export default function CosmicSectionShell({ meta, index, children }: Props) {
  const [expanded, setExpanded] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);

  return (
    <>
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        custom={index}
      >
        {/* Section header */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base">{meta.icon}</span>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-xs uppercase tracking-widest">{meta.title}</h3>
            <p className="text-gray-500 text-[10px] truncate">{meta.subtitle}</p>
          </div>

          {/* Help button */}
          <button
            onClick={() => setShowTutorial(true)}
            className="w-6 h-6 rounded-full bg-gray-700/40 hover:bg-gray-600/50 flex items-center justify-center text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0"
            aria-label={`Learn about ${meta.title}`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" />
            </svg>
          </button>

          {/* Collapse toggle */}
          <button
            onClick={() => setExpanded(e => !e)}
            className="w-6 h-6 rounded-full bg-gray-700/40 hover:bg-gray-600/50 flex items-center justify-center text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0"
            aria-label={expanded ? 'Collapse section' : 'Expand section'}
          >
            <motion.svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              animate={{ rotate: expanded ? 0 : -90 }}
              transition={{ duration: 0.2 }}
            >
              <path d="M19 9l-7 7-7-7" />
            </motion.svg>
          </button>
        </div>

        {/* Section content */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <SectionTutorialModal
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        icon={meta.icon}
        title={meta.title}
        tutorial={meta.tutorial}
      />
    </>
  );
}
