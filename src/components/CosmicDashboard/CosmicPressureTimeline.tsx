import { useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { HoraGridHour } from '@/types/cosmic';
import CosmicInfoTooltip from './shared/CosmicInfoTooltip';
import CosmicGlassCard from './shared/CosmicGlassCard';
import { COSMIC_TOOLTIPS } from './config/cosmicTooltips';
import { useInteractiveSelection } from './hooks/useInteractiveSelection';

interface Props { hours: HoraGridHour[] }

const NODE_COLORS: Record<string, string> = {
  ULTRA_ALIGNED: '#F59E0B',
  HIGH_PRESSURE: '#22C55E',
  SOUL_WINDOW:   '#3B82F6',
  MIXED:         '#EAB308',
  CONFLICT:      '#EF4444',
  DISRUPTION:    '#A855F7',
  U_NODE:        '#6B7280',
};

const NODE_LABELS: Record<string, string> = {
  ULTRA_ALIGNED: 'Ultra Aligned',
  HIGH_PRESSURE: 'High Pressure',
  SOUL_WINDOW:   'Soul Window',
  MIXED:         'Mixed',
  CONFLICT:      'Conflict',
  DISRUPTION:    'Disruption',
};

function getNodeColor(nodeType: string): string {
  return NODE_COLORS[nodeType] ?? NODE_COLORS.U_NODE;
}

function isCurrentHour(start: string, end: string): boolean {
  const now = Date.now();
  return now >= new Date(start).getTime() && now < new Date(end).getTime();
}

function formatHour(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', hour12: true }).replace(' ', '');
}

function getCurrentTimePercent(hours: HoraGridHour[]): number | null {
  if (hours.length === 0) return null;
  const now = Date.now();
  const dayStart = new Date(hours[0].startTime).getTime();
  const dayEnd = new Date(hours[hours.length - 1].endTime).getTime();
  if (now < dayStart || now > dayEnd) return null;
  return ((now - dayStart) / (dayEnd - dayStart)) * 100;
}

export default function CosmicPressureTimeline({ hours }: Props) {
  const { active, getHandlers } = useInteractiveSelection<number>();
  const currentIdx = hours.findIndex(h => isCurrentHour(h.startTime, h.endTime));

  // Live-updating current time position
  const [timePercent, setTimePercent] = useState<number | null>(() => getCurrentTimePercent(hours));
  useEffect(() => {
    const tick = () => setTimePercent(getCurrentTimePercent(hours));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [hours]);

  // Gap-aware segment layout: 2px gaps between segments
  const GAP_PX = 2;
  const segmentMeta = useMemo(() => {
    const len = hours.length;
    return hours.map((h, i) => {
      const color = getNodeColor(h.nodeType);
      return {
        color,
        // Each segment is calc((100% - totalGaps) / N) wide, offset by i * that + i * gap
        left: `calc(${(i / len) * 100}% + ${i * GAP_PX}px * ${1 / len})`,
        width: `calc(${100 / len}% - ${((len - 1) * GAP_PX) / len}px)`,
        marginLeft: i > 0 ? `${GAP_PX}px` : '0px',
      };
    });
  }, [hours]);

  return (
    <div className="relative w-full">
      {/* Header */}
      <div className="flex items-center gap-1.5 mb-4">
        <p className="text-[12px] text-gray-500 uppercase tracking-[0.15em] font-medium">
          Pressure Spectrum
        </p>
        <CosmicInfoTooltip label="Pressure spectrum info">
          {COSMIC_TOOLTIPS.nodeUltraAligned.text}
        </CosmicInfoTooltip>
      </div>

      {/* Timeline track container */}
      <div className="relative rounded-full bg-black/30 p-1">
        <div className="relative h-12 flex items-stretch">
          {hours.map((h, i) => {
            const isActive = active === i;
            const isBestWindow = h.nodeType === 'ULTRA_ALIGNED' || h.nodeType === 'HIGH_PRESSURE';
            const meta = segmentMeta[i];

            return (
              <div
                key={i}
                className={`relative flex-1 cursor-pointer transition-all duration-200 hover:brightness-125 rounded-[3px] ring-1 ring-white/[0.06] ${isActive ? 'z-20 brightness-130' : ''}`}
                style={{
                  background: `linear-gradient(to bottom, ${meta.color}90, ${meta.color}50)`,
                  marginLeft: i > 0 ? `${GAP_PX}px` : undefined,
                }}
                {...getHandlers(i)}
              >
                {/* Shimmer for best windows */}
                {isBestWindow && (
                  <div
                    className="absolute inset-0 rounded-[3px] bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"
                    style={{ backgroundSize: '200% 100%' }}
                  />
                )}

                {/* Active ring indicator */}
                {isActive && (
                  <div className="absolute inset-0 ring-2 ring-white/60 rounded-[3px] pointer-events-none" />
                )}
              </div>
            );
          })}

          {/* Current time cursor */}
          {timePercent !== null && (
            <motion.div
              className="absolute top-[-6px] bottom-[-6px] z-30 pointer-events-none flex flex-col items-center"
              style={{ left: `${timePercent}%`, transform: 'translateX(-50%)' }}
              animate={{ opacity: [1, 0.6, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              {/* Top notch indicator */}
              <div
                className="w-2.5 h-1.5 rounded-b-sm flex-shrink-0"
                style={{
                  background: '#2EC5FF',
                  boxShadow: '0 0 6px rgba(46,197,255,0.8)',
                }}
              />
              {/* Cursor line */}
              <div
                className="w-[4px] flex-1 rounded-full"
                style={{
                  background: 'linear-gradient(to bottom, #2EC5FF, #2EC5FFcc, #2EC5FF)',
                  boxShadow:
                    '0 0 6px rgba(46,197,255,0.7), 0 0 14px rgba(46,197,255,0.4), 0 0 24px rgba(46,197,255,0.2)',
                }}
              />
            </motion.div>
          )}
        </div>
      </div>

      {/* Hour labels + tick lines below band */}
      <div className="relative h-6 mt-1.5">
        {hours.map((h, i) => {
          const isCurrent = i === currentIdx;
          const showLabel = i % 3 === 0 || isCurrent;
          if (!showLabel) return null;
          const len = hours.length;
          const leftPct = ((i + 0.5) / len) * 100;
          return (
            <div
              key={i}
              className="absolute flex flex-col items-center -translate-x-1/2"
              style={{ left: `${leftPct}%` }}
            >
              {/* Tick line */}
              <div
                className={`w-px h-1.5 mb-0.5 ${isCurrent ? 'bg-[#2EC5FF]/60' : 'bg-white/10'}`}
              />
              <span
                className={`text-[11px] font-mono leading-none ${isCurrent ? 'text-[#2EC5FF] font-semibold' : 'text-gray-500'}`}
              >
                {formatHour(h.startTime)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Detail popup on selection */}
      <AnimatePresence mode="wait">
        {active !== null && hours[active] && (
          <motion.div
            key={active}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="mt-2"
          >
            <CosmicGlassCard variant="sunken" className="!p-4">
              {(() => {
                const h = hours[active];
                const color = getNodeColor(h.nodeType);
                return (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span
                        className="text-[13px] font-bold uppercase tracking-wide"
                        style={{ color }}
                      >
                        {h.nodeType.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[11px] text-gray-500 ml-auto font-mono">
                        {formatHour(h.startTime)} – {formatHour(h.endTime)}
                      </span>
                    </div>
                    <p className="text-white text-[13px] font-semibold">
                      {h.vedic.planet} <span className="text-gray-500 font-normal mx-1">/</span> {h.chinese.animal}
                    </p>
                    <p className="text-gray-400 text-[12px] leading-relaxed">
                      {h.tradingGuidance}
                    </p>
                  </div>
                );
              })()}
            </CosmicGlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend pills - glass treatment */}
      <div className="flex flex-wrap gap-2 mt-3">
        {Object.entries(NODE_LABELS).map(([key, label]) => {
          const color = NODE_COLORS[key];
          return (
            <span
              key={key}
              className="inline-flex items-center gap-1.5 text-[11px] rounded-full px-3 py-1 bg-white/[0.04] border border-white/[0.06] text-gray-400"
            >
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              {label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
