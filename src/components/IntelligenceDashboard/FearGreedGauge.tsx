import { useState, useMemo } from "react";
import { MiniSparkline, generateTrendData } from "./MiniSparkline";

interface FearGreedGaugeProps {
  value: number; // 0-100
  label: string;
  historicalData?: number[]; // Optional real historical data
  onLearnMore?: (topic: string) => void; // Callback for AI chat
}

export function FearGreedGauge({
  value,
  label,
  historicalData,
  onLearnMore,
}: FearGreedGaugeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  // Guard against undefined/NaN - default to 50 (neutral)
  const safeValue = Number.isFinite(value) ? value : 50;
  const safeLabel = label ?? "Neutral";

  // Normalize to 0-180 degrees for semicircle
  const angle = (safeValue / 100) * 180;

  // Generate sparkline data (use real data if available, otherwise simulate)
  const sparklineData = useMemo(() => {
    if (historicalData && historicalData.length >= 2) {
      return historicalData;
    }
    // Generate 14-day simulated trend toward current value
    return generateTrendData(safeValue, 14, 0.2, 50);
  }, [safeValue, historicalData]);

  // Determine trend direction for visual indicator
  const trend = useMemo(() => {
    if (sparklineData.length < 2) return "flat";
    const first = sparklineData[0];
    const last = sparklineData[sparklineData.length - 1];
    const change = last - first;
    if (change > 5) return "up";
    if (change < -5) return "down";
    return "flat";
  }, [sparklineData]);

  // Color based on value
  const getColor = () => {
    if (safeValue <= 25) return "#EF4444"; // Extreme Fear
    if (safeValue <= 45) return "#F97316"; // Fear
    if (safeValue <= 55) return "#6B7280"; // Neutral
    if (safeValue <= 75) return "#84CC16"; // Greed
    return "#10B981"; // Extreme Greed
  };

  // Determine if at sentiment extreme (for special styling)
  const isExtreme = safeValue <= 25 || safeValue >= 75;

  return (
    <div
      className={`glass-card-hero card-halo p-6 ${isExtreme ? "sentiment-extreme" : ""}`}
    >
      <div className="flex items-center justify-center gap-2 mb-4">
        <h3 className="text-xs text-gray-400 uppercase tracking-widest font-medium">
          Fear & Greed Index
        </h3>
        {/* Info tooltip */}
        <div
          className="relative"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <button
            aria-label="Learn more about Fear & Greed Index"
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

          {/* S&D Contrarian Tooltip - Fixed positioning to escape overflow */}
          {showTooltip && (
            <div
              className="tooltip-premium fixed left-1/2 -translate-x-1/2 w-72 z-[9999]"
              style={{ top: "20%" }}
            >
              <div className="text-left">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-red-500/20 to-emerald-500/20 flex items-center justify-center">
                    <span className="text-sm">🎯</span>
                  </div>
                  <span className="font-semibold text-white text-sm">
                    Contrarian S&D Signal
                  </span>
                </div>
                <div className="text-gray-400 text-[11px] leading-relaxed space-y-2">
                  <p>
                    Fear & Greed measures{" "}
                    <span className="text-white">crowd sentiment</span>. Use it
                    as a{" "}
                    <span className="text-amber-400">contrarian filter</span>{" "}
                    for S&D zone trades.
                  </p>
                  <div className="pt-2 border-t border-gray-700/50 space-y-1.5">
                    <div className="flex items-start gap-2">
                      <span className="text-red-400 text-xs shrink-0">
                        0-25
                      </span>
                      <span>
                        <span className="text-red-400 font-medium">
                          Extreme Fear
                        </span>{" "}
                        — Demand zones{" "}
                        <span className="text-emerald-400">STRONGER</span>. Look
                        for longs.
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-emerald-400 text-xs shrink-0">
                        75-100
                      </span>
                      <span>
                        <span className="text-emerald-400 font-medium">
                          Extreme Greed
                        </span>{" "}
                        — Supply zones{" "}
                        <span className="text-red-400">STRONGER</span>. Look for
                        shorts.
                      </span>
                    </div>
                  </div>
                  <p className="pt-2 border-t border-gray-700/50 text-purple-400">
                    💡 Best S&D setups occur at sentiment extremes
                  </p>
                  {onLearnMore && (
                    <button
                      onClick={() =>
                        onLearnMore("fear greed index contrarian trading")
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

      <div className="flex flex-col items-center">
        <div className="relative w-48 h-28">
          <svg viewBox="0 0 200 110" className="w-full h-full svg-gauge-glow">
            <defs>
              <linearGradient
                id="fear-greed-gradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#EF4444" />
                <stop offset="25%" stopColor="#F97316" />
                <stop offset="50%" stopColor="#6B7280" />
                <stop offset="75%" stopColor="#84CC16" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
              {/* Premium glow filter */}
              <filter
                id="fear-greed-glow"
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feGaussianBlur stdDeviation="4" result="blur1" />
                <feGaussianBlur stdDeviation="8" result="blur2" />
                <feMerge>
                  <feMergeNode in="blur2" />
                  <feMergeNode in="blur1" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="fg-needle-glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Background arc */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="14"
              strokeLinecap="round"
            />

            {/* Gradient arc with premium glow */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="url(#fear-greed-gradient)"
              strokeWidth="14"
              strokeLinecap="round"
              filter="url(#fear-greed-glow)"
              className="arc-animate"
            />

            {/* Needle with premium styling */}
            <g
              className="transition-transform duration-700 ease-out origin-center"
              style={{
                transformOrigin: "100px 100px",
                transform: `rotate(${angle - 90}deg)`,
              }}
            >
              {/* Needle shadow for depth */}
              <line
                x1="100"
                y1="100"
                x2="100"
                y2="28"
                stroke="rgba(0,0,0,0.3)"
                strokeWidth="5"
                strokeLinecap="round"
              />
              {/* Needle glow halo */}
              <line
                x1="100"
                y1="100"
                x2="100"
                y2="26"
                stroke={getColor()}
                strokeWidth="6"
                strokeLinecap="round"
                opacity="0.4"
                filter="url(#fg-needle-glow)"
              />
              {/* Main needle */}
              <line
                x1="100"
                y1="100"
                x2="100"
                y2="26"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                filter="url(#fg-needle-glow)"
              />
              {/* Center hub with gradient ring */}
              <circle
                cx="100"
                cy="100"
                r="10"
                fill="url(#fear-greed-gradient)"
                filter="url(#fg-needle-glow)"
              />
              <circle cx="100" cy="100" r="6" fill="white" />
            </g>

            {/* Labels with better visibility */}
            <text
              x="20"
              y="108"
              className="text-[9px] fill-red-400 font-medium"
              textAnchor="middle"
            >
              FEAR
            </text>
            <text
              x="180"
              y="108"
              className="text-[9px] fill-green-400 font-medium"
              textAnchor="middle"
            >
              GREED
            </text>
          </svg>
        </div>

        {/* Value and label */}
        <div className="text-center mt-2">
          <div
            className="text-4xl font-mono font-bold transition-colors duration-300"
            style={{ color: getColor() }}
          >
            {Math.round(safeValue)}
          </div>
          <div
            className="text-sm font-medium mt-1 px-3 py-1 rounded-full inline-block"
            style={{
              backgroundColor: `${getColor()}20`,
              color: getColor(),
            }}
          >
            {safeLabel}
          </div>
        </div>

        {/* 14-Day Trend Sparkline */}
        <div className="mt-4 pt-3 border-t border-gray-700/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">
              14-Day Trend
            </span>
            <div className="flex items-center gap-1">
              {trend === "up" && (
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
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
              )}
              {trend === "down" && (
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
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              )}
              <span
                className={`text-[10px] font-medium ${
                  trend === "up"
                    ? "text-emerald-400"
                    : trend === "down"
                      ? "text-red-400"
                      : "text-gray-400"
                }`}
              >
                {trend === "up"
                  ? "Rising Greed"
                  : trend === "down"
                    ? "Rising Fear"
                    : "Stable"}
              </span>
            </div>
          </div>
          <div className="flex justify-center">
            <MiniSparkline
              data={sparklineData}
              color={getColor()}
              height={32}
              width={140}
              strokeWidth={2}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
