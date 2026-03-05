import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { MoonPhase } from '@/types/cosmic';
import CosmicInfoTooltip from './shared/CosmicInfoTooltip';
import { COSMIC_TOOLTIPS } from './config/cosmicTooltips';

interface Props {
  moonPhase: MoonPhase;
  className?: string;
}

const MERCURY_RETROGRADES = [
  { pre: '2024-03-18', retro: '2024-04-01', post: '2024-04-25', end: '2024-05-13' },
  { pre: '2024-07-17', retro: '2024-08-05', post: '2024-08-28', end: '2024-09-11' },
  { pre: '2024-11-07', retro: '2024-11-26', post: '2024-12-15', end: '2025-01-02' },
  { pre: '2025-02-28', retro: '2025-03-15', post: '2025-04-07', end: '2025-04-26' },
  { pre: '2025-07-01', retro: '2025-07-18', post: '2025-08-11', end: '2025-08-24' },
  { pre: '2025-10-21', retro: '2025-11-09', post: '2025-11-29', end: '2025-12-15' },
  { pre: '2026-02-07', retro: '2026-02-25', post: '2026-03-20', end: '2026-04-07' },
  { pre: '2026-06-12', retro: '2026-06-29', post: '2026-07-23', end: '2026-08-04' },
  { pre: '2026-10-06', retro: '2026-10-24', post: '2026-11-13', end: '2026-11-28' },
  { pre: '2027-01-23', retro: '2027-02-09', post: '2027-03-03', end: '2027-03-18' },
  { pre: '2027-06-01', retro: '2027-06-10', post: '2027-07-04', end: '2027-07-15' },
  { pre: '2027-09-21', retro: '2027-10-08', post: '2027-10-28', end: '2027-11-11' },
];

const PLANET_GLYPHS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mars: '♂', Mercury: '☿', Jupiter: '♃', Venus: '♀', Saturn: '♄',
};
const DAY_RULERS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
const DAY_NAMES_SHORT = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const DAY_COLORS: Record<string, string> = {
  Sun: '#F6C453', Moon: '#5DD8FF', Mars: '#EF4444',
  Mercury: '#A78BFA', Jupiter: '#FB923C', Venus: '#34D399', Saturn: '#94A3B8',
};

function getMercuryStatus(now: Date) {
  const d = now.getTime();
  for (const r of MERCURY_RETROGRADES) {
    const pre = new Date(r.pre).getTime();
    const retro = new Date(r.retro).getTime();
    const post = new Date(r.post).getTime();
    const end = new Date(r.end).getTime();
    if (d >= pre && d < retro) return { status: 'pre-shadow' as const, daysToNext: Math.ceil((retro - d) / 86400000), nextPhase: 'Retrograde' };
    if (d >= retro && d < post) return { status: 'retrograde' as const, daysToNext: Math.ceil((post - d) / 86400000), nextPhase: 'Direct' };
    if (d >= post && d < end) return { status: 'post-shadow' as const, daysToNext: Math.ceil((end - d) / 86400000), nextPhase: 'Clear' };
  }
  const next = MERCURY_RETROGRADES.find(r => new Date(r.pre).getTime() > d);
  return { status: 'direct' as const, daysToNext: next ? Math.ceil((new Date(next.pre).getTime() - d) / 86400000) : 999, nextPhase: 'Pre-Shadow' };
}

function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const s = polarToXY(cx, cy, r, startDeg);
  const e = polarToXY(cx, cy, r, endDeg);
  const large = (endDeg - startDeg) % 360 > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

const MERCURY_STATUS_STYLES = {
  direct: { color: '#94A3B8', label: 'DIRECT', bg: 'bg-slate-500/20 border-slate-500/40 text-slate-300' },
  'pre-shadow': { color: '#F59E0B', label: 'PRE-SHADOW', bg: 'bg-amber-500/20 border-amber-500/40 text-amber-300' },
  retrograde: { color: '#EF4444', label: 'RETROGRADE', bg: 'bg-red-500/20 border-red-500/40 text-red-300' },
  'post-shadow': { color: '#F59E0B', label: 'POST-SHADOW', bg: 'bg-amber-500/20 border-amber-500/40 text-amber-300' },
};

