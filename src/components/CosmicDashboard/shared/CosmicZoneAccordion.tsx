import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZONE_META } from '../config/sectionMeta';

interface Props {
  zone: 'NOW' | 'THIS_WEEK' | 'DEEP';
  children: React.ReactNode;
}

export default function CosmicZoneAccordion({ zone, children }: Props) {
  const meta = ZONE_META[zone];
  const [expanded, setExpanded] = useState(meta.defaultExpanded);

  return (
    <div className="space-y-5">
      {/* Zone header */}
      <button
        onClick={() => setExpanded(e => !e)}
        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border ${meta.accent} ${meta.accentBg} transition-all hover:opacity-90`}
      >
        <span className={`text-sm font-bold uppercase tracking-wider ${meta.accentText}`}>
          {meta.label}
        </span>
        <span className="text-gray-500 text-[10px] hidden sm:block">— {meta.description}</span>
        <motion.svg
          className={`w-4 h-4 ml-auto ${meta.accentText}`}
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

      {/* Zone content */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-5 overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
