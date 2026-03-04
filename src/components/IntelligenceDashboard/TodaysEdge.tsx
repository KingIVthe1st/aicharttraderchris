import { useMemo, useState, useEffect, useRef, useCallback } from "react";

type MarketRegime =
  | "BULL_QUIET"
  | "BULL_VOLATILE"
  | "BEAR_QUIET"
  | "BEAR_VOLATILE"
  | "RANGE_BOUND";

interface TodaysEdgeProps {
  marketRegime: MarketRegime;
  smartMoneyBias: "BULLISH" | "BEARISH" | "NEUTRAL";
  convictionMultiplier: number;
  fearGreedValue: number;
  vixCurrent: number;
  strategicScore: number;
  tacticalScore: number;
  // Delta values (vs yesterday) - optional, will show if provided
  convictionDelta?: number;
  fearGreedDelta?: number;
  vixDelta?: number;
  onAskClaude?: (context: string) => void;
  // Refresh functionality
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

// Professional SVG icons replacing emojis
const Icons = {
  target: (
    <svg
      className="w-8 h-8"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" strokeLinecap="round" />
    </svg>
  ),
  trendUp: (
    <svg
      className="w-8 h-8"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        d="M3 17l6-6 4 4 8-8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M17 7h4v4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  trendDown: (
    <svg
      className="w-8 h-8"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M3 7l6 6 4-4 8 8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 17h4v-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  warning: (
    <svg
      className="w-8 h-8"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  balance: (
    <svg
      className="w-8 h-8"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M12 3v18M3 12h18" strokeLinecap="round" />
      <circle cx="6" cy="8" r="2" />
      <circle cx="18" cy="16" r="2" />
      <path d="M6 10v6M18 10v4" strokeLinecap="round" />
    </svg>
  ),
  sparkle: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
    </svg>
  ),
};

// Text scramble hook - "hacker decode" effect
function useTextScramble(text: string, duration: number = 1500) {
  const [displayText, setDisplayText] = useState(text);
  const chars = "!<>-_\\/[]{}—=+*^?#________";

  useEffect(() => {
    let iteration = 0;
    const finalText = text;
    const interval = duration / (text.length * 3);

    const scramble = setInterval(() => {
      setDisplayText(
        finalText
          .split("")
          .map((char, index) => {
            if (index < iteration) {
              return finalText[index];
            }
            if (char === " ") return " ";
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join(""),
      );

      if (iteration >= finalText.length) {
        clearInterval(scramble);
      }
      iteration += 1 / 3;
    }, interval);

    return () => clearInterval(scramble);
  }, [text, duration]);

  return displayText;
}

// Delta badge component - shows change vs yesterday
function DeltaBadge({ value, label }: { value?: number; label: string }) {
  if (value === undefined || !Number.isFinite(value)) return null;

  const isPositive = value > 0;
  const isNeutral = Math.abs(value) < 0.1;

  return (
    <div
      className={`
      inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium
      ${isNeutral ? "bg-gray-500/20 text-gray-400" : isPositive ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}
    `}
      aria-label={`${label} change: ${isPositive ? "+" : ""}${value.toFixed(1)} vs yesterday`}
    >
      {!isNeutral && (
        <svg
          className="w-2.5 h-2.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d={isPositive ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
          />
        </svg>
      )}
      <span>
        {isPositive ? "+" : ""}
        {value.toFixed(1)}
      </span>
      <span className="opacity-60">vs yday</span>
    </div>
  );
}

export function TodaysEdge({
  marketRegime,
  smartMoneyBias,
  convictionMultiplier,
  fearGreedValue,
  vixCurrent,
  strategicScore,
  tacticalScore,
  convictionDelta,
  fearGreedDelta,
  vixDelta,
  onAskClaude,
  onRefresh,
  isRefreshing,
}: TodaysEdgeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

  // Cursor tracking for spotlight border effect
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  }, []);

  // Calculate today's primary recommendation
  const todaysEdge = useMemo(() => {
    const isInstitutionallyBullish = smartMoneyBias === "BULLISH";
    const isInstitutionallyBearish = smartMoneyBias === "BEARISH";
    const isHighConviction = convictionMultiplier >= 1.2;
    const isLowConviction = convictionMultiplier < 0.8;
    const isFearExtreme = fearGreedValue <= 25;
    const isGreedExtreme = fearGreedValue >= 75;
    const isHighVix = vixCurrent >= 25;

    // Primary recommendation logic
    if (isInstitutionallyBullish && isFearExtreme && isHighConviction) {
      return {
        headline: "STRONG BUY AT DEMAND ZONES",
        subtext:
          "Institutions are positioned long while retail panics. This is a high-probability setup for demand zone entries.",
        summary:
          "Smart money is buying what scared hands are selling. Wait for price to reach fresh demand zones for optimal entries.",
        bias: "BULLISH" as const,
        confidence: "HIGH" as const,
        icon: Icons.target,
        action: "Look for demand zones on ES/SPY for long entries",
        reasoning: [
          "COT data shows institutions net long",
          "Extreme fear creates buying opportunities",
          "High conviction multiplier validates setup",
        ],
      };
    }

    if (isInstitutionallyBearish && isGreedExtreme && isHighConviction) {
      return {
        headline: "STRONG SELL AT SUPPLY ZONES",
        subtext:
          "Institutions are positioned short while retail euphoria peaks. High-probability supply zone setups.",
        summary:
          "Smart money is selling into retail greed. Fresh supply zones offer excellent short entries.",
        bias: "BEARISH" as const,
        confidence: "HIGH" as const,
        icon: Icons.target,
        action: "Look for supply zones on ES/SPY for short entries",
        reasoning: [
          "COT data shows institutions net short",
          "Extreme greed indicates distribution",
          "High conviction confirms institutional positioning",
        ],
      };
    }

    if (isInstitutionallyBullish && isHighConviction) {
      return {
        headline: "FAVOR DEMAND ZONES",
        subtext:
          "Institutional positioning supports buying at demand. Prioritize long setups.",
        summary:
          "The weight of evidence favors bullish trades. Focus on fresh demand zones for entries.",
        bias: "BULLISH" as const,
        confidence: "MEDIUM" as const,
        icon: Icons.trendUp,
        action: "Prioritize long setups at fresh demand zones",
        reasoning: [
          "Smart money positioning is bullish",
          "Conviction supports standard sizing",
        ],
      };
    }

    if (isInstitutionallyBearish && isHighConviction) {
      return {
        headline: "FAVOR SUPPLY ZONES",
        subtext:
          "Institutional positioning supports selling at supply. Prioritize short setups.",
        summary:
          "The weight of evidence favors bearish trades. Focus on fresh supply zones for entries.",
        bias: "BEARISH" as const,
        confidence: "MEDIUM" as const,
        icon: Icons.trendDown,
        action: "Prioritize short setups at fresh supply zones",
        reasoning: [
          "Smart money positioning is bearish",
          "Conviction supports standard sizing",
        ],
      };
    }

    if (isLowConviction || isHighVix) {
      return {
        headline: "REDUCE SIZE OR SIT OUT",
        subtext: isHighVix
          ? "Elevated volatility increases stop-out risk. Trade smaller or wait for calmer conditions."
          : "Mixed signals reduce conviction. Protect capital by reducing exposure.",
        summary:
          "Capital preservation mode. Wait for clearer conditions or use minimal size.",
        bias: "NEUTRAL" as const,
        confidence: "LOW" as const,
        icon: Icons.warning,
        action: "Use smaller position sizes or wait for clearer signals",
        reasoning: isHighVix
          ? [
              "VIX above 25 indicates elevated risk",
              "Wider stops needed, reducing R:R",
            ]
          : ["Conflicting indicator readings", "Low conviction = low edge"],
      };
    }

    // Default neutral
    return {
      headline: "TRADE BOTH DIRECTIONS",
      subtext:
        "Neutral conditions — both demand and supply zones are valid. Let price action guide you.",
      summary:
        "No clear directional edge. Trade the best-looking zones regardless of direction.",
      bias: "NEUTRAL" as const,
      confidence: "MEDIUM" as const,
      icon: Icons.balance,
      action: "Trade any high-quality zone with standard sizing",
      reasoning: [
        "Balanced institutional positioning",
        "Trade what the chart shows",
      ],
    };
  }, [smartMoneyBias, convictionMultiplier, fearGreedValue, vixCurrent]);

  // Apply text scramble to headline
  const scrambledHeadline = useTextScramble(todaysEdge.headline, 1200);

  // Get colors based on bias
  const colors = useMemo(() => {
    switch (todaysEdge.bias) {
      case "BULLISH":
        return {
          gradient: "from-emerald-600/30 via-emerald-500/15 to-teal-500/10",
          mesh: "radial-gradient(at 20% 30%, rgba(16, 185, 129, 0.25) 0px, transparent 50%), radial-gradient(at 80% 70%, rgba(20, 184, 166, 0.2) 0px, transparent 50%), radial-gradient(at 50% 50%, rgba(16, 185, 129, 0.1) 0px, transparent 70%)",
          border: "border-emerald-500/40",
          text: "text-emerald-400",
          glow: "rgba(16, 185, 129, 0.4)",
          spotlightColor: "16, 185, 129",
        };
      case "BEARISH":
        return {
          gradient: "from-red-600/30 via-red-500/15 to-orange-500/10",
          mesh: "radial-gradient(at 20% 30%, rgba(239, 68, 68, 0.25) 0px, transparent 50%), radial-gradient(at 80% 70%, rgba(249, 115, 22, 0.2) 0px, transparent 50%), radial-gradient(at 50% 50%, rgba(239, 68, 68, 0.1) 0px, transparent 70%)",
          border: "border-red-500/40",
          text: "text-red-400",
          glow: "rgba(239, 68, 68, 0.4)",
          spotlightColor: "239, 68, 68",
        };
      default:
        return {
          gradient: "from-purple-600/25 via-blue-500/15 to-cyan-500/10",
          mesh: "radial-gradient(at 20% 30%, rgba(124, 58, 237, 0.2) 0px, transparent 50%), radial-gradient(at 80% 70%, rgba(30, 174, 219, 0.2) 0px, transparent 50%), radial-gradient(at 50% 50%, rgba(99, 102, 241, 0.1) 0px, transparent 70%)",
          border: "border-purple-500/30",
          text: "text-purple-400",
          glow: "rgba(124, 58, 237, 0.3)",
          spotlightColor: "124, 58, 237",
        };
    }
  }, [todaysEdge.bias]);

  // Confidence badge styling
  const confidenceBadge = useMemo(() => {
    switch (todaysEdge.confidence) {
      case "HIGH":
        return {
          bg: "bg-purple-500/25",
          text: "text-purple-300",
          border: "border-purple-400/40",
          label: "High Confidence",
        };
      case "MEDIUM":
        return {
          bg: "bg-blue-500/25",
          text: "text-blue-300",
          border: "border-blue-400/40",
          label: "Medium Confidence",
        };
      default:
        return {
          bg: "bg-amber-500/25",
          text: "text-amber-300",
          border: "border-amber-400/40",
          label: "Low Confidence",
        };
    }
  }, [todaysEdge.confidence]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="todays-edge-v2 relative rounded-3xl p-8 overflow-hidden"
      style={{
        background: `linear-gradient(135deg, rgba(10, 10, 20, 0.9) 0%, rgba(15, 15, 30, 0.95) 100%)`,
        boxShadow: `0 0 120px -30px ${colors.glow}, inset 0 1px 0 rgba(255,255,255,0.1)`,
      }}
    >
      {/* Mesh Gradient Background */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-700"
        style={{ backgroundImage: colors.mesh }}
      />

      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 noise-overlay pointer-events-none opacity-30" />

      {/* Cursor-tracking spotlight border */}
      <div
        className="absolute inset-0 pointer-events-none rounded-3xl transition-opacity duration-300 opacity-60 hover:opacity-100"
        style={{
          background: `radial-gradient(800px circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(${colors.spotlightColor}, 0.15), transparent 40%)`,
        }}
      />

      {/* Animated border glow */}
      <div
        className="absolute inset-0 rounded-3xl pointer-events-none"
        style={{
          padding: "1px",
          background: `radial-gradient(600px circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(${colors.spotlightColor}, 0.5), transparent 40%)`,
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Top badge row */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-gradient-to-r from-white/10 to-white/5 text-white border border-white/20 backdrop-blur-sm">
              <span className={colors.text}>{Icons.sparkle}</span>
              Today's Edge
            </span>
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${confidenceBadge.bg} ${confidenceBadge.text} ${confidenceBadge.border}`}
            >
              {confidenceBadge.label}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="font-medium">Live Analysis</span>
          </div>
        </div>

        {/* Main headline with scramble effect */}
        <div className="flex items-start justify-between gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-3">
              <div className={`${colors.text} transition-colors duration-500`}>
                {todaysEdge.icon}
              </div>
              <h1
                className={`text-3xl md:text-4xl font-black tracking-tight ${colors.text} headline-glow font-mono`}
              >
                {scrambledHeadline}
              </h1>
            </div>

            {/* Summary - new actionable context */}
            <p className="text-white/90 text-lg font-medium mb-2 max-w-2xl leading-relaxed">
              {todaysEdge.summary}
            </p>
            <p className="text-gray-400 text-sm mb-5 max-w-2xl">
              {todaysEdge.subtext}
            </p>

            {/* Reasoning bullets - helps new traders understand */}
            <div className="flex flex-wrap gap-2 mb-5">
              {todaysEdge.reasoning.map((reason, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300"
                >
                  <svg
                    className="w-3 h-3 text-emerald-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {reason}
                </span>
              ))}
            </div>

            {/* Action bar with Ask Claude button */}
            <div className="flex flex-wrap items-center gap-3">
              <div
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl ${colors.text} bg-white/5 border border-current/20`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
                <span className="text-sm font-semibold">
                  {todaysEdge.action}
                </span>
              </div>

              {onAskClaude && (
                <button
                  onClick={() =>
                    onAskClaude(
                      `Help me understand today's edge: ${todaysEdge.headline}. ${todaysEdge.summary}`,
                    )
                  }
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 text-purple-300 text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] animate-pulse-glow"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
                  </svg>
                  Ask the AI Why
                </button>
              )}
            </div>
          </div>

          {/* Conviction Score - Premium Big Number */}
          <div className="hidden lg:flex flex-col items-center justify-center p-6 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm min-w-[140px]">
            <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-semibold">
              Conviction
            </div>
            <div
              className={`text-5xl font-black font-mono tabular-nums ${
                convictionMultiplier >= 1.2
                  ? "text-purple-400"
                  : convictionMultiplier >= 1.0
                    ? "text-emerald-400"
                    : convictionMultiplier >= 0.8
                      ? "text-amber-400"
                      : "text-red-400"
              }`}
              style={{
                textShadow:
                  convictionMultiplier >= 1.2
                    ? "0 0 30px rgba(124, 58, 237, 0.5)"
                    : undefined,
              }}
            >
              {convictionMultiplier.toFixed(1)}x
            </div>
            <div className="text-[10px] text-gray-500 mt-1 font-medium">
              {convictionMultiplier >= 1.2
                ? "Full Size"
                : convictionMultiplier >= 1.0
                  ? "Standard"
                  : convictionMultiplier >= 0.8
                    ? "Reduced"
                    : "Minimal"}
            </div>
            <DeltaBadge value={convictionDelta} label="conviction" />
          </div>
        </div>

        {/* Key metrics row - streamlined, with deltas */}
        <div className="flex flex-wrap items-center gap-4 mt-8 pt-6 border-t border-white/10">
          {/* Smart Money - Primary indicator */}
          <div
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${
              smartMoneyBias === "BULLISH"
                ? "bg-emerald-500/10 border-emerald-500/30"
                : smartMoneyBias === "BEARISH"
                  ? "bg-red-500/10 border-red-500/30"
                  : "bg-gray-500/10 border-gray-500/30"
            }`}
          >
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">
                Smart Money
              </span>
              <span
                className={`text-lg font-bold ${
                  smartMoneyBias === "BULLISH"
                    ? "text-emerald-400"
                    : smartMoneyBias === "BEARISH"
                      ? "text-red-400"
                      : "text-gray-300"
                }`}
              >
                {smartMoneyBias}
              </span>
            </div>
          </div>

          {/* VIX with delta */}
          <div
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${
              vixCurrent >= 30
                ? "bg-red-500/10 border-red-500/30"
                : vixCurrent >= 22
                  ? "bg-amber-500/10 border-amber-500/30"
                  : "bg-gray-500/10 border-gray-500/30"
            }`}
          >
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">
                VIX
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`text-lg font-mono font-bold ${
                    vixCurrent >= 30
                      ? "text-red-400"
                      : vixCurrent >= 22
                        ? "text-amber-400"
                        : "text-gray-300"
                  }`}
                >
                  {vixCurrent.toFixed(1)}
                </span>
                <DeltaBadge value={vixDelta} label="vix" />
              </div>
            </div>
          </div>

          {/* Fear & Greed with delta */}
          <div
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${
              fearGreedValue <= 25
                ? "bg-red-500/10 border-red-500/30"
                : fearGreedValue >= 75
                  ? "bg-emerald-500/10 border-emerald-500/30"
                  : "bg-gray-500/10 border-gray-500/30"
            }`}
          >
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">
                Fear & Greed
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`text-lg font-mono font-bold ${
                    fearGreedValue <= 25
                      ? "text-red-400"
                      : fearGreedValue >= 75
                        ? "text-emerald-400"
                        : "text-gray-300"
                  }`}
                >
                  {Math.round(fearGreedValue)}
                </span>
                <DeltaBadge value={fearGreedDelta} label="fg" />
              </div>
            </div>
          </div>

          {/* Market Regime */}
          <div
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${
              marketRegime?.includes("BULL")
                ? "bg-emerald-500/10 border-emerald-500/30"
                : marketRegime?.includes("BEAR")
                  ? "bg-red-500/10 border-red-500/30"
                  : "bg-amber-500/10 border-amber-500/30"
            }`}
          >
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">
                Regime
              </span>
              <span
                className={`text-sm font-bold ${
                  marketRegime?.includes("BULL")
                    ? "text-emerald-400"
                    : marketRegime?.includes("BEAR")
                      ? "text-red-400"
                      : "text-amber-400"
                }`}
              >
                {marketRegime?.replace("_", " ") ?? "LOADING"}
              </span>
            </div>
          </div>

          {/* Scores - Combined */}
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border bg-purple-500/10 border-purple-500/30">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">
                Scores
              </span>
              <div className="flex items-center gap-3">
                <span className="text-sm">
                  <span className="text-gray-400">Str:</span>{" "}
                  <span className="font-mono font-bold text-purple-400">
                    {strategicScore}%
                  </span>
                </span>
                <span className="text-gray-600">|</span>
                <span className="text-sm">
                  <span className="text-gray-400">Tac:</span>{" "}
                  <span className="font-mono font-bold text-blue-400">
                    {tacticalScore}%
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Refresh Live Data Button - Premium Floating Style */}
      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className={`
            absolute bottom-4 right-4 z-20
            group flex items-center gap-2.5 px-4 py-2.5
            rounded-xl backdrop-blur-xl
            bg-gradient-to-r from-white/[0.08] to-white/[0.03]
            border border-white/20 hover:border-purple-400/50
            text-sm font-semibold text-gray-300 hover:text-white
            shadow-lg shadow-black/20
            transition-all duration-300 ease-out
            hover:shadow-purple-500/20 hover:shadow-xl
            hover:scale-[1.03] active:scale-[0.98]
            disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100
            ${isRefreshing ? "border-purple-500/50" : ""}
          `}
          style={{
            boxShadow: isRefreshing
              ? "0 0 30px rgba(168, 85, 247, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)"
              : undefined,
          }}
        >
          {/* Animated glow ring when refreshing */}
          {isRefreshing && (
            <div className="absolute inset-0 rounded-xl overflow-hidden">
              <div
                className="absolute inset-0 animate-spin-slow"
                style={{
                  background:
                    "conic-gradient(from 0deg, transparent, rgba(168, 85, 247, 0.4), transparent)",
                }}
              />
            </div>
          )}

          {/* Icon */}
          <div className="relative">
            <svg
              className={`w-4 h-4 transition-transform duration-500 ${
                isRefreshing ? "animate-spin" : "group-hover:rotate-180"
              }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12a9 9 0 11-9-9" />
              <path d="M21 3v9h-9" />
            </svg>
          </div>

          {/* Label */}
          <span className="relative">
            {isRefreshing ? "Refreshing..." : "Refresh Live Data"}
          </span>

          {/* Sparkle indicator */}
          {!isRefreshing && (
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50" />
          )}
        </button>
      )}
    </div>
  );
}
