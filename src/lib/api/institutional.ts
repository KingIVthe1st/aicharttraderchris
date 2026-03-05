import apiClient from "../api-client";
import { AxiosError } from "axios";

// Types for Institutional Intelligence Data
export interface InstitutionalIntelligence {
  marketRegime:
    | "BULL_QUIET"
    | "BULL_VOLATILE"
    | "BEAR_QUIET"
    | "BEAR_VOLATILE"
    | "RANGE_BOUND";
  smartMoneyBias: "BULLISH" | "BEARISH" | "NEUTRAL";
  convictionMultiplier: number;
  strategicScore: number; // 1-10
  tacticalScore: number; // 1-10
  signalBreakdown: string[];
  contrarianAlerts: string[];
  keyRisks: string[];
  tradingGuidance: string;
  painTrade: {
    direction: "SHORT_SQUEEZE" | "LONG_SQUEEZE" | "NONE";
    description: string;
  };
  lastUpdated: string;
  dataQuality: {
    hasCOT: boolean;
    hasFRED: boolean;
    hasCBOE: boolean;
    hasFearGreed: boolean;
  };
  rawData?: {
    cot?: {
      contracts?: Array<{
        name?: string;
        assetManagerNet?: number;
        leveragedNet?: number;
        weeklyChange?: number;
        assetManagers?: { netPosition: number; weeklyChange: number };
        leveragedFunds?: { netPosition: number; weeklyChange: number };
      }>;
      cotZScore?: number;
      lastUpdated?: string;
    };
    fred?: {
      series: {
        fedBalanceSheet: number;
        treasuryBalance: number;
        reverseRepo: number;
        netLiquidity: number;
        financialStressIndex: number;
      };
      lastUpdated: string;
    };
    cboe?: {
      vix: {
        current: number;
        termStructure: "contango" | "backwardation";
      };
      putCallRatio: {
        value: number;
        signal: string;
      };
    };
    fearGreed?: {
      value: number;
      valueText: string;
      previousClose: number;
    };
  };
}

export interface InstitutionalHealthResponse {
  status: string;
  hasData: boolean;
  lastUpdated: string | null;
  dataQuality: {
    hasCOT: boolean;
    hasFRED: boolean;
    hasCBOE: boolean;
    hasFearGreed: boolean;
    hasIntelligence: boolean;
  };
}

// Helper to refresh session and update token
async function refreshSessionAndRetry(): Promise<boolean> {
  try {
    // Try to get a fresh session from the backend
    const response = await apiClient.get("/auth/session");
    if (response.data?.user) {
      return true; // Session is valid
    }
    return false;
  } catch {
    return false;
  }
}

// Helper to wait with exponential backoff
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Backend response structure (different from InstitutionalIntelligence)
interface BackendInstitutionalResponse {
  success: boolean;
  data: {
    lastUpdated: string;
    cot?: any;
    fred?: any;
    cboe?: any;
    fearGreed?: any;
    compositeSignal?: any;
    intelligence: {
      marketRegime: string;
      regimeDescription?: string;
      institutionalAlignment?: number;
      strategicScore: number;
      tacticalScore: number;
      smartMoneyBias: string;
      convictionMultiplier: number;
      vixAdjustment?: number;
      painTrade: any;
      contrarianAlerts: string[];
      tradingGuidance: string;
      keyRisks: string[];
      signalBreakdown: string[];
      dataQuality: any;
    };
  };
  isStale: boolean;
  ageHours: number;
}

