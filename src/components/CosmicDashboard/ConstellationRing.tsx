import { motion } from 'framer-motion';
import type { NEOFactor } from '@/types/cosmic';
import CosmicGlassCard from './shared/CosmicGlassCard';
import CosmicInfoTooltip from './shared/CosmicInfoTooltip';
import { COSMIC_TOOLTIPS } from './config/cosmicTooltips';
import { useInteractiveSelection } from './hooks/useInteractiveSelection';

interface Props { factors: NEOFactor[]; total: number }

function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/** 6-point star path centered at (cx, cy) with outer radius `r` */
function starPath(cx: number, cy: number, r: number): string {
  const inner = r * 0.5;
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const outerAngle = ((i * 60) - 90) * Math.PI / 180;
    const innerAngle = (((i * 60) + 30) - 90) * Math.PI / 180;
    pts.push(`${cx + r * Math.cos(outerAngle)},${cy + r * Math.sin(outerAngle)}`);
    pts.push(`${cx + inner * Math.cos(innerAngle)},${cy + inner * Math.sin(innerAngle)}`);
  }
  return `M${pts.join('L')}Z`;
}

export default function ConstellationRing({ factors, total: _total }: Props) {
  const { active: hoveredIdx, getHandlers } = useInteractiveSelection<number>();
  const cx = 240, cy = 240, ringR = 190;
  const n = factors.length;

  const nodePositions = factors.map((_, i) => {
    const angle = (i * 360) / n;
    return polarToXY(cx, cy, ringR, angle);
  });

  const passedIndices = factors.map((f, i) => f.score === 1 ? i : -1).filter(i => i >= 0);
  const passedCount = passedIndices.length;
  const pct = n > 0 ? passedCount / n : 0;

  // Mini fill ring params for center
  const fillR = 34;
  const fillCirc = 2 * Math.PI * fillR;

  return (
    <CosmicGlassCard accentColor="nebula" noPadding>
      <div className="relative w-full p-5">
        <div className="flex items-center justify-center gap-2 mb-4">
          <p className="text-xs text-gray-500 uppercase tracking-widest font-medium">17-Factor Constellation Ring</p>
          <CosmicInfoTooltip label="What are the constellation factors?">
            {COSMIC_TOOLTIPS.constellationFactor.text}
          </CosmicInfoTooltip>
        </div>

        <div className="relative flex justify-center">
          <svg width="480" height="480" viewBox="0 0 480 480" className="w-full max-w-[480px]"
            style={{ filter: 'drop-shadow(0 0 30px rgba(109,91,255,0.1))' }}>
            <defs>
              <filter id="star-glow-ring">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* Background grid: two dashed circles */}
            <circle cx={cx} cy={cy} r={ringR} fill="none"
              stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="4 4" />
            <circle cx={cx} cy={cy} r={ringR - 40} fill="none"
              stroke="rgba(255,255,255,0.02)" strokeWidth="1" strokeDasharray="4 4" />

            {/* Background grid: 4 radial crosshair lines */}
            {[0, 90, 45, 135].map((angle) => {
              const p1 = polarToXY(cx, cy, ringR + 10, angle);
              const p2 = polarToXY(cx, cy, 60, angle);
              return (
                <line key={`grid-${angle}`}
                  x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                  stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
              );
            })}

            {/* Constellation lines between passed factors */}
            {passedIndices.map((idx, j) => {
              if (j === passedIndices.length - 1) return null;
              const nextIdx = passedIndices[j + 1];
              const p1 = nodePositions[idx];
              const p2 = nodePositions[nextIdx];
              return (
                <motion.line key={`line-${idx}`}
                  x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                  stroke="rgba(109,91,255,0.2)" strokeWidth="1.2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: j * 0.05 }} />
              );
            })}

            {/* Factor nodes */}
            {factors.map((f, i) => {
              const pos = nodePositions[i];
              const passed = f.score === 1;
              const isHovered = i === hoveredIdx;

              return (
                <g key={f.id}
                  {...getHandlers(i)}
                  className="cursor-pointer"
                  style={{ outline: 'none' }}>
                  {passed ? (
                    <>
                      {/* Outer halo */}
                      <circle cx={pos.x} cy={pos.y} r={8}
                        fill="rgba(109,91,255,0.15)"
                        filter="url(#star-glow-ring)" />
                      {/* 6-point star shape */}
                      <motion.path
                        d={starPath(pos.x, pos.y, isHovered ? 7 : 5)}
                        fill="white"
                        filter="url(#star-glow-ring)"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, delay: i * 0.04 }}
                        style={{ transformOrigin: `${pos.x}px ${pos.y}px` }} />
                      {/* Inner core dot */}
                      <circle cx={pos.x} cy={pos.y} r={3} fill="white" />
                    </>
                  ) : (
                    /* Failed: simple dim dot */
                    <motion.circle cx={pos.x} cy={pos.y} r={3}
                      fill="rgba(239,68,68,0.3)"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3, delay: i * 0.04 }}
                      style={{ transformOrigin: `${pos.x}px ${pos.y}px` }} />
                  )}
                  {/* Label */}
                  <text x={pos.x} y={pos.y + 16} textAnchor="middle" fontSize="7"
                    fill={passed ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)'}>
                    F{i + 1}
                  </text>
                </g>
              );
            })}

            {/* Center display: glass circle */}
            <circle cx={cx} cy={cy} r={55}
              fill="rgba(4,5,13,0.95)"
              stroke="rgba(109,91,255,0.2)" strokeWidth="1" />

            {/* Mini fill ring */}
            <circle cx={cx} cy={cy} r={fillR}
              fill="none"
              stroke="rgba(109,91,255,0.1)"
              strokeWidth="3" />
            <circle cx={cx} cy={cy} r={fillR}
              fill="none"
              stroke="#6D5BFF"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${pct * fillCirc} ${fillCirc}`}
              transform={`rotate(-90 ${cx} ${cy})`}
              style={{ filter: 'drop-shadow(0 0 4px rgba(109,91,255,0.5))' }} />

            {/* Score */}
            <text x={cx} y={cy - 8} textAnchor="middle"
              fontSize="32" fontWeight="900" fontFamily="monospace"
              fill="#8B7AFF"
              style={{ filter: 'drop-shadow(0 0 10px rgba(109,91,255,0.5))' }}>
              {passedCount}
            </text>
            <text x={cx} y={cy + 10} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.4)">
              / {n}
            </text>
            {/* Classification label */}
            <text x={cx} y={cy + 26} textAnchor="middle" fontSize="8"
              fill="rgba(255,255,255,0.3)" letterSpacing="0.1em">
              {passedCount >= 14 ? 'STRONG' : passedCount >= 10 ? 'MODERATE' : passedCount >= 6 ? 'MIXED' : 'WEAK'}
            </text>
          </svg>
        </div>

        {/* Hover tooltip */}
        {hoveredIdx !== null && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            className="mt-3 bg-gray-900/80 backdrop-blur-sm border border-white/[0.06] rounded-xl p-4 text-sm w-full max-w-md mx-auto">
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2 h-2 rounded-full ${factors[hoveredIdx].score === 1 ? 'bg-purple-400' : 'bg-red-400'}`} />
              <span className="text-white font-bold">{factors[hoveredIdx].name}</span>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed">{factors[hoveredIdx].reasoning}</p>
          </motion.div>
        )}
      </div>
    </CosmicGlassCard>
  );
}
