/**
 * AI Chat Modal - Real OpenAI Integration for Trading Mentorship
 *
 * This modal provides intelligent, context-aware explanations using the
 * same OpenAI API connection as the chart analysis feature. When users
 * click "Learn More with AI" on any tool, the AI receives full context
 * about that tool's current data and recommendations.
 *
 * IMPORTANT: This component uses 100% real AI - NO canned content.
 * If the API fails, we show an error, NOT pre-written responses.
 */
import { useState, useRef, useEffect, useCallback } from "react";
import DOMPurify from "dompurify";
import { streamChat, sendChatMessage } from "@/lib/api/chat";
import type { ChatMessage } from "@/lib/api/chat";

interface Message {
  id: string;
  role: "user" | "assistant" | "error";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

// Full market context for intelligent responses
export interface MarketContext {
  marketRegime: string;
  smartMoneyBias: "BULLISH" | "BEARISH" | "NEUTRAL";
  convictionMultiplier: number;
  fearGreedValue: number;
  fearGreedLabel: string;
  vixCurrent: number;
  vixTermStructure: string;
  strategicScore: number;
  tacticalScore: number;
  recommendation: string;
  reasoning: string[];
}

// Tool-specific context for "Learn More with AI" buttons
export interface ToolContext {
  toolName: string;
  toolData: string;
  toolRecommendation: string;
}

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialContext?: string;
  marketContext?: MarketContext;
  toolContext?: ToolContext;
  title?: string;
}