// Fetch institutional intelligence data with robust retry logic
export async function getInstitutionalData(): Promise<InstitutionalIntelligence> {
  const MAX_RETRIES = 3;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await apiClient.get<BackendInstitutionalResponse>(
        "/institutional/data",
      );

      // Extract and transform the nested data structure
      const backendData = response.data;

      if (!backendData?.success) {
        throw new Error("Invalid response structure from backend");
      }

      // KV cache is empty - data hasn't been initialized yet (not an error, just not ready)
      if (!backendData?.data) {
        lastError = new Error("DATA_NOT_INITIALIZED");
        break; // Don't retry - retrying won't help, KV is just empty
      }

      if (!backendData?.data?.intelligence) {
        throw new Error("Invalid response structure from backend");
      }

      const intel = backendData.data.intelligence;
      const rawData = backendData.data;

      // Transform to expected InstitutionalIntelligence format
      const result: InstitutionalIntelligence = {
        marketRegime:
          intel.marketRegime as InstitutionalIntelligence["marketRegime"],
        smartMoneyBias:
          intel.smartMoneyBias as InstitutionalIntelligence["smartMoneyBias"],
        convictionMultiplier: intel.convictionMultiplier,
        strategicScore: intel.strategicScore,
        tacticalScore: intel.tacticalScore,
        signalBreakdown: intel.signalBreakdown || [],
        contrarianAlerts: intel.contrarianAlerts || [],
        keyRisks: intel.keyRisks || [],
        tradingGuidance: intel.tradingGuidance || "No guidance available",
        painTrade: intel.painTrade || { direction: "NONE", description: "" },
        lastUpdated: rawData.lastUpdated,
        dataQuality: intel.dataQuality || {
          hasCOT: !!rawData.cot,
          hasFRED: !!rawData.fred,
          hasCBOE: !!rawData.cboe,
          hasFearGreed: !!rawData.fearGreed,
        },
        rawData: {
          cot: rawData.cot
            ? {
                contracts: Object.entries(rawData.cot.contracts || {}).map(
                  ([name, data]: [string, any]) => ({
                    name,
                    assetManagerNet: data?.assetManagers?.netPosition,
                    leveragedNet: data?.leveragedFunds?.netPosition,
                    weeklyChange: data?.assetManagers?.weeklyChange,
                    assetManagers: data?.assetManagers,
                    leveragedFunds: data?.leveragedFunds,
                  }),
                ),
                cotZScore: rawData.cot.cotZScore,
                lastUpdated: rawData.cot.lastUpdated,
              }
            : undefined,
          fred: rawData.fred
            ? {
                series: {
                  fedBalanceSheet: rawData.fred.series?.fedBalanceSheet,
                  treasuryBalance: rawData.fred.series?.treasuryGeneral,
                  reverseRepo: rawData.fred.series?.reverseRepo,
                  netLiquidity: rawData.fred.series?.netLiquidity,
                  financialStressIndex:
                    rawData.fred.series?.financialStressIndex,
                },
                lastUpdated: rawData.fred.lastUpdated,
              }
            : undefined,
          cboe: rawData.cboe
            ? {
                vix: {
                  current: rawData.cboe.vix?.current,
                  termStructure: rawData.cboe.vix?.termStructure || "contango",
                },
                putCallRatio: {
                  value: rawData.cboe.putCallRatio?.total,
                  signal: rawData.cboe.putCallRatio?.signal || "neutral",
                },
              }
            : undefined,
          fearGreed: rawData.fearGreed
            ? {
                value: rawData.fearGreed.current,
                valueText: rawData.fearGreed.classification || "neutral",
                previousClose: rawData.fearGreed.previous,
              }
            : undefined,
        },
      };

      console.log("[Institutional API] Data loaded successfully:", {
        regime: result.marketRegime,
        strategic: result.strategicScore,
        tactical: result.tacticalScore,
        conviction: result.convictionMultiplier,
      });

      return result;
    } catch (error) {
      lastError = error as Error;
      const axiosError = error as AxiosError;

      // If 401 Unauthorized, try to refresh session
      if (axiosError.response?.status === 401) {
        console.log(
          `[Institutional API] Auth failed (attempt ${attempt + 1}), refreshing session...`,
        );
        const sessionRefreshed = await refreshSessionAndRetry();

        if (!sessionRefreshed) {
          // Session couldn't be refreshed - user needs to re-login
          throw new Error("Session expired. Please sign in again.");
        }
        // Session refreshed, retry immediately
        continue;
      }

      // For other errors (500, network issues), wait and retry
      if (attempt < MAX_RETRIES - 1) {
        const backoffMs = Math.min(1000 * Math.pow(2, attempt), 5000);
        console.log(
          `[Institutional API] Request failed (attempt ${attempt + 1}), retrying in ${backoffMs}ms...`,
        );
        await delay(backoffMs);
      }
    }
  }

  // All retries exhausted
  throw lastError || new Error("Failed to fetch institutional data");
}

// Check health of institutional data
export async function getInstitutionalHealth(): Promise<InstitutionalHealthResponse> {
  const response = await apiClient.get<InstitutionalHealthResponse>(
    "/institutional/health",
  );
  return response.data;
}

// Trigger data refresh (admin only)
export async function triggerInstitutionalRefresh(): Promise<{
  success: boolean;
  message: string;
}> {
  const response = await apiClient.post<{ success: boolean; message: string }>(
    "/institutional/trigger",
  );
  return response.data;
}

export const institutionalApi = {
  getData: getInstitutionalData,
  getHealth: getInstitutionalHealth,
  triggerRefresh: triggerInstitutionalRefresh,
};
