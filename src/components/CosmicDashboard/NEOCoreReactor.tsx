import { motion } from 'framer-motion';
import type { NEOScore } from '@/types/cosmic';
import CosmicGlassCard from './shared/CosmicGlassCard';
import CosmicStatusOrb from './shared/CosmicStatusOrb';
import CosmicInfoTooltip from './shared/CosmicInfoTooltip';
import { COSMIC_TOOLTIPS } from './config/cosmicTooltips';
import { useInteractiveSelection } from './hooks/useInteractiveSelection';

interface Props { neoScore: NEOScore }

const NEO_COLORS = {
  ULTRA_GREEN: { stroke: '#10B981', label: 'Ultra Aligned' },
  GREEN:       { stroke: '#22C55E', label: 'Aligned' },
  YELLOW:      { stroke: '#F59E0B', label: 'Mixed' },
  RED:         { stroke: '#EF4444', label: 'Conflicted' },
};

const ENERGY_GRADIENTS: Record<string, { inner: string; outer: string }> = {
  ULTRA_GREEN: { inner: 'rgba(16,185,129,0.2)',  outer: 'rgba(16,185,129,0)' },
  GREEN:       { inner: 'rgba(34,197,94,0.1)',    outer: 'rgba(34,197,94,0)' },
  YELLOW:      { inner: 'rgba(245,158,11,0.08)',  outer: 'rgba(245,158,11,0)' },
  RED:         { inner: 'transparent',             outer: 'transparent' },
};

const ACCENT_MAP: Record<string, 'emerald' | 'amber' | 'red'> = {
  ULTRA_GREEN: 'emerald',
  GREEN: 'emerald',
  YELLOW: 'amber',
  RED: 'red',
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
  const energy = ENERGY_GRADIENTS[classification];
  const dynamicAccent = ACCENT_MAP[classification];
  const { selected, getHandlers } = useInteractiveSelection<number>();

  const cx = 140, cy = 140, outerR = 110, innerR = 72;
  const totalFactors = factors.length; // 17
  const gapDeg = 2;
  const arcPerSegment = (360 - gapDeg * totalFactors) / totalFactors;

  const gradientId = 'neo-energy-gradient';
  const glowFilterId = 'neo-segment-glow';

  return (
    <CosmicGlassCard accentColor={dynamicAccent}>
      <div className="flex flex-col items-center">
        {/* Reactor SVG */}
        <svg width="280" height="280" viewBox="0 0 280 280">
          <defs>
            <filter id={glowFilterId}>
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id={gradientId} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={energy.inner} />
              <stop offset="100%" stopColor={energy.outer} />
            </radialGradient>
          </defs>

          {/* Containment rings */}
          <circle
            cx={cx} cy={cy} r={100}
            stroke="rgba(255,255,255,0.08)"
            strokeDasharray="3 6"
            fill="none"
            strokeWidth="1"
          />
          <circle
            cx={cx} cy={cy} r={120}
            stroke="rgba(255,255,255,0.08)"
            strokeDasharray="3 6"
            fill="none"
            strokeWidth="1"
          />

          {/* Arc segments */}
          {factors.map((f, i) => {
            const startDeg = i * (arcPerSegment + gapDeg);
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
                filter={passed ? `url(#${glowFilterId})` : undefined}
                initial={{ opacity: 0 }}
                animate={passed ? { opacity: [0.8, 1, 0.8] } : { opacity: 1 }}
                transition={passed
                  ? { opacity: { duration: 4, repeat: Infinity, ease: 'easeInOut' }, delay: i * 0.04 }
                  : { duration: 0.4, delay: i * 0.04, ease: 'easeOut' }
                }
              />
            );
          })}

          {/* Inner energy field */}
          {classification !== 'RED' && (
            <circle
              cx={cx} cy={cy} r={innerR}
              fill={`url(#${gradientId})`}
              style={
                classification === 'ULTRA_GREEN'
                  ? { animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite' }
                  : undefined
              }
            />
          )}

          {/* Center glass circle */}
          <circle cx={cx} cy={cy} r={innerR} fill="rgba(4,5,13,0.95)" />
          <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />

          {/* Re-draw energy on top for the glow to overlay the glass edge */}
          {classification !== 'RED' && (
            <circle
              cx={cx} cy={cy} r={innerR - 1}
              fill={`url(#${gradientId})`}
              style={
                classification === 'ULTRA_GREEN'
                  ? { animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite' }
                  : undefined
              }
            />
          )}

          {/* Score text */}
          <text
            x={cx} y={cy - 8}
            textAnchor="middle"
            dominantBaseline="middle"
            className="font-mono"
            fontSize="48"
            fontWeight="900"
            fill={theme.stroke}
            style={{ filter: `drop-shadow(0 0 8px ${theme.stroke})` }}
          >
            {total}
          </text>
          <text x={cx} y={cy + 18} textAnchor="middle" fontSize="16" fill="rgba(255,255,255,0.55)">
            /17
          </text>
          <text x={cx} y={cy + 36} textAnchor="middle" fontSize="13" fill={theme.stroke} fontWeight="600"
            letterSpacing="0.12em">
            {theme.label.toUpperCase()}
          </text>
        </svg>

        {/* Classification label + tooltip */}
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-xs font-semibold" style={{ color: theme.stroke }}>{theme.label}</span>
          <CosmicInfoTooltip label="NEO classification info">
            {COSMIC_TOOLTIPS.neoClassification.text}
          </CosmicInfoTooltip>
        </div>

        {/* Factor header + tooltip */}
        <div className="flex items-center gap-1.5 mt-3 mb-1">
          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">NEO Factors</span>
          <CosmicInfoTooltip label="NEO score info" topic={COSMIC_TOOLTIPS.neoScore.topic}>
            {COSMIC_TOOLTIPS.neoScore.text}
          </CosmicInfoTooltip>
        </div>

        {/* Factor grid */}
        <div className="w-full grid grid-cols-2 gap-2 mt-4">
          {factors.map((f, i) => {
            const isExpanded = selected === i;
            const handlers = getHandlers(i);
            return (
              <div
                key={f.id}
                className="bg-white/[0.03] border border-white/[0.04] rounded-lg px-3 py-2 cursor-pointer hover:bg-white/[0.05] transition-colors"
                {...handlers}
              >
                <div className="flex items-center gap-2 text-xs">
                  <CosmicStatusOrb status={f.score === 1 ? 'positive' : 'negative'} size="md" />
                  <span className={`font-medium text-[12px] ${f.score === 1 ? 'text-white' : 'text-gray-500'}`}>
                    {f.name}
                  </span>
                </div>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-white/[0.02] rounded-lg p-2 mt-1 text-gray-500 text-[12px] leading-relaxed"
                  >
                    {f.reasoning}
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </CosmicGlassCard>
  );
}
