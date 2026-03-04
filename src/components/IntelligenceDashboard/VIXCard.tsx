import { useState, useMemo } from "react";
import { MiniSparkline, generateTrendData } from "./MiniSparkline";

interface VIXCardProps {
  current: number;
  termStructure: "contango" | "backwardation";
  historicalData?: number[]; // Optional real historical data
  onLearnMore?: (topic: string) => void; // Callback for AI chat
}

export function VIXCard({
  current,
  termStructure,
  historicalData,
  onLearnMore,
}: VIXCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  // Guard against undefined values
  const safeCurrent = Number.isFinite(current) ? current : 20;
  const safeTermStructure = termStructure ?? "contango";

  // Generate sparkline data (use real data if available, otherwise simulate)
  const sparklineData = useMemo(() => {
    if (historicalData && historicalData.length >= 2) {
      return historicalData;
    }
    // Generate 30-day VIX trend (VIX is mean-reverting around 20)
    return generateTrendData(safeCurrent, 30, 0.25, 18);
  }, [safeCurrent, historicalData]);

  // VIX trend analysis
  const vixTrend = useMemo(() => {
    if (sparklineData.length < 5) return { direction: "flat", change: 0 };
    const recent = sparklineData.slice(-5);
    const older = sparklineData.slice(0, 5);
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    const change = recentAvg - olderAvg;
    return {
      direction: change > 2 ? "rising" : change < -2 ? "falling" : "flat",
      change: change,
    };
  }, [sparklineData]);

  // VIX color based on level
  const getVIXColor = () => {
    if (safeCurrent >= 30)
      return {
        bg: "bg-red-500/20",
        text: "text-red-400",
        glow: "shadow-red-500/30",
      };
    if (safeCurrent >= 22)
      return {
        bg: "bg-amber-500/20",
        text: "text-amber-400",
        glow: "shadow-amber-500/30",
      };
    if (safeCurrent >= 16)
      return {
        bg: "bg-gray-500/20",
        text: "text-gray-400",
        glow: "shadow-gray-500/30",
      };
    return {
      bg: "bg-emerald-500/20",
      text: "text-emerald-400",
      glow: "shadow-emerald-500/30",
    };
  };

  const color = getVIXColor();

  // VIX level description
  const getVIXDescription = () => {
    if (safeCurrent >= 35) return "PANIC";
    if (safeCurrent >= 30) return "Extreme Fear";
    if (safeCurrent >= 25) return "Elevated";
    if (safeCurrent >= 20) return "Cautious";
    if (safeCurrent >= 15) return "Normal";
    if (safeCurrent >= 12) return "Complacent";
    return "Extreme Complacency";
  };

  // Determine if volatility is elevated (for special styling)
  const isElevated = safeCurrent >= 25;

  return (
    <div
      className={`glass-card-hero card-halo p-6 ${isElevated ? "vix-elevated" : ""}`}
    >
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-xs text-gray-400 uppercase tracking-widest font-medium">
          VIX & Volatility
        </h3>
        {/* Info tooltip */}
        <div
          className="relative"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <button
            aria-label="Learn more about VIX and volatility"
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

          {/* S&D Educational Tooltip - Fixed positioning to escape overflow */}
          {showTooltip && (
            <div
              className="tooltip-premium fixed left-1/2 -translate-x-1/2 w-72 z-[9999]"
              style={{ top: "20%" }}
            >
              <div className="text-left">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <span className="text-amber-400 text-sm">📈</span>
                  </div>
                  <span className="font-semibold text-white text-sm">
                    Stop Placement Guide
                  </span>
                </div>
                <div className="text-gray-400 text-[11px] leading-relaxed space-y-2">
                  <p>
                    VIX measures expected volatility. Use it to{" "}
                    <span className="text-white">calibrate your stops</span> at
                    S&D zones.
                  </p>
                  <div className="pt-2 border-t border-gray-700/50 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 text-xs">
                        VIX &lt;15
                      </span>
                      <span>→ Tight stops, precise zone entries</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-300 text-xs">VIX 15-22</span>
                      <span>→ Normal stops, standard entries</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400 text-xs">VIX 22-30</span>
                      <span>→ Wider stops, reduce size</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-red-400 text-xs">VIX &gt;30</span>
                      <span>→ Very wide stops or sit out</span>
                    </div>
                  </div>
                  <p className="pt-2 border-t border-gray-700/50">
                    <span className="text-purple-400 font-medium">
                      Backwardation
                    </span>{" "}
                    = Fear spike. S&D zones may overshoot initially.
                  </p>
                  {onLearnMore && (
                    <button
                      onClick={() =>
                        onLearnMore("VIX volatility stop loss placement")
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
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        {/* VIX Level */}
        <div className="flex items-center gap-4">
          <div
            className={`
              w-20 h-20 rounded-xl flex items-center justify-center
              ${color.bg} border border-current/30
              shadow-lg ${color.glow}
            `}
          >
            <span className={`text-3xl font-mono font-bold ${color.text}`}>
              {safeCurrent.toFixed(1)}
            </span>
          </div>
          <div>
            <div className="text-sm font-semibold text-white">VIX Index</div>
            <div className={`text-xs ${color.text}`}>{getVIXDescription()}</div>
          </div>
        </div>

        {/* Term Structure */}
        <div className="text-right">
          <div className="text-xs text-gray-500 mb-1">Term Structure</div>
          <div
            className={`
              inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
              ${
                safeTermStructure === "backwardation"
                  ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                  : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
              }
            `}
          >
            {safeTermStructure === "backwardation" ? (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                  />
                </svg>
                BACKWARDATION
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
                CONTANGO
              </>
            )}
          </div>
        </div>
      </div>

      {/* VIX Bar Visualization - Premium Version */}
      <div className="mb-4">
        <div className="flex justify-between text-[10px] text-gray-500 mb-1.5 font-medium">
          <span>Complacency</span>
          <span>Normal</span>
          <span>Elevated</span>
          <span>Panic</span>
        </div>
        <div className="relative h-4 rounded-lg overflow-hidden bg-gray-800/60 border border-gray-700/30">
          {/* Premium gradient background with glow */}
          <div
            className="absolute inset-0 progress-liquid"
            style={{
              background:
                "linear-gradient(to right, #10B981 0%, #22D3EE 25%, #6B7280 40%, #F59E0B 60%, #EF4444 80%, #DC2626 100%)",
              opacity: 0.5,
            }}
          />
          {/* Active fill up to current VIX */}
          <div
            className="absolute inset-y-0 left-0 transition-all duration-700 ease-out"
            style={{
              width: `${Math.min((safeCurrent / 40) * 100, 100)}%`,
              background:
                "linear-gradient(to right, #10B981 0%, #22D3EE 25%, #6B7280 40%, #F59E0B 60%, #EF4444 80%, #DC2626 100%)",
              opacity: 0.8,
            }}
          />
          {/* Current position marker with glow */}
          <div
            className="absolute top-0 bottom-0 w-2 bg-white rounded-full shadow-lg transition-all duration-700 ease-out"
            style={{
              left: `${Math.min((safeCurrent / 40) * 100, 100)}%`,
              transform: "translateX(-50%)",
              boxShadow:
                "0 0 15px rgba(255,255,255,0.8), 0 0 30px rgba(255,255,255,0.4)",
            }}
          />
          {/* Reference marks - premium styling */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white/40"
            style={{ left: "37.5%" }}
            title="VIX 15"
          />
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white/40"
            style={{ left: "55%" }}
            title="VIX 22"
          />
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white/40"
            style={{ left: "75%" }}
            title="VIX 30"
          />
        </div>
      </div>

      {/* 30-Day VIX Trend Sparkline */}
      <div className="mt-4 pt-3 border-t border-gray-700/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider">
            30-Day Volatility Trend
          </span>
          <div className="flex items-center gap-1">
            {vixTrend.direction === "rising" && (
              <svg
                className="w-3 h-3 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
            )}
            {vixTrend.direction === "falling" && (
              <svg
                className="w-3 h-3 text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            )}
            <span
              className={`text-[10px] font-medium ${
                vixTrend.direction === "rising"
                  ? "text-red-400"
                  : vixTrend.direction === "falling"
                    ? "text-emerald-400"
                    : "text-gray-400"
              }`}
            >
              {vixTrend.direction === "rising"
                ? "Vol Rising"
                : vixTrend.direction === "falling"
                  ? "Vol Falling"
                  : "Stable"}
            </span>
          </div>
        </div>
        <MiniSparkline
          data={sparklineData}
          color={
            safeCurrent >= 25
              ? "#F59E0B"
              : safeCurrent >= 20
                ? "#6B7280"
                : "#10B981"
          }
          height={28}
          width={200}
          strokeWidth={1.5}
        />
      </div>
    </div>
  );
}
