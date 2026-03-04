import type { SoulBlueprint } from "@/types/cosmic";

interface BlueprintSummaryProps {
  blueprint: SoulBlueprint;
  onContinue: () => void;
}

export default function BlueprintSummary({
  blueprint,
  onContinue,
}: BlueprintSummaryProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-600/20 border border-purple-500/30 mb-4">
          <svg
            className="w-8 h-8 text-purple-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-white">Your Soul Blueprint</h2>
        <p className="text-gray-400 mt-2">
          The cosmos have revealed your unique spiritual fingerprint.
        </p>
      </div>

      {/* Life Path Number — Prominent */}
      <div className="rounded-xl border border-purple-700/40 bg-gradient-to-br from-purple-900/30 to-indigo-900/30 p-6 text-center mb-6">
        <p className="text-sm text-purple-400 uppercase tracking-wider font-medium">
          Life Path Number
        </p>
        <p className="text-6xl font-bold text-white mt-2">
          {blueprint.lifePathNumber}
        </p>
      </div>

      {/* Zodiac Signs Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider">
            Sun Sign
          </p>
          <p className="text-lg font-semibold text-white mt-1">
            {blueprint.sunSign}
          </p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider">
            Moon Sign
          </p>
          <p className="text-lg font-semibold text-white mt-1">
            {blueprint.moonSign}
          </p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider">
            Rising Sign
          </p>
          <p className="text-lg font-semibold text-white mt-1">
            {blueprint.risingSign}
          </p>
        </div>
      </div>

      {/* Chinese Zodiac + Planetary Ruler */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider">
            Chinese Zodiac
          </p>
          <p className="text-lg font-semibold text-white mt-1">
            {blueprint.chineseZodiacAnimal}
          </p>
          <p className="text-sm text-gray-400">
            {blueprint.chineseZodiacElement}
          </p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider">
            Planetary Ruler
          </p>
          <p className="text-lg font-semibold text-white mt-1">
            {blueprint.planetaryRuler}
          </p>
        </div>
      </div>

      {/* Continue Button */}
      <div className="text-center">
        <button
          type="button"
          onClick={onContinue}
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-8 py-3 font-medium transition-colors inline-flex items-center gap-2"
        >
          Continue to Dashboard
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
