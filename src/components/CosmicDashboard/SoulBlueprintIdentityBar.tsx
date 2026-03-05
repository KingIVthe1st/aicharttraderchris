import { motion } from 'framer-motion';
import type { SoulBlueprint } from '@/types/cosmic';
import CosmicInfoTooltip from './shared/CosmicInfoTooltip';
import CosmicGlassCard from './shared/CosmicGlassCard';
import CosmicDataRow from './shared/CosmicDataRow';
import CosmicConstellationBg from './shared/CosmicConstellationBg';
import { COSMIC_TOOLTIPS } from './config/cosmicTooltips';

interface Props {
  blueprint: SoulBlueprint;
  personalDay: number;
  isAlignmentDay: boolean;
}

const LIFE_PATH_ARCHETYPES: Record<number, string> = {
  1: 'The Leader', 2: 'The Diplomat', 3: 'The Creative', 4: 'The Builder',
  5: 'The Freedom Seeker', 6: 'The Nurturer', 7: 'The Seeker', 8: 'The Achiever',
  9: 'The Humanitarian', 11: 'The Visionary', 22: 'The Master Builder', 33: 'The Teacher',
};

const ZODIAC_GLYPHS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍',
  Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

const CHINESE_EMOJIS: Record<string, string> = {
  Rat: '🐀', Ox: '🐂', Tiger: '🐅', Rabbit: '🐇', Dragon: '🐉', Snake: '🐍',
  Horse: '🐎', Goat: '🐐', Monkey: '🐒', Rooster: '🐓', Dog: '🐕', Pig: '🐖',
};

