import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { MoonPhase, VOCStatus } from '@/types/cosmic';
import CosmicInfoTooltip from './shared/CosmicInfoTooltip';
import { COSMIC_TOOLTIPS } from './config/cosmicTooltips';

interface Props {
  moonPhase: MoonPhase;
  vocStatus: VOCStatus;
  moonSign: string;
}

const SIGN_COLORS: Record<string, string> = {
  Aries: '#EF4444', Taurus: '#22C55E', Gemini: '#A78BFA', Cancer: '#60A5FA',
  Leo: '#F6C453', Virgo: '#34D399', Libra: '#6EE7B7', Scorpio: '#DC2626',
  Sagittarius: '#FB923C', Capricorn: '#94A3B8', Aquarius: '#2EC5FF', Pisces: '#818CF8',
};

const SIGN_GLYPHS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍',
  Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

const SIGN_TRADING_HINT: Record<string, string> = {
  Aries: 'Volatile momentum — breakouts favor the bold',
  Taurus: 'Stable accumulation — value entries shine',
  Gemini: 'Whipsaw likely — stay nimble, honor stops',
  Cancer: 'Emotional sentiment — defensive plays lead',
  Leo: 'Confidence surges — trend-following rewards',
  Virgo: 'Analytical edge — data and earnings matter',
  Libra: 'Equilibrium — mean-reversion opportunities',
  Scorpio: 'High intensity — sudden reversals possible',
  Sagittarius: 'Optimism expands — risk assets rise',
  Capricorn: 'Institutional flow — disciplined entries',
  Aquarius: 'Erratic gaps — tech/innovation leads',
  Pisces: 'Foggy conviction — reduce size, wait',
};

