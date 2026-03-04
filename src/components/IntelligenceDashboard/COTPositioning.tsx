import { useState, useMemo } from "react";

interface COTContract {
  name: string;
  assetManagerNet: number;
  leveragedNet: number;
  weeklyChange: number;
}

interface COTPositioningProps {
  contracts: COTContract[];
  cotZScore?: number;
}

// Mini Sparkline component for trend visualization
function MiniSparkline({
  data,
  color,
  height = 24,
  width = 60,
}: {
  data: number[];
  color: string;
  height?: number;
  width?: number;
}) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((value, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  const gradientId = `sparkline-gradient-${Math.random().toString(36).slice(2)}`;

  return (
    <svg
      width={width}
      height={height}
      className="overflow-visible"
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Area fill */}
      <polygon
        points={`0,${height} ${points} ${width},${height}`}
        fill={`url(#${gradientId})`}
      />
      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End point dot */}
      <circle
        cx={width}
        cy={height - ((data[data.length - 1] - min) / range) * height}
        r="2"
        fill={color}
      />
    </svg>
  );
}

// Percentile Pill showing historical context
function PercentilePill({ percentile }: { percentile: number }) {
  const getColor = () => {
    if (percentile >= 80)
      return "text-purple-400 bg-purple-500/20 border-purple-500/30";
    if (percentile >= 60)
      return "text-emerald-400 bg-emerald-500/20 border-emerald-500/30";
    if (percentile >= 40)
      return "text-gray-400 bg-gray-500/20 border-gray-500/30";
    if (percentile >= 20)
      return "text-amber-400 bg-amber-500/20 border-amber-500/30";
    return "text-red-400 bg-red-500/20 border-red-500/30";
  };

  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getColor()}`}
    >
      {percentile}th %ile
    </span>
  );
}

// Smart Money Divergence Badge
function DivergenceBadge({
  assetManagerNet,
  leveragedNet,
}: {
  assetManagerNet: number;
  leveragedNet: number;
}) {
  const isDivergent =
    (assetManagerNet > 0 && leveragedNet < 0) ||
    (assetManagerNet < 0 && leveragedNet > 0);

  if (!isDivergent) return null;

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
      <svg
        className="w-3 h-3"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
      DIVERGENCE
    </span>
  );
}

export function COTPositioning({ contracts, cotZScore }: COTPositioningProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Handle empty contracts array - show empty state
  if (!contracts || contracts.length === 0) {
    return (
      <div className="glass-card p-6">
        <h3 className="text-xs text-gray-400 uppercase tracking-widest font-medium mb-4">
          COT Positioning
        </h3>
        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
          <svg
            className="w-12 h-12 mb-3 opacity-50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <span className="text-sm">No COT data available</span>
          <span className="text-xs text-gray-600 mt-1">
            Data updates weekly on Fridays
          </span>
        </div>
      </div>
    );
  }

  // Calculate primary contract data (first one is ES - S&P 500)
  const primaryContract = contracts[0];

  // Determine institutional bias based on Asset Manager positioning
  const institutionalBias = useMemo(() => {
    const netPosition = primaryContract?.assetManagerNet ?? 0;
    if (netPosition > 50000) return "STRONGLY_BULLISH";
    if (netPosition > 10000) return "BULLISH";
    if (netPosition < -50000) return "STRONGLY_BEARISH";
    if (netPosition < -10000) return "BEARISH";
    return "NEUTRAL";
  }, [primaryContract]);

  // Generate headline based on positioning
  const getHeadline = () => {
    switch (institutionalBias) {
      case "STRONGLY_BULLISH":
        return {
          text: "INSTITUTIONS FAVOR DEMAND ZONES",
          subtext: "Heavy long positioning supports buying at demand",
          color: "text-emerald-400",
          bgColor: "bg-emerald-500/10",
          borderColor: "border-emerald-500/30",
          icon: "🟢",
        };
      case "BULLISH":
        return {
          text: "LEAN TOWARD DEMAND ZONES",
          subtext: "Net long bias supports demand zone entries",
          color: "text-emerald-400",
          bgColor: "bg-emerald-500/10",
          borderColor: "border-emerald-500/30",
          icon: "🔹",
        };
      case "STRONGLY_BEARISH":
        return {
          text: "INSTITUTIONS FAVOR SUPPLY ZONES",
          subtext: "Heavy short positioning supports selling at supply",
          color: "text-red-400",
          bgColor: "bg-red-500/10",
          borderColor: "border-red-500/30",
          icon: "🔴",
        };
      case "BEARISH":
        return {
          text: "LEAN TOWARD SUPPLY ZONES",
          subtext: "Net short bias supports supply zone entries",
          color: "text-red-400",
          bgColor: "bg-red-500/10",
          borderColor: "border-red-500/30",
          icon: "🔻",
        };
      default:
        return {
          text: "NEUTRAL POSITIONING",
          subtext: "Trade both demand and supply zones equally",
          color: "text-gray-400",
          bgColor: "bg-gray-500/10",
          borderColor: "border-gray-500/30",
          icon: "⚪",
        };
    }
  };

  const headline = getHeadline();

  // Calculate percentile (simulated based on z-score if available)
  const percentile = useMemo(() => {
    if (cotZScore !== undefined) {
      // Convert z-score to percentile using approximate normal distribution
      const z = Math.abs(cotZScore);
      if (z >= 2) return cotZScore > 0 ? 97 : 3;
      if (z >= 1.5) return cotZScore > 0 ? 93 : 7;
      if (z >= 1) return cotZScore > 0 ? 84 : 16;
      if (z >= 0.5) return cotZScore > 0 ? 69 : 31;
      return 50;
    }
    return 50;
  }, [cotZScore]);

  // Mock sparkline data (in production, this would come from historical data)
  const sparklineData = useMemo(() => {
    const baseValue = primaryContract?.assetManagerNet ?? 0;
    // Generate 12 weeks of simulated historical data trending toward current
    return Array.from({ length: 12 }, (_, i) => {
      const progress = i / 11;
      const randomNoise = (Math.random() - 0.5) * Math.abs(baseValue) * 0.3;
      return baseValue * progress + randomNoise;
    });
  }, [primaryContract]);

  // Find max value for scaling
  const allValues = contracts.flatMap((c) => [
    Math.abs(c.assetManagerNet ?? 0),
    Math.abs(c.leveragedNet ?? 0),
  ]);
  const maxValue = allValues.length > 0 ? Math.max(...allValues, 1) : 1;

  const formatNumber = (num: number) => {
    if (Math.abs(num) >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (Math.abs(num) >= 1000) {
      return `${(num / 1000).toFixed(0)}K`;
    }
    return num.toFixed(0);
  };

  return (
    <div className="cot-hero-card relative rounded-2xl p-6">
      {/* HERO HEADLINE - The Answer at a Glance */}
      <div
        className={`mb-6 p-4 rounded-xl ${headline.bgColor} border ${headline.borderColor}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{headline.icon}</span>
              <h2
                className={`text-lg font-bold ${headline.color} tracking-tight`}
              >
                {headline.text}
              </h2>
            </div>
            <p className="text-xs text-gray-400">{headline.subtext}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <PercentilePill percentile={percentile} />
            <MiniSparkline
              data={sparklineData}
              color={headline.color.replace("text-", "#").replace("-400", "")}
              height={28}
              width={80}
            />
          </div>
        </div>
      </div>

      {/* Header with tooltip */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-xs text-gray-400 uppercase tracking-widest font-medium">
            COT Positioning
          </h3>
          <div
            className="relative"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <button
              aria-label="Learn more about COT positioning"
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

            {/* S&D Educational Tooltip - Using fixed positioning to escape overflow */}
            {showTooltip && (
              <div
                className="tooltip-premium fixed left-1/2 -translate-x-1/2 w-80 z-[9999]"
                style={{ top: "20%" }}
              >
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <span className="text-purple-400 text-sm">📊</span>
                    </div>
                    <span className="font-semibold text-white text-sm">
                      S&D Zone Validation
                    </span>
                  </div>
                  <div className="text-gray-400 text-[11px] leading-relaxed space-y-2">
                    <p>
                      <span className="text-emerald-400 font-medium">
                        Asset Managers
                      </span>{" "}
                      = "Smart Money" (pension funds, institutions). Their
                      positioning validates{" "}
                      <span className="text-white">Demand/Supply zones</span>.
                    </p>
                    <p>
                      <span className="text-blue-400 font-medium">
                        Leveraged Funds
                      </span>{" "}
                      = Hedge funds. Often wrong at extremes — use as{" "}
                      <span className="text-amber-400">contrarian signal</span>.
                    </p>
                    <div className="pt-2 border-t border-gray-700/50 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400">✓</span>
                        <span>
                          Asset Mgr LONG + Demand Zone ={" "}
                          <span className="text-emerald-400">
                            High confidence long
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-red-400">✓</span>
                        <span>
                          Asset Mgr SHORT + Supply Zone ={" "}
                          <span className="text-red-400">
                            High confidence short
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-amber-400">⚡</span>
                        <span>
                          Divergence (opposite positions) ={" "}
                          <span className="text-amber-400">
                            Increased volatility expected
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-400 border border-purple-500/30">
            Key for S&D
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Divergence indicator if applicable */}
          {primaryContract && (
            <DivergenceBadge
              assetManagerNet={primaryContract.assetManagerNet}
              leveragedNet={primaryContract.leveragedNet}
            />
          )}

          {cotZScore !== undefined && (
            <div
              className={`
                text-xs font-mono px-2 py-1 rounded
                ${
                  Math.abs(cotZScore) > 2
                    ? "bg-purple-500/20 text-purple-400"
                    : Math.abs(cotZScore) > 1
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-gray-500/20 text-gray-400"
                }
              `}
            >
              Z: {cotZScore.toFixed(2)}σ
            </div>
          )}
        </div>
      </div>

      {/* Contract Bars */}
      <div className="space-y-4">
        {contracts.map((contract) => (
          <div key={contract.name} className="space-y-2">
            {/* Contract name */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">
                {contract.name}
              </span>
              <span
                className={`
                  delta-indicator
                  ${
                    contract.weeklyChange > 0
                      ? "delta-positive"
                      : contract.weeklyChange < 0
                        ? "delta-negative"
                        : "bg-gray-500/20 text-gray-400"
                  }
                `}
              >
                {contract.weeklyChange > 0
                  ? "↑"
                  : contract.weeklyChange < 0
                    ? "↓"
                    : ""}
                {contract.weeklyChange > 0 ? "+" : ""}
                {formatNumber(contract.weeklyChange)} wk
              </span>
            </div>

            {/* Asset Managers bar - SMART MONEY */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-emerald-400/80 w-20 font-medium tracking-wide">
                  Asset Mgrs
                </span>
                <div className="flex-1 h-6 bg-gray-800/60 rounded-lg overflow-hidden relative border border-gray-700/30">
                  {/* Center line with label */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-500/80 z-10" />
                  <div className="absolute left-1/2 -translate-x-1/2 top-0 text-[8px] text-gray-500 font-medium">
                    0
                  </div>

                  {/* Bar */}
                  <div
                    className={`
                      absolute top-1 bottom-1 transition-all duration-700 ease-out rounded-sm
                      ${
                        contract.assetManagerNet >= 0
                          ? "bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400 left-1/2"
                          : "bg-gradient-to-l from-red-600 via-red-500 to-red-400 right-1/2"
                      }
                    `}
                    style={{
                      width: `${(Math.abs(contract.assetManagerNet) / maxValue) * 50}%`,
                    }}
                  />

                  {/* Glow on extreme positions */}
                  {Math.abs(contract.assetManagerNet) > maxValue * 0.7 && (
                    <div
                      className={`
                        absolute top-0 bottom-0 blur-md opacity-60
                        ${contract.assetManagerNet >= 0 ? "bg-emerald-400 left-1/2" : "bg-red-400 right-1/2"}
                      `}
                      style={{
                        width: `${(Math.abs(contract.assetManagerNet) / maxValue) * 50}%`,
                      }}
                    />
                  )}
                </div>
                <span
                  className={`
                    text-xs font-mono w-16 text-right font-bold tabular-nums
                    ${contract.assetManagerNet >= 0 ? "text-emerald-400" : "text-red-400"}
                  `}
                >
                  {contract.assetManagerNet >= 0 ? "+" : ""}
                  {formatNumber(contract.assetManagerNet)}
                </span>
              </div>

              {/* Leveraged Funds bar */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-blue-400/80 w-20 font-medium tracking-wide">
                  Lev. Funds
                </span>
                <div className="flex-1 h-6 bg-gray-800/60 rounded-lg overflow-hidden relative border border-gray-700/30">
                  {/* Center line */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-500/80 z-10" />

                  {/* Bar */}
                  <div
                    className={`
                      absolute top-1 bottom-1 transition-all duration-700 ease-out rounded-sm
                      ${
                        contract.leveragedNet >= 0
                          ? "bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 left-1/2"
                          : "bg-gradient-to-l from-orange-600 via-orange-500 to-orange-400 right-1/2"
                      }
                    `}
                    style={{
                      width: `${(Math.abs(contract.leveragedNet) / maxValue) * 50}%`,
                    }}
                  />
                </div>
                <span
                  className={`
                    text-xs font-mono w-16 text-right font-bold tabular-nums
                    ${contract.leveragedNet >= 0 ? "text-blue-400" : "text-orange-400"}
                  `}
                >
                  {contract.leveragedNet >= 0 ? "+" : ""}
                  {formatNumber(contract.leveragedNet)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Legend */}
      <div className="mt-4 pt-4 border-t border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-[10px] text-gray-500">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-gradient-to-r from-emerald-600 to-emerald-400" />
              <span>Long</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-gradient-to-r from-red-600 to-red-400" />
              <span>Short</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-gradient-to-r from-blue-600 to-blue-400" />
              <span>Lev Long</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-gradient-to-r from-orange-600 to-orange-400" />
              <span>Lev Short</span>
            </div>
          </div>
          <div className="text-[10px] text-gray-600">
            Updated weekly on Fridays
          </div>
        </div>
      </div>
    </div>
  );
}
