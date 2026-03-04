/**
 * AI Chat API - Uses OpenAI via the backend for intelligent trading mentorship
 *
 * This module provides streaming chat functionality for the "Learn More with AI"
 * feature throughout the Intelligence Dashboard. It passes full market context
 * to the AI so it can provide specific, data-driven explanations.
 */

import type { MarketContext } from "@/components/IntelligenceDashboard/AIChatModal";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  marketContext?: MarketContext;
  toolContext?: {
    toolName: string;
    toolData: string;
    toolRecommendation: string;
  };
}

export type ChatEventHandler = {
  onChunk?: (chunk: string) => void;
  onDone?: () => void;
  onError?: (error: string) => void;
};

/**
 * Build a comprehensive system prompt that turns the AI into a trading mentor
 */
function buildSystemPrompt(
  marketContext?: MarketContext,
  toolContext?: {
    toolName: string;
    toolData: string;
    toolRecommendation: string;
  },
): string {
  let systemPrompt = `You are an expert trading mentor helping users understand institutional-grade market intelligence.
You explain complex trading concepts in simple terms while referencing ACTUAL current data.
You are friendly, educational, and always relate explanations back to actionable trading insights.

IMPORTANT GUIDELINES:
- Always reference the specific current values when explaining why something is the way it is
- Explain cause-and-effect relationships clearly
- Use analogies when helpful
- Keep responses concise but thorough
- Format with markdown for readability (bullets, bold for key terms)
- End with actionable takeaways when appropriate`;

  // Add current market context
  if (marketContext) {
    systemPrompt += `

CURRENT MARKET INTELLIGENCE (LIVE DATA):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Market Regime: ${marketContext.marketRegime}
🏦 Smart Money Bias: ${marketContext.smartMoneyBias}
⚡ Conviction Multiplier: ${marketContext.convictionMultiplier}x
😱 Fear & Greed: ${marketContext.fearGreedValue} (${marketContext.fearGreedLabel})
📈 VIX: ${marketContext.vixCurrent} (${marketContext.vixTermStructure})
🎯 Strategic Score: ${marketContext.strategicScore}/100
🎯 Tactical Score: ${marketContext.tacticalScore}/100

TODAY'S RECOMMENDATION: ${marketContext.recommendation}
REASONING:
${marketContext.reasoning?.map((r) => `• ${r}`).join("\n") || "Not available"}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

When explaining any metric, ALWAYS reference these actual values. For example:
- If asked why conviction is low, explain using the actual ${marketContext.convictionMultiplier}x value
- If asked about market conditions, reference the actual ${marketContext.marketRegime} regime
- If asked about risk, use the actual VIX of ${marketContext.vixCurrent}`;
  }

  // Add tool-specific context if user clicked "Learn More" on a specific tool
  if (toolContext) {
    systemPrompt += `

USER IS ASKING ABOUT: ${toolContext.toolName}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CURRENT DATA SHOWN: ${toolContext.toolData}
CURRENT RECOMMENDATION: ${toolContext.toolRecommendation}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The user clicked "Learn More with AI" on this specific tool.
Focus your explanation on this tool and its current readings.
Explain WHY this tool is showing what it's showing based on the underlying data.`;
  }

  return systemPrompt;
}

/**
 * Stream chat responses from the backend using Server-Sent Events
 *
 * This follows the same pattern as streamAnalysis() but for conversational AI
 */
export async function streamChat(
  request: ChatRequest,
  handlers: ChatEventHandler,
): Promise<() => void> {
  // Get auth token from localStorage
  const token = localStorage.getItem("auth_token");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Build system prompt with full context
  const systemPrompt = buildSystemPrompt(
    request.marketContext,
    request.toolContext,
  );

  // Prepare messages with system prompt
  const messagesWithSystem: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...request.messages,
  ];

  try {
    const response = await fetch(`${API_URL}/api/chat`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify({
        messages: messagesWithSystem,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      handlers.onError?.(
        errorText || `HTTP ${response.status}: ${response.statusText}`,
      );
      throw new Error(errorText || `HTTP error ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      handlers.onError?.("No response body");
      throw new Error("No response body");
    }

    let buffer = "";
    let cancelled = false;

    // Process stream
    const processStream = async () => {
      try {
        while (!cancelled) {
          const { done, value } = await reader.read();

          if (done) {
            handlers.onDone?.();
            break;
          }

          // Decode chunk
          buffer += decoder.decode(value, { stream: true });

          // Process complete SSE messages
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.trim()) continue;

            // Parse SSE format
            const eventMatch = line.match(/event:\s*(\w+)/);
            const dataMatch = line.match(/data:\s*(.+)/s);

            if (dataMatch) {
              const data = dataMatch[1];
              const event = eventMatch?.[1] || "chunk";

              switch (event) {
                case "chunk":
                  try {
                    const decodedChunk = JSON.parse(data);
                    handlers.onChunk?.(decodedChunk);
                  } catch {
                    handlers.onChunk?.(data);
                  }
                  break;

                case "done":
                  handlers.onDone?.();
                  break;

                case "error":
                  handlers.onError?.(data);
                  break;
              }
            }
          }
        }
      } catch (error) {
        if (!cancelled) {
          const errorMessage =
            error instanceof Error ? error.message : "Stream error";
          handlers.onError?.(errorMessage);
        }
      }
    };

    processStream();

    // Return cancel function
    return () => {
      cancelled = true;
      reader.cancel();
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Connection error";
    handlers.onError?.(errorMessage);
    return () => {};
  }
}

/**
 * Non-streaming chat fallback (for backends without SSE support)
 */
export async function sendChatMessage(request: ChatRequest): Promise<string> {
  const token = localStorage.getItem("auth_token");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const systemPrompt = buildSystemPrompt(
    request.marketContext,
    request.toolContext,
  );

  const messagesWithSystem: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...request.messages,
  ];

  const response = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify({
      messages: messagesWithSystem,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.content || data.message || "";
}
