import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { WeeklyCalendarDay } from '@/types/cosmic';
import CosmicGlassCard from './shared/CosmicGlassCard';
import CosmicInfoTooltip from './shared/CosmicInfoTooltip';
import { COSMIC_TOOLTIPS } from './config/cosmicTooltips';
import { useInteractiveSelection } from './hooks/useInteractiveSelection';

interface Props {
  calendar: WeeklyCalendarDay[];
  isLoading?: boolean;
}

const PLANET_GLYPHS: Record<string, string> = {
  Sun: '\u2609', Moon: '\u263D', Mars: '\u2642', Mercury: '\u263F',
  Jupiter: '\u2643', Venus: '\u2640', Saturn: '\u2644',
};

const DAY_COLORS: Record<string, string> = {
  Sun: '#F6C453', Moon: '#5DD8FF', Mars: '#EF4444',
  Mercury: '#A78BFA', Jupiter: '#FB923C', Venus: '#34D399', Saturn: '#94A3B8',
};

const NODE_WASH: Record<string, string> = {
  ULTRA_ALIGNED:  'rgba(16,185,129,0.08)',
  HIGH_PRESSURE:  'rgba(34,197,94,0.06)',
  SOUL_WINDOW:    'rgba(59,130,246,0.06)',
  MIXED:          'rgba(245,158,11,0.05)',
  CONFLICT:       'rgba(239,68,68,0.06)',
  DISRUPTION:     'rgba(168,85,247,0.06)',
  U_NODE:         'rgba(100,116,139,0.04)',
};

/** Tailwind gradient classes for week cell backgrounds based on nodeType */
const NODE_GRADIENT: Record<string, string> = {
  ULTRA_ALIGNED:  'bg-gradient-to-b from-emerald-500/[0.08] to-transparent',
  HIGH_PRESSURE:  'bg-gradient-to-b from-cyan-500/[0.08] to-transparent',
  SOUL_WINDOW:    'bg-gradient-to-b from-blue-500/[0.07] to-transparent',
  MIXED:          'bg-gradient-to-b from-amber-500/[0.06] to-transparent',
  CONFLICT:       'bg-gradient-to-b from-red-500/[0.06] to-transparent',
  DISRUPTION:     'bg-gradient-to-b from-purple-500/[0.06] to-transparent',
  U_NODE:         'bg-gradient-to-b from-slate-500/[0.04] to-transparent',
};

const NODE_LABEL: Record<string, { text: string; color: string; label: string }> = {
  ULTRA_ALIGNED:  { text: 'text-emerald-300', color: '#34d399', label: 'Prime' },
  HIGH_PRESSURE:  { text: 'text-green-300',   color: '#86efac', label: 'Strong' },
  SOUL_WINDOW:    { text: 'text-blue-300',    color: '#93c5fd', label: 'Soul' },
  MIXED:          { text: 'text-amber-300',   color: '#fcd34d', label: 'Mixed' },
  CONFLICT:       { text: 'text-red-300',     color: '#fca5a5', label: 'Caution' },
  DISRUPTION:     { text: 'text-purple-300',  color: '#c4b5fd', label: 'Disruption' },
  U_NODE:         { text: 'text-gray-400',    color: '#9ca3af', label: 'Neutral' },
};

const MOON_ICONS: Record<string, string> = {
  'New Moon': '\uD83C\uDF11', 'Waxing Crescent': '\uD83C\uDF12',
  'First Quarter': '\uD83C\uDF13', 'Waxing Gibbous': '\uD83C\uDF14',
  'Full Moon': '\uD83C\uDF15', 'Waning Gibbous': '\uD83C\uDF16',
  'Last Quarter': '\uD83C\uDF17', 'Waning Crescent': '\uD83C\uDF18',
};

const KEY_PHASES = new Set(['New Moon', 'Full Moon', 'First Quarter', 'Last Quarter']);
const DAY_ABBREVS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/* ---------- Loading skeleton ---------- */
function CalendarSkeleton() {
  return (
    <CosmicGlassCard accentColor="emerald">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-4 w-36 rounded-full bg-white/[0.06] animate-pulse" />
      </div>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-white/[0.04] animate-pulse" />
        ))}
      </div>
    </CosmicGlassCard>
  );
}