const PHASE_MILESTONES = [
  { day: 0, label: '🌑' },
  { day: 7.4, label: '🌓' },
  { day: 14.75, label: '🌕' },
  { day: 22.1, label: '🌗' },
];

export default function MacroTimeCycles({ moonPhase, className = '' }: Props) {
  const now = useMemo(() => new Date(), []);
  const mercury = useMemo(() => getMercuryStatus(now), [now]);
  const todayDow = now.getDay();

  const ARC_START = 225;
  const ARC_SPAN = 270;
  const CYCLE = 29.5;
  const days = moonPhase.daysIntoCycle ?? 0;
  const progressDeg = (days / CYCLE) * ARC_SPAN;
  const currentAngle = ARC_START + progressDeg;
  const dotPos = polarToXY(80, 80, 55, currentAngle);
  const arcColor = days < 7.4 ? '#6D5BFF' : days < 14.75 ? '#8B7AFF' : days < 22.1 ? '#F6C453' : '#4B5563';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`relative rounded-2xl border border-indigo-500/20 overflow-hidden ${className}`}
    >
      <div className="absolute inset-0 bg-cover bg-center opacity-15" style={{ backgroundImage: 'url(/images/ai-generated/cosmic-macro-cycles-bg.png)' }} />
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/95 via-slate-900/95 to-purple-950/95" />

      <div className="relative z-10 p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">🌌</span>
          <h3 className="text-white font-bold text-sm uppercase tracking-widest">Macro Time Cycles</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Lunar Month Arc */}
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/40 p-4 flex flex-col items-center">
            <div className="flex items-center gap-1 mb-3">
              <p className="text-indigo-300 text-[10px] uppercase tracking-widest font-bold">Lunar Month</p>
              <CosmicInfoTooltip label="About Lunar Month">
                <p>{COSMIC_TOOLTIPS.lunarArc.text}</p>
              </CosmicInfoTooltip>
            </div>
            <svg viewBox="0 0 160 160" className="w-40 h-40">
              <defs>
                <filter id="arcGlow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
              </defs>
              <path d={arcPath(80, 80, 55, ARC_START, ARC_START + ARC_SPAN)} fill="none" stroke="#1e1b4b" strokeWidth="8" strokeLinecap="round" />
              <path d={arcPath(80, 80, 55, ARC_START, Math.max(ARC_START + 1, currentAngle))} fill="none" stroke={arcColor} strokeWidth="8" strokeLinecap="round" filter="url(#arcGlow)" />
              {PHASE_MILESTONES.map(m => {
                const mAngle = ARC_START + (m.day / CYCLE) * ARC_SPAN;
                const mPos = polarToXY(80, 80, 55, mAngle);
                const labelPos = polarToXY(80, 80, 70, mAngle);
                return (
                  <g key={m.day}>
                    <circle cx={mPos.x} cy={mPos.y} r="3" fill="#374151" />
                    <text x={labelPos.x} y={labelPos.y} textAnchor="middle" dominantBaseline="middle" fontSize="10">{m.label}</text>
                  </g>
                );
              })}
              <motion.circle cx={dotPos.x} cy={dotPos.y} r="6" fill={arcColor}
                animate={{ r: [5, 7, 5], opacity: [1, 0.7, 1] }} transition={{ duration: 2, repeat: Infinity }} />
              <text x="80" y="76" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold" fontFamily="monospace">{Math.round(days)}</text>
              <text x="80" y="92" textAnchor="middle" fill="#6B7280" fontSize="9">of 29 days</text>
            </svg>
            <p className="text-white font-bold text-xs mt-1">{moonPhase.name}</p>
            <p className="text-gray-400 text-[10px] mt-0.5">{moonPhase.isWaxing ? '↑ Waxing' : '↓ Waning'}</p>
          </div>

          {/* Mercury Cycle */}
          <div className="rounded-xl border border-slate-500/20 bg-slate-950/40 p-4 flex flex-col items-center">
            <p className="text-slate-300 text-[10px] uppercase tracking-widest mb-3 font-bold">Mercury Cycle</p>
            <svg viewBox="0 0 160 100" className="w-44 h-28">
              <ellipse cx="80" cy="55" rx="60" ry="30" fill="none" stroke="#1e293b" strokeWidth="2" />
              <ellipse cx="80" cy="55" rx="60" ry="30" fill="none"
                stroke={MERCURY_STATUS_STYLES[mercury.status].color}
                strokeWidth={mercury.status === 'retrograde' ? 3 : 1.5}
                strokeDasharray={mercury.status === 'retrograde' ? '6 3' : undefined}
                opacity="0.7"
              />
              <text x="80" y="22" textAnchor="middle" fontSize="18" fill={MERCURY_STATUS_STYLES[mercury.status].color}>☿</text>
              <text x="80" y="59" textAnchor="middle" fontSize="14" fill="#F6C453">☉</text>
            </svg>
            <div className="flex items-center gap-1 mt-1">
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase ${MERCURY_STATUS_STYLES[mercury.status].bg}`}>
                {mercury.status === 'retrograde' && (
                  <motion.span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block"
                    animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1, repeat: Infinity }} />
                )}
                ☿ {MERCURY_STATUS_STYLES[mercury.status].label}
              </div>
              <CosmicInfoTooltip label="About Mercury status">
                <p>{COSMIC_TOOLTIPS.mercuryStatus.text}</p>
              </CosmicInfoTooltip>
            </div>
            {mercury.status === 'pre-shadow' && (
              <div className="flex items-center gap-1 mt-1">
                <span className="text-amber-400 text-[9px] font-medium">Pre-shadow active</span>
                <CosmicInfoTooltip label="About Pre-Shadow phase">
                  <p>{COSMIC_TOOLTIPS.preShadow.text}</p>
                </CosmicInfoTooltip>
              </div>
            )}
            {mercury.status === 'post-shadow' && (
              <div className="flex items-center gap-1 mt-1">
                <span className="text-amber-400 text-[9px] font-medium">Post-shadow active</span>
                <CosmicInfoTooltip label="About Post-Shadow phase">
                  <p>{COSMIC_TOOLTIPS.postShadow.text}</p>
                </CosmicInfoTooltip>
              </div>
            )}
            <p className="text-gray-400 text-[10px] mt-2">
              <span className="text-white font-mono font-bold">{mercury.daysToNext}d</span> until {mercury.nextPhase}
            </p>
          </div>

          {/* Weekly Rhythm */}
          <div className="rounded-xl border border-purple-500/20 bg-purple-950/40 p-4">
            <div className="flex items-center justify-center gap-1 mb-3">
              <p className="text-purple-300 text-[10px] uppercase tracking-widest font-bold">Weekly Rhythm</p>
              <CosmicInfoTooltip label="About Weekly Rhythm">
                <p>{COSMIC_TOOLTIPS.weeklyRhythm.text}</p>
              </CosmicInfoTooltip>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {DAY_NAMES_SHORT.map((day, i) => {
                const ruler = DAY_RULERS[i];
                const isToday = i === todayDow;
                const color = DAY_COLORS[ruler];
                return (
                  <motion.div
                    key={day}
                    className={`flex flex-col items-center p-1.5 rounded-lg border transition-all ${
                      isToday ? 'border-yellow-400/60 bg-yellow-500/20' : 'border-white/5 bg-white/5'
                    }`}
                    animate={isToday ? { boxShadow: ['0 0 8px #F6C45340', '0 0 16px #F6C45380', '0 0 8px #F6C45340'] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <span className="text-[14px]" style={{ color }}>{PLANET_GLYPHS[ruler]}</span>
                    <span className={`text-[8px] font-bold mt-0.5 ${isToday ? 'text-yellow-300' : 'text-gray-500'}`}>{day}</span>
                  </motion.div>
                );
              })}
            </div>
            <div className="mt-3 text-center">
              <p className="text-gray-400 text-[10px]">Today</p>
              <p className="text-white font-bold text-sm" style={{ color: DAY_COLORS[DAY_RULERS[todayDow]] }}>
                {PLANET_GLYPHS[DAY_RULERS[todayDow]]} {DAY_RULERS[todayDow]} Day
              </p>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
