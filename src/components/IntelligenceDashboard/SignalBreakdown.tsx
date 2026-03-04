import { useMemo, useState } from "react";

interface SignalBreakdownProps {
  signals: string[];
  strategicScore: number;
  tacticalScore: number;
  onLearnMore?: (context: string) => void;
}

// Tooltip content for each score type
const scoreTooltips = {
  strategic: {
    title: "Strategic Score",
    icon: "🎯",
    description:
      "Measures LONG-TERM positioning based on institutional COT data, macro liquidity, and structural market factors.",
    interpretation: [
      {
        range: "+50 to +100",
        meaning: "Strong bullish bias — favor demand zones",
        color: "text-emerald-400",
      },
      {
        range: "+20 to +49",
        meaning: "Moderate bullish lean",
        color: "text-emerald-400/70",
      },
      {
        range: "-19 to +19",
        meaning: "Neutral — trade both directions",
        color: "text-gray-400",
      },
      {
        range: "-49 to -20",
        meaning: "Moderate bearish lean",
        color: "text-red-400/70",
      },
      {
        range: "-100 to -50",
        meaning: "Strong bearish bias — favor supply zones",
        color: "text-red-400",
      },
    ],
    tip: "Strategic score changes slowly (weekly). It tells you WHICH direction to favor.",
  },
  tactical: {
    title: "Tactical Score",
    icon: "⚡",
    description:
      "Measures SHORT-TERM momentum using VIX, Fear & Greed, and intraday sentiment shifts.",
    interpretation: [
      {
        range: "+50 to +100",
        meaning: "Strong momentum — act now",
        color: "text-emerald-400",
      },
      {
        range: "+20 to +49",
        meaning: "Good setup forming",
        color: "text-emerald-400/70",
      },
      {
        range: "-19 to +19",
        meaning: "Wait for clearer signals",
        color: "text-gray-400",
      },
      {
        range: "-49 to -20",
        meaning: "Weak momentum — reduce size",
        color: "text-red-400/70",
      },
      {
        range: "-100 to -50",
        meaning: "Adverse conditions — sit out",
        color: "text-red-400",
      },
    ],
    tip: "Tactical score can change hourly. It tells you WHEN to act.",
  },
};

// Parse signal strings into structured data
interface ParsedSignal {
  name: string;
  value: number;
  maxValue: number;
  direction: "bullish" | "bearish" | "neutral";
  description: string;
}

