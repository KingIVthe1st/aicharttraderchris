interface TradingGuidanceProps {
  guidance: string;
  marketRegime: string;
  convictionMultiplier: number;
}

export function TradingGuidance({
  guidance,
  marketRegime,
  convictionMultiplier,
}: TradingGuidanceProps) {
  // Guard against undefined/null values
  const safeGuidance = guidance ?? "No trading guidance available.";
  const safeRegime = marketRegime ?? "NEUTRAL";
  const safeMultiplier = Number.isFinite(convictionMultiplier)
    ? convictionMultiplier
    : 1.0;

  // Parse guidance for key action words
  const highlightKeywords = (text: string) => {
    const keywords = {
      bullish: "text-emerald-400 font-semibold",
      bearish: "text-red-400 font-semibold",
      long: "text-emerald-400 font-semibold",
      short: "text-red-400 font-semibold",
      buy: "text-emerald-400 font-semibold",
      sell: "text-red-400 font-semibold",
      caution: "text-amber-400 font-semibold",
      risk: "text-amber-400 font-semibold",
      wait: "text-blue-400 font-semibold",
      neutral: "text-gray-400 font-semibold",
      squeeze: "text-purple-400 font-semibold",
      extreme: "text-purple-400 font-semibold",
    };

    let result = text;
    Object.entries(keywords).forEach(([word, className]) => {
      const regex = new RegExp(`\\b(${word}\\w*)\\b`, "gi");
      result = result.replace(regex, `<span class="${className}">$1</span>`);
    });
    return result;
  };

  // Get regime-specific styling
  const getRegimeStyle = () => {
    if (safeRegime.includes("BULL")) {
      return {
        border: "border-emerald-500/30",
        glow: "shadow-emerald-500/10",
        icon: "text-emerald-400",
      };
    }
    if (safeRegime.includes("BEAR")) {
      return {
        border: "border-red-500/30",
        glow: "shadow-red-500/10",
        icon: "text-red-400",
      };
    }
    return {
      border: "border-amber-500/30",
      glow: "shadow-amber-500/10",
      icon: "text-amber-400",
    };
  };

  const style = getRegimeStyle();

  return (
    <div
      className={`glass-card p-6 border ${style.border} shadow-lg ${style.glow}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs text-gray-400 uppercase tracking-widest font-medium">
          AI Trading Guidance
        </h3>
        <div className="flex items-center gap-2">
          {/* AI indicator */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-gray-800/50">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[10px] text-cyan-400 font-medium">AI</span>
          </div>
        </div>
      </div>

      {/* Main guidance text */}
      <div
        className="text-sm text-gray-300 leading-relaxed mb-4"
        dangerouslySetInnerHTML={{ __html: highlightKeywords(safeGuidance) }}
      />

      {/* Quick stats */}
      <div className="flex items-center gap-4 pt-4 border-t border-gray-700/50">
        <div className="flex items-center gap-2">
          <svg
            className={`w-4 h-4 ${style.icon}`}
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
          <span className="text-xs text-gray-500">
            Regime:{" "}
            <span className={style.icon}>{safeRegime.replace("_", " ")}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <svg
            className={`w-4 h-4 ${
              safeMultiplier >= 1
                ? "text-emerald-400"
                : safeMultiplier >= 0.7
                  ? "text-amber-400"
                  : "text-red-400"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <span className="text-xs text-gray-500">
            Size:{" "}
            <span
              className={`font-mono ${
                safeMultiplier >= 1
                  ? "text-emerald-400"
                  : safeMultiplier >= 0.7
                    ? "text-amber-400"
                    : "text-red-400"
              }`}
            >
              {safeMultiplier.toFixed(1)}x
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
