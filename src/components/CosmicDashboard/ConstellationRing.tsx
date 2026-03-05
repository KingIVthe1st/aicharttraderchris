import { useState } from 'react';
import { motion } from 'framer-motion';
import type { NEOFactor } from '@/types/cosmic';

interface Props { factors: NEOFactor[]; total: number }

function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export default function ConstellationRing({ factors, total }: Props) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const cx = 220, cy = 220, ringR = 170, nodeR = 10;
  const n = factors.length;

  const nodePositions = factors.map((_, i) => {
    const angle = (i * 360) / n;
    return polarToXY(cx, cy, ringR, angle);
  });

  const passedIndices = factors.map((f, i) => f.score === 1 ? i : -1).filter(i => i >= 0);
  const passedCount = passedIndices.length;

  return (
    <div className="relative w-full">
      <p className="text-xs text-gray-500 uppercase tracking-widest mb-4 font-medium text-center">17-Factor Constellation Ring</p>

      <div className="relative flex justify-center">
        <svg width="440" height="440" viewBox="0 0 440 440" className="w-full max-w-[440px]"
          style={{ filter: 'drop-shadow(0 0 30px rgba(109,91,255,0.1))' }}>
          <defs>
            <filter id="star-glow-f">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          <circle cx={cx} cy={cy} r={ringR} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx={cx} cy={cy} r={ringR - 25} fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />

          {/* Constellation lines */}
          {passedIndices.map((idx, j) => {
            if (j === passedIndices.length - 1) return null;
            const nextIdx = passedIndices[j + 1];
            const p1 = nodePositions[idx];
            const p2 = nodePositions[nextIdx];
            return (
              <motion.line key={`line-${idx}`}
                x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                stroke="rgba(139,122,255,0.3)" strokeWidth="0.8"
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
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer">
                {passed && (
                  <motion.circle cx={pos.x} cy={pos.y} r={nodeR + 6}
                    fill="rgba(139,122,255,0.1)"
                    filter="url(#star-glow-f)"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2 + (i % 3) * 0.5, repeat: Infinity }}
                    style={{ transformOrigin: `${pos.x}px ${pos.y}px` }} />
                )}
                <motion.circle cx={pos.x} cy={pos.y} r={isHovered ? nodeR + 2 : nodeR}
                  fill={passed ? 'rgba(139,122,255,0.3)' : 'rgba(30,30,50,0.8)'}
                  stroke={passed ? '#8B7AFF' : 'rgba(239,68,68,0.4)'}
                  strokeWidth={isHovered ? 2 : 1}
                  filter={passed ? 'url(#star-glow-f)' : undefined}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  style={{ transformOrigin: `${pos.x}px ${pos.y}px` }} />
                <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle"
                  fontSize="8" fontWeight="bold"
                  fill={passed ? '#8B7AFF' : 'rgba(239,68,68,0.6)'}>
                  {passed ? '★' : '·'}
                </text>
                {passed && (
                  <motion.circle cx={pos.x} cy={pos.y} r={nodeR + 12}
                    fill="none" stroke="#8B7AFF" strokeWidth="0.5" opacity={0.3}
                    animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ duration: 3 + (i % 4), repeat: Infinity, delay: i * 0.2 }}
                    style={{ transformOrigin: `${pos.x}px ${pos.y}px` }} />
                )}
                <text x={pos.x} y={pos.y + nodeR + 10} textAnchor="middle" fontSize="7"
                  fill={passed ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)'}>
                  F{i + 1}
                </text>
              </g>
            );
          })}

          <circle cx={cx} cy={cy} r={50} fill="rgba(4,5,13,0.95)" stroke="rgba(139,122,255,0.2)" strokeWidth="1" />
          <text x={cx} y={cy - 12} textAnchor="middle" fontSize="32" fontWeight="900"
            fill="#8B7AFF" style={{ filter: 'drop-shadow(0 0 10px rgba(139,122,255,0.5))' }}>
            {passedCount}
          </text>
          <text x={cx} y={cy + 8} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.4)">/ {n}</text>
          <text x={cx} y={cy + 22} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.3)">FACTORS</text>
        </svg>

        {hoveredIdx !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-gray-900 border border-gray-700 rounded-xl p-4 text-sm shadow-xl w-72 pointer-events-none z-10">
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2 h-2 rounded-full ${factors[hoveredIdx].score === 1 ? 'bg-purple-400' : 'bg-red-400'}`} />
              <span className="text-white font-bold">{factors[hoveredIdx].name}</span>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed">{factors[hoveredIdx].reasoning}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