export default function MoonPhaseHero({ moonPhase, vocStatus, moonSign }: Props) {
  const [haloAngle, setHaloAngle] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setHaloAngle(a => (a + 0.3) % 360), 50);
    return () => clearInterval(id);
  }, []);

  const illum = moonPhase.illumination ?? 0;
  const signColor = SIGN_COLORS[moonSign] || '#8B7AFF';
  const signGlyph = SIGN_GLYPHS[moonSign] || '☽';

  // SVG moon disc geometry (240×240 viewBox, radius 90)
  const cx = 120, cy = 120, r = 90;
  const angle = Math.acos(Math.abs(2 * illum - 1));
  const rx = r * Math.abs(Math.cos(angle));

  // Illuminate: right half + ellipse (waxing) or left half + ellipse (waning)
  const clipId = 'moonHeroClip';

  // Illumination arc (outer ring)
  const arcR = 108;
  const arcCircumference = 2 * Math.PI * arcR;
  const arcFill = illum * arcCircumference;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7 }}
      className="rounded-2xl border border-indigo-500/25 bg-gradient-to-br from-indigo-950/90 via-cosmic-900/95 to-slate-950/90 overflow-hidden"
    >
      <div className="p-5 flex flex-col items-center">
        <p className="text-indigo-300 text-[10px] uppercase tracking-widest mb-3 font-bold">Moon Phase</p>

        {/* Large moon SVG */}
        <div className="relative">
          <svg viewBox="0 0 240 240" className="w-52 h-52">
            <defs>
              <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#e2e8f0" stopOpacity="1" />
                <stop offset="70%" stopColor="#94a3b8" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#334155" stopOpacity="0.5" />
              </radialGradient>
              <clipPath id={clipId}>
                {illum >= 0.5 ? (
                  <path d={`M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r} A ${rx} ${r} 0 0 ${illum > 0.75 ? 0 : 1} ${cx} ${cy - r}`} />
                ) : (
                  <path d={`M ${cx} ${cy - r} A ${r} ${r} 0 0 0 ${cx} ${cy + r} A ${rx} ${r} 0 0 ${illum > 0.25 ? 0 : 1} ${cx} ${cy - r}`} />
                )}
              </clipPath>
              <filter id="moonGlowFilter">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* Outer glow halo — rotating */}
            <circle cx={cx} cy={cy} r="108" fill="none" stroke={signColor} strokeWidth="1" strokeOpacity="0.25"
              strokeDasharray="4 8"
              style={{ transformOrigin: `${cx}px ${cy}px`, transform: `rotate(${haloAngle}deg)` }}
            />

            {/* Illumination arc ring */}
            <circle cx={cx} cy={cy} r={arcR} fill="none" stroke="#1e293b" strokeWidth="6" />
            <circle cx={cx} cy={cy} r={arcR} fill="none" stroke={signColor} strokeWidth="4"
              strokeDasharray={`${arcFill} ${arcCircumference}`}
              strokeLinecap="round"
              style={{ transformOrigin: `${cx}px ${cy}px`, transform: 'rotate(-90deg)' }}
              strokeOpacity="0.8"
            />

            {/* Dark moon base */}
            <circle cx={cx} cy={cy} r={r} fill="#0f172a" />

            {/* Illuminated portion */}
            <g clipPath={`url(#${clipId})`}>
              <circle cx={cx} cy={cy} r={r} fill="url(#moonGlow)" filter="url(#moonGlowFilter)" />
            </g>

            {/* Moon emoji center */}
            <text x={cx} y={cy + 8} textAnchor="middle" fontSize="32">{moonPhase.emoji}</text>

            {/* Illumination % */}
            <text x={cx} y={cy + 34} textAnchor="middle" fill={signColor} fontSize="11" fontWeight="bold" fontFamily="monospace">
              {Math.round(illum * 100)}%
            </text>
          </svg>

          {/* Moon sign badge */}
          <motion.div
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-bold whitespace-nowrap"
            style={{ borderColor: signColor + '60', background: signColor + '20', color: signColor }}
            animate={{ boxShadow: [`0 0 8px ${signColor}40`, `0 0 16px ${signColor}60`, `0 0 8px ${signColor}40`] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span>{signGlyph}</span>
            <span>Moon in {moonSign}</span>
            <CosmicInfoTooltip label="About moon sign">
              <p>{COSMIC_TOOLTIPS.moonSignBadge.text}</p>
            </CosmicInfoTooltip>
          </motion.div>
        </div>

        {/* Illumination label with tooltip */}
        <div className="flex items-center justify-center gap-1 mt-2">
          <span className="text-xs font-bold" style={{ color: signColor, fontFamily: 'monospace' }}>{Math.round(illum * 100)}% illuminated</span>
          <CosmicInfoTooltip label="About illumination">
            <p>{COSMIC_TOOLTIPS.illumination.text}</p>
          </CosmicInfoTooltip>
        </div>

        {/* Phase info */}
        <div className="mt-3 text-center space-y-1">
          <div className="flex items-center justify-center gap-1">
            <p className="text-white font-bold text-base">{moonPhase.name}</p>
            <CosmicInfoTooltip label="About moon phase">
              <p>{COSMIC_TOOLTIPS.phaseName.text}</p>
            </CosmicInfoTooltip>
          </div>
          <div className="flex items-center justify-center gap-1">
            <p className="text-gray-400 text-[11px]">{moonPhase.isWaxing ? '↑ Waxing' : '↓ Waning'} · Day {Math.round(moonPhase.daysIntoCycle || 0)}</p>
            <CosmicInfoTooltip label="About waxing and waning">
              <p>{COSMIC_TOOLTIPS.waxingWaning.text}</p>
            </CosmicInfoTooltip>
          </div>
          <p className="text-gray-300 text-[11px] italic mt-2 px-2">{SIGN_TRADING_HINT[moonSign] || ''}</p>
        </div>

        {/* VOC Status */}
        {vocStatus.isVoid ? (
          <motion.div
            className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/40 bg-red-500/15"
            animate={{ opacity: [1, 0.7, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
          >
            <span className="w-2 h-2 rounded-full bg-red-400" />
            <span className="text-red-300 text-[10px] font-bold uppercase">Void of Course</span>
            <CosmicInfoTooltip label="About void of course">
              <p>{COSMIC_TOOLTIPS.vocStatus.text}</p>
            </CosmicInfoTooltip>
          </motion.div>
        ) : (
          <div className="mt-3 flex items-center gap-1.5 px-3 py-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-emerald-300 text-[10px]">Moon Clear</span>
            <CosmicInfoTooltip label="About void of course">
              <p>{COSMIC_TOOLTIPS.vocStatus.text}</p>
            </CosmicInfoTooltip>
          </div>
        )}
      </div>
    </motion.div>
  );
}