export function AIChatModal({
  isOpen,
  onClose,
  initialContext,
  marketContext,
  toolContext,
  title = "AI Trading Mentor",
}: AIChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const cancelStreamRef = useRef<(() => void) | null>(null);
  const isMountedRef = useRef(true); // Track component mount state for safe async updates

  // Convert internal messages to API format
  const toApiMessages = useCallback((msgs: Message[]): ChatMessage[] => {
    return msgs
      .filter((m) => m.role !== "error")
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));
  }, []);

  // Track mount state to prevent updates after unmount/close
  useEffect(() => {
    isMountedRef.current = isOpen;
    return () => {
      isMountedRef.current = false;
    };
  }, [isOpen]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input and generate initial response when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setConnectionError(null);

      // If we have context, generate initial AI response
      if (messages.length === 0 && (initialContext || marketContext)) {
        const initialQuestion =
          initialContext || "What's today's edge and why?";

        // Add a "thinking" message placeholder
        const thinkingId = crypto.randomUUID();
        setMessages([
          {
            id: thinkingId,
            role: "assistant",
            content: "",
            timestamp: new Date(),
            isStreaming: true,
          },
        ]);
        setIsTyping(true);

        // Make the real API call
        sendInitialMessage(initialQuestion, thinkingId);
      }
    }
  }, [isOpen, initialContext, marketContext]);

  // Send initial context message to AI - 100% REAL AI, NO FALLBACKS
  const sendInitialMessage = async (question: string, messageId: string) => {
    let responseContent = "";

    try {
      cancelStreamRef.current = await streamChat(
        {
          messages: [{ role: "user", content: question }],
          marketContext,
          toolContext,
        },
        {
          onChunk: (chunk) => {
            if (!isMountedRef.current) return; // Guard against updates after close
            responseContent += chunk;
            setMessages([
              {
                id: messageId,
                role: "assistant",
                content: responseContent,
                timestamp: new Date(),
                isStreaming: true,
              },
            ]);
          },
          onDone: () => {
            if (!isMountedRef.current) return; // Guard against updates after close
            setMessages([
              {
                id: messageId,
                role: "assistant",
                content: responseContent,
                timestamp: new Date(),
                isStreaming: false,
              },
            ]);
            setIsTyping(false);
          },
          onError: async (errorMsg) => {
            if (!isMountedRef.current) return; // Guard against updates after close
            console.error("Chat stream error:", errorMsg);
            // Try non-streaming fallback
            try {
              const response = await sendChatMessage({
                messages: [{ role: "user", content: question }],
                marketContext,
                toolContext,
              });
              if (!isMountedRef.current) return; // Guard again after async call
              setMessages([
                {
                  id: messageId,
                  role: "assistant",
                  content: response,
                  timestamp: new Date(),
                  isStreaming: false,
                },
              ]);
            } catch (fallbackError) {
              if (!isMountedRef.current) return; // Guard against updates after close
              console.error("API request failed:", fallbackError);
              // Show ERROR - NOT canned content
              setMessages([
                {
                  id: messageId,
                  role: "error",
                  content:
                    "Unable to connect to AI service. Please check your connection and try again.",
                  timestamp: new Date(),
                  isStreaming: false,
                },
              ]);
              setConnectionError(
                "AI service temporarily unavailable. Please try again.",
              );
            }
            setIsTyping(false);
          },
        },
      );
    } catch (err) {
      console.error("Initial message error:", err);
      if (!isMountedRef.current) return; // Guard against updates after close
      // Show ERROR - NOT canned content
      setMessages([
        {
          id: messageId,
          role: "error",
          content:
            "Unable to connect to AI service. Please check your connection and try again.",
          timestamp: new Date(),
          isStreaming: false,
        },
      ]);
      setConnectionError(
        "AI service temporarily unavailable. Please try again.",
      );
      setIsTyping(false);
    }
  };

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Cancel any ongoing stream
      if (cancelStreamRef.current) {
        cancelStreamRef.current();
        cancelStreamRef.current = null;
      }
      setTimeout(() => {
        setMessages([]);
        setInput("");
        setConnectionError(null);
      }, 300);
    }
  }, [isOpen]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || isTyping) return;

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: input.trim(),
        timestamp: new Date(),
      };

      const aiMessageId = crypto.randomUUID();
      const updatedMessages = [...messages, userMessage];

      setMessages([
        ...updatedMessages,
        {
          id: aiMessageId,
          role: "assistant",
          content: "",
          timestamp: new Date(),
          isStreaming: true,
        },
      ]);
      setInput("");
      setIsTyping(true);
      setConnectionError(null);

      let responseContent = "";

      try {
        // Call the real API with streaming - 100% REAL AI
        cancelStreamRef.current = await streamChat(
          {
            messages: toApiMessages(updatedMessages),
            marketContext,
            toolContext,
          },
          {
            onChunk: (chunk) => {
              if (!isMountedRef.current) return; // Guard against updates after close
              responseContent += chunk;
              setMessages([
                ...updatedMessages,
                {
                  id: aiMessageId,
                  role: "assistant",
                  content: responseContent,
                  timestamp: new Date(),
                  isStreaming: true,
                },
              ]);
            },
            onDone: () => {
              if (!isMountedRef.current) return; // Guard against updates after close
              setMessages([
                ...updatedMessages,
                {
                  id: aiMessageId,
                  role: "assistant",
                  content: responseContent,
                  timestamp: new Date(),
                  isStreaming: false,
                },
              ]);
              setIsTyping(false);
            },
            onError: async (errorMsg) => {
              if (!isMountedRef.current) return; // Guard against updates after close
              console.error("Chat stream error:", errorMsg);
              // Try non-streaming fallback
              try {
                const response = await sendChatMessage({
                  messages: toApiMessages(updatedMessages),
                  marketContext,
                  toolContext,
                });
                if (!isMountedRef.current) return; // Guard again after async call
                setMessages([
                  ...updatedMessages,
                  {
                    id: aiMessageId,
                    role: "assistant",
                    content: response,
                    timestamp: new Date(),
                    isStreaming: false,
                  },
                ]);
              } catch (fallbackError) {
                if (!isMountedRef.current) return; // Guard against updates after close
                console.error("API request failed:", fallbackError);
                // Show ERROR - NOT canned content
                setMessages([
                  ...updatedMessages,
                  {
                    id: aiMessageId,
                    role: "error",
                    content:
                      "Unable to get AI response. Please check your connection and try again.",
                    timestamp: new Date(),
                    isStreaming: false,
                  },
                ]);
                setConnectionError(
                  "AI service temporarily unavailable. Please try again.",
                );
              }
              setIsTyping(false);
            },
          },
        );
      } catch (err) {
        console.error("Submit error:", err);
        if (!isMountedRef.current) return; // Guard against updates after close
        // Show ERROR - NOT canned content
        setMessages([
          ...updatedMessages,
          {
            id: aiMessageId,
            role: "error",
            content:
              "Unable to connect to AI service. Please check your connection and try again.",
            timestamp: new Date(),
            isStreaming: false,
          },
        ]);
        setConnectionError(
          "AI service temporarily unavailable. Please try again.",
        );
        setIsTyping(false);
      }
    },
    [input, messages, marketContext, toolContext, isTyping, toApiMessages],
  );

  // Retry last failed request
  const handleRetry = useCallback(() => {
    // Find the last user message before the error
    const lastUserMsgIndex = [...messages]
      .reverse()
      .findIndex((m) => m.role === "user");
    if (lastUserMsgIndex === -1) return;

    const actualIndex = messages.length - 1 - lastUserMsgIndex;
    const lastUserMsg = messages[actualIndex];

    // Remove error messages and retry
    const messagesWithoutErrors = messages.filter((m) => m.role !== "error");
    setMessages(messagesWithoutErrors);
    setInput(lastUserMsg.content);
    setConnectionError(null);
  }, [messages]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="chat-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-scale-in">
        {/* Glow effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl" />
        </div>
        <div className="absolute inset-0 noise-overlay pointer-events-none opacity-20" />

        {/* Header */}
        <div className="relative flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                />
              </svg>
            </div>
            <div>
              <h2 id="chat-title" className="text-lg font-bold text-white">
                {title}
              </h2>
              <p className="text-xs text-gray-400">
                {marketContext
                  ? "Powered by GPT • Using live market data"
                  : "Ask anything about trading concepts"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="relative flex-1 overflow-y-auto px-6 py-4 space-y-4 min-h-[300px]">
          {messages.length === 0 && !initialContext && !marketContext && (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-purple-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Your Trading Mentor
              </h3>
              <p className="text-sm text-gray-400 max-w-sm mb-6">
                I can explain any indicator on your dashboard, help you
                understand why conditions are what they are, and guide your
                trading decisions.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  "What's a supply zone?",
                  "How do I size positions?",
                  "Explain VIX levels",
                ].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => setInput(prompt)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Connection error banner */}
          {connectionError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-red-400"
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
                <span className="text-sm text-red-400">{connectionError}</span>
              </div>
              <button
                onClick={handleRetry}
                className="px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-sm font-medium transition-all"
              >
                Retry
              </button>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[90%] rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-purple-500/20 border border-purple-500/30 text-white"
                    : message.role === "error"
                      ? "bg-red-500/10 border border-red-500/30 text-red-300"
                      : "bg-white/5 border border-white/10 text-gray-200"
                }`}
              >
                {message.content ? (
                  <div
                    className="text-sm leading-relaxed whitespace-pre-wrap prose prose-invert prose-sm max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(
                        formatMessageContent(message.content),
                        { ALLOWED_TAGS: ["strong", "span", "br"] },
                      ),
                    }}
                  />
                ) : message.isStreaming ? (
                  <div className="flex items-center gap-1">
                    <span
                      className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                ) : null}
                {message.isStreaming && message.content && (
                  <span className="inline-block w-2 h-4 bg-purple-400 animate-pulse ml-1" />
                )}
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="relative px-6 py-4 border-t border-white/10 bg-white/[0.02]"
        >
          <div className="flex items-center gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                marketContext
                  ? 'Ask "why is conviction low?" or "explain the VIX reading"...'
                  : "Ask about supply zones, conviction, VIX..."
              }
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
          <p className="text-[10px] text-gray-500 mt-2 text-center">
            {marketContext
              ? "Powered by GPT • Using live data • Press Escape to close"
              : "Press Escape to close"}
          </p>
        </form>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
        .animate-scale-in { animation: scale-in 0.3s ease-out; }
      `}</style>
    </div>
  );
}

/**
 * Format message content with markdown-like styling
 */
function formatMessageContent(content: string): string {
  return content
    .replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="text-white font-semibold">$1</strong>',
    )
    .replace(/^• /gm, "→ ")
    .replace(/✅/g, '<span class="text-emerald-400">✅</span>')
    .replace(/⚠️/g, '<span class="text-amber-400">⚠️</span>')
    .replace(/❌/g, '<span class="text-red-400">❌</span>')
    .replace(/\n/g, "<br />");
}
