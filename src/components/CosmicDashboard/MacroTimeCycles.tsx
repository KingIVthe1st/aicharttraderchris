import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { MoonPhase } from '@/types/cosmic';
import CosmicInfoTooltip from './shared/CosmicInfoTooltip';
import CosmicGlassCard from './shared/CosmicGlassCard';
import CosmicStatusOrb from './shared/CosmicStatusOrb';
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
  Sun: '\u2609', Moon: '\u263D', Mars: '\u2642', Mercury: '\u263F', Jupiter: '\u2643', Venus: '\u2640', Saturn: '\u2644',
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

const MERCURY_STATUS_MAP: Record<string, { label: string; orbStatus: 'positive' | 'neutral' | 'negative'; pulse: boolean }> = {
  direct:       { label: 'DIRECT',      orbStatus: 'positive', pulse: false },
  'pre-shadow': { label: 'PRE-SHADOW',  orbStatus: 'neutral',  pulse: false },
  retrograde:   { label: 'RETROGRADE',  orbStatus: 'negative', pulse: true },
  'post-shadow':{ label: 'POST-SHADOW', orbStatus: 'neutral',  pulse: false },
};

const MERCURY_STATUS_STYLES = {
  direct:       { color: '#94A3B8' },
  'pre-shadow': { color: '#F59E0B' },
  retrograde:   { color: '#EF4444' },
  'post-shadow':{ color: '#F59E0B' },
};

const PHASE_MILESTONES = [
  { day: 0,     label: '\uD83C\uDF11', pct: 0 },
  { day: 7.4,   label: '\uD83C\uDF13', pct: 25 },
  { day: 14.75, label: '\uD83C\uDF15', pct: 50 },
  { day: 22.1,  label: '\uD83C\uDF17', pct: 75 },
];

