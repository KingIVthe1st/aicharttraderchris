import { motion } from 'framer-motion';
import type { PlanetaryHourMap, Planet } from '@/types/cosmic';

interface Props { planetaryHours: PlanetaryHourMap }

const PLANETS: Planet[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
const PLANET_GLYPHS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mars: '♂', Mercury: '☿', Jupiter: '♃', Venus: '♀', Saturn: '♄',
};

function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export default function PlanetaryHourCompass({ planetaryHours }: Props) {
  const { dayRuler, currentHour } = planetaryHours;
  const cx = 100, cy = 100;

  return (
    <div className="rounded-2xl border border-gray-700/50 bg-gradient-to-b from-gray-900 to-gray-950 p-5 flex flex-col items-center">
      <p className="text-xs text-gray-500 uppercase tracking-widest mb-3 font-medium">Planetary Compass</p>

      <svg width="200" height="200" viewBox="0 0 200 200">
        <defs>
          <filter id="compass-glow-filter">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <circle cx={cx} cy={cy} r={90} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={75} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />

        {[0, 45, 90, 135].map(a => {
          const p1 = polarToXY(cx, cy, 90, a);
          const p2 = polarToXY(cx, cy, 90, a + 180);
          return <line key={a} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />;
        })}

        {PLANETS.map((p, i) => {
          const angle = (i * 360) / PLANETS.length;
          const pos = polarToXY(cx, cy, 75, angle);
          const isCurrent = currentHour.planet === p;
          const isAlly = isCurrent && currentHour.isAllyHour;
          const isEnemy = isCurrent && currentHour.isEnemyHour;

          return (
            <g key={p}>
              <motion.circle
                cx={pos.x} cy={pos.y} r={isCurrent ? 12 : 9}
                fill={isAlly ? 'rgba(46,197,255,0.2)' : isEnemy ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.05)'}
                stroke={isAlly ? '#2EC5FF' : isEnemy ? '#EF4444' : 'rgba(255,255,255,0.2)'}
                strokeWidth={isCurrent ? 1.5 : 0.5}
                filter={isCurrent ? 'url(#compass-glow-filter)' : undefined}
                animate={isCurrent && isAlly ? { scale: [1, 1.1, 1] } : isCurrent && isEnemy ? { opacity: [1, 0.5, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ transformOrigin: `${pos.x}px ${pos.y}px` }}
              />
              <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle" fontSize="10"
                fill={isAlly ? '#2EC5FF' : isEnemy ? '#EF4444' : isCurrent ? 'white' : 'rgba(255,255,255,0.5)'}>
                {PLANET_GLYPHS[p]}
              </text>
            </g>
          );
        })}

        {(() => {
          const currentPlanetIdx = PLANETS.indexOf(currentHour.planet);
          const angle = (currentPlanetIdx * 360) / PLANETS.length;
          return (
            <motion.g
              animate={{ rotate: angle }}
              transition={{ duration: 1, ease: 'easeInOut' }}
              style={{ transformOrigin: `${cx}px ${cy}px` }}
            >
              <line x1={cx} y1={cy} x2={cx} y2={cy - 55}
                stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeDasharray="4 3" />
            </motion.g>
          );
        })()}

        <circle cx={cx} cy={cy} r={22} fill="rgba(4,5,13,0.95)" stroke="rgba(109,91,255,0.4)" strokeWidth="1" />
        <text x={cx} y={cy - 5} textAnchor="middle" dominantBaseline="middle" fontSize="16" fill="#8B7AFF">
          {PLANET_GLYPHS[dayRuler]}
        </text>
        <text x={cx} y={cy + 9} textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.4)">DAY</text>
      </svg>

      <div className="flex items-center gap-3 mt-1 text-xs">
        <div>
          <span className="text-gray-500">Now: </span>
          <span className="text-white font-semibold">{PLANET_GLYPHS[currentHour.planet]} {currentHour.planet}</span>
        </div>
        {currentHour.isAllyHour && <span className="text-cyan-400 font-medium">✦ Ally</span>}
        {currentHour.isEnemyHour && <span className="text-red-400 font-medium">✕ Enemy</span>}
      </div>
    </div>
  );
}
