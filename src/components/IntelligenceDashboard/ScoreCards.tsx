import { useState } from "react";

interface ScoreCardsProps {
  strategicScore: number;
  tacticalScore: number;
  convictionMultiplier: number;
  onLearnMore?: (topic: string) => void;
}

/**
 * InfoTooltip - Reusable educational tooltip component
 */
function InfoTooltip({
  children,
  onLearnMore,
  learnMoreTopic,
  ariaLabel = "Learn more",
}: {
  children: React.ReactNode;
  onLearnMore?: (topic: string) => void;
  learnMoreTopic?: string;
  ariaLabel?: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <button
        aria-label={ariaLabel}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        className="w-4 h-4 rounded-full bg-gray-700/50 hover:bg-gray-600/50 focus:ring-2 focus:ring-purple-500/50 focus:outline-none flex items-center justify-center transition-colors"
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

      {show && (
        <div
          className="tooltip-premium fixed left-1/2 -translate-x-1/2 w-80 z-[9999]"
          style={{ top: "20%" }}
        >
          <div className="text-left">
            {children}
            {onLearnMore && learnMoreTopic && (
              <button
                onClick={() => onLearnMore(learnMoreTopic)}
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

export function ScoreCards({
  strategicScore,
  tacticalScore,
  convictionMultiplier,
  onLearnMore,
}: ScoreCardsProps) {
  // Guard against undefined/NaN values
  const safeStrategic = Number.isFinite(strategicScore) ? strategicScore : 0;
  const safeTactical = Number.isFinite(tacticalScore) ? tacticalScore : 0;
  const safeMultiplier = Number.isFinite(convictionMultiplier)
    ? convictionMultiplier
    : 1;

  // Determine overall bias from scores
  const getScoreColor = (score: number) => {
    if (score >= 50)
      return {
        bg: "bg-emerald-500",
        text: "text-emerald-400",
        glow: "shadow-emerald-500/30",
        gradient: "from-emerald-500/20 to-emerald-600/10",
      };
    if (score >= 20)
      return {
        bg: "bg-emerald-500/70",
        text: "text-emerald-400",
        glow: "shadow-emerald-500/20",
        gradient: "from-emerald-500/15 to-emerald-600/5",
      };
    if (score >= -20)
      return {
        bg: "bg-gray-500",
        text: "text-gray-400",
        glow: "shadow-gray-500/20",
        gradient: "from-gray-500/15 to-gray-600/5",
      };
    if (score >= -50)
      return {
        bg: "bg-red-500/70",
        text: "text-red-400",
        glow: "shadow-red-500/20",
        gradient: "from-red-500/15 to-red-600/5",
      };
    return {
      bg: "bg-red-500",
      text: "text-red-400",
      glow: "shadow-red-500/30",
      gradient: "from-red-500/20 to-red-600/10",
    };
  };

  const strategicColor = getScoreColor(safeStrategic);
  const tacticalColor = getScoreColor(safeTactical);

  // Calculate composite score
  const compositeScore =
    (safeStrategic * 0.6 + safeTactical * 0.4) * safeMultiplier;
  const compositeColor = getScoreColor(compositeScore);

  // Get bias label
  const getBiasLabel = (score: number) => {
    if (score >= 50) return "Strong Bullish";
    if (score >= 20) return "Bullish";
    if (score >= -20) return "Neutral";
    if (score >= -50) return "Bearish";
    return "Strong Bearish";
  };

  return (
    <div className="glass-card-elevated p-6">
      {/* Header with educational tooltip */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <h3 className="text-xs text-gray-400 uppercase tracking-widest font-medium">
          Market Bias Analysis
        </h3>
        <InfoTooltip
          onLearnMore={onLearnMore}
          learnMoreTopic="strategic tactical composite scores trading"
          ariaLabel="Learn more about Market Bias Analysis"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
              <span className="text-purple-400 text-sm">📊</span>
            </div>
            <span className="font-semibold text-white text-sm">
              Understanding Bias Scores
            </span>
          </div>
          <div className="text-gray-400 text-[11px] leading-relaxed space-y-2">
            <p>
              These scores synthesize{" "}
              <span className="text-white">multiple market indicators</span>{" "}
              into actionable bias readings.
            </p>
            <div className="pt-2 border-t border-gray-700/50 space-y-1.5">
              <div className="flex items-start gap-2">
                <span className="text-blue-400 text-xs shrink-0 font-medium">
                  Strategic
                </span>
                <span>
                  Long-term institutional signals (COT positioning, smart money
                  flow)
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-cyan-400 text-xs shrink-0 font-medium">
                  Tactical
                </span>
                <span>
                  Short-term market signals (VIX, Fear & Greed, momentum)
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-400 text-xs shrink-0 font-medium">
                  Overall
                </span>
                <span>
                  Weighted blend: 60% Strategic + 40% Tactical × Conviction
                </span>
              </div>
            </div>
            <p className="pt-2 border-t border-gray-700/50 text-emerald-400">
              💡 Higher scores = stronger institutional alignment = higher
              probability trades
            </p>
          </div>
        </InfoTooltip>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Strategic Score */}
        <div className="flex flex-col items-center">
          <div
            className={`
              relative w-24 h-24 rounded-2xl flex items-center justify-center
              bg-gradient-to-br ${strategicColor.gradient}
              border border-blue-500/30
              shadow-lg ${strategicColor.glow}
              transition-all duration-300 hover:scale-105
            `}
          >
            {/* Animated ring */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-gray-700/50"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${Math.abs(safeStrategic) * 2.83} 283`}
                className={`${strategicColor.text} transition-all duration-700`}
                style={{
                  transform: "rotate(-90deg)",
                  transformOrigin: "center",
                }}
              />
            </svg>

            <span
              className={`text-2xl font-mono font-bold tabular-nums ${strategicColor.text} relative z-10`}
            >
              {safeStrategic > 0 ? "+" : ""}
              {safeStrategic.toFixed(0)}
            </span>
          </div>
          <div className="mt-3 text-center">
            <div className="flex items-center gap-1.5 justify-center">
              <div className="text-xs text-blue-400 font-medium">Strategic</div>
              <InfoTooltip
                onLearnMore={onLearnMore}
                learnMoreTopic="strategic score COT institutional positioning"
                ariaLabel="Learn more about Strategic Score"
              >
                <div className="text-gray-400 text-[11px] leading-relaxed">
                  <p className="font-medium text-white mb-1">Strategic Score</p>
                  <p>
                    Derived from <span className="text-blue-400">COT data</span>{" "}
                    and institutional positioning. Shows where the "smart money"
                    is positioned over weeks/months.
                  </p>
                  <p className="mt-2 text-emerald-400">
                    High strategic score = institutions are aligned with your
                    trade direction
                  </p>
                </div>
              </InfoTooltip>
            </div>
            <div className={`text-[10px] ${strategicColor.text}`}>
              {getBiasLabel(safeStrategic)}
            </div>
          </div>
        </div>

        {/* Composite Score - Center, larger */}
        <div className="flex flex-col items-center">
          <div
            className={`
              relative w-28 h-28 rounded-2xl flex items-center justify-center
              bg-gradient-to-br from-purple-500/20 via-gray-800/80 to-purple-600/10
              border border-purple-500/40
              shadow-xl ${compositeColor.glow}
              transition-all duration-300 hover:scale-105
            `}
          >
            {/* Outer glow ring */}
            <div
              className={`
                absolute inset-0 rounded-2xl animate-pulse opacity-30
                ${compositeColor.bg}
              `}
              style={{ filter: "blur(8px)" }}
            />

            {/* Animated ring */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-gray-700/50"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${Math.abs(compositeScore) * 2.64} 264`}
                className={`${compositeColor.text} transition-all duration-700`}
                style={{
                  transform: "rotate(-90deg)",
                  transformOrigin: "center",
                }}
              />
            </svg>

            <div className="relative z-10 text-center">
              <span
                className={`text-3xl font-mono font-bold ${compositeColor.text}`}
              >
                {compositeScore > 0 ? "+" : ""}
                {compositeScore.toFixed(0)}
              </span>
            </div>
          </div>
          <div className="mt-3 text-center">
            <div className="flex items-center gap-1.5 justify-center">
              <div className="text-xs text-purple-400 font-semibold">
                Overall Bias
              </div>
              <InfoTooltip
                onLearnMore={onLearnMore}
                learnMoreTopic="composite overall bias score position sizing"
                ariaLabel="Learn more about Overall Bias Score"
              >
                <div className="text-gray-400 text-[11px] leading-relaxed">
                  <p className="font-medium text-white mb-1">
                    Overall Bias Score
                  </p>
                  <p>
                    Combines Strategic (60%) and Tactical (40%) scores, then
                    multiplied by your{" "}
                    <span className="text-purple-400">
                      Conviction Multiplier
                    </span>
                    .
                  </p>
                  <div className="mt-2 pt-2 border-t border-gray-700/50 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-emerald-400">+50 to +100</span>
                      <span>Strong long bias</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">-20 to +20</span>
                      <span>Neutral / wait</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-400">-50 to -100</span>
                      <span>Strong short bias</span>
                    </div>
                  </div>
                </div>
              </InfoTooltip>
            </div>
            <div className={`text-[10px] ${compositeColor.text}`}>
              {getBiasLabel(compositeScore)}
            </div>
          </div>
        </div>

        {/* Tactical Score */}
        <div className="flex flex-col items-center">
          <div
            className={`
              relative w-24 h-24 rounded-2xl flex items-center justify-center
              bg-gradient-to-br ${tacticalColor.gradient}
              border border-cyan-500/30
              shadow-lg ${tacticalColor.glow}
              transition-all duration-300 hover:scale-105
            `}
          >
            {/* Animated ring */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-gray-700/50"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${Math.abs(safeTactical) * 2.83} 283`}
                className={`${tacticalColor.text} transition-all duration-700`}
                style={{
                  transform: "rotate(-90deg)",
                  transformOrigin: "center",
                }}
              />
            </svg>

            <span
              className={`text-2xl font-mono font-bold tabular-nums ${tacticalColor.text} relative z-10`}
            >
              {safeTactical > 0 ? "+" : ""}
              {safeTactical.toFixed(0)}
            </span>
          </div>
          <div className="mt-3 text-center">
            <div className="flex items-center gap-1.5 justify-center">
              <div className="text-xs text-cyan-400 font-medium">Tactical</div>
              <InfoTooltip
                onLearnMore={onLearnMore}
                learnMoreTopic="tactical score VIX fear greed sentiment"
                ariaLabel="Learn more about Tactical Score"
              >
                <div className="text-gray-400 text-[11px] leading-relaxed">
                  <p className="font-medium text-white mb-1">Tactical Score</p>
                  <p>
                    Derived from short-term indicators:{" "}
                    <span className="text-cyan-400">VIX</span>,{" "}
                    <span className="text-amber-400">Fear & Greed</span>, and
                    momentum signals.
                  </p>
                  <p className="mt-2 text-amber-400">
                    ⚡ Changes faster than Strategic - good for timing entries
                  </p>
                </div>
              </InfoTooltip>
            </div>
            <div className={`text-[10px] ${tacticalColor.text}`}>
              {getBiasLabel(safeTactical)}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-700/50 flex items-center justify-center gap-6 text-[10px]">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
          <span className="text-gray-500">Bullish</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-gray-400" />
          <span className="text-gray-500">Neutral</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-400 shadow-sm shadow-red-400/50" />
          <span className="text-gray-500">Bearish</span>
        </div>
      </div>

      {/* Multiplier indicator */}
      {safeMultiplier !== 1 && (
        <div className="mt-3 text-center">
          <span className="text-[10px] text-purple-400">
            Conviction Multiplier: {safeMultiplier.toFixed(1)}x applied
          </span>
        </div>
      )}
    </div>
  );
}
