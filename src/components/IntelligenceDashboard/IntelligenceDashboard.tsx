import { useState, useCallback, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { institutionalApi } from "@/lib/api/institutional";
import type { InstitutionalIntelligence } from "@/lib/api/institutional";
import { MarketRegimePill } from "./MarketRegimePill";
import { SmartMoneyGauge } from "./SmartMoneyGauge";
import { ConvictionMeter } from "./ConvictionMeter";
import { FearGreedGauge } from "./FearGreedGauge";
import { VIXCard } from "./VIXCard";
import { COTPositioning } from "./COTPositioning";
import { SignalBreakdown } from "./SignalBreakdown";
import { ContrarianAlerts } from "./ContrarianAlerts";
import { TradingGuidance } from "./TradingGuidance";
import { ScoreCards } from "./ScoreCards";
import { TodaysEdge } from "./TodaysEdge";
import { AIChatModal } from "./AIChatModal";
import type { MarketContext, ToolContext } from "./AIChatModal";
// FloatingHelpButton removed - using Onboarding HelpButton from main.tsx instead

export function IntelligenceDashboard() {
  // AI Chat modal state
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [chatContext, setChatContext] = useState<string | undefined>();
  const [toolContext, setToolContext] = useState<ToolContext | undefined>();

  // Handler for "Ask Claude" / "Learn More" buttons with tool-specific context
  const handleAskClaude = useCallback((context: string, tool?: ToolContext) => {
    setChatContext(context);
    setToolContext(tool);
    setChatModalOpen(true);
  }, []);

  // Handler for floating help button (no pre-set context)
  const handleOpenHelp = useCallback(() => {
    setChatContext(undefined);
    setToolContext(undefined);
    setChatModalOpen(true);
  }, []);

  // Keyboard shortcut: ⌘K (Mac) or Ctrl+K (Windows/Linux) to open AI chat
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        handleOpenHelp();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleOpenHelp]);
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["institutional-intelligence"],
    queryFn: institutionalApi.getData,
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    retry: (count, err) => {
      // Don't retry when KV cache is empty - it won't help
      if ((err as Error)?.message === "DATA_NOT_INITIALIZED") return false;
      return count < 5;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 15000),
    // Network-level retries for transient failures
    networkMode: "always",
  });

  // Build MarketContext from live data for AI Chat
  // This provides full context to the AI about current market conditions
  const marketContext = useMemo<MarketContext | undefined>(() => {
    if (!data) return undefined;

    // Generate recommendation based on conviction
    const getRecommendation = () => {
      if (data.convictionMultiplier >= 1.2) return "HIGH CONVICTION SETUP";
      if (data.convictionMultiplier >= 0.8) return "STANDARD POSITION SIZE";
      if (data.convictionMultiplier >= 0.5) return "REDUCE SIZE";
      return "REDUCE SIZE OR SIT OUT";
    };

    // Generate reasoning from current data
    const getReasoning = (): string[] => {
      const reasons: string[] = [];

      // Conviction-based reasoning
      if (data.convictionMultiplier < 0.5) {
        reasons.push(
          `Low conviction multiplier (${data.convictionMultiplier.toFixed(2)}x) suggests poor alignment`,
        );
      } else if (data.convictionMultiplier >= 1.2) {
        reasons.push(
          `High conviction multiplier (${data.convictionMultiplier.toFixed(2)}x) indicates strong setup alignment`,
        );
      }

      // VIX-based reasoning
      const vix = data.rawData?.cboe?.vix?.current ?? 20;
      if (vix > 25) {
        reasons.push(
          `Elevated VIX (${vix.toFixed(1)}) suggests wider stops needed`,
        );
      } else if (vix < 15) {
        reasons.push(`Low VIX (${vix.toFixed(1)}) indicates calm conditions`);
      }

      // Fear & Greed reasoning
      const fg = data.rawData?.fearGreed?.value ?? 50;
      if (fg < 25) {
        reasons.push(`Extreme fear (${fg}) - potential contrarian opportunity`);
      } else if (fg > 75) {
        reasons.push(`Extreme greed (${fg}) - caution advised`);
      }

      // Smart Money reasoning
      if (data.smartMoneyBias === "BULLISH") {
        reasons.push("Institutional positioning favors demand zones");
      } else if (data.smartMoneyBias === "BEARISH") {
        reasons.push("Institutional positioning favors supply zones");
      }

      // Score-based reasoning
      if (data.strategicScore >= 70 && data.tacticalScore >= 70) {
        reasons.push(
          `Strong alignment: Strategic (${data.strategicScore}%) and Tactical (${data.tacticalScore}%) scores both elevated`,
        );
      } else if (data.strategicScore < 40 || data.tacticalScore < 40) {
        reasons.push(
          `Mixed signals: Strategic ${data.strategicScore}%, Tactical ${data.tacticalScore}%`,
        );
      }

      return reasons.length > 0
        ? reasons
        : ["Market conditions within normal range"];
    };

    return {
      marketRegime: data.marketRegime,
      smartMoneyBias: data.smartMoneyBias,
      convictionMultiplier: data.convictionMultiplier,
      fearGreedValue: data.rawData?.fearGreed?.value ?? 50,
      fearGreedLabel: data.rawData?.fearGreed?.valueText ?? "Neutral",
      vixCurrent: data.rawData?.cboe?.vix?.current ?? 20,
      vixTermStructure: data.rawData?.cboe?.vix?.termStructure ?? "contango",
      strategicScore: data.strategicScore,
      tacticalScore: data.tacticalScore,
      recommendation: getRecommendation(),
      reasoning: getReasoning(),
    };
  }, [data]);

  // Show loading state while fetching data
  if (isLoading) {
    return <IntelligenceSkeletonLoader />;
  }

  // Show error state with retry option - we ONLY show real data
  if (error || !data) {
    const isDataInitializing = (error as Error)?.message === "DATA_NOT_INITIALIZED";
    return (
      <div className="glass-card p-8 text-center">
        <div className={`mb-4 ${isDataInitializing ? "text-blue-400" : "text-amber-400"}`}>
          {isDataInitializing ? (
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          ) : (
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          {isDataInitializing ? "Market Data Initializing" : "Loading Market Intelligence"}
        </h3>
        <p className="text-gray-400 mb-6 max-w-md mx-auto">
          {isDataInitializing
            ? "Institutional market data is being populated for the first time. This typically completes within a few minutes. Check back shortly."
            : error
            ? "Connection to market data temporarily interrupted. Click retry to reconnect."
            : "Connecting to live market feed..."}
        </p>
        {!isDataInitializing && (
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isFetching ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Connecting...
              </span>
            ) : (
              "Retry Connection"
            )}
          </button>
        )}
        {isDataInitializing && (
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isFetching ? "Checking..." : "Check Again"}
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className="space-y-6 dashboard-bg-texture relative"
      data-tour="intelligence-dashboard"
    >
      {/* HERO: Today's Edge - Primary Trading Action */}
      {/* This is the first thing traders see - synthesizes ALL indicators into one actionable headline */}
      <div className="animate-slide-in stagger-1" data-tour="todays-edge">
        <TodaysEdge
          marketRegime={data.marketRegime}
          smartMoneyBias={data.smartMoneyBias}
          convictionMultiplier={data.convictionMultiplier}
          fearGreedValue={data.rawData?.fearGreed?.value ?? 50}
          vixCurrent={data.rawData?.cboe?.vix?.current ?? 20}
          strategicScore={data.strategicScore}
          tacticalScore={data.tacticalScore}
          onAskClaude={handleAskClaude}
          onRefresh={refetch}
          isRefreshing={isFetching}
        />
      </div>

      {/* Status Bar - Meta info row */}
      <div className="glass-card-elevated p-4 flex flex-wrap items-center justify-between gap-4 animate-slide-in stagger-2">
        <div className="flex items-center gap-6">
          <div data-tour="market-regime">
            <MarketRegimePill regime={data.marketRegime} />
          </div>
          <SmartMoneyGauge
            bias={data.smartMoneyBias}
            onLearnMore={handleAskClaude}
          />
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          {/* Refetching indicator */}
          {isFetching && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-blue-400 text-xs">Updating...</span>
            </div>
          )}
          <span>
            Last Updated:{" "}
            {data.lastUpdated
              ? new Date(data.lastUpdated).toLocaleTimeString()
              : "Awaiting data..."}
          </span>
          <DataQualityIndicator quality={data.dataQuality} />
        </div>
      </div>

      {/* COT Positioning - Institutional validation for S&D zones */}
      {/* Institutional positioning validates S&D zones - second in hierarchy */}
      <div className="animate-slide-in stagger-3" data-tour="cot-positioning">
        <COTPositioning
          contracts={(data.rawData?.cot?.contracts ?? []).map((c) => ({
            name: c.name ?? "Unknown",
            assetManagerNet: c.assetManagerNet ?? 0,
            leveragedNet: c.leveragedNet ?? 0,
            weeklyChange: c.weeklyChange ?? 0,
          }))}
          cotZScore={data.rawData?.cot?.cotZScore}
        />
      </div>

      {/* Conviction & Scores Row */}
      <div className="grid grid-cols-12 gap-4">
        {/* Strategic & Tactical Scores */}
        <div className="col-span-12 lg:col-span-4 animate-slide-in stagger-4">
          <ScoreCards
            strategicScore={data.strategicScore}
            tacticalScore={data.tacticalScore}
            convictionMultiplier={data.convictionMultiplier}
            onLearnMore={handleAskClaude}
          />
        </div>

        {/* Conviction Multiplier - Key for position sizing in S&D */}
        <div
          className="col-span-12 lg:col-span-4 animate-slide-in stagger-5"
          data-tour="conviction-meter"
        >
          <ConvictionMeter
            value={data.convictionMultiplier}
            onLearnMore={handleAskClaude}
          />
        </div>

        {/* Fear & Greed - Contrarian indicator for S&D extremes */}
        <div
          className="col-span-12 lg:col-span-4 animate-slide-in stagger-6"
          data-tour="fear-greed"
        >
          <FearGreedGauge
            value={data.rawData?.fearGreed?.value ?? 50}
            label={data.rawData?.fearGreed?.valueText ?? "Neutral"}
            onLearnMore={handleAskClaude}
          />
        </div>
      </div>

      {/* Volatility Context Row */}
      <div className="grid grid-cols-12 gap-4">
        {/* VIX Card - Volatility context for stop placement */}
        <div
          className="col-span-12 md:col-span-6 lg:col-span-4 animate-slide-in stagger-7"
          data-tour="vix-card"
        >
          <VIXCard
            current={data.rawData?.cboe?.vix?.current ?? 20}
            termStructure={data.rawData?.cboe?.vix?.termStructure ?? "contango"}
            onLearnMore={handleAskClaude}
          />
        </div>

        {/* Signals & Alerts - Trade validation */}
        <div className="col-span-12 md:col-span-6 lg:col-span-8 animate-slide-in stagger-7">
          <SignalBreakdown
            signals={data.signalBreakdown ?? []}
            strategicScore={data.strategicScore}
            tacticalScore={data.tacticalScore}
            onLearnMore={handleAskClaude}
          />
        </div>
      </div>

      {/* Risk & Contrarian Row */}
      <div className="animate-slide-in stagger-8">
        <ContrarianAlerts
          contrarianAlerts={data.contrarianAlerts ?? []}
          keyRisks={data.keyRisks ?? []}
          painTrade={data.painTrade}
          onLearnMore={handleAskClaude}
        />
      </div>

      {/* Trading Guidance - Final synthesis */}
      <div className="animate-slide-in stagger-9" data-tour="trading-guidance">
        <TradingGuidance
          guidance={data.tradingGuidance ?? "No trading guidance available."}
          marketRegime={data.marketRegime}
          convictionMultiplier={data.convictionMultiplier}
        />
      </div>

      {/* AI Chat Modal - Educational assistant for new traders */}
      {/* Now uses real OpenAI API with full market context for intelligent responses */}
      <AIChatModal
        isOpen={chatModalOpen}
        onClose={() => setChatModalOpen(false)}
        initialContext={chatContext}
        marketContext={marketContext}
        toolContext={toolContext}
        title="AI Trading Assistant"
      />

      {/* Note: Help button is rendered globally in main.tsx via Onboarding HelpButton */}
      {/* AI Chat can still be opened via ⌘K keyboard shortcut */}
    </div>
  );
}