// Score tooltip component
function ScoreTooltip({
  type,
  currentValue,
  onLearnMore,
}: {
  type: "strategic" | "tactical";
  currentValue: number;
  onLearnMore?: (context: string) => void;
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltip = scoreTooltips[type];

  // Find which range the current value falls into
  const getCurrentRange = () => {
    if (currentValue >= 50) return 0;
    if (currentValue >= 20) return 1;
    if (currentValue >= -19) return 2;
    if (currentValue >= -49) return 3;
    return 4;
  };

  const activeRange = getCurrentRange();

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <button
        aria-label={`Learn more about ${tooltip.title}`}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        className="w-4 h-4 rounded-full bg-gray-700/50 hover:bg-gray-600/50 focus:ring-2 focus:ring-purple-500/50 focus:outline-none flex items-center justify-center transition-colors ml-1"
      >
        <svg
          className="w-3 h-3 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>

      {showTooltip && (
        <div
          className="tooltip-premium fixed left-1/2 -translate-x-1/2 w-80 z-[9999]"
          style={{ top: "20%" }}
        >
          <div className="text-left">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{tooltip.icon}</span>
              <span className="font-semibold text-white text-sm">
                {tooltip.title}
              </span>
            </div>

            {/* Description */}
            <p className="text-gray-400 text-[11px] leading-relaxed mb-3">
              {tooltip.description}
            </p>

            {/* Interpretation table */}
            <div className="space-y-1.5 mb-3">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">
                How to Read
              </div>
              {tooltip.interpretation.map((item, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between text-[11px] px-2 py-1 rounded ${
                    i === activeRange
                      ? "bg-white/10 border border-white/20"
                      : ""
                  }`}
                >
                  <span className="text-gray-400 font-mono">{item.range}</span>
                  <span className={item.color}>{item.meaning}</span>
                </div>
              ))}
            </div>

            {/* Pro tip */}
            <div className="pt-2 border-t border-gray-700/50">
              <p className="text-purple-400 text-[11px]">💡 {tooltip.tip}</p>
            </div>

            {/* Learn more button */}
            {onLearnMore && (
              <button
                onClick={() =>
                  onLearnMore(
                    `${tooltip.title} explanation and how to use it for trading decisions`,
                  )
                }
                className="mt-3 w-full py-1.5 px-3 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 text-purple-300 text-[11px] font-medium transition-all flex items-center justify-center gap-1.5"
              >
                <svg
                  className="w-3 h-3"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
                </svg>
                Learn More with AI
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function SignalBreakdown({
  signals,
  strategicScore,
  tacticalScore,
  onLearnMore,
}: SignalBreakdownProps) {
  // Guard against undefined/null scores
  const safeStrategic = strategicScore ?? 0;
  const safeTactical = tacticalScore ?? 0;
  const safeSignals = signals ?? [];

  // Parse signals from backend format - memoized for performance
  const parsedSignals = useMemo(() => {
    const parsed: ParsedSignal[] = [];

    safeSignals.forEach((signal) => {
      // Try to extract numeric values from signal strings
      const tierMatch = signal.match(/TIER (\d)/);
      const pointsMatch = signal.match(/([+-]?\d+\.?\d*)\s*(?:points?|pts?)/i);
      const biasMatch = signal.match(/(bullish|bearish|neutral|long|short)/i);

      if (tierMatch) {
        const tier = parseInt(tierMatch[1]);
        const points = pointsMatch ? parseFloat(pointsMatch[1]) : 0;
        const direction = biasMatch
          ? biasMatch[1].toLowerCase().includes("bull") ||
            biasMatch[1].toLowerCase().includes("long")
            ? "bullish"
            : biasMatch[1].toLowerCase().includes("bear") ||
                biasMatch[1].toLowerCase().includes("short")
              ? "bearish"
              : "neutral"
          : points > 0
            ? "bullish"
            : points < 0
              ? "bearish"
              : "neutral";

        const tierNames = [
          "",
          "Macro Environment",
          "Structural Position",
          "Fear & Greed",
          "Timing",
        ];

        parsed.push({
          name: tierNames[tier] || `Tier ${tier}`,
          value: Math.abs(points),
          maxValue: tier === 1 ? 30 : tier === 2 ? 30 : tier === 3 ? 25 : 15,
          direction,
          description: signal,
        });
      }
    });

    // If no tier signals parsed, create from scores
    if (parsed.length === 0) {
      return [
        {
          name: "Strategic Score",
          value: Math.abs(safeStrategic),
          maxValue: 100,
          direction:
            safeStrategic > 0
              ? "bullish"
              : safeStrategic < 0
                ? "bearish"
                : "neutral",
          description: `Overall strategic bias: ${safeStrategic}`,
        },
        {
          name: "Tactical Score",
          value: Math.abs(safeTactical),
          maxValue: 100,
          direction:
            safeTactical > 0
              ? "bullish"
              : safeTactical < 0
                ? "bearish"
                : "neutral",
          description: `Short-term tactical bias: ${safeTactical}`,
        },
      ];
    }

    return parsed;
  }, [safeSignals, safeStrategic, safeTactical]);

  return (
    <div className="glass-card p-6">
      <h3 className="text-xs text-gray-400 uppercase tracking-widest font-medium mb-4">
        Signal Breakdown
      </h3>

      <div className="space-y-4">
        {parsedSignals.map((signal, index) => (
          <div key={index} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">
                {signal.name}
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`
                    text-xs font-mono
                    ${
                      signal.direction === "bullish"
                        ? "text-emerald-400"
                        : signal.direction === "bearish"
                          ? "text-red-400"
                          : "text-gray-400"
                    }
                  `}
                >
                  {signal.direction === "bullish"
                    ? "+"
                    : signal.direction === "bearish"
                      ? "-"
                      : ""}
                  {signal.value.toFixed(1)}
                </span>
                <span className="text-[10px] text-gray-500">
                  / {signal.maxValue}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="relative h-2 bg-gray-800/50 rounded-full overflow-hidden">
              {/* Background gradient hint */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  background:
                    signal.direction === "bullish"
                      ? "linear-gradient(to right, transparent, #10B981)"
                      : signal.direction === "bearish"
                        ? "linear-gradient(to right, transparent, #EF4444)"
                        : "linear-gradient(to right, transparent, #6B7280)",
                }}
              />

              {/* Filled portion */}
              <div
                className={`
                  absolute left-0 top-0 bottom-0 rounded-full
                  transition-all duration-700 ease-out
                  ${
                    signal.direction === "bullish"
                      ? "bg-gradient-to-r from-emerald-600 to-emerald-400"
                      : signal.direction === "bearish"
                        ? "bg-gradient-to-r from-red-600 to-red-400"
                        : "bg-gradient-to-r from-gray-600 to-gray-400"
                  }
                `}
                style={{
                  width: `${Math.min((signal.value / signal.maxValue) * 100, 100)}%`,
                }}
              />

              {/* Glow effect */}
              <div
                className={`
                  absolute left-0 top-0 bottom-0 rounded-full blur-sm
                  ${
                    signal.direction === "bullish"
                      ? "bg-emerald-400/50"
                      : signal.direction === "bearish"
                        ? "bg-red-400/50"
                        : "bg-gray-400/50"
                  }
                `}
                style={{
                  width: `${Math.min((signal.value / signal.maxValue) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Composite scores */}
      <div className="mt-6 pt-4 border-t border-gray-700/50 grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-[10px] text-gray-500 uppercase tracking-wider mb-1">
            <span>Strategic</span>
            <ScoreTooltip
              type="strategic"
              currentValue={safeStrategic}
              onLearnMore={onLearnMore}
            />
          </div>
          <div
            className={`
              text-2xl font-mono font-bold tabular-nums
              ${safeStrategic > 0 ? "text-emerald-400" : safeStrategic < 0 ? "text-red-400" : "text-gray-400"}
            `}
          >
            {safeStrategic > 0 ? "+" : ""}
            {safeStrategic.toFixed(0)}
          </div>
          {/* Quick hint under the number */}
          <div className="text-[9px] text-gray-600 mt-0.5">
            {safeStrategic >= 50
              ? "Strong bullish"
              : safeStrategic >= 20
                ? "Bullish lean"
                : safeStrategic <= -50
                  ? "Strong bearish"
                  : safeStrategic <= -20
                    ? "Bearish lean"
                    : "Neutral"}
          </div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-[10px] text-gray-500 uppercase tracking-wider mb-1">
            <span>Tactical</span>
            <ScoreTooltip
              type="tactical"
              currentValue={safeTactical}
              onLearnMore={onLearnMore}
            />
          </div>
          <div
            className={`
              text-2xl font-mono font-bold tabular-nums
              ${safeTactical > 0 ? "text-emerald-400" : safeTactical < 0 ? "text-red-400" : "text-gray-400"}
            `}
          >
            {safeTactical > 0 ? "+" : ""}
            {safeTactical.toFixed(0)}
          </div>
          {/* Quick hint under the number */}
          <div className="text-[9px] text-gray-600 mt-0.5">
            {safeTactical >= 50
              ? "Act now"
              : safeTactical >= 20
                ? "Good setup"
                : safeTactical <= -50
                  ? "Sit out"
                  : safeTactical <= -20
                    ? "Reduce size"
                    : "Wait"}
          </div>
        </div>
      </div>
    </div>
  );
}
