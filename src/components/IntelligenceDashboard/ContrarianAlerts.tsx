import { useState, useMemo } from "react";

interface ContrarianAlertsProps {
  contrarianAlerts: string[];
  keyRisks: string[];
  painTrade?: {
    direction: "SHORT_SQUEEZE" | "LONG_SQUEEZE" | "NONE";
    description: string;
  };
  onLearnMore?: (topic: string) => void;
}

export function ContrarianAlerts({
  contrarianAlerts,
  keyRisks,
  painTrade,
  onLearnMore,
}: ContrarianAlertsProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [expandedSection, setExpandedSection] = useState<
    "alerts" | "risks" | null
  >(null);

  // Guard against undefined arrays
  const safeAlerts = contrarianAlerts ?? [];
  const safeRisks = keyRisks ?? [];

  const hasAlerts = safeAlerts.length > 0;
  const hasRisks = safeRisks.length > 0;
  const hasPainTrade = painTrade && painTrade.direction !== "NONE";

  // Calculate overall threat level for visual emphasis
  const threatLevel = useMemo(() => {
    let score = 0;
    if (hasPainTrade) score += 3;
    score += safeAlerts.length;
    score += safeRisks.length * 1.5;
    if (score >= 6) return "high";
    if (score >= 3) return "medium";
    return "low";
  }, [hasPainTrade, safeAlerts.length, safeRisks.length]);

  // Empty state with premium styling
  if (!hasAlerts && !hasRisks && !hasPainTrade) {
    return (
      <div className="glass-card-hero card-halo p-6">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-xs text-gray-400 uppercase tracking-widest font-medium">
            Contrarian Signals & Risks
          </h3>
          <InfoTooltip
            show={showTooltip}
            onShow={() => setShowTooltip(true)}
            onHide={() => setShowTooltip(false)}
            onLearnMore={onLearnMore}
          />
        </div>

        <div className="flex flex-col items-center justify-center py-10 relative">
          {/* Subtle animated rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-32 h-32 rounded-full border border-emerald-500/10 animate-ping-slow" />
            <div className="absolute w-24 h-24 rounded-full border border-emerald-500/20 animate-ping-slower" />
          </div>

          {/* Success icon with glow */}
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          <span className="text-sm font-medium text-emerald-400">
            All Clear
          </span>
          <span className="text-xs text-gray-500 mt-1">
            No contrarian signals or active risks
          </span>
        </div>

        <style>{`
          @keyframes ping-slow {
            0% { transform: scale(1); opacity: 0.3; }
            75%, 100% { transform: scale(1.5); opacity: 0; }
          }
          @keyframes ping-slower {
            0% { transform: scale(1); opacity: 0.2; }
            75%, 100% { transform: scale(2); opacity: 0; }
          }
          .animate-ping-slow {
            animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
          }
          .animate-ping-slower {
            animation: ping-slower 3s cubic-bezier(0, 0, 0.2, 1) infinite;
            animation-delay: 0.5s;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      className={`glass-card-hero card-halo p-6 relative overflow-hidden ${
        threatLevel === "high" ? "ring-1 ring-amber-500/30" : ""
      }`}
    >
      {/* Threat level gradient overlay */}
      {threatLevel !== "low" && (
        <div
          className={`absolute inset-0 opacity-5 pointer-events-none ${
            threatLevel === "high"
              ? "bg-gradient-to-br from-red-500 via-amber-500 to-transparent"
              : "bg-gradient-to-br from-amber-500 via-purple-500 to-transparent"
          }`}
        />
      )}

      {/* Header with threat indicator */}
      <div className="relative flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <h3 className="text-xs text-gray-400 uppercase tracking-widest font-medium">
            Contrarian Signals & Risks
          </h3>
          <InfoTooltip
            show={showTooltip}
            onShow={() => setShowTooltip(true)}
            onHide={() => setShowTooltip(false)}
            onLearnMore={onLearnMore}
          />
        </div>

        {/* Threat level badge */}
        <ThreatBadge level={threatLevel} />
      </div>

      <div className="relative space-y-4">
        {/* Pain Trade Alert - Most Important with premium styling */}
        {hasPainTrade && painTrade && painTrade.direction !== "NONE" && (
          <PainTradeCard
            direction={painTrade.direction}
            description={painTrade.description}
          />
        )}

        {/* Contrarian Alerts Section */}
        {hasAlerts && (
          <AlertSection
            title="Contrarian Opportunities"
            items={safeAlerts}
            type="contrarian"
            icon={
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
            }
            expanded={expandedSection === "alerts"}
            onToggle={() =>
              setExpandedSection(expandedSection === "alerts" ? null : "alerts")
            }
          />
        )}

        {/* Key Risks Section */}
        {hasRisks && (
          <AlertSection
            title="Key Risks"
            items={safeRisks}
            type="risk"
            icon={
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            }
            expanded={expandedSection === "risks"}
            onToggle={() =>
              setExpandedSection(expandedSection === "risks" ? null : "risks")
            }
          />
        )}
      </div>

      <style>{`
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
        @keyframes squeeze-pulse {
          0%, 100% { box-shadow: 0 0 20px 0 currentColor; }
          50% { box-shadow: 0 0 40px 10px currentColor; }
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        .animate-squeeze-pulse {
          animation: squeeze-pulse 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

// Info Tooltip Component
function InfoTooltip({
  show,
  onShow,
  onHide,
  onLearnMore,
}: {
  show: boolean;
  onShow: () => void;
  onHide: () => void;
  onLearnMore?: (topic: string) => void;
}) {
  return (
    <div className="relative" onMouseEnter={onShow} onMouseLeave={onHide}>
      <button className="w-4 h-4 rounded-full bg-gray-700/50 hover:bg-gray-600/50 flex items-center justify-center transition-colors">
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
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500/20 to-amber-500/20 flex items-center justify-center">
                <span className="text-sm">🎯</span>
              </div>
              <span className="font-semibold text-white text-sm">
                Contrarian & Risk Signals
              </span>
            </div>
            <div className="text-gray-400 text-[11px] leading-relaxed space-y-2">
              <p>
                These alerts identify{" "}
                <span className="text-white">
                  high-probability reversal opportunities
                </span>{" "}
                and risks that could invalidate S&D zone trades.
              </p>
              <div className="pt-2 border-t border-gray-700/50 space-y-1.5">
                <div className="flex items-start gap-2">
                  <span className="text-purple-400 text-xs shrink-0">⚡</span>
                  <span>
                    <span className="text-purple-400 font-medium">
                      Contrarian
                    </span>{" "}
                    — Crowd is wrong. Look for reversals at S&D zones.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-amber-400 text-xs shrink-0">⚠️</span>
                  <span>
                    <span className="text-amber-400 font-medium">Risks</span> —
                    Events that could invalidate your zones.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400 text-xs shrink-0">🔥</span>
                  <span>
                    <span className="text-emerald-400 font-medium">
                      Pain Trade
                    </span>{" "}
                    — Maximum pain scenario. Strong reversal catalyst.
                  </span>
                </div>
              </div>
              {onLearnMore && (
                <button
                  onClick={() =>
                    onLearnMore("contrarian signals pain trade supply demand")
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
  );
}

// Threat Level Badge
function ThreatBadge({ level }: { level: "low" | "medium" | "high" }) {
  const config = {
    low: {
      bg: "bg-emerald-500/20",
      text: "text-emerald-400",
      border: "border-emerald-500/30",
      label: "Low Risk",
    },
    medium: {
      bg: "bg-amber-500/20",
      text: "text-amber-400",
      border: "border-amber-500/30",
      label: "Elevated",
    },
    high: {
      bg: "bg-red-500/20",
      text: "text-red-400",
      border: "border-red-500/30",
      label: "High Alert",
    },
  };

  const c = config[level];

  return (
    <div
      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider
        ${c.bg} ${c.text} border ${c.border} flex items-center gap-1.5`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          level === "high"
            ? "bg-red-400 animate-pulse"
            : level === "medium"
              ? "bg-amber-400"
              : "bg-emerald-400"
        }`}
      />
      {c.label}
    </div>
  );
}

// Pain Trade Card - Premium styling for the most important alert
function PainTradeCard({
  direction,
  description,
}: {
  direction: "SHORT_SQUEEZE" | "LONG_SQUEEZE";
  description: string;
}) {
  const isShortSqueeze = direction === "SHORT_SQUEEZE";

  return (
    <div
      className={`relative p-5 rounded-xl overflow-hidden
        ${isShortSqueeze ? "bg-gradient-to-br from-emerald-500/15 via-emerald-500/10 to-transparent" : "bg-gradient-to-br from-red-500/15 via-red-500/10 to-transparent"}
        border ${isShortSqueeze ? "border-emerald-500/40" : "border-red-500/40"}
      `}
    >
      {/* Animated glow ring */}
      <div
        className={`absolute inset-0 rounded-xl opacity-30 animate-pulse-glow
          ${isShortSqueeze ? "shadow-[inset_0_0_30px_rgba(16,185,129,0.3)]" : "shadow-[inset_0_0_30px_rgba(239,68,68,0.3)]"}
        `}
      />

      {/* Corner accent */}
      <div
        className={`absolute top-0 right-0 w-24 h-24 opacity-20
          ${isShortSqueeze ? "bg-emerald-500" : "bg-red-500"}`}
        style={{
          borderRadius: "0 0 0 100%",
          filter: "blur(20px)",
        }}
      />

      <div className="relative flex items-start gap-4">
        {/* Icon with glow effect */}
        <div className="relative">
          <div
            className={`absolute inset-0 rounded-xl blur-md animate-pulse
              ${isShortSqueeze ? "bg-emerald-500/40" : "bg-red-500/40"}`}
          />
          <div
            className={`relative w-12 h-12 rounded-xl flex items-center justify-center
              ${isShortSqueeze ? "bg-emerald-500/20 border-emerald-500/50" : "bg-red-500/20 border-red-500/50"}
              border`}
          >
            <svg
              className={`w-6 h-6 ${isShortSqueeze ? "text-emerald-400" : "text-red-400"}`}
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
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-sm font-bold uppercase tracking-wide
                ${isShortSqueeze ? "text-emerald-400" : "text-red-400"}`}
            >
              Pain Trade Active
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-semibold
                ${isShortSqueeze ? "bg-emerald-500/30 text-emerald-300" : "bg-red-500/30 text-red-300"}`}
            >
              {direction.replace("_", " ")}
            </span>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">{description}</p>

          {/* Action hint */}
          <div
            className={`mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium
              ${isShortSqueeze ? "text-emerald-400/80" : "text-red-400/80"}`}
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
            {isShortSqueeze
              ? "Watch demand zones for long entries"
              : "Watch supply zones for short entries"}
          </div>
        </div>
      </div>
    </div>
  );
}

// Alert Section Component
function AlertSection({
  title,
  items,
  type,
  icon,
  expanded,
  onToggle,
}: {
  title: string;
  items: string[];
  type: "contrarian" | "risk";
  icon: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
}) {
  const colors = {
    contrarian: {
      bg: "bg-purple-500/10",
      border: "border-purple-500/30",
      icon: "bg-purple-500/20 text-purple-400",
      text: "text-purple-400",
      hover: "hover:bg-purple-500/20",
    },
    risk: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      icon: "bg-amber-500/20 text-amber-400",
      text: "text-amber-400",
      hover: "hover:bg-amber-500/20",
    },
  };

  const c = colors[type];
  const displayItems = expanded ? items : items.slice(0, 2);
  const hasMore = items.length > 2;

  return (
    <div className={`rounded-xl ${c.bg} border ${c.border} overflow-hidden`}>
      {/* Section header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center ${c.icon}`}
          >
            {icon}
          </div>
          <span
            className={`text-xs font-semibold uppercase tracking-wider ${c.text}`}
          >
            {title}
          </span>
          <span className="text-[10px] text-gray-500 bg-gray-800/50 px-1.5 py-0.5 rounded">
            {items.length}
          </span>
        </div>

        {hasMore && (
          <button
            onClick={onToggle}
            className={`text-[10px] font-medium ${c.text} ${c.hover} px-2 py-1 rounded transition-colors`}
          >
            {expanded ? "Show Less" : `+${items.length - 2} More`}
          </button>
        )}
      </div>

      {/* Alert items */}
      <div className="divide-y divide-white/5">
        {displayItems.map((item, index) => (
          <div
            key={`${type}-${index}`}
            className="px-4 py-3 flex items-start gap-3 transition-colors hover:bg-white/[0.02]"
          >
            <div
              className={`flex-shrink-0 w-1.5 h-1.5 rounded-full mt-1.5 ${
                type === "contrarian" ? "bg-purple-400" : "bg-amber-400"
              }`}
            />
            <span className="text-sm text-gray-300 leading-relaxed">
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
