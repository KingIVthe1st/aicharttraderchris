import { useState } from 'react';
import { motion } from 'framer-motion';
import type { HoraGridHour } from '@/types/cosmic';

interface Props { hours: HoraGridHour[] }

const NODE_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  ULTRA_ALIGNED: { bg: 'bg-amber-500/70',  border: 'border-amber-400',   text: 'text-amber-100' },
  HIGH_PRESSURE: { bg: 'bg-green-500/70',  border: 'border-green-400',   text: 'text-green-100' },
  SOUL_WINDOW:   { bg: 'bg-blue-500/70',   border: 'border-blue-400',    text: 'text-blue-100' },
  MIXED:         { bg: 'bg-yellow-500/70', border: 'border-yellow-400',  text: 'text-yellow-100' },
  CONFLICT:      { bg: 'bg-red-500/70',    border: 'border-red-400',     text: 'text-red-100' },
  DISRUPTION:    { bg: 'bg-purple-500/70', border: 'border-purple-400',  text: 'text-purple-100' },
  U_NODE:        { bg: 'bg-gray-500/50',   border: 'border-gray-600',    text: 'text-gray-300' },
};

function isCurrentHour(start: string, end: string): boolean {
  const now = Date.now();
  return now >= new Date(start).getTime() && now < new Date(end).getTime();
}

function formatHour(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', hour12: true }).replace(' ', '');
}

export default function CosmicPressureTimeline({ hours }: Props) {
  const [tooltip, setTooltip] = useState<number | null>(null);
  const currentIdx = hours.findIndex(h => isCurrentHour(h.startTime, h.endTime));

  return (
    <div className="relative w-full">
      <p className="text-xs text-gray-500 uppercase tracking-widest mb-3 font-medium">Cosmic Pressure Timeline · 24-Hour</p>

      <div className="relative flex w-full h-14 rounded-xl overflow-visible border border-gray-800">
        {hours.map((h, i) => {
          const style = NODE_STYLES[h.nodeType] ?? NODE_STYLES['U_NODE'];
          const isCurrent = i === currentIdx;
          const isBestWindow = h.nodeType === 'ULTRA_ALIGNED' || h.nodeType === 'HIGH_PRESSURE';

          return (
            <div
              key={i}
              className={`relative flex-1 ${style.bg} border-r border-r-black/20 cursor-pointer transition-all duration-200 hover:brightness-125`}
              onMouseEnter={() => setTooltip(i)}
              onMouseLeave={() => setTooltip(null)}
            >
              {isBestWindow && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"
                  style={{ backgroundSize: '200% 100%' }} />
              )}
              {isCurrent && (
                <motion.div
                  className="absolute inset-0 border-2 border-white/80 z-10 pointer-events-none"
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
              {(i % 4 === 0 || isCurrent) && (
                <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-mono ${style.text} opacity-80 whitespace-nowrap`}>
                  {formatHour(h.startTime)}
                </span>
              )}
              <span className={`hidden sm:block absolute top-1 left-1/2 -translate-x-1/2 text-[10px] font-bold ${style.text} opacity-90`}>
                {h.vedic.planet.slice(0, 2)}
              </span>
            </div>
          );
        })}
      </div>

      {tooltip !== null && (
        <div className="absolute z-50 top-full mt-2 bg-gray-900 border border-gray-700 rounded-xl p-3 text-xs shadow-xl w-56 pointer-events-none"
          style={{ left: `${(tooltip / hours.length) * 100}%`, transform: 'translateX(-50%)' }}>
          {(() => {
            const h = hours[tooltip];
            const style = NODE_STYLES[h.nodeType] ?? NODE_STYLES['U_NODE'];
            return (
              <>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`w-2 h-2 rounded-full ${style.bg}`} />
                  <span className={`font-bold uppercase ${style.text}`}>{h.nodeType.replace('_', ' ')}</span>
                </div>
                <p className="text-gray-300 mb-1">{formatHour(h.startTime)} – {formatHour(h.endTime)}</p>
                <p className="text-white font-semibold mb-0.5">{h.vedic.planet} · {h.chinese.animal}</p>
                <p className="text-gray-400 leading-relaxed">{h.tradingGuidance}</p>
              </>
            );
          })()}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mt-3">
        {Object.entries(NODE_STYLES).filter(([k]) => k !== 'U_NODE').map(([key, s]) => (
          <span key={key} className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border ${s.border} ${s.bg} ${s.text}`}>
            {key.replace('_', ' ')}
          </span>
        ))}
      </div>
    </div>
  );
}
