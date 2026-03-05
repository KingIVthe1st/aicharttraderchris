import type { SoulBlueprint } from "@/types/cosmic";

interface BlueprintSummaryProps {
  blueprint: SoulBlueprint;
  onContinue: () => void;
}

const LIFE_PATH_MEANINGS: Record<number, string> = {
  1: "The Leader — Independent, pioneering, original",
  2: "The Diplomat — Cooperative, sensitive, peacemaker",
  3: "The Creative — Expressive, joyful, communicative",
  4: "The Builder — Practical, disciplined, trustworthy",
  5: "The Freedom Seeker — Adventurous, versatile, curious",
  6: "The Nurturer — Responsible, caring, harmonious",
  7: "The Seeker — Analytical, introspective, spiritual",
  8: "The Achiever — Ambitious, powerful, business-minded",
  9: "The Humanitarian — Compassionate, generous, wise",
  11: "Master Number — Intuitive visionary, spiritual illuminator",
  22: "Master Number — The master builder, practical idealist",
  33: "Master Number — Master teacher, compassionate healer",
};

const ZODIAC_EMOJIS: Record<string, string> = {
  Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋",
  Leo: "♌", Virgo: "♍", Libra: "♎", Scorpio: "♏",
  Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓",
};

const CHINESE_ANIMAL_EMOJIS: Record<string, string> = {
  Rat: "🐀", Ox: "🐂", Tiger: "🐅", Rabbit: "🐇",
  Dragon: "🐉", Snake: "🐍", Horse: "🐎", Goat: "🐐",
  Monkey: "🐒", Rooster: "🐓", Dog: "🐕", Pig: "🐖",
};