/* ---------- Main component ---------- */
export default function TradingDayCalendar({ calendar, isLoading }: Props) {
  const [showMonth, setShowMonth] = useState(false);
  const { active, getHandlers } = useInteractiveSelection<number>();
  const today = new Date().toISOString().split('T')[0];

  const week = calendar.slice(0, 7);
  const bestDay = useMemo(
    () => week.reduce<WeeklyCalendarDay | null>((best, d) => (!best || d.score > best.score ? d : best), null),
    [week],
  );

  const { monthGrid } = useMemo(() => {
    const firstDay = calendar[0] ? new Date(calendar[0].date + 'T12:00:00') : new Date();
    const dow = firstDay.getDay();
    return {
      monthGrid: [...Array(dow).fill(null), ...calendar.slice(0, 35)] as (WeeklyCalendarDay | null)[],
    };
  }, [calendar]);

  if (isLoading) return <CalendarSkeleton />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <CosmicGlassCard accentColor="emerald">
        {/* -- Header -- */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">&#x1F4C5;</span>
            <h3 className="text-white font-bold text-sm uppercase tracking-widest">
              Cosmic Calendar
            </h3>
            <CosmicInfoTooltip label="Calendar quality colors">
              {COSMIC_TOOLTIPS.calendarPrime.text}
            </CosmicInfoTooltip>
          </div>
          <div className="flex items-center gap-2">
            <CosmicInfoTooltip label="Month view info">
              Expand the full month grid to see day-by-day cosmic quality at a glance. Tap any day for details.
            </CosmicInfoTooltip>
            {/* -- Premium glass pill toggle -- */}
            <button
              onClick={() => setShowMonth(v => !v)}
              className="flex items-center gap-1.5 rounded-full px-4 py-1.5 bg-white/[0.05] border border-white/[0.08] backdrop-blur-sm text-white text-[11px] font-medium hover:bg-white/[0.10] hover:border-white/[0.14] hover:shadow-[0_0_10px_rgba(255,255,255,0.04)] transition-all duration-300"
            >
              <motion.span
                animate={{ rotate: showMonth ? 180 : 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="inline-block text-[12px]"
              >
                {'\u2193'}
              </motion.span>
              {showMonth ? 'Week View' : 'Month View'}
            </button>
          </div>
        </div>

        {/* -- Week strip -- */}
        <div className="grid grid-cols-7 gap-2 mb-3">
          {week.map((day, i) => {
            const d = new Date(day.date + 'T12:00:00');
            const dow = DAY_ABBREVS[d.getDay()];
            const dayNum = d.getDate();
            const isToday = day.date === today;
            const isBest = day.date === bestDay?.date;
            const nl = NODE_LABEL[day.nodeType] || NODE_LABEL.U_NODE;
            const gradient = NODE_GRADIENT[day.nodeType] || NODE_GRADIENT.U_NODE;
            const rulerColor = DAY_COLORS[day.dayRuler] || '#fff';

            return (
              <motion.div
                key={day.date}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{
                  scale: 1.02,
                  transition: { duration: 0.2 },
                }}
                className={`
                  relative rounded-xl p-3
                  flex flex-col items-center text-center
                  ${gradient}
                  border transition-all duration-300
                  ${isToday
                    ? 'border-[#F6C453]/40 ring-2 ring-[#F6C453]/50 shadow-[0_0_18px_rgba(246,196,83,0.25),0_0_6px_rgba(246,196,83,0.15)]'
                    : 'border-white/[0.08] hover:border-white/[0.16] hover:shadow-[0_4px_20px_rgba(255,255,255,0.04)]'
                  }
                `}
              >
                {isBest && (
                  <span className="absolute -top-1.5 -right-1.5 text-[12px]" title="Best day this week">
                    &#x2B50;
                  </span>
                )}

                {/* Day abbreviation */}
                <span className="text-[11px] uppercase tracking-widest text-gray-400 font-semibold">
                  {dow}
                </span>

                {/* Date number */}
                <span className={`text-lg font-mono font-bold leading-tight ${isToday ? 'text-[#F6C453]' : 'text-white'}`}>
                  {dayNum}
                </span>

                {/* Planet glyph -- prominent */}
                <span className="text-[20px] leading-none mt-0.5" style={{ color: rulerColor }}>
                  {PLANET_GLYPHS[day.dayRuler]}
                </span>

                {/* Node quality label */}
                <span className={`text-[11px] font-semibold uppercase mt-1 tracking-wide ${nl.text}`}>
                  {nl.label}
                </span>

                {/* Moon phase */}
                <span className="text-[11px] mt-0.5 inline-flex items-center gap-0.5">
                  {MOON_ICONS[day.moonPhaseName] || ''}
                  {KEY_PHASES.has(day.moonPhaseName) && (
                    <CosmicInfoTooltip label="Moon phase">
                      {COSMIC_TOOLTIPS.calendarMoonIcon.text}
                    </CosmicInfoTooltip>
                  )}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* -- Month grid (expandable) -- */}
        <AnimatePresence>
          {showMonth && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
            >
              <div className="border-t border-white/[0.06] pt-4">
                {/* DOW headers */}
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {DAY_ABBREVS.map(d => (
                    <div key={d} className="text-center text-[11px] text-gray-400 font-bold uppercase tracking-wide">
                      {d}
                    </div>
                  ))}
                </div>

                {/* Day cells */}
                <div className="grid grid-cols-7 gap-1">
                  {monthGrid.map((day, i) => {
                    if (!day) return <div key={`e-${i}`} className="h-12" />;
                    const isTodayCell = day.date === today;
                    const dayNum = new Date(day.date + 'T12:00:00').getDate();
                    const wash = NODE_WASH[day.nodeType] || NODE_WASH.U_NODE;
                    const rulerColor = DAY_COLORS[day.dayRuler] || '#fff';
                    const isKey = KEY_PHASES.has(day.moonPhaseName);
                    const qualityOpacity = 0.4 + (day.score / 17) * 0.6;

                    return (
                      <motion.div
                        key={day.date}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: qualityOpacity, scale: 1 }}
                        transition={{ delay: i * 0.008 }}
                        whileHover={{ scale: 1.05, transition: { duration: 0.15 } }}
                        className={`
                          relative h-12 rounded-xl border bg-white/[0.03]
                          flex flex-col items-center justify-center cursor-pointer
                          transition-all duration-200
                          ${isTodayCell
                            ? 'border-[#F6C453]/40 ring-2 ring-[#F6C453]/50 shadow-[0_0_14px_rgba(246,196,83,0.2)]'
                            : 'border-white/[0.08] hover:border-white/[0.16]'
                          }
                          ${active === i ? 'ring-2 ring-purple-400/70' : ''}
                        `}
                        style={{
                          background: `linear-gradient(180deg, ${wash}, transparent)`,
                        }}
                        {...getHandlers(i)}
                      >
                        {isKey && (
                          <span className="absolute -top-0.5 -right-0.5 text-[9px]">
                            {MOON_ICONS[day.moonPhaseName]}
                          </span>
                        )}
                        <span className={`text-[11px] font-bold ${isTodayCell ? 'text-[#F6C453]' : 'text-white'}`}>
                          {dayNum}
                        </span>
                        <span className="text-[10px]" style={{ color: rulerColor }}>
                          {PLANET_GLYPHS[day.dayRuler]}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Legend -- glass pills */}
                <div className="flex flex-wrap gap-2.5 mt-3 pt-3 border-t border-white/[0.05]">
                  {Object.entries(NODE_LABEL)
                    .filter(([k]) => k !== 'U_NODE')
                    .map(([type, nl]) => (
                      <div
                        key={type}
                        className="flex items-center gap-1.5 rounded-full px-3 py-1 bg-white/[0.04] border border-white/[0.06]"
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full border border-white/10 shrink-0"
                          style={{ backgroundColor: nl.color }}
                        />
                        <span className={`text-[11px] font-medium ${nl.text}`}>{nl.label}</span>
                      </div>
                    ))}
                </div>

                {/* Active day detail panel */}
                <AnimatePresence>
                  {active !== null && monthGrid[active] && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: 8, height: 0 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className="mt-3 p-4 rounded-xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm"
                    >
                      <p className="text-white font-bold font-mono text-[13px]">{monthGrid[active]!.date}</p>
                      <p className="text-gray-400 mt-1.5 text-[12px] leading-relaxed">
                        <span className="text-gray-500 text-[11px] font-semibold uppercase tracking-wide">Ruler:</span>{' '}
                        {monthGrid[active]!.dayRuler}{' '}
                        <span className="text-white/20 mx-1">&middot;</span>{' '}
                        <span className="text-gray-500 text-[11px] font-semibold uppercase tracking-wide">Moon:</span>{' '}
                        {monthGrid[active]!.moonPhaseName}{' '}
                        <span className="text-white/20 mx-1">&middot;</span>{' '}
                        <span className="text-gray-500 text-[11px] font-semibold uppercase tracking-wide">Sign:</span>{' '}
                        {monthGrid[active]!.moonSign}{' '}
                        <span className="text-white/20 mx-1">&middot;</span>{' '}
                        <span className="text-gray-500 text-[11px] font-semibold uppercase tracking-wide">Score:</span>{' '}
                        {monthGrid[active]!.score}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CosmicGlassCard>
    </motion.div>
  );
}
