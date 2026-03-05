import { useState } from 'react';
import { motion } from 'framer-motion';
import type { HoraGridHour } from '@/types/cosmic';

interface Props { hours: HoraGridHour[] }

const NODE_COLORS: Record<string, string> = {
  ULTRA_ALIGNED: '#F6C453', HIGH_PRESSURE: '#22C55E', SOUL_WINDOW: '#3B82F6',
  MIXED: '#EAB308', CONFLICT: '#EF4444', DISRUPTION: '#A855F7', U_NODE: '#374151',
};

function isCurrentHour(start: string, end: string): boolean {
  const now = Date.now();
  return now >= new Date(start).getTime() && now < new Date(end).getTime();
}

function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function wedgePath(cx: number, cy: number, rInner: number, rOuter: number, startDeg: number, endDeg: number): string {
  const s1 = polarToXY(cx, cy, rOuter, startDeg);
  const s2 = polarToXY(cx, cy, rOuter, endDeg);
  const s3 = polarToXY(cx, cy, rInner, endDeg);
  const s4 = polarToXY(cx, cy, rInner, startDeg);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${s1.x} ${s1.y} A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${s2.x} ${s2.y} L ${s3.x} ${s3.y} A ${rInner} ${rInner} 0 ${largeArc} 0 ${s4.x} ${s4.y} Z`;
}

export default function HoraOrbitWheel({ hours }: Props) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const cx = 200, cy = 200;
  const outerR = 175, midR = 140, innerR = 105, coreR = 85;
  const totalHours = hours.length;
  const wedgeDeg = 360 / totalHours;
  const gap = 0.8;

  const currentIdx = hours.findIndex(h => isCurrentHour(h.startTime, h.endTime));
  const hovered = hoveredIdx !== null ? hours[hoveredIdx] : null;

  return (
    <div className="relative flex flex-col items-center w-full">
      <div className="relative w-full max-w-[420px] mx-auto rounded-2xl overflow-hidden" style={{ aspectRatio: '1' }}>
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15"
          style={{ backgroundImage: 'url(/images/ai-generated/cosmic-hora-wheel-bg.png)' }}
        />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle, transparent 30%, rgba(4,5,13,0.9) 100%)' }} />

        <svg viewBox="0 0 400 400" className="relative z-10 w-full h-full"
          style={{ filter: 'drop-shadow(0 0 20px rgba(109,91,255,0.2))' }}>
          <defs>
            <filter id="hora-glow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Outer ring: planet name labels */}
          {hours.map((h, i) => {
            const midAngle = i * wedgeDeg + wedgeDeg / 2;
            const pos = polarToXY(cx, cy, (outerR + midR) / 2, midAngle);
            const isCurrent = i === currentIdx;
            return (
              <text key={`planet-${i}`} x={pos.x} y={pos.y}
                textAnchor="middle" dominantBaseline="middle"
                fontSize="7" fontWeight={isCurrent ? '700' : '400'}
                fill={isCurrent ? '#FFD97A' : 'rgba(255,255,255,0.5)'}
                transform={`rotate(${midAngle}, ${pos.x}, ${pos.y})`}>
                {h.vedic.planet.slice(0, 3)}
              </text>
            );
          })}

          {/* Outer colored wedges */}
          {hours.map((h, i) => {
            const startAngle = i * wedgeDeg + gap / 2;
            const endAngle = (i + 1) * wedgeDeg - gap / 2;
            const color = NODE_COLORS[h.nodeType] ?? '#374151';
            const isCurrent = i === currentIdx;
            const isHovered = i === hoveredIdx;
            return (
              <motion.path key={`outer-${i}`}
                d={wedgePath(cx, cy, midR + 2, outerR - 2, startAngle, endAngle)}
                fill={color}
                opacity={isCurrent || isHovered ? 0.9 : 0.35}
                filter={isCurrent ? 'url(#hora-glow)' : undefined}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer"
                initial={{ scale: 0.8 }}
                animate={{ opacity: isCurrent || isHovered ? 0.9 : 0.35 }}
                transition={{ duration: 0.3, delay: i * 0.02 }}
              />
            );
          })}

          {/* Middle ring: Chinese animals */}
          {hours.map((h, i) => {
            const midAngle = i * wedgeDeg + wedgeDeg / 2;
            const pos = polarToXY(cx, cy, (midR + innerR) / 2, midAngle);
            return (
              <text key={`animal-${i}`} x={pos.x} y={pos.y}
                textAnchor="middle" dominantBaseline="middle"
                fontSize="8" fill="rgba(255,255,255,0.6)">
                {h.chinese.animal.slice(0, 3)}
              </text>
            );
          })}

          {/* Middle ring fill */}
          {hours.map((_h, i) => {
            const startAngle = i * wedgeDeg + gap / 2;
            const endAngle = (i + 1) * wedgeDeg - gap / 2;
            const isCurrent = i === currentIdx;
            return (
              <path key={`mid-${i}`}
                d={wedgePath(cx, cy, innerR, midR, startAngle, endAngle)}
                fill="rgba(255,255,255,0.03)"
                stroke={isCurrent ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.06)'}
                strokeWidth="0.5" />
            );
          })}

          <circle cx={cx} cy={cy} r={innerR} fill="rgba(4,5,13,0.6)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
          <circle cx={cx} cy={cy} r={coreR} fill="rgba(4,5,13,0.95)" />
          <circle cx={cx} cy={cy} r={coreR} fill="none" stroke="rgba(109,91,255,0.3)" strokeWidth="1" />

          {/* Current hour beam */}
          {currentIdx >= 0 && (() => {
            const midAngle = currentIdx * wedgeDeg + wedgeDeg / 2;
            const p1 = polarToXY(cx, cy, coreR + 2, midAngle);
            const p2 = polarToXY(cx, cy, outerR, midAngle);
            return (
              <motion.line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                stroke="white" strokeWidth="1.5" opacity={0.5}
                filter="url(#hora-glow)"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }} />
            );
          })()}

          {hovered ? (
            <>
              <text x={cx} y={cy - 18} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.6)">{hovered.vedic.planet}</text>
              <text x={cx} y={cy} textAnchor="middle" fontSize="13" fontWeight="bold" fill="#FFD97A">{hovered.chinese.animal}</text>
              <text x={cx} y={cy + 16} textAnchor="middle" fontSize="8" fill={NODE_COLORS[hovered.nodeType]}>{hovered.nodeType.replace('_', ' ')}</text>
            </>
          ) : (
            <>
              <text x={cx} y={cy - 12} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.4)">HORA WHEEL</text>
              <text x={cx} y={cy + 6} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.3)">Hover a segment</text>
            </>
          )}
        </svg>
      </div>

      {hovered && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
          className="mt-3 bg-gray-900 border border-gray-700 rounded-xl p-4 text-sm w-full max-w-md">
          <p className="text-gray-400 text-xs mb-1">Trading Guidance</p>
          <p className="text-white leading-relaxed">{hovered.tradingGuidance}</p>
          <div className="mt-2 flex gap-4 text-xs text-gray-500">
            <span>Vedic: <span className="text-gray-300">{hovered.vedic.planet}</span></span>
            <span>Babylonian: <span className="text-gray-300">{hovered.babylonian.planet}</span></span>
            <span>Egyptian: <span className="text-gray-300">{hovered.egyptian.decanEnergy}</span></span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
