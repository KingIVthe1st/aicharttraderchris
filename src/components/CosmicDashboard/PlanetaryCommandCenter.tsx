import { useMemo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { PlanetaryHourMap, Planet } from '@/types/cosmic';
import CosmicInfoTooltip from './shared/CosmicInfoTooltip';
import CosmicGlassCard from './shared/CosmicGlassCard';
import CosmicStatusOrb from './shared/CosmicStatusOrb';
import CosmicDataRow from './shared/CosmicDataRow';
import { COSMIC_TOOLTIPS } from './config/cosmicTooltips';
import { useInteractiveSelection } from './hooks/useInteractiveSelection';
import { useAnimationFrame } from './hooks/useAnimationFrame';

interface Props {
  planetaryHours: PlanetaryHourMap;
  planetaryRuler: Planet;
}

// ─── Chaldean Planetary Hour System ──────────────────────────────────────────
const CHALDEAN: Planet[] = ['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon'];
const DAY_START_IDX: Record<string, number> = {
  Sun: 3, Moon: 6, Mars: 2, Mercury: 5, Jupiter: 1, Venus: 4, Saturn: 0,
};

const PLANET_GLYPHS: Record<string, string> = {
  Sun: '\u2609', Moon: '\u263D', Mars: '\u2642', Mercury: '\u263F', Jupiter: '\u2643', Venus: '\u2640', Saturn: '\u2644',
};
const PLANET_COLORS: Record<string, string> = {
  Sun: '#F6C453', Moon: '#5DD8FF', Mars: '#EF4444',
  Mercury: '#A78BFA', Jupiter: '#FB923C', Venus: '#34D399', Saturn: '#94A3B8',
};

const PLANET_RELATIONSHIPS: Record<string, { friends: string[]; enemies: string[] }> = {
  Sun:     { friends: ['Moon', 'Mars', 'Jupiter'],    enemies: ['Venus', 'Saturn'] },
  Moon:    { friends: ['Sun', 'Mercury'],              enemies: [] },
  Mars:    { friends: ['Sun', 'Moon', 'Jupiter'],      enemies: ['Mercury'] },
  Mercury: { friends: ['Sun', 'Venus'],                enemies: ['Moon'] },
  Jupiter: { friends: ['Sun', 'Moon', 'Mars'],         enemies: ['Mercury', 'Venus'] },
  Venus:   { friends: ['Mercury', 'Saturn'],           enemies: ['Sun', 'Moon'] },
  Saturn:  { friends: ['Mercury', 'Venus'],            enemies: ['Sun', 'Moon', 'Mars'] },
};

const DAY_WISDOM: Record<string, string> = {
  Sun:     'Solar confidence amplifies bold moves. Quality over quantity \u2014 favor market leaders.',
  Moon:    'Sentiment rules today. Follow institutional order flow, not crowd emotion.',
  Mars:    'Energy is high but patience is thin. Set tight stops. Fast entries, faster exits.',
  Mercury: 'News and data dominate price action. Trade the catalyst, not the narrative.',
  Jupiter: 'Risk appetite expands midday. Trend-following strategies outperform.',
  Venus:   'Profit-taking pressure builds into close. Lighter positions favor you.',
  Saturn:  'Discipline over intuition. Only high-conviction setups. Honor every stop.',
};

function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function wedgePath(cx: number, cy: number, rIn: number, rOut: number, startDeg: number, endDeg: number): string {
  const gap = 0.5;
  const s1 = polarToXY(cx, cy, rIn, startDeg + gap);
  const s2 = polarToXY(cx, cy, rOut, startDeg + gap);
  const e1 = polarToXY(cx, cy, rOut, endDeg - gap);
  const e2 = polarToXY(cx, cy, rIn, endDeg - gap);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${s1.x} ${s1.y} L ${s2.x} ${s2.y} A ${rOut} ${rOut} 0 ${large} 1 ${e1.x} ${e1.y} L ${e2.x} ${e2.y} A ${rIn} ${rIn} 0 ${large} 0 ${s1.x} ${s1.y} Z`;
}

function getHourRelationship(hourPlanet: string, rulerPlanet: string): 'ally' | 'enemy' | 'neutral' | 'self' {
  if (hourPlanet === rulerPlanet) return 'self';
  const rel = PLANET_RELATIONSHIPS[rulerPlanet];
  if (!rel) return 'neutral';
  if (rel.friends.includes(hourPlanet)) return 'ally';
  if (rel.enemies.includes(hourPlanet)) return 'enemy';
  return 'neutral';
}

/* ─── CSS keyframes injected once ─────────────────────────────────────────── */
const STYLE_ID = 'pcc-keyframes';
if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes pcc-orbit-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes pcc-orbit-spin-rev { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
    @keyframes pcc-ally-breathe { 0%,100% { opacity: 0.55; } 50% { opacity: 0.85; } }
  `;
  document.head.appendChild(style);
}

const WEDGE_REL_FILLS: Record<string, string> = {
  ally:    'rgba(46,197,255,0.25)',
  enemy:   'rgba(220,38,38,0.2)',
  neutral: 'rgba(100,116,139,0.15)',
  self:    'rgba(246,196,83,0.3)',
};

const WEDGE_ACCENT: Record<string, string> = {
  ally: '#2EC5FF', enemy: '#EF4444', neutral: '#64748B', self: '#F6C453',
};

const REL_TO_STATUS: Record<string, 'positive' | 'neutral' | 'negative' | 'special'> = {
  ally: 'positive', enemy: 'negative', neutral: 'neutral', self: 'special',
};

const REL_LABELS: Record<string, string> = {
  ally: 'ALLY HOUR', enemy: 'ENEMY HOUR', neutral: 'NEUTRAL HOUR', self: 'YOUR RULER',
};

export default function PlanetaryCommandCenter({ planetaryHours, planetaryRuler }: Props) {
  const [nowMs, setNowMs] = useState(() => Date.now());
  const { active, getHandlers } = useInteractiveSelection<number>();

  // Replace setInterval with useAnimationFrame (throttled to ~1s updates)
  const updateNow = useCallback((elapsed: number) => {
    // Only update state every ~1000ms to avoid excessive re-renders
    if (elapsed === 0 || Math.floor(elapsed / 1000) !== Math.floor((elapsed - 16) / 1000)) {
      setNowMs(Date.now());
    }
  }, []);
  useAnimationFrame(updateNow);

  // Compute all 24 planetary hours from dayRuler + sunrise/sunset
  const allHours = useMemo(() => {
    const sunrise = new Date(planetaryHours.sunrise);
    const sunset = new Date(planetaryHours.sunset);
    const nextSunrise = new Date(sunrise.getTime() + 24 * 60 * 60 * 1000);

    const dayDuration = sunset.getTime() - sunrise.getTime();
    const nightDuration = nextSunrise.getTime() - sunset.getTime();
    const dayHourMs = dayDuration / 12;
    const nightHourMs = nightDuration / 12;

    const startIdx = DAY_START_IDX[planetaryHours.dayRuler] ?? 0;
    const hours: Array<{ planet: string; startMs: number; endMs: number; isDaytime: boolean }> = [];

    for (let i = 0; i < 12; i++) {
      const planetIdx = (startIdx + i) % 7;
      hours.push({
        planet: CHALDEAN[planetIdx],
        startMs: sunrise.getTime() + i * dayHourMs,
        endMs: sunrise.getTime() + (i + 1) * dayHourMs,
        isDaytime: true,
      });
    }
    for (let i = 0; i < 12; i++) {
      const planetIdx = (startIdx + 12 + i) % 7;
      hours.push({
        planet: CHALDEAN[planetIdx],
        startMs: sunset.getTime() + i * nightHourMs,
        endMs: sunset.getTime() + (i + 1) * nightHourMs,
        isDaytime: false,
      });
    }
    return hours;
  }, [planetaryHours]);

  const currentIdx = allHours.findIndex(h => nowMs >= h.startMs && nowMs < h.endMs);
  const currentPlanet = currentIdx >= 0 ? allHours[currentIdx].planet : (planetaryHours.currentHour?.planet ?? planetaryHours.dayRuler);

  // Ally/enemy/neutral counts
  const counts = allHours.reduce(
    (acc, h) => { acc[getHourRelationship(h.planet, planetaryRuler)]++; return acc; },
    { ally: 0, enemy: 0, neutral: 0, self: 0 } as Record<string, number>,
  );

  // Next ally hour
  const nextAllyHour = allHours.find((h, i) => i > currentIdx && (getHourRelationship(h.planet, planetaryRuler) === 'ally' || getHourRelationship(h.planet, planetaryRuler) === 'self'));
  const msToNextAlly = nextAllyHour ? nextAllyHour.startMs - nowMs : null;
  const nextAllyStr = msToNextAlly != null && msToNextAlly > 0
    ? `${Math.floor(msToNextAlly / 3600000)}h ${Math.floor((msToNextAlly % 3600000) / 60000)}m`
    : '\u2014';

  // Best upcoming hours (top 5)
  const upcomingBest = allHours
    .filter((h, i) => i >= currentIdx && ['ally', 'self'].includes(getHourRelationship(h.planet, planetaryRuler)))
    .slice(0, 5);

  const currentRel = getHourRelationship(currentPlanet, planetaryRuler);

  // SVG parameters — 480x480
  const cx = 240, cy = 240;
  const outerR = 215, midR = 160, innerRimR = 155;
  const wedgeDeg = 360 / 24;

  // When a wedge is hovered/selected, show its details in the tactical panel
  const displayPlanet = active !== null && allHours[active] ? allHours[active].planet : currentPlanet;
  const displayRel = active !== null && allHours[active]
    ? getHourRelationship(allHours[active].planet, planetaryRuler)
    : currentRel;

  // Pick the right tooltip based on the current/displayed hour status
  const hourStatusTooltip =
    displayRel === 'ally' ? COSMIC_TOOLTIPS.allyHour :
    displayRel === 'enemy' ? COSMIC_TOOLTIPS.enemyHour :
    displayRel === 'self' ? COSMIC_TOOLTIPS.selfHour :
    COSMIC_TOOLTIPS.neutralHour;

  const isAllyNow = currentRel === 'ally' || currentRel === 'self';

  // Tick marks around the outer rim
  const ticks = Array.from({ length: 24 }, (_, i) => {
    const deg = i * 15;
    const p1 = polarToXY(cx, cy, outerR + 4, deg);
    const p2 = polarToXY(cx, cy, outerR + 10, deg);
    return { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y };
  });

  return (
    <CosmicGlassCard variant="elevated" accentColor="amber" glowIntensity="medium" noPadding>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15 }}
        className="relative overflow-hidden"
      >
        {/* Background */}
        <div className="absolute inset-0 bg-cover bg-center opacity-[0.08]" style={{ backgroundImage: 'url(/images/ai-generated/cosmic-day-ruler-bg.png)' }} />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950/60 via-cosmic-900/60 to-indigo-950/60" />

        <div className="relative z-10 p-5">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg opacity-80">{PLANET_GLYPHS[planetaryHours.dayRuler]}</span>
            <h3 className="text-white font-bold text-sm uppercase tracking-widest">Day Ruler Command Deck</h3>
            <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-[10px] font-bold">
              {PLANET_GLYPHS[planetaryHours.dayRuler]} {planetaryHours.dayRuler} Day
              <CosmicInfoTooltip label="Day ruler info">{COSMIC_TOOLTIPS.dayRuler.text}</CosmicInfoTooltip>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-5">
            {/* ── Left 60%: Command Wheel (SVG 480x480) ── */}
            <div className="lg:w-[60%] flex justify-center">
              <svg viewBox="0 0 480 480" className="w-full max-w-[480px]">
                <defs>
                  <filter id="beam-glow">
                    <feGaussianBlur stdDeviation="3" result="b" />
                    <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                  <filter id="wedge-ally-glow">
                    <feGaussianBlur stdDeviation="3" result="b" />
                    <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                  <filter id="wedge-enemy-glow">
                    <feGaussianBlur stdDeviation="2" result="b" />
                    <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                  <filter id="wedge-hover-glow">
                    <feGaussianBlur stdDeviation="4" result="b" />
                    <feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                  <filter id="glyph-shadow">
                    <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="rgba(0,0,0,0.6)" />
                  </filter>
                </defs>

                {/* Outer rim circle */}
                <circle cx={cx} cy={cy} r={outerR + 12} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

                {/* 24 tick marks */}
                {ticks.map((t, i) => (
                  <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
                ))}

                {/* Wedges — multi-layer */}
                {allHours.map((h, i) => {
                  const startDeg = i * wedgeDeg;
                  const endDeg = startDeg + wedgeDeg;
                  const midDeg = startDeg + wedgeDeg / 2;
                  const rel = getHourRelationship(h.planet, planetaryRuler);
                  const isCurrent = i === currentIdx;
                  const isPast = i < currentIdx;
                  const isActive = active === i;
                  const isUpcomingAlly = !isPast && !isCurrent && (rel === 'ally' || rel === 'self');
                  const accent = WEDGE_ACCENT[rel];
                  const relFill = WEDGE_REL_FILLS[rel];
                  const labelPos = polarToXY(cx, cy, (outerR + midR) / 2, midDeg);

                  const basePath = wedgePath(cx, cy, midR, outerR, startDeg, endDeg);

                  return (
                    <g key={i} {...getHandlers(i)} className="cursor-pointer" style={{ outline: 'none' }}>
                      {/* Base fill layer */}
                      <path
                        d={basePath}
                        fill="rgba(255,255,255,0.02)"
                      />
                      {/* Color layer */}
                      <motion.path
                        d={basePath}
                        fill={isCurrent || isActive ? accent : relFill}
                        stroke={accent}
                        strokeWidth={isActive ? 2.5 : isCurrent ? 2 : 0.5}
                        opacity={isPast && !isActive ? 0.3 : isActive ? 1 : 1}
                        filter={
                          isActive ? 'url(#wedge-hover-glow)' :
                          rel === 'ally' && !isPast ? 'url(#wedge-ally-glow)' :
                          rel === 'enemy' && !isPast ? 'url(#wedge-enemy-glow)' :
                          undefined
                        }
                        animate={
                          isCurrent && !isActive
                            ? { opacity: [1, 0.7, 1] }
                            : undefined
                        }
                        transition={
                          isCurrent && !isActive
                            ? { duration: 1.5, repeat: Infinity }
                            : undefined
                        }
                        style={{
                          ...(isUpcomingAlly && !isActive
                            ? { animation: 'pcc-ally-breathe 3s ease-in-out infinite' }
                            : {}),
                          ...(isActive
                            ? { transform: `scale(1.04)`, transformOrigin: `${labelPos.x}px ${labelPos.y}px` }
                            : {}),
                        }}
                      />
                      {/* Bright ring for selected wedge */}
                      {isActive && (
                        <path
                          d={basePath}
                          fill="none"
                          stroke={accent}
                          strokeWidth="3"
                          opacity={0.9}
                          filter="url(#wedge-hover-glow)"
                        />
                      )}
                      {/* Planet glyph label */}
                      <text
                        x={labelPos.x} y={labelPos.y}
                        textAnchor="middle" dominantBaseline="middle"
                        fontSize="14"
                        fill={isPast && !isActive ? '#475569' : accent}
                        opacity={isPast && !isActive ? 0.5 : 0.95}
                        fontWeight="bold"
                        filter={isPast && !isActive ? undefined : 'url(#glyph-shadow)'}
                      >
                        {PLANET_GLYPHS[h.planet]}
                      </text>
                    </g>
                  );
                })}

                {/* Inner ring divider */}
                <circle cx={cx} cy={cy} r={innerRimR} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

                {/* Current hour beam line from center */}
                {currentIdx >= 0 && (() => {
                  const beamDeg = currentIdx * wedgeDeg + wedgeDeg / 2;
                  const beamEnd = polarToXY(cx, cy, outerR - 5, beamDeg);
                  return (
                    <motion.line
                      x1={cx} y1={cy} x2={beamEnd.x} y2={beamEnd.y}
                      stroke="white" strokeWidth="1.5"
                      filter="url(#beam-glow)"
                      animate={{ strokeOpacity: [0.7, 0.2, 0.7] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  );
                })()}

                {/* Center glass circle */}
                <circle cx={cx} cy={cy} r={68} fill="rgba(4,5,13,0.95)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

                {/* Orbital circles (CSS spin) */}
                <g style={{ transformOrigin: `${cx}px ${cy}px`, animation: 'pcc-orbit-spin 30s linear infinite' }}>
                  <circle cx={cx + 52} cy={cy} r="3" fill="rgba(246,196,83,0.4)" />
                </g>
                <g style={{ transformOrigin: `${cx}px ${cy}px`, animation: 'pcc-orbit-spin-rev 45s linear infinite' }}>
                  <circle cx={cx} cy={cy + 58} r="2.5" fill="rgba(46,197,255,0.35)" />
                </g>

                {/* Center: day ruler sigil + name */}
                <text x={cx} y={cy - 12} textAnchor="middle" fontSize="42" fill={PLANET_COLORS[planetaryHours.dayRuler]} fontWeight="bold">
                  {PLANET_GLYPHS[planetaryHours.dayRuler]}
                </text>
                <text x={cx} y={cy + 14} textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" letterSpacing="0.15em">
                  {planetaryHours.dayRuler.toUpperCase()}
                </text>
                <text x={cx} y={cy + 28} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="11" letterSpacing="0.2em">
                  DAY RULER
                </text>
              </svg>
            </div>

            {/* ── Right 40%: Tactical Panel ── */}
            <div className="lg:w-[40%] flex flex-col gap-3">
              {/* Current status orb + details */}
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                <p className="text-gray-500 text-[12px] uppercase tracking-widest mb-2">
                  {active !== null ? 'Selected Hour' : 'Current Hour'}
                </p>
                <div className="flex items-center gap-3 mb-2">
                  <CosmicStatusOrb
                    size="lg"
                    status={REL_TO_STATUS[displayRel]}
                    pulse
                    label={REL_LABELS[displayRel]}
                  />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-3xl" style={{ color: PLANET_COLORS[displayPlanet] }}>{PLANET_GLYPHS[displayPlanet]}</span>
                  <div>
                    <p className="text-white font-bold text-base">{displayPlanet}</p>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-sm font-black uppercase tracking-wide px-2 py-0.5 rounded ${
                          displayRel === 'enemy'
                            ? 'text-red-300 bg-red-500/20 border border-red-500/30'
                            : displayRel === 'ally'
                            ? 'text-cyan-300 bg-cyan-500/20 border border-cyan-500/30'
                            : displayRel === 'self'
                            ? 'text-yellow-300 bg-yellow-500/20 border border-yellow-500/30'
                            : 'text-gray-400 bg-gray-500/10 border border-gray-500/20'
                        }`}
                        style={
                          displayRel === 'enemy'
                            ? { textShadow: '0 0 8px rgba(239,68,68,0.5)' }
                            : displayRel === 'ally'
                            ? { textShadow: '0 0 8px rgba(46,197,255,0.5)' }
                            : undefined
                        }
                      >
                        {displayRel === 'self' ? 'YOUR RULER' : displayRel.toUpperCase()}
                      </span>
                      <CosmicInfoTooltip label="Hour status info" topic={hourStatusTooltip.topic}>{hourStatusTooltip.text}</CosmicInfoTooltip>
                    </div>
                  </div>
                </div>
              </div>

              {/* Countdown to next ally */}
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                <p className="text-gray-500 text-[12px] uppercase tracking-widest mb-1 flex items-center gap-1">
                  Next Ally Hour
                  <CosmicInfoTooltip label="Next ally hour info">{COSMIC_TOOLTIPS.nextAllyCountdown.text}</CosmicInfoTooltip>
                </p>
                <p className={`text-4xl font-mono font-black tabular-nums ${isAllyNow ? 'text-cyan-300' : 'text-white'}`}
                  style={{
                    textShadow: isAllyNow
                      ? '0 0 20px rgba(46,197,255,0.5), 0 0 40px rgba(46,197,255,0.25), 0 0 60px rgba(46,197,255,0.1)'
                      : '0 0 12px rgba(255,255,255,0.15)',
                    background: isAllyNow
                      ? 'linear-gradient(135deg, #2EC5FF 0%, #67e8f9 50%, #2EC5FF 100%)'
                      : 'linear-gradient(135deg, #ffffff 0%, #94a3b8 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {nextAllyStr}
                </p>
                {nextAllyHour && (
                  <p className="text-gray-400 text-[11px] mt-1 font-mono">
                    {PLANET_GLYPHS[nextAllyHour.planet]} {new Date(nextAllyHour.startMs).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                  </p>
                )}
              </div>

              {/* Hour breakdown: 3 CosmicDataRow entries */}
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
                <p className="text-gray-500 text-[12px] uppercase tracking-widest mb-1">Hour Breakdown</p>
                <CosmicDataRow
                  label="Ally Hours"
                  value={(counts.ally ?? 0) + (counts.self ?? 0)}
                  valueColor="#2EC5FF"
                  badge={{ text: 'Favorable', variant: 'positive' }}
                />
                <CosmicDataRow
                  label="Neutral Hours"
                  value={counts.neutral ?? 0}
                  valueColor="#94A3B8"
                  badge={{ text: 'Standard', variant: 'neutral' }}
                />
                <CosmicDataRow
                  label="Enemy Hours"
                  value={counts.enemy ?? 0}
                  valueColor="#EF4444"
                  badge={{ text: 'Caution', variant: 'negative' }}
                  noBorder
                />
              </div>

              {/* Best windows — up to 5 glass chips */}
              {upcomingBest.length > 0 && (
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
                  <p className="text-gray-500 text-[12px] uppercase tracking-widest mb-2">Best Windows</p>
                  <div className="flex flex-wrap gap-2">
                    {upcomingBest.map((h, i) => (
                      <div
                        key={i}
                        className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2 flex items-center gap-2"
                        style={{ boxShadow: `0 0 12px ${PLANET_COLORS[h.planet]}15, 0 0 4px ${PLANET_COLORS[h.planet]}10` }}
                      >
                        <span className="text-sm" style={{ color: PLANET_COLORS[h.planet] }}>{PLANET_GLYPHS[h.planet]}</span>
                        <span className="text-white text-[12px] font-medium">{h.planet}</span>
                        <span className="text-gray-400 text-[11px] font-mono">
                          {new Date(h.startMs).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Day wisdom in sunken glass card */}
              <CosmicGlassCard variant="sunken" accentColor="amber" noPadding>
                <div className="p-3">
                  <p className="text-amber-400/70 text-[12px] uppercase tracking-widest mb-1 font-bold flex items-center gap-1">
                    Day Wisdom
                    <CosmicInfoTooltip label="Day wisdom info">{COSMIC_TOOLTIPS.dayWisdom.text}</CosmicInfoTooltip>
                  </p>
                  <p className="text-gray-300 text-[13px] leading-relaxed italic">
                    {DAY_WISDOM[planetaryHours.dayRuler] || ''}
                  </p>
                </div>
              </CosmicGlassCard>
            </div>
          </div>
        </div>
      </motion.div>
    </CosmicGlassCard>
  );
}
