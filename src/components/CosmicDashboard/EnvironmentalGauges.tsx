import { motion } from 'framer-motion';
import type { EnvironmentalEnergy } from '@/types/cosmic';
import CosmicInfoTooltip from './shared/CosmicInfoTooltip';
import { COSMIC_TOOLTIPS } from './config/cosmicTooltips';

interface Props { env: EnvironmentalEnergy }

function KIndexMeter({ value }: { value: number }) {
  const color = value <= 2 ? '#10B981' : value <= 4 ? '#F59E0B' : '#EF4444';
  const max = 9;
  const arcLength = 125.6; // approximate half-circle arc
  const filled = (value / max) * arcLength;

  return (
    <div className="flex flex-col items-center">
      <svg width="90" height="55" viewBox="0 0 90 55">
        <path d="M 5 50 A 40 40 0 0 1 85 50" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" strokeLinecap="round" />
        <motion.path
          d="M 5 50 A 40 40 0 0 1 85 50"
          fill="none" stroke={color} strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${arcLength}`}
          initial={{ strokeDasharray: `0 ${arcLength}` }}
          animate={{ strokeDasharray: `${filled} ${arcLength}` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
        <text x={45} y={42} textAnchor="middle" fontSize="18" fontWeight="900" fill={color}>{value}</text>
        <text x={45} y={52} textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.3)">K-INDEX</text>
      </svg>
    </div>
  );
}

export default function EnvironmentalGauges({ env }: Props) {
  const sc = {
    green: { text: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', dot: 'bg-emerald-400' },
    amber: { text: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30', dot: 'bg-amber-400' },
    red:   { text: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30', dot: 'bg-red-400' },
  }[env.overallStatus] ?? { text: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', dot: 'bg-emerald-400' };

  const schumannColor = env.schumannResonance === 'normal' ? '#10B981' : env.schumannResonance === 'elevated' ? '#F59E0B' : '#EF4444';

  return (
    <div className="rounded-2xl border border-gray-700/50 bg-gradient-to-b from-gray-900 to-gray-950 p-5">
      <p className="text-xs text-gray-500 uppercase tracking-widest mb-4 font-medium">Environmental Energy</p>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex flex-col items-center gap-1">
          <KIndexMeter value={env.kIndex} />
          <CosmicInfoTooltip label="About K-Index">
            <p>{COSMIC_TOOLTIPS.kIndex.text}</p>
          </CosmicInfoTooltip>
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-gray-400 text-xs">Schumann</span>
              <CosmicInfoTooltip label="About Schumann resonance">
                <p>{COSMIC_TOOLTIPS.schumann.text}</p>
              </CosmicInfoTooltip>
            </div>
            <span className="font-semibold text-xs px-2 py-0.5 rounded-full border"
              style={{ color: schumannColor, borderColor: schumannColor + '40', background: schumannColor + '15' }}>
              {env.schumannResonance.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-gray-400 text-xs">Solar Flare</span>
              <CosmicInfoTooltip label="About solar flares">
                <p>{COSMIC_TOOLTIPS.solarFlare.text}</p>
              </CosmicInfoTooltip>
            </div>
            <span className={`font-semibold text-xs ${env.solarFlareActive ? 'text-red-400' : 'text-emerald-400'}`}>
              {env.solarFlareActive ? `⚡ ${env.solarFlareClass ?? 'Active'}` : '✓ Quiet'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-xs">Geomagnetic</span>
            <span className="text-gray-300 text-xs font-medium capitalize">{env.kIndexLevel}</span>
          </div>
        </div>
      </div>

      <div className={`flex items-center gap-2 rounded-xl px-3 py-2 border ${sc.bg} ${sc.border}`}>
        <motion.span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${sc.dot}`}
          animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
        <span className={`text-xs font-bold uppercase ${sc.text}`}>
          {env.overallStatus === 'green' ? 'Favorable Conditions' : env.overallStatus === 'amber' ? 'Moderate Interference' : 'High Interference'}
        </span>
      </div>

      {env.tradingImpact && (
        <p className="text-gray-500 text-[11px] mt-2 leading-relaxed">{env.tradingImpact}</p>
      )}
    </div>
  );
}