// Data Quality Indicator
function DataQualityIndicator({
  quality,
}: {
  quality: InstitutionalIntelligence["dataQuality"] | undefined;
}) {
  const sources = [
    { key: "hasCOT", label: "COT" },
    { key: "hasFRED", label: "FRED" },
    { key: "hasCBOE", label: "CBOE" },
    { key: "hasFearGreed", label: "F&G" },
  ] as const;

  // Guard against undefined quality object
  if (!quality) {
    return (
      <div className="flex items-center gap-2">
        {sources.map(({ label }) => (
          <span
            key={label}
            className="px-2 py-0.5 rounded text-xs font-medium bg-gray-500/20 text-gray-400 border border-gray-500/30"
          >
            {label}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {sources.map(({ key, label }) => (
        <span
          key={key}
          className={`px-2 py-0.5 rounded text-xs font-medium ${
            quality[key]
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "bg-red-500/20 text-red-400 border border-red-500/30"
          }`}
        >
          {label}
        </span>
      ))}
    </div>
  );
}

// Skeleton Loader
function IntelligenceSkeletonLoader() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Top bar skeleton */}
      <div className="glass-card p-4 flex justify-between">
        <div className="flex gap-6">
          <div className="h-10 w-36 bg-gray-700/50 rounded-full" />
          <div className="h-10 w-48 bg-gray-700/50 rounded-lg" />
        </div>
        <div className="h-6 w-32 bg-gray-700/50 rounded" />
      </div>

      {/* Grid skeletons */}
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card p-6 h-48">
            <div className="h-4 w-24 bg-gray-700/50 rounded mb-4" />
            <div className="h-24 bg-gray-700/50 rounded" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-6 h-64">
          <div className="h-4 w-32 bg-gray-700/50 rounded mb-4" />
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 bg-gray-700/50 rounded" />
            ))}
          </div>
        </div>
        <div className="glass-card p-6 h-64">
          <div className="h-4 w-32 bg-gray-700/50 rounded mb-4" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-700/50 rounded" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default IntelligenceDashboard;