export default function BlueprintSummary({ blueprint, onContinue }: BlueprintSummaryProps) {
  // Parse alignment numbers from JSON string
  let alignmentNums: number[] = [];
  try {
    alignmentNums = JSON.parse(blueprint.alignmentNumbers || "[]");
  } catch {
    alignmentNums = [];
  }

  // Parse allies/enemies
  let allies: string[] = [];
  let enemies: string[] = [];
  try { allies = JSON.parse(blueprint.chineseAllies || "[]"); } catch { allies = []; }
  try { enemies = JSON.parse(blueprint.chineseEnemies || "[]"); } catch { enemies = []; }

  const lifePathMeaning = LIFE_PATH_MEANINGS[blueprint.lifePath] || "";
  const sunEmoji = ZODIAC_EMOJIS[blueprint.sunSign] || "⭐";
  const moonEmoji = ZODIAC_EMOJIS[blueprint.moonSign] || "🌙";
  const risingEmoji = ZODIAC_EMOJIS[blueprint.risingSign] || "⬆️";
  const chineseEmoji = CHINESE_ANIMAL_EMOJIS[blueprint.chineseAnimal] || "🐾";

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-600/20 border border-purple-500/30 mb-4">
          <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-white">Your Soul Blueprint</h2>
        <p className="text-gray-400 mt-1">The cosmos have revealed your unique spiritual fingerprint.</p>
        <p className="text-purple-400 text-sm mt-1 font-medium">{blueprint.fullName}</p>
      </div>

      {/* Life Path Number — Hero card */}
      <div className="rounded-xl border border-purple-700/40 bg-gradient-to-br from-purple-900/40 to-indigo-900/40 p-6 text-center mb-5">
        <p className="text-sm text-purple-400 uppercase tracking-wider font-medium mb-2">Life Path Number</p>
        <p className="text-7xl font-black text-white leading-none">{blueprint.lifePath}</p>
        {lifePathMeaning && (
          <p className="text-purple-300 text-sm mt-3 font-medium">{lifePathMeaning}</p>
        )}
      </div>

      {/* Western Astrology Row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Sun Sign</p>
          <p className="text-2xl mb-1">{sunEmoji}</p>
          <p className="text-base font-bold text-white">{blueprint.sunSign}</p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Moon Sign</p>
          <p className="text-2xl mb-1">{moonEmoji}</p>
          <p className="text-base font-bold text-white">{blueprint.moonSign}</p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Rising Sign</p>
          <p className="text-2xl mb-1">{risingEmoji}</p>
          <p className="text-base font-bold text-white">{blueprint.risingSign}</p>
        </div>
      </div>

      {/* Chinese Zodiac + Planetary Ruler + Nakshatra */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="rounded-xl border border-amber-900/40 bg-amber-900/10 p-4 text-center">
          <p className="text-xs text-amber-500/70 uppercase tracking-wider mb-1">Chinese Zodiac</p>
          <p className="text-2xl mb-1">{chineseEmoji}</p>
          <p className="text-base font-bold text-white">{blueprint.chineseAnimal}</p>
          <p className="text-xs text-amber-400/70 mt-0.5">{blueprint.chineseElement}</p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Planetary Ruler</p>
          <p className="text-2xl mb-1">🪐</p>
          <p className="text-base font-bold text-white">{blueprint.planetaryRuler}</p>
        </div>
        {blueprint.nakshatra && (
          <div className="rounded-xl border border-indigo-900/40 bg-indigo-900/10 p-4 text-center">
            <p className="text-xs text-indigo-400/70 uppercase tracking-wider mb-1">Nakshatra</p>
            <p className="text-2xl mb-1">🌟</p>
            <p className="text-sm font-bold text-white leading-tight">{blueprint.nakshatra}</p>
          </div>
        )}
      </div>

      {/* Human Design + Alignment Numbers */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {blueprint.humanDesignType && (
          <div className="rounded-xl border border-cyan-900/40 bg-cyan-900/10 p-4 text-center">
            <p className="text-xs text-cyan-500/70 uppercase tracking-wider mb-1">Human Design</p>
            <p className="text-base font-bold text-white">{blueprint.humanDesignType}</p>
          </div>
        )}
        {alignmentNums.length > 0 && (
          <div className="rounded-xl border border-green-900/40 bg-green-900/10 p-4 text-center">
            <p className="text-xs text-green-500/70 uppercase tracking-wider mb-2">Trading Alignment Numbers</p>
            <div className="flex justify-center gap-2 flex-wrap">
              {alignmentNums.map((n) => (
                <span key={n} className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-500/20 border border-green-500/40 text-green-300 font-bold text-sm">
                  {n}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chinese Allies / Enemies */}
      {(allies.length > 0 || enemies.length > 0) && (
        <div className="grid grid-cols-2 gap-3 mb-5">
          {allies.length > 0 && (
            <div className="rounded-xl border border-green-900/40 bg-green-900/10 p-4">
              <p className="text-xs text-green-500/70 uppercase tracking-wider mb-2">Chinese Allies</p>
              <p className="text-sm text-green-300 font-medium">{allies.join(", ")}</p>
            </div>
          )}
          {enemies.length > 0 && (
            <div className="rounded-xl border border-red-900/40 bg-red-900/10 p-4">
              <p className="text-xs text-red-400/70 uppercase tracking-wider mb-2">Chinese Clashes</p>
              <p className="text-sm text-red-300 font-medium">{enemies.join(", ")}</p>
            </div>
          )}
        </div>
      )}

      {/* Birth Details */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4 mb-6 grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-gray-500">Born:</span>{" "}
          <span className="text-gray-300">{blueprint.birthDate} at {blueprint.birthTime}</span>
        </div>
        <div>
          <span className="text-gray-500">Place:</span>{" "}
          <span className="text-gray-300">{blueprint.birthCity}, {blueprint.birthCountry}</span>
        </div>
        {blueprint.birthLat && blueprint.birthLon && (
          <div className="col-span-2">
            <span className="text-gray-500">Coordinates:</span>{" "}
            <span className="text-gray-400 font-mono text-xs">{blueprint.birthLat.toFixed(4)}°, {blueprint.birthLon.toFixed(4)}°</span>
          </div>
        )}
      </div>

      {/* Continue Button */}
      <div className="text-center">
        <button
          type="button"
          onClick={onContinue}
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-8 py-3 font-medium transition-colors inline-flex items-center gap-2"
        >
          Continue to Dashboard
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
