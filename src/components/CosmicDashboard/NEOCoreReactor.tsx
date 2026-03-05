import { useState } from 'react';
import { motion } from 'framer-motion';
import type { NEOScore } from '@/types/cosmic';
import CosmicInfoTooltip from './shared/CosmicInfoTooltip';
import { COSMIC_TOOLTIPS } from './config/cosmicTooltips';

interface Props { neoScore: NEOScore }

const NEO_COLORS = {
  ULTRA_GREEN: { stroke: '#10B981', glow: '#10B981', label: 'Ultra Aligned' },
  GREEN:       { stroke: '#22C55E', glow: '#22C55E', label: 'Aligned' },
  YELLOW:      { stroke: '#F59E0B', glow: '#F59E0B', label: 'Mixed' },
  RED:         { stroke: '#EF4444', glow: '#EF4444', label: 'Conflicted' },
};

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const toRad = (d: number) => ((d - 90) * Math.PI) / 180;
  const x1 = cx + r * Math.cos(toRad(startDeg));
  const y1 = cy + r * Math.sin(toRad(startDeg));
  const x2 = cx + r * Math.cos(toRad(endDeg));
  const y2 = cy + r * Math.sin(toRad(endDeg));
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
}

export default function NEOCoreReactor({ neoScore }: Props) {
  const { total, classification, factors } = neoScore;
  const theme = NEO_COLORS[classification];
  const cx = 120, cy = 120, outerR = 100, innerR = 68;
  const totalFactors = factors.length;
  const gapDeg = 3;
  const arcPerSegment = (300 - gapDeg * totalFactors) / totalFactors;
  const [expandedFactor, setExpandedFactor] = useState<number | null>(null);

  return (
    <div className="flex flex-col items-center">
      <svg width="240" height="240" viewBox="0 0 240 240">
        <defs>
          <filter id="neo-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="neo-glow-strong">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />

        {factors.map((f, i) => {
          const startDeg = -150 + i * (arcPerSegment + gapDeg);
          const endDeg = startDeg + arcPerSegment;
          const passed = f.score === 1;
          return (
            <motion.path
              key={f.id}
              d={arcPath(cx, cy, outerR, startDeg, endDeg)}
              fill="none"
              stroke={passed ? theme.stroke : 'rgba(255,255,255,0.08)'}
              strokeWidth="10"
              strokeLinecap="round"
              filter={passed ? 'url(#neo-glow)' : undefined}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: i * 0.04, ease: 'easeOut' }}
            />
          );
        })}

        <circle cx={cx} cy={cy} r={innerR - 2} fill="rgba(4,5,13,0.95)" />
        <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />

        {classification === 'ULTRA_GREEN' && (
          <motion.circle
            cx={cx} cy={cy} r={innerR - 2}
            fill="none" stroke={theme.glow} strokeWidth="1"
            filter="url(#neo-glow-strong)"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}

        <text x={cx} y={cy - 10} textAnchor="middle" dominantBaseline="middle"
          fontSize="36" fontWeight="900" fill={theme.stroke}
          style={{ filter: `drop-shadow(0 0 8px ${theme.glow})` }}>
          {total}
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.4)">
          / {totalFactors}
        </text>
        <text x={cx} y={cy + 32} textAnchor="middle" fontSize="10" fill={theme.stroke} fontWeight="600">
          {theme.label.toUpperCase()}
        </text>
      </svg>

      <div className="flex items-center gap-1.5 mt-1">
        <span className="text-xs font-semibold" style={{ color: theme.stroke }}>{theme.label}</span>
        <CosmicInfoTooltip label="NEO classification info">
          {COSMIC_TOOLTIPS.neoClassification.text}
        </CosmicInfoTooltip>
      </div>

      <div className="flex items-center gap-1.5 mt-3 mb-1">
        <span className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">NEO Factors</span>
        <CosmicInfoTooltip label="NEO score info" topic={COSMIC_TOOLTIPS.neoScore.topic}>
          {COSMIC_TOOLTIPS.neoScore.text}
        </CosmicInfoTooltip>
      </div>

      <div className="w-full space-y-1.5 max-h-48 overflow-y-auto">
        {factors.map((f, i) => (
          <div
            key={f.id}
            className="flex items-start gap-2 text-xs cursor-pointer"
            onClick={() => setExpandedFactor(prev => prev === i ? null : i)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setExpandedFactor(prev => prev === i ? null : i);
              }
            }}
            tabIndex={0}
            role="button"
          >
            <span className={`mt-0.5 flex-shrink-0 w-3 h-3 rounded-full ${f.score === 1 ? 'bg-emerald-400' : 'bg-red-400/50'}`} />
            <div>
              <span className={`font-medium ${f.score === 1 ? 'text-white' : 'text-gray-500'}`}>{f.name}</span>
              {expandedFactor === i && (
                <p className="text-gray-600 leading-tight">{f.reasoning}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