export default function SoulBlueprintIdentityBar({ blueprint, personalDay, isAlignmentDay }: Props) {
  let alignmentNums: number[] = [];
  try { alignmentNums = JSON.parse(blueprint.alignmentNumbers || '[]'); } catch { alignmentNums = []; }

  const archetype = LIFE_PATH_ARCHETYPES[blueprint.lifePath] ?? '';
  const sunGlyph = ZODIAC_GLYPHS[blueprint.sunSign] ?? '⭐';
  const moonGlyph = ZODIAC_GLYPHS[blueprint.moonSign] ?? '🌙';
  const risingGlyph = ZODIAC_GLYPHS[blueprint.risingSign] ?? '↑';
  const chineseEmoji = CHINESE_EMOJIS[blueprint.chineseAnimal] ?? '🐾';

  const constellationItems = [
    { label: 'Sun', glyph: sunGlyph, sign: blueprint.sunSign, tooltipKey: 'sunSign' as const },
    { label: 'Moon', glyph: moonGlyph, sign: blueprint.moonSign, tooltipKey: 'moonSign' as const },
    { label: 'Rising', glyph: risingGlyph, sign: blueprint.risingSign, tooltipKey: 'risingSign' as const },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <CosmicGlassCard variant="elevated" accentColor="nebula" glowIntensity="medium" noPadding>
        <div className="relative overflow-hidden rounded-2xl">
          {/* Constellation background */}
          <CosmicConstellationBg density="sparse" />

          {/* Main content */}
          <div className="relative z-10 flex flex-col lg:flex-row gap-6 items-center p-6">

            {/* LEFT: Life Path Hero */}
            <div className="flex flex-col items-center lg:items-start flex-shrink-0">
              <div className="flex items-center gap-1 mb-1">
                <span className="text-[10px] uppercase tracking-widest text-gray-500">Life Path</span>
                <CosmicInfoTooltip label="About life path number">
                  <p>{COSMIC_TOOLTIPS.lifePathNumber.text}</p>
                </CosmicInfoTooltip>
              </div>
              <motion.span
                className="text-7xl lg:text-8xl font-black font-mono leading-none bg-gradient-to-r from-[#6D5BFF] to-[#2EC5FF] bg-clip-text text-transparent"
                animate={{ textShadow: ['0 0 0px rgba(109,91,255,0)', '0 0 20px rgba(109,91,255,0.3)', '0 0 0px rgba(109,91,255,0)'] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{ filter: 'drop-shadow(0 0 6px rgba(109,91,255,0.15))' }}
              >
                {blueprint.lifePath}
              </motion.span>
              <span className="text-xs uppercase tracking-widest text-nebula-400 font-semibold mt-2">
                {archetype}
              </span>
              <span className="text-gray-400 text-sm mt-1">{blueprint.fullName}</span>
            </div>

            {/* CENTER: Identity Constellation */}
            <div className="flex-1 flex justify-center">
              <div className="relative" style={{ width: 200, height: 160 }}>
                {/* SVG connecting lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 200 160">
                  <defs>
                    <filter id="lineGlow">
                      <feGaussianBlur stdDeviation="2" result="blur" />
                      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                    <linearGradient id="sunToMoonLine" x1="100" y1="40" x2="40" y2="120" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="rgba(246,196,83,0.2)" />
                      <stop offset="100%" stopColor="rgba(148,163,184,0.18)" />
                    </linearGradient>
                    <linearGradient id="sunToRisingLine" x1="100" y1="40" x2="160" y2="120" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="rgba(246,196,83,0.2)" />
                      <stop offset="100%" stopColor="rgba(129,140,248,0.18)" />
                    </linearGradient>
                    <linearGradient id="moonToRisingLine" x1="40" y1="120" x2="160" y2="120" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="rgba(148,163,184,0.18)" />
                      <stop offset="100%" stopColor="rgba(129,140,248,0.18)" />
                    </linearGradient>
                  </defs>
                  {/* Sun (top center) to Moon (bottom-left) */}
                  <line x1="100" y1="40" x2="40" y2="120" stroke="url(#sunToMoonLine)" strokeWidth="1.5" filter="url(#lineGlow)" />
                  {/* Sun (top center) to Rising (bottom-right) */}
                  <line x1="100" y1="40" x2="160" y2="120" stroke="url(#sunToRisingLine)" strokeWidth="1.5" filter="url(#lineGlow)" />
                  {/* Moon (bottom-left) to Rising (bottom-right) */}
                  <line x1="40" y1="120" x2="160" y2="120" stroke="url(#moonToRisingLine)" strokeWidth="1.5" filter="url(#lineGlow)" />
                </svg>

                {/* Sun - top center */}
                <div className="absolute group" style={{ left: '50%', top: 0, transform: 'translateX(-50%)' }}>
                  <CosmicInfoTooltip label="About sun sign">
                    <p>{COSMIC_TOOLTIPS.sunSign.text}</p>
                  </CosmicInfoTooltip>
                  <div
                    className="w-16 h-16 lg:w-20 lg:h-20 bg-white/5 border border-white/10 rounded-full flex flex-col items-center justify-center transition-shadow duration-300"
                    style={{ boxShadow: '0 0 8px rgba(246,196,83,0.15)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 0 16px rgba(246,196,83,0.35)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 0 8px rgba(246,196,83,0.15)'; }}
                  >
                    <span className="text-2xl lg:text-3xl leading-none">{sunGlyph}</span>
                    <span className="text-[9px] lg:text-[10px] text-gray-400 mt-0.5">{constellationItems[0].sign}</span>
                  </div>
                </div>

                {/* Moon - bottom-left */}
                <div className="absolute group" style={{ left: 0, bottom: 0 }}>
                  <CosmicInfoTooltip label="About moon sign">
                    <p>{COSMIC_TOOLTIPS.moonSign.text}</p>
                  </CosmicInfoTooltip>
                  <div
                    className="w-16 h-16 lg:w-20 lg:h-20 bg-white/5 border border-white/10 rounded-full flex flex-col items-center justify-center transition-shadow duration-300"
                    style={{ boxShadow: '0 0 8px rgba(148,163,184,0.15)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 0 16px rgba(148,163,184,0.35)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 0 8px rgba(148,163,184,0.15)'; }}
                  >
                    <span className="text-2xl lg:text-3xl leading-none">{moonGlyph}</span>
                    <span className="text-[9px] lg:text-[10px] text-gray-400 mt-0.5">{constellationItems[1].sign}</span>
                  </div>
                </div>

                {/* Rising - bottom-right */}
                <div className="absolute group" style={{ right: 0, bottom: 0 }}>
                  <CosmicInfoTooltip label="About rising sign">
                    <p>{COSMIC_TOOLTIPS.risingSign.text}</p>
                  </CosmicInfoTooltip>
                  <div
                    className="w-16 h-16 lg:w-20 lg:h-20 bg-white/5 border border-white/10 rounded-full flex flex-col items-center justify-center transition-shadow duration-300"
                    style={{ boxShadow: '0 0 8px rgba(129,140,248,0.15)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 0 16px rgba(129,140,248,0.35)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 0 8px rgba(129,140,248,0.15)'; }}
                  >
                    <span className="text-2xl lg:text-3xl leading-none">{risingGlyph}</span>
                    <span className="text-[9px] lg:text-[10px] text-gray-400 mt-0.5">{constellationItems[2].sign}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Cosmic Metadata */}
            <div className="flex flex-col gap-0 min-w-[180px]">
              <CosmicDataRow
                icon={chineseEmoji}
                label="Chinese Zodiac"
                value={`${blueprint.chineseAnimal}`}
                sublabel={blueprint.chineseElement}
                noBorder={false}
              />
              <CosmicDataRow
                icon="🪐"
                label="Planetary Ruler"
                value={blueprint.planetaryRuler}
                noBorder={false}
              />
              {blueprint.nakshatra && (
                <CosmicDataRow
                  icon="✨"
                  label="Nakshatra"
                  value={blueprint.nakshatra}
                  noBorder
                />
              )}
              {/* Tooltips for metadata section */}
              <div className="flex items-center gap-2 mt-1">
                <CosmicInfoTooltip label="About planetary ruler">
                  <p>{COSMIC_TOOLTIPS.planetaryRuler.text}</p>
                </CosmicInfoTooltip>
                {blueprint.nakshatra && (
                  <CosmicInfoTooltip label="About nakshatra">
                    <p>{COSMIC_TOOLTIPS.nakshatra.text}</p>
                  </CosmicInfoTooltip>
                )}
              </div>
            </div>
          </div>

          {/* BOTTOM: Alignment Strip */}
          {alignmentNums.length > 0 && (
            <div
              className={`relative z-10 px-6 pb-5 ${
                isAlignmentDay ? 'border-t border-[#F6C453]/20' : ''
              }`}
            >
              <div className="relative flex gap-2 justify-center pt-4 items-center">
                {/* Subtle connecting track behind numbers */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 h-px w-[calc(100%-3rem)] bg-gradient-to-r from-transparent via-white/10 to-transparent" style={{ marginTop: '8px' }} />
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
                  const isPersonalDay = n === personalDay;
                  return (
                    <motion.span
                      key={n}
                      animate={isPersonalDay ? { scale: [1, 1.12, 1] } : {}}
                      transition={isPersonalDay ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : {}}
                      className={`relative z-10 inline-flex items-center justify-center rounded-full text-sm font-bold border transition-all ${
                        isPersonalDay
                          ? 'w-9 h-9 bg-[#F6C453]/20 border-[#F6C453]/50 text-[#F6C453]'
                          : 'w-8 h-8 bg-white/5 border-white/10 text-gray-500'
                      }`}
                      style={isPersonalDay ? { boxShadow: '0 0 12px rgba(246,196,83,0.4), 0 0 24px rgba(246,196,83,0.15)' } : undefined}
                    >
                      {n}
                    </motion.span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </CosmicGlassCard>
    </motion.div>
  );
}
