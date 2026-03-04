import { useState, useMemo } from "react";
import { MiniSparkline, generateTrendData } from "./MiniSparkline";

interface ConvictionMeterProps {
  value: number; // 0.5 to 1.5
  historicalData?: number[]; // Optional real historical data
  onLearnMore?: (topic: string) => void; // Callback for AI chat
}

export function ConvictionMeter({
  value,
  historicalData,
  onLearnMore,
}: ConvictionMeterProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  // Guard against undefined/NaN - default to 1.0 (neutral)
  const safeValue = Number.isFinite(value) ? value : 1.0;

  // Normalize value to 0-100 for the gauge (0.5 = 0%, 1.5 = 100%)
  const percentage = ((safeValue - 0.5) / 1.0) * 100;

  // Generate sparkline data (use real data if available, otherwise simulate)
  const sparklineData = useMemo(() => {
    if (historicalData && historicalData.length >= 2) {
      return historicalData;
    }
    // Generate 7-day conviction trend (conviction changes weekly with data updates)
    return generateTrendData(safeValue, 7, 0.1, 1.0);
  }, [safeValue, historicalData]);

  // Conviction trend
  const convictionTrend = useMemo(() => {
    if (sparklineData.length < 3) return "stable";
    const recent = sparklineData[sparklineData.length - 1];
    const prior = sparklineData[sparklineData.length - 3];
    const change = recent - prior;
    if (change > 0.1) return "strengthening";
    if (change < -0.1) return "weakening";
    return "stable";
  }, [sparklineData]);
  const clampedPercentage = Math.max(0, Math.min(100, percentage));

  // Calculate arc path
  const radius = 70;
  const startAngle = -120;
  const endAngle = 120;
  const angleRange = endAngle - startAngle;
  const currentAngle = startAngle + (clampedPercentage / 100) * angleRange;

  const polarToCartesian = (
    cx: number,
    cy: number,
    r: number,
    angle: number,
  ) => {
    const radians = (angle - 90) * (Math.PI / 180);
    return {
      x: cx + r * Math.cos(radians),
      y: cy + r * Math.sin(radians),
    };
  };

  const describeArc = (
    cx: number,
    cy: number,
    r: number,
    startDeg: number,
    endDeg: number,
  ) => {
    const start = polarToCartesian(cx, cy, r, endDeg);
    const end = polarToCartesian(cx, cy, r, startDeg);
    const largeArcFlag = endDeg - startDeg <= 180 ? 0 : 1;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  };

  // Determine color based on value
  const getColor = () => {
    if (safeValue >= 1.3)
      return { stroke: "#7C3AED", glow: "rgba(124, 58, 237, 0.4)" }; // Purple - high conviction
    if (safeValue >= 1.0)
      return { stroke: "#10B981", glow: "rgba(16, 185, 129, 0.4)" }; // Green - normal
    if (safeValue >= 0.7)
      return { stroke: "#F59E0B", glow: "rgba(245, 158, 11, 0.4)" }; // Amber - reduced
    return { stroke: "#EF4444", glow: "rgba(239, 68, 68, 0.4)" }; // Red - low
  };

  const color = getColor();

  return (
    <div
      className={`glass-card-hero card-halo p-6 ${safeValue >= 1.3 ? "conviction-bloom" : ""}`}
    >
      <div className="flex items-center justify-center gap-2 mb-4">
        <h3 className="text-xs text-gray-400 uppercase tracking-widest font-medium">
          Conviction Multiplier
        </h3>
        {/* Info tooltip */}
        <div
          className="relative"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <button
            aria-label="Learn more about Conviction Multiplier"
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

          {/* Position Sizing Tooltip - Fixed positioning to escape overflow */}
          {showTooltip && (
            <div
              className="tooltip-premium fixed left-1/2 -translate-x-1/2 w-72 z-[9999]"
              style={{ top: "20%" }}
            >
              <div className="text-left">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <span className="text-purple-400 text-sm">⚖️</span>
                  </div>
                  <span className="font-semibold text-white text-sm">
                    Position Sizing Multiplier
                  </span>
                </div>
                <div className="text-gray-400 text-[11px] leading-relaxed space-y-2">
                  <p>
                    Multiply your{" "}
                    <span className="text-white">base position size</span> by
                    this value when entering S&D zones.
                  </p>
                  <div className="pt-2 border-t border-gray-700/50 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-purple-400 font-mono text-xs">
                        1.3x+
                      </span>
                      <span>All signals aligned — full size at zone</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-mono text-xs">
                        1.0x
                      </span>
                      <span>Normal conditions — standard size</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400 font-mono text-xs">
                        0.7x
                      </span>
                      <span>Mixed signals — reduce size</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-red-400 font-mono text-xs">
                        &lt;0.7x
                      </span>
                      <span>Conflicting data — skip or tiny size</span>
                    </div>
                  </div>
                  <p className="pt-2 border-t border-gray-700/50">
                    Example: 1.2x means use{" "}
                    <span className="text-emerald-400">120%</span> of your
                    normal position at the zone.
                  </p>
                  {onLearnMore && (
                    <button
                      onClick={() =>
                        onLearnMore("conviction multiplier position sizing")
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
        <svg viewBox="0 0 200 130" className="w-48 h-28 svg-gauge-glow">
          <defs>
            <linearGradient
              id="conviction-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="33%" stopColor="#F59E0B" />
              <stop offset="66%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
            {/* Premium multi-layer glow filter */}
            <filter
              id="conviction-glow"
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
            <filter id="needle-glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background track */}
          <path
            d={describeArc(100, 100, radius, startAngle, endAngle)}
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="10"
            strokeLinecap="round"
          />

          {/* Gradient track (subtle) */}
          <path
            d={describeArc(100, 100, radius, startAngle, endAngle)}
            fill="none"
            stroke="url(#conviction-gradient)"
            strokeWidth="10"
            strokeLinecap="round"
            opacity="0.2"
          />

          {/* Active arc with premium glow and draw animation */}
          <path
            d={describeArc(100, 100, radius, startAngle, currentAngle)}
            fill="none"
            stroke={color.stroke}
            strokeWidth="10"
            strokeLinecap="round"
            filter="url(#conviction-glow)"
            className="arc-animate transition-all duration-700 ease-out"
          />

          {/* Tick marks */}
          {[0, 25, 50, 75, 100].map((tick) => {
            const tickAngle = startAngle + (tick / 100) * angleRange;
            const innerPoint = polarToCartesian(
              100,
              100,
              radius - 18,
              tickAngle,
            );
            const outerPoint = polarToCartesian(
              100,
              100,
              radius - 12,
              tickAngle,
            );
            return (
              <line
                key={tick}
                x1={innerPoint.x}
                y1={innerPoint.y}
                x2={outerPoint.x}
                y2={outerPoint.y}
                stroke="rgba(255, 255, 255, 0.3)"
                strokeWidth="2"
              />
            );
          })}

          {/* Needle with premium styling */}
          <g
            className="transition-transform duration-700 ease-out origin-center"
            style={{
              transformOrigin: "100px 100px",
              transform: `rotate(${currentAngle}deg)`,
            }}
          >
            {/* Needle shadow for depth */}
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="42"
              stroke="rgba(0,0,0,0.3)"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Main needle */}
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="38"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              filter="url(#needle-glow)"
            />
            {/* Center hub with gradient effect */}
            <circle
              cx="100"
              cy="100"
              r="8"
              fill="url(#conviction-gradient)"
              filter="url(#needle-glow)"
            />
            <circle cx="100" cy="100" r="5" fill="white" />
          </g>
        </svg>

        {/* Value display */}
        <div className="mt-2 text-center">
          <div
            className="text-4xl font-mono font-bold transition-colors duration-300"
            style={{ color: color.stroke }}
          >
            {safeValue.toFixed(1)}x
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {safeValue >= 1.3
              ? "High Conviction"
              : safeValue >= 1.0
                ? "Normal"
                : safeValue >= 0.7
                  ? "Reduced"
                  : "Low Conviction"}
          </div>
        </div>

        {/* Weekly Trend Sparkline */}
        <div className="mt-4 pt-3 border-t border-gray-700/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">
              7-Day Trend
            </span>
            <div className="flex items-center gap-1">
              {convictionTrend === "strengthening" && (
                <svg
                  className="w-3 h-3 text-purple-400"
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
              {convictionTrend === "weakening" && (
                <svg
                  className="w-3 h-3 text-amber-400"
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
                  convictionTrend === "strengthening"
                    ? "text-purple-400"
                    : convictionTrend === "weakening"
                      ? "text-amber-400"
                      : "text-gray-400"
                }`}
              >
                {convictionTrend === "strengthening"
                  ? "Strengthening"
                  : convictionTrend === "weakening"
                    ? "Weakening"
                    : "Stable"}
              </span>
            </div>
          </div>
          <div className="flex justify-center">
            <MiniSparkline
              data={sparklineData}
              color={color.stroke}
              height={28}
              width={140}
              strokeWidth={2}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
