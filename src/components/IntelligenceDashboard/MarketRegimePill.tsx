import { useState } from "react";

type MarketRegime =
  | "BULL_QUIET"
  | "BULL_VOLATILE"
  | "BEAR_QUIET"
  | "BEAR_VOLATILE"
  | "RANGE_BOUND";

interface MarketRegimePillProps {
  regime: MarketRegime;
}

interface RegimeConfig {
  label: string;
  sdContext: string; // Supply & Demand trading context
  color: string;
  bgColor: string;
  borderColor: string;
  glowColor: string;
  dotColor: string;
  bgImageClass: string; // CSS class for regime background image
}

const regimeConfig: Record<MarketRegime, RegimeConfig> = {
  BULL_QUIET: {
    label: "BULL QUIET",
    sdContext: "Trade Demand Zones",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    glowColor: "rgba(16, 185, 129, 0.4)",
    dotColor: "#10B981",
    bgImageClass: "regime-bg-bull",
  },
  BULL_VOLATILE: {
    label: "BULL VOLATILE",
    sdContext: "Demand Active • Wide Stops",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    glowColor: "rgba(16, 185, 129, 0.4)",
    dotColor: "#10B981",
    bgImageClass: "regime-bg-bull",
  },
  BEAR_QUIET: {
    label: "BEAR QUIET",
    sdContext: "Trade Supply Zones",
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    glowColor: "rgba(239, 68, 68, 0.4)",
    dotColor: "#EF4444",
    bgImageClass: "regime-bg-bear",
  },
  BEAR_VOLATILE: {
    label: "BEAR VOLATILE",
    sdContext: "Supply Active • Wide Stops",
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    glowColor: "rgba(239, 68, 68, 0.4)",
    dotColor: "#EF4444",
    bgImageClass: "regime-bg-bear",
  },
  RANGE_BOUND: {
    label: "RANGE BOUND",
    sdContext: "Fade Extremes",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    glowColor: "rgba(245, 158, 11, 0.4)",
    dotColor: "#F59E0B",
    bgImageClass: "regime-bg-range",
  },
};

const defaultConfig: RegimeConfig = {
  label: "LOADING",
  sdContext: "Analyzing...",
  color: "text-gray-400",
  bgColor: "bg-gray-500/10",
  borderColor: "border-gray-500/30",
  glowColor: "rgba(107, 114, 128, 0.4)",
  dotColor: "#6B7280",
  bgImageClass: "",
};

export function MarketRegimePill({ regime }: MarketRegimePillProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const config = regimeConfig[regime] ?? defaultConfig;

  const isBull = regime?.includes("BULL");
  const isBear = regime?.includes("BEAR");
  const isVolatile = regime?.includes("VOLATILE");

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Ambient glow background */}
      <div
        className="absolute inset-0 rounded-full blur-xl opacity-50 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle, ${config.glowColor} 0%, transparent 70%)`,
          transform: "scale(1.8)",
        }}
      />

      {/* Main pill container with regime background image */}
      <div
        className={`
          relative inline-flex items-center gap-3 px-5 py-2.5
          ${config.bgColor} ${config.borderColor} ${config.bgImageClass}
          border-2 rounded-full
          backdrop-blur-xl
          shadow-lg
          transition-all duration-500 ease-out
          hover:scale-105
          glass-sheen
          group
          overflow-hidden
        `}
        style={{
          boxShadow: `0 0 30px ${config.glowColor}, inset 0 1px 0 rgba(255,255,255,0.1)`,
        }}
      >
        {/* Live indicator with concentric ring pulse */}
        <div className="relative flex items-center justify-center w-5 h-5">
          {/* Outer ring - slow pulse */}
          <div
            className="absolute inset-0 rounded-full ring-pulse"
            style={{ backgroundColor: config.dotColor, opacity: 0.2 }}
          />
          {/* Middle ring - delayed pulse */}
          <div
            className="absolute inset-1 rounded-full ring-pulse ring-pulse-delay-1"
            style={{ backgroundColor: config.dotColor, opacity: 0.4 }}
          />
          {/* Core dot with glow */}
          <div
            className="relative w-2.5 h-2.5 rounded-full shadow-lg"
            style={{
              backgroundColor: config.dotColor,
              boxShadow: `0 0 10px ${config.dotColor}, 0 0 20px ${config.dotColor}50`,
            }}
          />
        </div>

        {/* Regime Label */}
        <div className="flex flex-col">
          <span
            className={`text-sm font-bold tracking-wide uppercase ${config.color}`}
          >
            {config.label}
          </span>
          <span
            className={`text-[10px] font-medium tracking-wider ${config.color} opacity-80`}
          >
            {config.sdContext}
          </span>
        </div>

        {/* Volatility waveform for volatile regimes */}
        {isVolatile && (
          <div className="flex items-end gap-0.5 h-5 ml-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-0.5 rounded-full animate-wave"
                style={{
                  height: "100%",
                  backgroundColor: config.dotColor,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Premium Tooltip */}
      {showTooltip && (
        <div className="tooltip-premium absolute left-1/2 -translate-x-1/2 bottom-full mb-3 whitespace-nowrap">
          <div className="text-center">
            <div className="font-semibold text-white mb-1">Market Regime</div>
            <div className="text-gray-400 text-[11px] leading-relaxed">
              {isBull && (
                <>
                  Bullish regime active.
                  <br />
                  <span className="text-emerald-400">
                    Demand zones are more reliable.
                  </span>
                </>
              )}
              {isBear && (
                <>
                  Bearish regime active.
                  <br />
                  <span className="text-red-400">
                    Supply zones are more reliable.
                  </span>
                </>
              )}
              {!isBull && !isBear && (
                <>
                  Range-bound conditions.
                  <br />
                  <span className="text-amber-400">
                    Fade moves at zone extremes.
                  </span>
                </>
              )}
              {isVolatile && (
                <div className="mt-1 text-amber-400">
                  ⚠️ High volatility - use wider stops
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
