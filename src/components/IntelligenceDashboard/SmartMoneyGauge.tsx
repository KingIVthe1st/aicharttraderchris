import { useState } from "react";

type SmartMoneyBias = "BULLISH" | "BEARISH" | "NEUTRAL";

interface SmartMoneyGaugeProps {
  bias: SmartMoneyBias;
  onLearnMore?: (topic: string) => void;
}

export function SmartMoneyGauge({ bias, onLearnMore }: SmartMoneyGaugeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  // Default to NEUTRAL if bias is undefined
  const safeBias = bias ?? "NEUTRAL";
  const position =
    safeBias === "BULLISH" ? 80 : safeBias === "BEARISH" ? 20 : 50;

  // Get colors based on bias
  const getBiasColors = () => {
    switch (safeBias) {
      case "BULLISH":
        return {
          indicator: "bg-emerald-400",
          glow: "bg-emerald-500/40",
          shadow: "shadow-emerald-500/50",
          text: "text-emerald-400",
          bg: "bg-emerald-500/20",
          border: "border-emerald-500/30",
        };
      case "BEARISH":
        return {
          indicator: "bg-red-400",
          glow: "bg-red-500/40",
          shadow: "shadow-red-500/50",
          text: "text-red-400",
          bg: "bg-red-500/20",
          border: "border-red-500/30",
        };
      default:
        return {
          indicator: "bg-gray-400",
          glow: "bg-gray-500/40",
          shadow: "shadow-gray-500/50",
          text: "text-gray-400",
          bg: "bg-gray-500/20",
          border: "border-gray-500/30",
        };
    }
  };

  const colors = getBiasColors();

  return (
    <div className="flex flex-col items-center gap-2 min-w-[200px]">
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">
          Smart Money
        </span>
        {/* Info tooltip */}
        <div
          className="relative"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <button
            aria-label="Learn more about Smart Money positioning"
            onFocus={() => setShowTooltip(true)}
            onBlur={() => setShowTooltip(false)}
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

          {/* Smart Money Tooltip - Fixed positioning to escape overflow */}
          {showTooltip && (
            <div
              className="tooltip-premium fixed left-1/2 -translate-x-1/2 w-72 z-[9999]"
              style={{ top: "15%" }}
            >
              <div className="text-left">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <span className="text-blue-400 text-sm">🏦</span>
                  </div>
                  <span className="font-semibold text-white text-sm">
                    Institutional Positioning
                  </span>
                </div>
                <div className="text-gray-400 text-[11px] leading-relaxed space-y-2">
                  <p>
                    Smart Money reflects{" "}
                    <span className="text-white">institutional bias</span>{" "}
                    derived from COT data and positioning metrics.
                  </p>
                  <div className="pt-2 border-t border-gray-700/50 space-y-1.5">
                    <div className="flex items-start gap-2">
                      <span className="text-emerald-400 text-xs shrink-0">
                        BULLISH
                      </span>
                      <span>
                        Institutions accumulating — favor{" "}
                        <span className="text-emerald-400">demand zones</span>{" "}
                        for longs
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-red-400 text-xs shrink-0">
                        BEARISH
                      </span>
                      <span>
                        Institutions distributing — favor{" "}
                        <span className="text-red-400">supply zones</span> for
                        shorts
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400 text-xs shrink-0">
                        NEUTRAL
                      </span>
                      <span>
                        Mixed signals — trade both directions at key zones
                      </span>
                    </div>
                  </div>
                  <p className="pt-2 border-t border-gray-700/50 text-purple-400">
                    💡 Aligns your trades with institutions for higher
                    conviction
                  </p>
                </div>
                {onLearnMore && (
                  <button
                    onClick={() =>
                      onLearnMore("smart money institutional positioning COT")
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
      </div>

      {/* Premium gauge track */}
      <div className="relative w-full h-10 rounded-xl overflow-hidden bg-gray-800/60 border border-gray-700/50">
        {/* Gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, #EF4444 0%, #F59E0B 25%, #6B7280 50%, #10B981 75%, #10B981 100%)",
            opacity: 0.25,
          }}
        />

        {/* Active section highlight */}
        <div
          className={`absolute inset-y-0 transition-all duration-700 ease-out ${colors.bg}`}
          style={{
            left:
              safeBias === "BEARISH"
                ? "0%"
                : safeBias === "NEUTRAL"
                  ? "33%"
                  : "66%",
            width: "34%",
            opacity: 0.4,
          }}
        />

        {/* Marker/Arrow with enhanced styling */}
        <div
          className="absolute top-1 bottom-1 transition-all duration-700 ease-out"
          style={{ left: `${position}%`, transform: "translateX(-50%)" }}
        >
          <div className="relative h-full flex flex-col items-center">
            {/* Outer glow effect */}
            <div
              className={`absolute -inset-3 rounded-full blur-md ${colors.glow} animate-pulse`}
            />
            {/* Indicator pill */}
            <div
              className={`
                w-5 h-full rounded-lg
                ${colors.indicator}
                shadow-lg ${colors.shadow}
                relative z-10
                border-2 border-white/20
              `}
            />
          </div>
        </div>

        {/* Reference marks */}
        <div className="absolute top-0 bottom-0 left-1/3 w-px bg-white/10" />
        <div className="absolute top-0 bottom-0 left-2/3 w-px bg-white/10" />
      </div>

      {/* Labels */}
      <div className="w-full flex justify-between text-[10px] font-medium px-1">
        <span
          className={
            safeBias === "BEARISH" ? "text-red-400" : "text-red-400/50"
          }
        >
          BEARISH
        </span>
        <span
          className={safeBias === "NEUTRAL" ? "text-gray-300" : "text-gray-500"}
        >
          NEUTRAL
        </span>
        <span
          className={
            safeBias === "BULLISH" ? "text-emerald-400" : "text-emerald-400/50"
          }
        >
          BULLISH
        </span>
      </div>

      {/* Current bias label - enhanced */}
      <div
        className={`
          mt-2 px-4 py-1.5 rounded-lg text-xs font-bold tracking-wide
          ${colors.bg} ${colors.text} ${colors.border}
          border shadow-lg ${colors.shadow}
          transition-all duration-300
        `}
      >
        {safeBias}
      </div>
    </div>
  );
}
