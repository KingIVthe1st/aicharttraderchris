// API Type Definitions

// Analysis Types
export type AnalysisAction = "trade" | "no_trade" | "need_inputs";
export type AnalysisStatus = "trade" | "no_trade" | "need_inputs" | "error";

export interface AnalysisValidation {
  tickPrecisionOk: boolean;
  rrOk: boolean;
  biasAligned: boolean;
  atmExact: boolean;
}

export interface AnalysisPriceLevels {
  entry: number;
  stop: number;
  targets: number[];
}

export interface AnalysisResult {
  action: AnalysisAction;
  rationale: string[];
  validation: AnalysisValidation;
  priceLevels: AnalysisPriceLevels;
  riskDisclosure: string;
  managementNotes?: string;
}

export interface ChartData {
  url: string;
  type: "daily" | "ltf" | string;
  timeframe?: string;
  description?: string;
}

export interface ATMData {
  bias?: "long" | "short";
  entry?: number;
  distal?: number;
  stop_ticks: number;
  target_ticks: number[];
  breakeven?: number;
  image_url?: string | null;
}

// Conversation Message Types
export interface ConversationMessage {
  role: "user" | "assistant" | "system";
  content: string;
  images?: string[]; // URLs to images for this message
  timestamp?: string;
}

export interface AnalyzeRequest {
  instrument: string;
  contract: string;
  charts: ChartData[];
  atm: ATMData;
  useConversation?: boolean;
  conversationHistory?: ConversationMessage[]; // Full conversation context
  mode?: "trader" | "mentor"; // Analysis mode: trader (concise) or mentor (educational)
}

// SSE Event Types
export type SSEEvent = "chunk" | "done" | "error";

export interface SSEChunkEvent {
  event: "chunk";
  data: string;
}

export interface SSEDoneEvent {
  event: "done";
  data: AnalysisResult;
}

export interface SSEErrorEvent {
  event: "error";
  data: string;
}

// File Upload Types
export type FileKind = "chart" | "atm_screenshot" | "pdf";

export interface UploadUrlRequest {
  fileName: string;
  fileType: string;
  fileKind: FileKind;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  finalUrl: string;
  fileId: string;
}

// Auth Types
export type UserRole = "user" | "admin";
export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "canceled"
  | "incomplete"
  | "past_due";

export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  role: UserRole;
  subscriptionStatus?: SubscriptionStatus;
  subscriptionEndDate?: number; // Unix timestamp
  canceledAt?: number; // Unix timestamp
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export interface Session {
  user: User;
  expires: string;
}

// Stripe Types
export interface CheckoutRequest {
  successUrl?: string;
  cancelUrl?: string;
  couponCode?: string;
}

export interface CheckoutResponse {
  url: string;
}

export interface ValidateCouponRequest {
  couponCode: string;
}

export interface ValidateCouponResponse {
  valid: boolean;
  error?: string;
  couponId?: string;
  originalPrice?: number;
  finalPrice?: number;
  discount?: string;
  duration?: string;
}

// Analysis History Types
export interface AnalysisHistoryItem {
  id: string;
  instrument: string;
  contract: string;
  status: AnalysisStatus;
  summaryText: string;
  latencyMs: number | null;
  createdAt: string;
}

export interface AnalysisHistoryResponse {
  analyses: AnalysisHistoryItem[];
}

// Tick Spec Types
export interface TickSpec {
  symbol: string;
  tick: number;
  multiplier: number;
}

// ATM Calculation Types
export interface ATMCalculateRequest {
  instrument: string;
  entry?: number;
  distal?: number;
  stop_ticks: number;
  target_ticks: number[];
}

export interface ExactFitResult {
  exact: boolean;
  reasons: string[];
}