export default function MacroTimeCycles({ moonPhase, className = '' }: Props) {
  const now = useMemo(() => new Date(), []);
  const mercury = useMemo(() => getMercuryStatus(now), [now]);
  const todayDow = now.getDay();

  /* ── Lunar Arc geometry ── */
  const ARC_START = 225;
  const ARC_SPAN = 270;
  const CYCLE = 29.5;
  const days = moonPhase.daysIntoCycle ?? 0;
  const progressDeg = (days / CYCLE) * ARC_SPAN;
  const currentAngle = ARC_START + progressDeg;
  const dotPos = polarToXY(100, 100, 70, currentAngle);

  /* ── Mercury orbital position (simplified) ── */
  const mercuryAngle = useMemo(() => {
    const statusAngles: Record<string, number> = { direct: 0, 'pre-shadow': 270, retrograde: 180, 'post-shadow': 90 };
    return statusAngles[mercury.status] ?? 0;
  }, [mercury.status]);
  const mercuryPos = useMemo(() => {
    const rad = ((mercuryAngle - 90) * Math.PI) / 180;
    return { x: 80 + 55 * Math.cos(rad), y: 55 + 28 * Math.sin(rad) };
  }, [mercuryAngle]);

  const mercuryMeta = MERCURY_STATUS_MAP[mercury.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`relative ${className}`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">{'\uD83C\uDF0C'}</span>
        <h3 className="text-white font-bold text-sm uppercase tracking-widest">Cosmic Orrery</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* ═══ Panel 1: Lunar Arc ═══ */}
        <CosmicGlassCard accentColor="indigo">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 mb-3">
              <p className="text-indigo-300 text-[10px] uppercase tracking-widest font-bold">Lunar Arc</p>
              <CosmicInfoTooltip label="About Lunar Month">
                <p>{COSMIC_TOOLTIPS.lunarArc.text}</p>
              </CosmicInfoTooltip>
            </div>

            <svg viewBox="0 0 200 200" className="w-[200px] h-[200px]">
              <defs>
                <linearGradient id="lunarArcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4F46E5" />
                  <stop offset="33%" stopColor="#6D5BFF" />
                  <stop offset="66%" stopColor="#F6C453" />
                  <stop offset="100%" stopColor="#334155" />
                </linearGradient>
                <filter id="lunarDotGlow">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Track */}
              <path
                d={arcPath(100, 100, 70, ARC_START, ARC_START + ARC_SPAN)}
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="8"
                strokeLinecap="round"
              />

              {/* Filled arc */}
              <path
                d={arcPath(100, 100, 70, ARC_START, Math.max(ARC_START + 1, currentAngle))}
                fill="none"
                stroke="url(#lunarArcGrad)"
                strokeWidth="8"
                strokeLinecap="round"
              />

              {/* Phase milestones */}
              {PHASE_MILESTONES.map(m => {
                const mAngle = ARC_START + (m.day / CYCLE) * ARC_SPAN;
                const mPos = polarToXY(100, 100, 70, mAngle);
                return (
                  <g key={m.day}>
                    <circle cx={mPos.x} cy={mPos.y} r="12" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                    <text x={mPos.x} y={mPos.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="11">{m.label}</text>
                  </g>
                );
              })}

              {/* Radial halo */}
              <circle cx={dotPos.x} cy={dotPos.y} r="20" fill="rgba(99,102,241,0.2)" />

              {/* Current position dot with glow */}
              <motion.circle
                cx={dotPos.x}
                cy={dotPos.y}
                r="6"
                fill="#6D5BFF"
                filter="url(#lunarDotGlow)"
                animate={{ r: [5, 7, 5], opacity: [1, 0.8, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />

              {/* Center text */}
              <text x="100" y="92" textAnchor="middle" fill="white" fontSize="22" fontWeight="900" fontFamily="monospace" className="tabular-nums">
                {`Day ${Math.round(days)}`}
              </text>
              <text x="100" y="112" textAnchor="middle" fill="#6B7280" fontSize="11" fontFamily="monospace">
                / 29
              </text>
            </svg>

            <p className="text-white font-bold text-xs mt-1">{moonPhase.name}</p>
            <p className="text-gray-400 text-[10px] mt-0.5">{moonPhase.isWaxing ? '\u2191 Waxing' : '\u2193 Waning'}</p>
          </div>
        </CosmicGlassCard>

        {/* ═══ Panel 2: Mercury Cycle ═══ */}
        <CosmicGlassCard accentColor="amber">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 mb-3">
              <p className="text-amber-300 text-[10px] uppercase tracking-widest font-bold">Mercury Cycle</p>
              <CosmicInfoTooltip label="About Mercury status">
                <p>{COSMIC_TOOLTIPS.mercuryStatus.text}</p>
              </CosmicInfoTooltip>
            </div>

            <svg viewBox="0 0 160 110" className="w-44 h-28">
              <defs>
                <linearGradient id="mercuryOrbitGrad" x1="0%" y1="50%" x2="100%" y2="50%">
                  <stop offset="0%" stopColor="#C0C0C0" />
                  <stop offset="40%" stopColor="#F59E0B" />
                  <stop offset="60%" stopColor="#EF4444" />
                  <stop offset="80%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#C0C0C0" />
                </linearGradient>
                <filter id="mercuryGlyphGlow">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Orbital ellipse */}
              <ellipse cx="80" cy="55" rx="60" ry="30" fill="none" stroke="url(#mercuryOrbitGrad)" strokeWidth="1.5" opacity="0.6" />

              {/* Sun at center */}
              <text x="80" y="59" textAnchor="middle" fontSize="14" fill="#F6C453">{'\u2609'}</text>

              {/* Mercury glyph marker with glow */}
              <motion.g
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <circle cx={mercuryPos.x} cy={mercuryPos.y} r="6" fill={MERCURY_STATUS_STYLES[mercury.status].color} filter="url(#mercuryGlyphGlow)" opacity="0.8" />
                <text x={mercuryPos.x} y={mercuryPos.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="white">{'\u263F'}</text>
              </motion.g>

              {/* Zone labels */}
              <text x="15" y="18" fontSize="7" fill="#94A3B8" opacity="0.5">Direct</text>
              <text x="120" y="18" fontSize="7" fill="#EF4444" opacity="0.5">Rx</text>
            </svg>

            {/* Status badge: glass pill with CosmicStatusOrb */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10">
                <CosmicStatusOrb
                  status={mercuryMeta.orbStatus}
                  size="sm"
                  pulse={mercuryMeta.pulse}
                />
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">
                  {'\u263F'} {mercuryMeta.label}
                </span>
              </div>
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

            {/* Countdown */}
            <p className="text-gray-400 text-[10px] mt-2 font-mono text-sm">
              <span className="text-white font-bold tabular-nums">{mercury.daysToNext}d</span>{' '}
              <span className="text-gray-500">until {mercury.nextPhase}</span>
            </p>
          </div>
        </CosmicGlassCard>

        {/* ═══ Panel 3: Weekly Rhythm ═══ */}
        <CosmicGlassCard accentColor="nebula">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 mb-4">
              <p className="text-[#6D5BFF] text-[10px] uppercase tracking-widest font-bold">Weekly Rhythm</p>
              <CosmicInfoTooltip label="About Weekly Rhythm">
                <p>{COSMIC_TOOLTIPS.weeklyRhythm.text}</p>
              </CosmicInfoTooltip>
            </div>

            {/* Day circles with connecting lines */}
            <div className="flex items-center w-full justify-center">
              {DAY_NAMES_SHORT.map((day, i) => {
                const ruler = DAY_RULERS[i];
                const isToday = i === todayDow;
                const color = DAY_COLORS[ruler];
                return (
                  <div key={day} className="flex items-center">
                    {i > 0 && (
                      <div className="h-[1px] w-2 bg-white/[0.06]" />
                    )}
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isToday
                            ? 'border border-[#F6C453]/50 bg-white/[0.08]'
                            : 'border border-white/10 bg-white/5'
                        }`}
                        style={isToday ? { boxShadow: '0 0 12px rgba(246,196,83,0.3)' } : undefined}
                      >
                        <span className="text-[15px]" style={{ color }}>{PLANET_GLYPHS[ruler]}</span>
                      </div>
                      <span className={`text-[7px] font-bold ${isToday ? 'text-[#F6C453]' : 'text-gray-500'}`}>{day}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 text-center">
              <p className="text-gray-500 text-[10px]">Today</p>
              <p className="text-white font-bold text-sm" style={{ color: DAY_COLORS[DAY_RULERS[todayDow]] }}>
                {PLANET_GLYPHS[DAY_RULERS[todayDow]]} {DAY_RULERS[todayDow]} Day
              </p>
            </div>
          </div>
        </CosmicGlassCard>

      </div>
    </motion.div>
  );
}
