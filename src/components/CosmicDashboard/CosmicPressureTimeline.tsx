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

  // Pre-compute gradient backgrounds for each segment
  const segmentStyles = useMemo(() => {
    const len = hours.length;
    return hours.map((h, i) => {
      const color = getNodeColor(h.nodeType);
      const prev = i > 0 ? getNodeColor(hours[i - 1].nodeType) : color;
      const next = i < len - 1 ? getNodeColor(hours[i + 1].nodeType) : color;
      return {
        left: `${(i / len) * 100}%`,
        width: `${100 / len}%`,
        background: `linear-gradient(to right, ${prev}00, ${color}80, ${color}80, ${next}00)`,
      };
    });
  }, [hours]);

  return (
    <div className="relative w-full">
      {/* Header */}
      <div className="flex items-center gap-1.5 mb-4">
        <p className="text-[11px] text-gray-500 uppercase tracking-[0.15em] font-medium">
          Pressure Spectrum
        </p>
        <CosmicInfoTooltip label="Pressure spectrum info">
          {COSMIC_TOOLTIPS.nodeUltraAligned.text}
        </CosmicInfoTooltip>
      </div>

      {/* Timeline band */}
      <div className="relative h-14 rounded-full overflow-hidden bg-white/[0.03] border border-white/[0.06]">
        {hours.map((h, i) => {
          const isActive = active === i;
          const isBestWindow = h.nodeType === 'ULTRA_ALIGNED' || h.nodeType === 'HIGH_PRESSURE';

          return (
            <div
              key={i}
              className={`absolute top-0 bottom-0 cursor-pointer transition-all duration-200 hover:brightness-125 ${isActive ? 'z-20 brightness-130' : ''}`}
              style={segmentStyles[i]}
              {...getHandlers(i)}
            >
              {/* Shimmer for best windows */}
              {isBestWindow && (
                <div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"
                  style={{ backgroundSize: '200% 100%' }}
                />
              )}

              {/* Active ring indicator */}
              {isActive && (
                <div className="absolute inset-0 ring-2 ring-white/60 rounded-sm pointer-events-none" />
              )}
            </div>
          );
        })}

        {/* Current time beam */}
        {timePercent !== null && (
          <motion.div
            className="absolute top-[-4px] bottom-[-4px] w-[3px] z-30 pointer-events-none rounded-full"
            style={{
              left: `${timePercent}%`,
              background: 'linear-gradient(to bottom, transparent, #2EC5FF, transparent)',
              boxShadow: '0 0 8px rgba(46,197,255,0.6)',
            }}
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </div>

      {/* Hour labels below band */}
      <div className="relative h-4 mt-1">
        {hours.map((h, i) => {
          const isCurrent = i === currentIdx;
          const showLabel = i % 4 === 0 || isCurrent;
          if (!showLabel) return null;
          const len = hours.length;
          const leftPct = ((i + 0.5) / len) * 100;
          return (
            <span
              key={i}
              className={`absolute text-[9px] font-mono -translate-x-1/2 ${isCurrent ? 'text-[#2EC5FF] font-semibold' : 'text-gray-500'}`}
              style={{ left: `${leftPct}%` }}
            >
              {formatHour(h.startTime)}
            </span>
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
            <CosmicGlassCard variant="sunken" className="!p-3">
              {(() => {
                const h = hours[active];
                const color = getNodeColor(h.nodeType);
                return (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span
                        className="text-xs font-bold uppercase tracking-wide"
                        style={{ color }}
                      >
                        {h.nodeType.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] text-gray-500 ml-auto font-mono">
                        {formatHour(h.startTime)} – {formatHour(h.endTime)}
                      </span>
                    </div>
                    <p className="text-white text-xs font-semibold">
                      {h.vedic.planet} <span className="text-gray-500 font-normal mx-1">/</span> {h.chinese.animal}
                    </p>
                    <p className="text-gray-400 text-[11px] leading-relaxed">
                      {h.tradingGuidance}
                    </p>
                  </div>
                );
              })()}
            </CosmicGlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend pills */}
      <div className="flex flex-wrap gap-1.5 mt-3">
        {Object.entries(NODE_LABELS).map(([key, label]) => {
          const color = NODE_COLORS[key];
          return (
            <span
              key={key}
              className="inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-gray-400"
            >
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
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
