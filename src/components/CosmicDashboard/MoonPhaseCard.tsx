import { motion } from 'framer-motion';
import type { MoonPhase, VOCStatus } from '@/types/cosmic';

interface Props { moonPhase: MoonPhase; vocStatus: VOCStatus }

export default function MoonPhaseCard({ moonPhase, vocStatus }: Props) {
  const illum = moonPhase.illumination;
  const pct = Math.round(illum * 100);
  const cx = 80, cy = 80, r = 55;
  const angle = Math.acos(Math.abs(2 * illum - 1));
  const rx = r * Math.sin(angle);

  return (
    <div className="rounded-2xl border border-gray-700/50 bg-gradient-to-b from-gray-900 to-gray-950 p-5 flex flex-col items-center">
      <p className="text-xs text-gray-500 uppercase tracking-widest mb-3 font-medium">Moon Phase</p>

      <svg width="160" height="160" viewBox="0 0 160 160">
        <defs>
          <radialGradient id="moon-glow-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(200,200,220,0.8)" />
            <stop offset="100%" stopColor="rgba(100,100,140,0.1)" />
          </radialGradient>
          <clipPath id="moon-clip-inner">
            <circle cx={cx} cy={cy} r={r} />
          </clipPath>
        </defs>

        <circle cx={cx} cy={cy} r={r + 8} fill="rgba(200,200,240,0.03)" />
        <circle cx={cx} cy={cy} r={r} fill="rgba(15,15,30,0.95)" />

        <g clipPath="url(#moon-clip-inner)">
          <rect
            x={moonPhase.isWaxing ? cx : cx - r}
            y={cy - r} width={r} height={r * 2}
            fill="url(#moon-glow-grad)" />
          <ellipse
            cx={cx} cy={cy} rx={rx} ry={r}
            fill={illum < 0.5
              ? (moonPhase.isWaxing ? 'rgba(15,15,30,0.95)' : 'url(#moon-glow-grad)')
              : (moonPhase.isWaxing ? 'url(#moon-glow-grad)' : 'rgba(15,15,30,0.95)')} />
        </g>

        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(200,200,240,0.15)" strokeWidth="1" />

        {/* Illumination arc ring */}
        <circle cx={cx} cy={cy} r={r + 12} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
        <circle
          cx={cx} cy={cy} r={r + 12}
          fill="none" stroke="rgba(200,200,240,0.3)" strokeWidth="6"
          strokeDasharray={`${pct * 0.01 * 2 * Math.PI * (r + 12)} ${2 * Math.PI * (r + 12)}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />

        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="24">
          {moonPhase.emoji}
        </text>
      </svg>

      <p className="text-white font-semibold text-sm mt-1">{moonPhase.name}</p>
      <p className="text-gray-400 text-xs">{pct}% · {moonPhase.isWaxing ? 'Waxing' : 'Waning'}</p>

      <motion.div
        className={`mt-3 px-3 py-1.5 rounded-full border text-xs font-medium ${
          vocStatus.isVoid
            ? 'border-red-500/40 bg-red-500/10 text-red-300'
            : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
        }`}
        animate={vocStatus.isVoid ? { scale: [1, 1.03, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {vocStatus.isVoid ? '⚠ VOC Active' : '✓ VOC Clear'}
      </motion.div>
    </div>
  );
}
