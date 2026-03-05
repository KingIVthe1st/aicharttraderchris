import { motion } from 'framer-motion';
import type { NumerologyProfile } from '@/types/cosmic';

interface Props { numerology: NumerologyProfile }

function MicroDial({ label, value, color }: { label: string; value: number; color: string }) {
  const radius = 28, strokeWidth = 5;
  const circumference = 2 * Math.PI * radius;
  const filled = (value / 9) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="70" height="70" viewBox="0 0 70 70">
        <circle cx={35} cy={35} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={strokeWidth} />
        <motion.circle
          cx={35} cy={35} r={radius}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          transform="rotate(-90 35 35)"
          initial={{ strokeDasharray: `0 ${circumference}` }}
          animate={{ strokeDasharray: `${filled} ${circumference}` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ transformOrigin: '35px 35px' }}
        />
        <text x={35} y={32} textAnchor="middle" dominantBaseline="middle" fontSize="16" fontWeight="900" fill={color}>{value}</text>
        <text x={35} y={46} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.35)">{label}</text>
      </svg>
    </div>
  );
}

export default function NumerologyHarmonics({ numerology }: Props) {
  const { personalDay, universalDay, personalYear, personalMonth, isAlignmentDay } = numerology;

  return (
    <div className={`rounded-2xl border p-5 bg-gradient-to-b from-gray-900 to-gray-950 ${
      isAlignmentDay ? 'border-yellow-500/50' : 'border-gray-700/50'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-gray-500 uppercase tracking-widest font-medium">Numerology Harmonics</p>
        {isAlignmentDay && (
          <motion.span
            className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 font-bold"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ✦ Alignment Day
          </motion.span>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2">
        <MicroDial label="Personal" value={personalDay} color={isAlignmentDay ? '#FFD97A' : '#8B7AFF'} />
        <MicroDial label="Universal" value={universalDay} color="#5DD8FF" />
        <MicroDial label="Year" value={personalYear} color="#A855F7" />
        <MicroDial label="Month" value={personalMonth} color="#22C55E" />
      </div>

      {isAlignmentDay && (
        <p className="mt-3 text-center text-xs text-yellow-400/80">
          Personal day {personalDay} resonates with your alignment numbers
        </p>
      )}
    </div>
  );
}
