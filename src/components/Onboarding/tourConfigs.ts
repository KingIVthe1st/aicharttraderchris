/**
 * Tour Configuration System
 * Version-controlled, feature-gated tour definitions
 */

export interface TourStep {
  id: string;
  targetSelector: string;
  title: string;
  description: string;
  position: "top" | "bottom" | "left" | "right" | "center";
  spotlightPadding?: number;
  waitForElement?: boolean;
  action?: "click" | "hover" | "none";
  highlight?: boolean;
  // Optional: condition to show this step
  showIf?: () => boolean;
}

export interface TourConfig {
  id: string;
  version: number;
  name: string;
  description: string;
  steps: TourStep[];
  // Conditions
  requiresAuth?: boolean;
  requiresSubscription?: boolean;
  showOnce?: boolean;
  // Analytics
  analyticsKey?: string;
}

// =============================================================================
// WELCOME TOUR - First-time user experience
// =============================================================================
export const welcomeTour: TourConfig = {
  id: "welcome-tour",
  version: 2,
  name: "Welcome to Chart Trader AI",
  description: "Learn the basics of AI-powered chart analysis",
  showOnce: true,
  requiresAuth: true,
  analyticsKey: "onboarding_welcome",
  steps: [
    {
      id: "welcome-1-mode-selector",
      targetSelector: '[data-tour="mode-selector"]',
      title: "Choose Your Analysis Mode",
      description:
        "Trader Mode gives you quick, actionable setups (150-250 words). Mentor Mode teaches you WHY the setups work with full explanations. Switch anytime!",
      position: "top",
      spotlightPadding: 12,
      highlight: true,
    },
    {
      id: "welcome-2-upload-area",
      targetSelector: '[data-tour="upload-area"]',
      title: "Upload Your Charts",
      description:
        "Drag & drop charts here, paste from clipboard (Ctrl+V), or type your question. Start with higher timeframes (Daily, 4H) then add lower timeframes for precision entries.",
      position: "top",
      spotlightPadding: 16,
      highlight: true,
    },
    {
      id: "welcome-3-add-chart",
      targetSelector: '[data-tour="add-chart-button"]',
      title: "Add More Charts",
      description:
        "Click here to upload additional chart images. Multi-timeframe analysis gives the AI better context for accurate setups.",
      position: "top",
      spotlightPadding: 8,
    },
    {
      id: "welcome-4-analyze-button",
      targetSelector: '[data-tour="analyze-button"]',
      title: "Get AI Analysis",
      description:
        "Click to receive supply/demand zones, trade setups with scores, and risk assessment. The AI will always show you 3 ranked setups with adjusted scores based on time of day!",
      position: "top",
      spotlightPadding: 8,
      highlight: true,
    },
  ],
};

// =============================================================================
// ANALYSIS RESULTS TOUR - Understanding AI output
// This tour is triggered contextually after first analysis
// =============================================================================
export const analysisResultsTour: TourConfig = {
  id: "analysis-results-tour",
  version: 2,
  name: "Understanding Your Analysis",
  description: "Learn to read AI-generated trade setups",
  showOnce: true,
  requiresAuth: true,
  analyticsKey: "onboarding_analysis",
  steps: [
    {
      id: "results-1-overview",
      targetSelector: '[data-tour="upload-area"]',
      title: "Reading Your Analysis",
      description:
        "The AI provides: Market Regime (Trending/Ranging/Volatile), Session timing with score adjustments, and 3 ranked trade setups with confidence scores.",
      position: "top",
      spotlightPadding: 16,
      highlight: true,
    },
    {
      id: "results-2-scores",
      targetSelector: '[data-tour="mode-selector"]',
      title: "Understanding Scores",
      description:
        "Each setup has a score (0-100). 70+ = High probability, 50-69 = Medium, <50 = Low. Scores adjust based on time of day - prime hours (9:45-11:30 ET) get bonuses!",
      position: "top",
      spotlightPadding: 12,
    },
    {
      id: "results-3-follow-up",
      targetSelector: '[data-tour="follow-up-input"]',
      title: "Refine Your Analysis",
      description:
        'Ask follow-up questions to drill deeper: "What invalidates this setup?", "Show me alternative entries", or "Explain the zone formation".',
      position: "top",
      spotlightPadding: 12,
      highlight: true,
    },
  ],
};

