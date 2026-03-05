import { motion } from 'framer-motion';
import type { HoraGridHour } from '@/types/cosmic';
import CosmicGlassCard from './shared/CosmicGlassCard';
import CosmicInfoTooltip from './shared/CosmicInfoTooltip';
import { COSMIC_TOOLTIPS } from './config/cosmicTooltips';
import { useInteractiveSelection } from './hooks/useInteractiveSelection';

interface Props { hours: HoraGridHour[] }

const NODE_COLORS: Record<string, string> = {
  ULTRA_ALIGNED: '#F59E0B', HIGH_PRESSURE: '#22C55E', SOUL_WINDOW: '#3B82F6',
  MIXED: '#EAB308', CONFLICT: '#EF4444', DISRUPTION: '#A855F7', U_NODE: '#6B7280',
};

const PLANET_GLYPHS: Record<string, string> = {
  Sun: '\u2609', Moon: '\u263D', Mars: '\u2642', Mercury: '\u263F',
  Jupiter: '\u2643', Venus: '\u2640', Saturn: '\u2644',
};

const ANIMAL_EMOJIS: Record<string, string> = {
  Rat: '\uD83D\uDC00', Ox: '\uD83D\uDC02', Tiger: '\uD83D\uDC05', Rabbit: '\uD83D\uDC07',
  Dragon: '\uD83D\uDC09', Snake: '\uD83D\uDC0D', Horse: '\uD83D\uDC0E', Goat: '\uD83D\uDC10',
  Monkey: '\uD83D\uDC12', Rooster: '\uD83D\uDC13', Dog: '\uD83D\uDC15', Pig: '\uD83D\uDC16',
  Ram: '\uD83D\uDC0F', Sheep: '\uD83D\uDC11',
};

function getAnimalEmoji(animal: string): string {
  return ANIMAL_EMOJIS[animal] ?? animal.slice(0, 2);
}

function isCurrentHour(start: string, end: string): boolean {
  const now = Date.now();
  return now >= new Date(start).getTime() && now < new Date(end).getTime();
}

