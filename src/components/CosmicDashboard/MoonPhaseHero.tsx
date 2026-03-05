import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { MoonPhase, VOCStatus } from '@/types/cosmic';
import CosmicInfoTooltip from './shared/CosmicInfoTooltip';
import CosmicGlassCard from './shared/CosmicGlassCard';
import { COSMIC_TOOLTIPS } from './config/cosmicTooltips';
import { useAnimationFrame } from './hooks/useAnimationFrame';

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

  useAnimationFrame(useCallback((elapsed: number) => {
    setHaloAngle((elapsed / 50) * 0.3 % 360);
  }, []));

  const illum = moonPhase.illumination ?? 0;
  const signColor = SIGN_COLORS[moonSign] || '#8B7AFF';
  const signGlyph = SIGN_GLYPHS[moonSign] || '☽';

  // SVG moon disc geometry — 280×280 viewBox, radius 100
  const cx = 140, cy = 140, r = 100;
  const angle = Math.acos(Math.abs(2 * illum - 1));
  const rx = r * Math.abs(Math.cos(angle));

  const clipId = 'moonHeroClip';

  // Illumination arc (outer ring)
  const arcR = 120;
  const arcCircumference = 2 * Math.PI * arcR;
  const arcFill = illum * arcCircumference;

  return (
    <CosmicGlassCard variant="elevated" accentColor="indigo" glowIntensity="medium">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
      >
        <div className="flex flex-col items-center">
          <p className="text-indigo-300 text-[10px] uppercase tracking-widest mb-3 font-bold">Lunar Observatory</p>

          {/* Large moon SVG — 280×280 viewBox */}
          <div className="relative">
            <svg viewBox="0 0 280 280" className="w-56 h-56">
              <defs>
                <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#e2e8f0" stopOpacity="1" />
                  <stop offset="70%" stopColor="#94a3b8" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#334155" stopOpacity="0.5" />
                </radialGradient>

                {/* Outer indigo halo glow */}
                <radialGradient id="outerHaloGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="60%" stopColor="rgba(99,102,241,0.15)" />
                  <stop offset="100%" stopColor="rgba(99,102,241,0)" />
                </radialGradient>

                {/* Soft terminator gradient overlay — feathers light/dark edge */}
                <linearGradient id="terminatorFeather" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#0f172a" stopOpacity="0" />
                  <stop offset="42%" stopColor="#0f172a" stopOpacity="0" />
                  <stop offset="50%" stopColor="#0f172a" stopOpacity="0.3" />
                  <stop offset="58%" stopColor="#0f172a" stopOpacity="0.7" />
                  <stop offset="65%" stopColor="#0f172a" stopOpacity="0" />
                  <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
                </linearGradient>

                {/* VOC red vignette gradient */}
                <radialGradient id="vocVignette" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(239,68,68,0)" />
                  <stop offset="100%" stopColor="rgba(239,68,68,0.12)" />
                </radialGradient>

                <clipPath id={clipId}>
                  {illum >= 0.5 ? (
                    <path d={`M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r} A ${rx} ${r} 0 0 ${illum > 0.75 ? 0 : 1} ${cx} ${cy - r}`} />
                  ) : (
                    <path d={`M ${cx} ${cy - r} A ${r} ${r} 0 0 0 ${cx} ${cy + r} A ${rx} ${r} 0 0 ${illum > 0.25 ? 0 : 1} ${cx} ${cy - r}`} />
                  )}
                </clipPath>

                <clipPath id="moonDiscClip">
                  <circle cx={cx} cy={cy} r={r} />
                </clipPath>

                <filter id="moonGlowFilter">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>

              {/* Outer glow halo — atmospheric circle beyond moon */}
              <circle cx={cx} cy={cy} r={r + 30} fill="url(#outerHaloGlow)" />

              {/* Rotating dashed halo ring */}
              <circle cx={cx} cy={cy} r={arcR + 8} fill="none" stroke={signColor} strokeWidth="1" strokeOpacity="0.25"
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

              {/* Soft terminator overlay — feathers the light/dark edge */}
              <g clipPath="url(#moonDiscClip)">
                <rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} fill="url(#terminatorFeather)" />
              </g>

              {/* VOC red vignette overlay */}
              {vocStatus.isVoid && (
                <circle cx={cx} cy={cy} r={r} fill="url(#vocVignette)" />
              )}

              {/* Moon emoji center */}
              <text x={cx} y={cy + 8} textAnchor="middle" fontSize="32">{moonPhase.emoji}</text>
            </svg>

            {/* Moon sign badge — glass pill */}
            <motion.div
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 whitespace-nowrap"
              animate={{ boxShadow: [`0 0 8px ${signColor}40`, `0 0 16px ${signColor}60`, `0 0 8px ${signColor}40`] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-sm" style={{ color: signColor }}>{signGlyph}</span>
              <span className="text-xs font-bold text-white/90">Moon in {moonSign}</span>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: signColor }} />
              <CosmicInfoTooltip label="About moon sign">
                <p>{COSMIC_TOOLTIPS.moonSignBadge.text}</p>
              </CosmicInfoTooltip>
            </motion.div>
          </div>

          {/* Illumination display — large tabular nums */}
          <div className="flex items-baseline justify-center gap-0.5 mt-5">
            <span className="text-5xl font-mono font-black tabular-nums text-white">
              {Math.round(illum * 100)}
            </span>
            <span className="text-xl font-mono font-black text-white/70 -translate-y-3">%</span>
            <CosmicInfoTooltip label="About illumination">
              <p>{COSMIC_TOOLTIPS.illumination.text}</p>
            </CosmicInfoTooltip>
          </div>
          <p className="text-indigo-300/60 text-[10px] uppercase tracking-widest font-medium -mt-1">illuminated</p>

          {/* Phase name — gradient text */}
          <div className="mt-3 text-center space-y-1">
            <div className="flex items-center justify-center gap-1">
              <p className="bg-gradient-to-r from-[#2EC5FF] to-[#6D5BFF] bg-clip-text text-transparent text-lg font-bold">
                {moonPhase.name}
              </p>
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
    </CosmicGlassCard>
  );
}
