import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { PlanetaryHourMap, Planet } from '@/types/cosmic';
import CosmicInfoTooltip from './shared/CosmicInfoTooltip';
import { COSMIC_TOOLTIPS } from './config/cosmicTooltips';
import { useInteractiveSelection } from './hooks/useInteractiveSelection';

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
  Sun: '☉', Moon: '☽', Mars: '♂', Mercury: '☿', Jupiter: '♃', Venus: '♀', Saturn: '♄',
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
  Sun:     'Solar confidence amplifies bold moves. Quality over quantity — favor market leaders.',
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

export default function PlanetaryCommandCenter({ planetaryHours, planetaryRuler }: Props) {
  const [nowMs, setNowMs] = useState(() => Date.now());
  const { active, getHandlers } = useInteractiveSelection<number>();

  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);

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
    { ally: 0, enemy: 0, neutral: 0, self: 0 } as Record<string, number>
  );

  // Next ally hour
  const nextAllyHour = allHours.find((h, i) => i > currentIdx && (getHourRelationship(h.planet, planetaryRuler) === 'ally' || getHourRelationship(h.planet, planetaryRuler) === 'self'));
  const msToNextAlly = nextAllyHour ? nextAllyHour.startMs - nowMs : null;
  const nextAllyStr = msToNextAlly != null && msToNextAlly > 0
    ? `${Math.floor(msToNextAlly / 3600000)}h ${Math.floor((msToNextAlly % 3600000) / 60000)}m`
    : '—';

  // Best upcoming hours (top 4)
  const upcomingBest = allHours
    .filter((h, i) => i >= currentIdx && ['ally', 'self'].includes(getHourRelationship(h.planet, planetaryRuler)))
    .slice(0, 4);

  const currentRel = getHourRelationship(currentPlanet, planetaryRuler);

  const WEDGE_COLORS: Record<string, string> = { ally: '#2EC5FF', enemy: '#EF4444', neutral: '#374151', self: '#F6C453' };
  const WEDGE_BG: Record<string, string> = { ally: 'rgba(46,197,255,0.25)', enemy: 'rgba(239,68,68,0.2)', neutral: 'rgba(55,65,81,0.3)', self: 'rgba(246,196,83,0.3)' };

  const cx = 200, cy = 200;
  const outerR = 175, midR = 140;
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.15 }}
      className="rounded-2xl border border-amber-500/20 overflow-hidden relative"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-cover bg-center opacity-[0.12]" style={{ backgroundImage: 'url(/images/ai-generated/cosmic-day-ruler-bg.png)' }} />
      <div className="absolute inset-0 bg-gradient-to-br from-amber-950/95 via-cosmic-900/95 to-indigo-950/95" />

      <div className="relative z-10 p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">🌐</span>
          <h3 className="text-white font-bold text-sm uppercase tracking-widest">Planetary Command Center</h3>
          <div className="ml-auto flex items-center gap-1.5 px-2 py-1 rounded-full border border-amber-500/40 bg-amber-500/15 text-amber-300 text-[10px] font-bold">
            {PLANET_GLYPHS[planetaryHours.dayRuler]} {planetaryHours.dayRuler} Day
            <CosmicInfoTooltip label="Day ruler info">{COSMIC_TOOLTIPS.dayRuler.text}</CosmicInfoTooltip>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-5">
          {/* ── Left: 24-Hour Command Wheel ── */}
          <div className="flex-1 flex justify-center">
            <svg viewBox="0 0 400 400" className="w-full max-w-xs sm:max-w-sm">
              <defs>
                <filter id="cmdAllyGlow">
                  <feGaussianBlur stdDeviation="3" result="b"/>
                  <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
                <filter id="cmdEnemyGlow">
                  <feGaussianBlur stdDeviation="2" result="b"/>
                  <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>

              {/* Wedges */}
              {allHours.map((h, i) => {
                const startDeg = i * wedgeDeg;
                const endDeg = startDeg + wedgeDeg;
                const midDeg = startDeg + wedgeDeg / 2;
                const rel = getHourRelationship(h.planet, planetaryRuler);
                const isCurrent = i === currentIdx;
                const isPast = i < currentIdx;
                const color = WEDGE_COLORS[rel];
                const bg = WEDGE_BG[rel];
                const labelPos = polarToXY(cx, cy, (outerR + midR) / 2, midDeg);

                const isActive = active === i;

                return (
                  <g key={i} {...getHandlers(i)} className="cursor-pointer" style={{ outline: 'none' }}>
                    <motion.path
                      d={wedgePath(cx, cy, midR, outerR, startDeg, endDeg)}
                      fill={isCurrent || isActive ? color : bg}
                      stroke={color}
                      strokeWidth={isCurrent || isActive ? 2 : 0.5}
                      opacity={isPast && !isActive ? 0.3 : 1}
                      filter={rel === 'ally' && !isPast ? 'url(#cmdAllyGlow)' : rel === 'enemy' && !isPast ? 'url(#cmdEnemyGlow)' : undefined}
                      animate={isCurrent && !isActive ? { opacity: [1, 0.7, 1] } : undefined}
                      transition={isCurrent && !isActive ? { duration: 1.5, repeat: Infinity } : undefined}
                    />
                    {/* Planet glyph label */}
                    <text
                      x={labelPos.x} y={labelPos.y}
                      textAnchor="middle" dominantBaseline="middle"
                      fontSize="9"
                      fill={isPast && !isActive ? '#374151' : color}
                      opacity={isPast && !isActive ? 0.5 : 0.85}
                    >
                      {PLANET_GLYPHS[h.planet]}
                    </text>
                  </g>
                );
              })}

              {/* Inner ring */}
              <circle cx={cx} cy={cy} r={midR} fill="none" stroke="#1e293b" strokeWidth="1" />
              <circle cx={cx} cy={cy} r={60} fill="#0a0f1e" stroke="#1e293b" strokeWidth="1" />

              {/* Current hour beam */}
              {currentIdx >= 0 && (() => {
                const beamDeg = currentIdx * wedgeDeg + wedgeDeg / 2;
                const beamEnd = polarToXY(cx, cy, outerR - 5, beamDeg);
                return (
                  <motion.line
                    x1={cx} y1={cy} x2={beamEnd.x} y2={beamEnd.y}
                    stroke="white" strokeWidth="1.5" strokeOpacity="0.6"
                    animate={{ strokeOpacity: [0.6, 0.2, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                );
              })()}

              {/* Center: day ruler */}
              <text x={cx} y={cy - 12} textAnchor="middle" fontSize="28" fill={PLANET_COLORS[planetaryHours.dayRuler]}>
                {PLANET_GLYPHS[planetaryHours.dayRuler]}
              </text>
              <text x={cx} y={cy + 10} textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">
                {planetaryHours.dayRuler.toUpperCase()}
              </text>
              <text x={cx} y={cy + 22} textAnchor="middle" fill="#6b7280" fontSize="8">DAY</text>
            </svg>
          </div>

          {/* ── Right: Tactical Panel ── */}
          <div className="w-full lg:w-56 flex flex-col gap-3">
            {/* Current hour status */}
            <div className={`rounded-xl border p-3 text-center ${
              displayRel === 'ally' ? 'border-cyan-500/40 bg-cyan-500/10' :
              displayRel === 'enemy' ? 'border-red-500/40 bg-red-500/10' :
              displayRel === 'self' ? 'border-yellow-500/40 bg-yellow-500/10' :
              'border-gray-500/30 bg-gray-500/10'
            }`}>
              <p className="text-gray-400 text-[9px] uppercase mb-1">
                {active !== null ? 'Selected Hour' : 'Current Hour'}
              </p>
              <p className="text-2xl">{PLANET_GLYPHS[displayPlanet]}</p>
              <p className="text-white font-bold text-xs">{displayPlanet}</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <p className={`text-[10px] font-black uppercase ${
                  displayRel === 'ally' ? 'text-cyan-400' :
                  displayRel === 'enemy' ? 'text-red-400' :
                  displayRel === 'self' ? 'text-yellow-400' :
                  'text-gray-400'
                }`}>
                  {displayRel === 'self' ? '★ YOUR RULER' : displayRel.toUpperCase()}
                </p>
                <CosmicInfoTooltip label="Hour status info" topic={hourStatusTooltip.topic}>{hourStatusTooltip.text}</CosmicInfoTooltip>
              </div>
            </div>

            {/* Next ally countdown */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-3">
              <p className="text-gray-400 text-[9px] uppercase mb-1 flex items-center gap-1">
                Next Ally Hour
                <CosmicInfoTooltip label="Next ally hour info">{COSMIC_TOOLTIPS.nextAllyCountdown.text}</CosmicInfoTooltip>
              </p>
              <p className="text-emerald-300 font-mono font-bold text-xl">{nextAllyStr}</p>
              {nextAllyHour && (
                <p className="text-gray-400 text-[10px] mt-0.5">
                  {PLANET_GLYPHS[nextAllyHour.planet]} {new Date(nextAllyHour.startMs).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                </p>
              )}
            </div>

            {/* Day summary */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-gray-400 text-[9px] uppercase mb-2">Today's Breakdown</p>
              <div className="flex gap-3 text-center">
                <div><p className="text-cyan-300 font-bold text-sm">{(counts.ally ?? 0) + (counts.self ?? 0)}</p><p className="text-[9px] text-gray-500">Ally</p></div>
                <div><p className="text-gray-400 font-bold text-sm">{counts.neutral ?? 0}</p><p className="text-[9px] text-gray-500">Neutral</p></div>
                <div><p className="text-red-400 font-bold text-sm">{counts.enemy ?? 0}</p><p className="text-[9px] text-gray-500">Enemy</p></div>
              </div>
            </div>

            {/* Best upcoming hours */}
            {upcomingBest.length > 0 && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-gray-400 text-[9px] uppercase mb-2">Best Hours Today</p>
                <div className="space-y-1.5">
                  {upcomingBest.map((h, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[13px]" style={{ color: PLANET_COLORS[h.planet] }}>{PLANET_GLYPHS[h.planet]}</span>
                        <span className="text-white text-[10px] font-medium">{h.planet}</span>
                      </div>
                      <span className="text-gray-400 text-[9px] font-mono">
                        {new Date(h.startMs).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Day wisdom */}
            <div className="rounded-xl border border-amber-500/20 bg-amber-950/30 p-3">
              <p className="text-amber-400 text-[9px] uppercase mb-1 font-bold flex items-center gap-1">
                Day Wisdom
                <CosmicInfoTooltip label="Day wisdom info">{COSMIC_TOOLTIPS.dayWisdom.text}</CosmicInfoTooltip>
              </p>
              <p className="text-gray-300 text-[10px] leading-relaxed italic">
                {DAY_WISDOM[planetaryHours.dayRuler] || ''}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