// =============================================================================
// CONVERSATION TOUR - Multi-turn analysis
// =============================================================================
export const conversationTour: TourConfig = {
  id: "conversation-tour",
  version: 2,
  name: "Continue the Conversation",
  description: "Learn to have multi-turn analysis sessions",
  showOnce: true,
  requiresAuth: true,
  analyticsKey: "onboarding_conversation",
  steps: [
    {
      id: "convo-1-add-chart",
      targetSelector: '[data-tour="add-chart-button"]',
      title: "Add More Charts",
      description:
        "Upload additional timeframes without starting over. The AI remembers context from your previous charts and analysis.",
      position: "top",
      spotlightPadding: 8,
    },
    {
      id: "convo-2-follow-up",
      targetSelector: '[data-tour="follow-up-input"]',
      title: "Ask Follow-up Questions",
      description:
        'Type questions like "What if price breaks below 6830?" or "Show me short setups instead". The AI maintains context and adapts to your needs.',
      position: "top",
      spotlightPadding: 12,
      highlight: true,
    },
    {
      id: "convo-3-mode-switch",
      targetSelector: '[data-tour="mode-selector"]',
      title: "Switch Modes Anytime",
      description:
        "Change between Trader and Mentor modes mid-conversation. Your selected mode persists throughout the chat session.",
      position: "top",
      spotlightPadding: 8,
    },
  ],
};

// =============================================================================
// INTELLIGENCE DASHBOARD TOUR - Understanding institutional data for S&D trading
// =============================================================================
export const intelligenceDashboardTour: TourConfig = {
  id: "intelligence-dashboard-tour",
  version: 1,
  name: "Intelligence Dashboard for S&D Trading",
  description:
    "Learn how to use institutional data to validate Supply & Demand zones",
  showOnce: true,
  requiresAuth: true,
  analyticsKey: "onboarding_intelligence_dashboard",
  steps: [
    {
      id: "intel-1-overview",
      targetSelector: '[data-tour="intelligence-dashboard"]',
      title: "Welcome to Market Intelligence",
      description:
        'This dashboard provides institutional-grade data to help validate your Supply & Demand zone trades. Think of it as your "smart money radar" - showing you what the big players are doing.',
      position: "center",
      spotlightPadding: 20,
      highlight: true,
    },
    {
      id: "intel-2-market-regime",
      targetSelector: '[data-tour="market-regime"]',
      title: "Market Regime - Your Trading Filter",
      description:
        "This shows the current market state. In BULL regimes, focus on Demand zones (longs). In BEAR regimes, focus on Supply zones (shorts). RANGE-BOUND means fade extremes. The S&D context tells you exactly which zones to prioritize.",
      position: "bottom",
      spotlightPadding: 12,
      highlight: true,
    },
    {
      id: "intel-3-cot-positioning",
      targetSelector: '[data-tour="cot-positioning"]',
      title: "COT Data - Zone Validation Tool",
      description:
        'This is KEY for S&D trading! Asset Managers (pension funds, institutions) = "Smart Money". When they\'re net LONG, Demand zones are more reliable. When net SHORT, Supply zones are stronger. Use this to filter your zone trades!',
      position: "top",
      spotlightPadding: 16,
      highlight: true,
    },
    {
      id: "intel-4-conviction",
      targetSelector: '[data-tour="conviction-meter"]',
      title: "Conviction Multiplier - Position Sizing",
      description:
        "Multiply your base position size by this value. 1.3x+ means all signals aligned - go full size at your S&D zone. Below 0.7x? Either skip the trade or use tiny size. This prevents you from taking weak setups.",
      position: "top",
      spotlightPadding: 12,
    },
    {
      id: "intel-5-fear-greed",
      targetSelector: '[data-tour="fear-greed"]',
      title: "Fear & Greed - Contrarian Filter",
      description:
        "Use this as a contrarian signal! Extreme Fear (0-25) = Demand zones are STRONGER. Extreme Greed (75-100) = Supply zones are STRONGER. The best S&D setups occur at sentiment extremes.",
      position: "top",
      spotlightPadding: 12,
    },
    {
      id: "intel-6-vix",
      targetSelector: '[data-tour="vix-card"]',
      title: "VIX - Stop Placement Guide",
      description:
        "VIX tells you how to set stops at your S&D zones. Low VIX (<15) = tight stops, precision entries. High VIX (>25) = wider stops, reduced size. Backwardation (purple badge) means fear spike - zones may overshoot initially.",
      position: "top",
      spotlightPadding: 12,
    },
    {
      id: "intel-7-guidance",
      targetSelector: '[data-tour="trading-guidance"]',
      title: "Trading Guidance - AI Synthesis",
      description:
        "This synthesizes ALL the data into plain-English guidance for your S&D trading. It tells you which zones to prioritize, position sizing recommendations, and key risks to watch. Check this before every trade!",
      position: "top",
      spotlightPadding: 16,
      highlight: true,
    },
  ],
};

// =============================================================================
// All tours registry
// =============================================================================
export const allTours: Record<string, TourConfig> = {
  [welcomeTour.id]: welcomeTour,
  [analysisResultsTour.id]: analysisResultsTour,
  [conversationTour.id]: conversationTour,
  [intelligenceDashboardTour.id]: intelligenceDashboardTour,
};

// Helper to get tour by ID with version check
export function getTour(tourId: string): TourConfig | null {
  return allTours[tourId] || null;
}

// Get all tours that should auto-start for new users
export function getAutoStartTours(): TourConfig[] {
  return Object.values(allTours).filter((tour) => tour.showOnce);
}
