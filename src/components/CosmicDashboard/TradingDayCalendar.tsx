import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { WeeklyCalendarDay } from '@/types/cosmic';

interface Props {
  calendar: WeeklyCalendarDay[];
  isLoading?: boolean;
}

const PLANET_GLYPHS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mars: '♂', Mercury: '☿', Jupiter: '♃', Venus: '♀', Saturn: '♄',
};

const DAY_COLORS: Record<string, string> = {
  Sun: '#F6C453', Moon: '#5DD8FF', Mars: '#EF4444',
  Mercury: '#A78BFA', Jupiter: '#FB923C', Venus: '#34D399', Saturn: '#94A3B8',
};

const NODE_STYLE: Record<string, { bg: string; border: string; text: string; label: string }> = {
  ULTRA_ALIGNED: { bg: 'from-emerald-900/60 to-emerald-950/80', border: 'border-emerald-500/40', text: 'text-emerald-300', label: 'Prime' },
  HIGH_PRESSURE: { bg: 'from-green-900/50 to-green-950/70', border: 'border-green-500/30', text: 'text-green-300', label: 'Strong' },
  SOUL_WINDOW:   { bg: 'from-blue-900/50 to-blue-950/70',  border: 'border-blue-500/30',  text: 'text-blue-300',  label: 'Soul' },
  MIXED:         { bg: 'from-amber-900/40 to-amber-950/60', border: 'border-amber-500/30', text: 'text-amber-300', label: 'Mixed' },
  CONFLICT:      { bg: 'from-red-900/40 to-red-950/60',    border: 'border-red-500/30',   text: 'text-red-300',   label: 'Caution' },
  DISRUPTION:    { bg: 'from-purple-900/40 to-purple-950/60', border: 'border-purple-500/30', text: 'text-purple-300', label: 'Disruption' },
  U_NODE:        { bg: 'from-gray-900/40 to-gray-950/60',  border: 'border-gray-600/30',  text: 'text-gray-400',  label: 'Neutral' },
};

const MOON_ICONS: Record<string, string> = {
  'New Moon': '🌑', 'Waxing Crescent': '🌒', 'First Quarter': '🌓', 'Waxing Gibbous': '🌔',
  'Full Moon': '🌕', 'Waning Gibbous': '🌖', 'Last Quarter': '🌗', 'Waning Crescent': '🌘',
};

const KEY_PHASES = new Set(['New Moon', 'Full Moon', 'First Quarter', 'Last Quarter']);
const DAY_ABBREVS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function TradingDayCalendar({ calendar, isLoading }: Props) {
  const [showMonth, setShowMonth] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  const week = calendar.slice(0, 7);
  const bestDay = week.reduce<WeeklyCalendarDay | null>((best, d) =>
    !best || d.score > best.score ? d : best, null);

  const firstDay = calendar[0] ? new Date(calendar[0].date + 'T12:00:00') : new Date();
  const startDow = firstDay.getDay();
  const monthGrid: (WeeklyCalendarDay | null)[] = [
    ...Array(startDow).fill(null),
    ...calendar.slice(0, 35),
  ];

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-slate-950/90 to-emerald-950/50 p-5 animate-pulse">
        <div className="h-4 bg-white/10 rounded w-40 mb-4" />
        <div className="grid grid-cols-7 gap-2">
          {Array(7).fill(0).map((_, i) => <div key={i} className="h-20 bg-white/5 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="relative rounded-2xl border border-emerald-500/20 overflow-hidden"
    >
      <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: 'url(/images/ai-generated/cosmic-trading-calendar-bg.png)' }} />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-slate-900/95 to-emerald-950/90" />

      <div className="relative z-10 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">📅</span>
            <h3 className="text-white font-bold text-sm uppercase tracking-widest">Optimum Trading Calendar</h3>
          </div>
          <button
            onClick={() => setShowMonth(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-white text-[11px] font-medium transition-all"
          >
            {showMonth ? '↑ Week View' : '↓ Month View'}
          </button>
        </div>

        {/* Week strip */}
        <div className="grid grid-cols-7 gap-2 mb-3">
          {week.map((day, i) => {
            const d = new Date(day.date + 'T12:00:00');
            const dow = DAY_ABBREVS[d.getDay()];
            const dayNum = d.getDate();
            const isToday = day.date === today;
            const isBest = day.date === bestDay?.date;
            const s = NODE_STYLE[day.nodeType] || NODE_STYLE.U_NODE;
            const rulerColor = DAY_COLORS[day.dayRuler] || '#fff';
            return (
              <motion.div
                key={day.date}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`relative rounded-xl border p-2 flex flex-col items-center bg-gradient-to-b ${s.bg} ${s.border} ${
                  isToday ? 'ring-2 ring-yellow-400/60 ring-offset-1 ring-offset-transparent' : ''
                }`}
              >
                {isBest && <span className="absolute -top-1 -right-1 text-[10px]">⭐</span>}
                <span className="text-[9px] text-gray-400 font-bold">{dow}</span>
                <span className={`text-lg font-black ${isToday ? 'text-yellow-300' : 'text-white'}`}>{dayNum}</span>
                <span className="text-[14px]" style={{ color: rulerColor }}>{PLANET_GLYPHS[day.dayRuler]}</span>
                <span className={`text-[8px] font-bold uppercase ${s.text}`}>{s.label}</span>
                <span className="text-[10px] mt-0.5">{MOON_ICONS[day.moonPhaseName] || ''}</span>
              </motion.div>
            );
          })}
        </div>

        {/* Month grid */}
        <AnimatePresence>
          {showMonth && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="border-t border-white/10 pt-4">
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {DAY_ABBREVS.map(d => (
                    <div key={d} className="text-center text-[9px] text-gray-500 font-bold uppercase">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {monthGrid.map((day, i) => {
                    if (!day) return <div key={`e-${i}`} className="h-10" />;
                    const isToday = day.date === today;
                    const dayNum = new Date(day.date + 'T12:00:00').getDate();
                    const s = NODE_STYLE[day.nodeType] || NODE_STYLE.U_NODE;
                    const rulerColor = DAY_COLORS[day.dayRuler] || '#fff';
                    const isKey = KEY_PHASES.has(day.moonPhaseName);
                    return (
                      <motion.div
                        key={day.date}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.008 }}
                        className={`relative h-10 rounded-lg border flex flex-col items-center justify-center cursor-default bg-gradient-to-b ${s.bg} ${s.border} ${isToday ? 'ring-1 ring-yellow-400/80' : ''}`}
                        title={`${day.date} | ${day.dayRuler} Day | Moon in ${day.moonSign} | ${day.nodeType}`}
                      >
                        {isKey && (
                          <span className="absolute -top-0.5 -right-0.5 text-[8px]">{MOON_ICONS[day.moonPhaseName]}</span>
                        )}
                        <span className={`text-[10px] font-bold ${isToday ? 'text-yellow-300' : 'text-white'}`}>{dayNum}</span>
                        <span className="text-[8px]" style={{ color: rulerColor }}>{PLANET_GLYPHS[day.dayRuler]}</span>
                      </motion.div>
                    );
                  })}
                </div>
                <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-white/5">
                  {Object.entries(NODE_STYLE).filter(([k]) => k !== 'U_NODE').map(([type, s]) => (
                    <div key={type} className="flex items-center gap-1">
                      <div className={`w-2.5 h-2.5 rounded border ${s.border} bg-gradient-to-b ${s.bg}`} />
                      <span className={`text-[9px] ${s.text}`}>{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
