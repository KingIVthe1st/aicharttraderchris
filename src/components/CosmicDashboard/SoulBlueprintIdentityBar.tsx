import { motion } from 'framer-motion';
import type { SoulBlueprint } from '@/types/cosmic';
import CosmicInfoTooltip from './shared/CosmicInfoTooltip';
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

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative rounded-2xl overflow-hidden border border-nebula-500/30 bg-gradient-to-r from-cosmic-900 via-cosmic-800 to-cosmic-900"
      style={{ boxShadow: '0 0 40px rgba(109,91,255,0.15), inset 0 1px 0 rgba(255,255,255,0.05)' }}
    >
      {/* Animated cosmic border glow */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none">
        <div className="absolute inset-0 rounded-2xl border border-nebula-500/20 animate-pulse-slow" />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-4 px-6 py-4">
        {/* LEFT: Life path + archetype */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="text-center">
            <span
              className="text-6xl font-black leading-none"
              style={{ background: 'linear-gradient(135deg, #8B7AFF, #5DD8FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              {blueprint.lifePath}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <p className="text-xs text-nebula-400 uppercase tracking-widest font-medium">Life Path</p>
              <CosmicInfoTooltip label="About life path number">
                <p>{COSMIC_TOOLTIPS.lifePathNumber.text}</p>
              </CosmicInfoTooltip>
            </div>
            <p className="text-white font-semibold text-sm">{archetype}</p>
            <p className="text-gray-500 text-xs">{blueprint.fullName}</p>
          </div>
        </div>

        {/* CENTER: Sun / Moon / Rising badges */}
        <div className="flex items-center gap-2">
          {[
            { label: 'Sun', glyph: sunGlyph, sign: blueprint.sunSign, color: 'solar', tooltipKey: 'sunSign' as const },
            { label: 'Moon', glyph: moonGlyph, sign: blueprint.moonSign, color: 'aurora', tooltipKey: 'moonSign' as const },
            { label: 'Rising', glyph: risingGlyph, sign: blueprint.risingSign, color: 'nebula', tooltipKey: 'risingSign' as const },
          ].map(({ label, glyph, sign, color, tooltipKey }) => (
            <div
              key={label}
              className={`flex flex-col items-center px-3 py-2 rounded-xl border ${
                color === 'solar' ? 'border-solar-500/30 bg-solar-500/10' :
                color === 'aurora' ? 'border-aurora-500/30 bg-aurora-500/10' :
                'border-nebula-500/30 bg-nebula-500/10'
              }`}
            >
              <span className="text-xl leading-none">{glyph}</span>
              <div className="flex items-center gap-1 mt-0.5">
                <span className={`text-xs font-bold ${
                  color === 'solar' ? 'text-solar-400' :
                  color === 'aurora' ? 'text-aurora-400' :
                  'text-nebula-400'
                }`}>{label}</span>
                <CosmicInfoTooltip label={`About ${label.toLowerCase()} sign`}>
                  <p>{COSMIC_TOOLTIPS[tooltipKey].text}</p>
                </CosmicInfoTooltip>
              </div>
              <span className="text-white text-[11px] font-medium">{sign}</span>
            </div>
          ))}
        </div>

        {/* RIGHT: Chinese zodiac + element + planetary ruler + nakshatra */}
        <div className="flex items-center gap-3 text-sm flex-shrink-0">
          <div className="flex flex-col items-center px-3 py-2 rounded-xl border border-amber-500/30 bg-amber-500/10">
            <span className="text-xl">{chineseEmoji}</span>
            <span className="text-amber-400 text-xs font-bold mt-0.5">{blueprint.chineseAnimal}</span>
            <span className="text-amber-300/70 text-[11px]">{blueprint.chineseElement}</span>
          </div>
          <div className="flex flex-col gap-1">
            <div className="px-2 py-1 rounded-lg border border-purple-500/20 bg-purple-500/10">
              <div className="flex items-center gap-1">
                <span className="text-purple-400 text-xs">Ruler </span>
                <span className="text-white text-xs font-semibold">{blueprint.planetaryRuler}</span>
                <CosmicInfoTooltip label="About planetary ruler">
                  <p>{COSMIC_TOOLTIPS.planetaryRuler.text}</p>
                </CosmicInfoTooltip>
              </div>
            </div>
            {blueprint.nakshatra && (
              <div className="px-2 py-1 rounded-lg border border-indigo-500/20 bg-indigo-500/10">
                <div className="flex items-center gap-1">
                  <span className="text-indigo-400 text-xs">Nakshatra </span>
                  <span className="text-white text-xs font-semibold truncate max-w-[100px] inline-block align-bottom">{blueprint.nakshatra}</span>
                  <CosmicInfoTooltip label="About nakshatra">
                    <p>{COSMIC_TOOLTIPS.nakshatra.text}</p>
                  </CosmicInfoTooltip>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM: alignment number chips */}
      {alignmentNums.length > 0 && (
        <div className="relative z-10 flex items-center gap-2 px-6 pb-3">
          <span className="text-xs text-gray-500 uppercase tracking-wider mr-1">Alignment</span>
          {alignmentNums.map((n) => {
            const isToday = n === personalDay;
            return (
              <motion.span
                key={n}
                animate={isToday && isAlignmentDay ? { scale: [1, 1.15, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
                className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold border transition-all ${
                  isToday && isAlignmentDay
                    ? 'bg-solar-500/30 border-solar-400 text-solar-300 shadow-glow-solar'
                    : 'bg-gray-800/60 border-gray-700 text-gray-400'
                }`}
              >
                {n}
              </motion.span>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