function isPastHour(end: string): boolean {
  return Date.now() >= new Date(end).getTime();
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
  const { active: hoveredIdx, getHandlers } = useInteractiveSelection<number>();
  const cx = 230, cy = 230;
  const totalHours = hours.length || 24;
  const wedgeDeg = 360 / totalHours;
  const gap = 0.6;

  const currentIdx = hours.findIndex(h => isCurrentHour(h.startTime, h.endTime));
  const hovered = hoveredIdx !== null ? hours[hoveredIdx] : null;

  // Build Chinese animal segments (12 double-width)
  const chineseSegments: { animal: string; startIdx: number }[] = [];
  for (let i = 0; i < totalHours; i += 2) {
    chineseSegments.push({ animal: hours[i]?.chinese.animal ?? '', startIdx: i });
  }

  return (
    <CosmicGlassCard accentColor="nebula">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">&#x1F52D;</span>
        <h3 className="text-white font-bold text-sm uppercase tracking-widest">Temporal Orbit Wheel</h3>
        <CosmicInfoTooltip label="What are the hora rings?" topic={COSMIC_TOOLTIPS.horaRings.topic}>
          {COSMIC_TOOLTIPS.horaRings.text}
        </CosmicInfoTooltip>
      </div>

      <div className="relative w-full max-w-[460px] mx-auto" style={{ aspectRatio: '1' }}>
        <svg viewBox="0 0 460 460" className="w-full h-full"
          style={{ filter: 'drop-shadow(0 0 24px rgba(109,91,255,0.15))' }}>
          <defs>
            <filter id="hora-glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="hora-beam-glow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <radialGradient id="hora-center-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(109,91,255,0.12)" />
              <stop offset="100%" stopColor="rgba(109,91,255,0)" />
            </radialGradient>
            {/* Gradient defs for each node color */}
            {Object.entries(NODE_COLORS).map(([key, color]) => (
              <radialGradient key={`grad-${key}`} id={`hora-grad-${key}`} cx="50%" cy="50%" r="70%">
                <stop offset="0%" stopColor={color} stopOpacity="0.7" />
                <stop offset="100%" stopColor={color} stopOpacity="0.3" />
              </radialGradient>
            ))}
          </defs>

          {/* ── Ring separators (dashed circles) ── */}
          {[175, 155, 140, 120].map(r => (
            <circle key={`sep-${r}`} cx={cx} cy={cy} r={r}
              fill="none" stroke="rgba(255,255,255,0.06)"
              strokeWidth="0.5" strokeDasharray="2 6" />
          ))}

          {/* ── Outer ring: Vedic planetary wedges (200 -> 175) ── */}
          {hours.map((h, i) => {
            const startAngle = i * wedgeDeg + gap / 2;
            const endAngle = (i + 1) * wedgeDeg - gap / 2;
            const gradId = `hora-grad-${h.nodeType}`;
            const isCurrent = i === currentIdx;
            const isHovered = i === hoveredIdx;
            const past = isPastHour(h.endTime) && !isCurrent;
            return (
              <motion.path key={`outer-${i}`}
                d={wedgePath(cx, cy, 175, 200, startAngle, endAngle)}
                fill={`url(#${gradId})`}
                opacity={past ? 0.25 : (isCurrent || isHovered ? 1 : 0.6)}
                filter={isCurrent ? 'url(#hora-glow)' : undefined}
                stroke={isHovered ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.04)'}
                strokeWidth={isHovered ? 1 : 0.3}
                {...getHandlers(i)}
                className="cursor-pointer"
                style={{ outline: 'none' }}
                initial={false}
                animate={{
                  opacity: past ? 0.25 : (isCurrent || isHovered ? 1 : 0.6),
                }}
                transition={{ duration: 0.25 }}
              />
            );
          })}

          {/* ── Outer ring: Planet glyphs at outer edge ── */}
          {hours.map((h, i) => {
            const midAngle = i * wedgeDeg + wedgeDeg / 2;
            const pos = polarToXY(cx, cy, 210, midAngle);
            const isCurrent = i === currentIdx;
            const past = isPastHour(h.endTime) && !isCurrent;
            return (
              <text key={`glyph-${i}`} x={pos.x} y={pos.y}
                textAnchor="middle" dominantBaseline="middle"
                fontSize="10" fontWeight={isCurrent ? '700' : '400'}
                fill="#F6C453"
                opacity={past ? 0.25 : (isCurrent ? 1 : 0.7)}
                style={{ pointerEvents: 'none' }}>
                {PLANET_GLYPHS[h.vedic.planet] ?? h.vedic.planet.slice(0, 2)}
              </text>
            );
          })}

          {/* ── Middle ring: Alignment band (155 -> 140) ── */}
          {hours.map((h, i) => {
            const startAngle = i * wedgeDeg + gap / 2;
            const endAngle = (i + 1) * wedgeDeg - gap / 2;
            const color = NODE_COLORS[h.nodeType] ?? '#6B7280';
            const isCurrent = i === currentIdx;
            const past = isPastHour(h.endTime) && !isCurrent;
            return (
              <path key={`mid-${i}`}
                d={wedgePath(cx, cy, 140, 155, startAngle, endAngle)}
                fill={color} opacity={past ? 0.1 : 0.4}
                stroke="rgba(255,255,255,0.04)" strokeWidth="0.3" />
            );
          })}

          {/* ── Inner ring: Chinese zodiac (120 -> 105), 12 double-width segments ── */}
          {chineseSegments.map((seg, i) => {
            const startAngle = seg.startIdx * wedgeDeg + gap / 2;
            const endAngle = (seg.startIdx + 2) * wedgeDeg - gap / 2;
            return (
              <path key={`chinese-${i}`}
                d={wedgePath(cx, cy, 105, 120, startAngle, endAngle)}
                fill="rgba(255,255,255,0.03)"
                stroke="rgba(255,255,255,0.06)" strokeWidth="0.4" />
            );
          })}

          {/* ── Chinese animal emoji labels ── */}
          {chineseSegments.map((seg, i) => {
            const midAngle = (seg.startIdx + 1) * wedgeDeg;
            const pos = polarToXY(cx, cy, 112.5, midAngle);
            return (
              <text key={`animal-${i}`} x={pos.x} y={pos.y}
                textAnchor="middle" dominantBaseline="middle"
                fontSize="9" fill="rgba(255,255,255,0.6)"
                style={{ pointerEvents: 'none' }}>
                {getAnimalEmoji(seg.animal)}
              </text>
            );
          })}

          {/* ── Center orb (r=85) ── */}
          <circle cx={cx} cy={cy} r={85}
            fill="rgba(4,5,13,0.95)"
            stroke="rgba(109,91,255,0.15)" strokeWidth="1" />
          <circle cx={cx} cy={cy} r={85}
            fill="url(#hora-center-glow)" />

          {/* ── Current hour beam (triangular path) ── */}
          {currentIdx >= 0 && (() => {
            const midAngle = currentIdx * wedgeDeg + wedgeDeg / 2;
            const halfNarrow = 1.5; // ~3px width at center
            const halfWide = 6;    // ~12px width at rim
            const innerR = 87;
            const outerR = 200;
            const pLeft = polarToXY(cx, cy, innerR, midAngle - (halfNarrow * 360) / (2 * Math.PI * innerR));
            const pRight = polarToXY(cx, cy, innerR, midAngle + (halfNarrow * 360) / (2 * Math.PI * innerR));
            const pOutLeft = polarToXY(cx, cy, outerR, midAngle - (halfWide * 360) / (2 * Math.PI * outerR));
            const pOutRight = polarToXY(cx, cy, outerR, midAngle + (halfWide * 360) / (2 * Math.PI * outerR));
            return (
              <motion.path
                d={`M ${pLeft.x} ${pLeft.y} L ${pOutLeft.x} ${pOutLeft.y} L ${pOutRight.x} ${pOutRight.y} L ${pRight.x} ${pRight.y} Z`}
                fill="rgba(255,255,255,0.12)"
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="0.5"
                filter="url(#hora-beam-glow)"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            );
          })()}

          {/* ── Center content ── */}
          {hovered ? (() => {
            const nodeColor = NODE_COLORS[hovered.nodeType] ?? '#6B7280';
            return (
              <>
                <text x={cx} y={cy - 24} textAnchor="middle" fontSize="20" fontWeight="bold" fill="white">
                  {PLANET_GLYPHS[hovered.vedic.planet] ?? hovered.vedic.planet}
                </text>
                <text x={cx} y={cy - 6} textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.7)" fontWeight="600">
                  {hovered.vedic.planet}
                </text>
                <text x={cx} y={cy + 14} textAnchor="middle" fontSize="16">
                  {getAnimalEmoji(hovered.chinese.animal)}
                </text>
                <rect x={cx - 28} y={cy + 24} width="56" height="16" rx="8"
                  fill={nodeColor} opacity="0.2" />
                <text x={cx} y={cy + 35} textAnchor="middle" fontSize="7" fontWeight="bold"
                  fill={nodeColor}>
                  {hovered.nodeType.replace(/_/g, ' ')}
                </text>
              </>
            );
          })() : (
            <>
              <text x={cx} y={cy - 16} textAnchor="middle" fontSize="9" fontWeight="600"
                fill="rgba(255,255,255,0.35)" letterSpacing="2">TEMPORAL</text>
              <text x={cx} y={cy} textAnchor="middle" fontSize="9" fontWeight="600"
                fill="rgba(255,255,255,0.35)" letterSpacing="2">ORBIT</text>
              <text x={cx} y={cy + 16} textAnchor="middle" fontSize="9" fontWeight="600"
                fill="rgba(255,255,255,0.35)" letterSpacing="2">WHEEL</text>
              <text x={cx} y={cy + 36} textAnchor="middle" fontSize="7"
                fill="rgba(255,255,255,0.2)">Tap a segment</text>
            </>
          )}
        </svg>
      </div>

      {/* ── Legend pills ── */}
      <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
        {[
          { label: 'Vedic', color: '#F6C453' },
          { label: 'Alignment', color: '#A855F7' },
          { label: 'Chinese', color: '#22C55E' },
        ].map(l => (
          <span key={l.label}
            className="bg-white/[0.03] border border-white/[0.06] rounded-full px-3 py-1 text-[10px] font-medium tracking-wide"
            style={{ color: l.color }}>
            {l.label}
          </span>
        ))}
      </div>

      {/* ── Detail panel ── */}
      {hovered && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
          className="mt-4 bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 text-sm">
          <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-1.5 font-medium">Trading Guidance</p>
          <p className="text-gray-200 leading-relaxed text-xs">{hovered.tradingGuidance}</p>
          <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-gray-500">
            <span>Vedic: <span className="text-gray-300">{hovered.vedic.planet}</span></span>
            <span>Babylonian: <span className="text-gray-300">{hovered.babylonian.planet}</span></span>
            <span>Egyptian: <span className="text-gray-300">{hovered.egyptian.decanEnergy}</span></span>
            <span>Chinese: <span className="text-gray-300">{hovered.chinese.animal}</span></span>
          </div>
        </motion.div>
      )}
    </CosmicGlassCard>
  );
}
