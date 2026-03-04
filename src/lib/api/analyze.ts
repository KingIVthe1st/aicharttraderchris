import type {
  AnalyzeRequest,
  AnalysisResult,
} from '@/types/api';

// SSE event types from backend
type SSEEvent = 'chunk' | 'tool' | 'done' | 'error';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export type AnalysisEventHandler = {
  onChunk?: (chunk: string) => void;
  onDone?: (result: AnalysisResult) => void;
  onError?: (error: string) => void;
  onComplete?: () => void;
};

/**
 * Stream analysis results from the backend using Server-Sent Events
 */
export async function streamAnalysis(
  payload: AnalyzeRequest,
  handlers: AnalysisEventHandler
): Promise<() => void> {
  // Get auth token from localStorage
  const token = localStorage.getItem('auth_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/api/analyze`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    handlers.onError?.(errorText || `HTTP ${response.status}: ${response.statusText}`);
    handlers.onComplete?.();
    throw new Error(errorText || `HTTP error ${response.status}`);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    handlers.onError?.('No response body');
    handlers.onComplete?.();
    throw new Error('No response body');
  }

  let buffer = '';
  let cancelled = false;

  // Process stream
  const processStream = async () => {
    try {
      while (!cancelled) {
        const { done, value } = await reader.read();

        if (done) {
          handlers.onComplete?.();
          break;
        }

        // Decode chunk
        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE messages
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || ''; // Keep incomplete message in buffer

        for (const line of lines) {
          if (!line.trim()) continue;

          // Parse SSE format: "event: eventName\ndata: eventData"
          const eventMatch = line.match(/event:\s*(\w+)/);
          const dataMatch = line.match(/data:\s*(.+)/s);

          if (!eventMatch || !dataMatch) continue;

          const event = eventMatch[1] as SSEEvent;
          const data = dataMatch[1];

          switch (event) {
            case 'chunk':
              try {
                // Data is JSON-encoded to preserve formatting
                const decodedChunk = JSON.parse(data);
                handlers.onChunk?.(decodedChunk);
              } catch (error) {
                // Fallback to raw data if not JSON
                handlers.onChunk?.(data);
              }
              break;

            case 'tool':
              // GPT-5 function calling - format as markdown for display
              try {
                const toolData = JSON.parse(data);
                const functionName = toolData.function;
                const functionArgs = toolData.data;

                // Format tool call as markdown for user-friendly display
                let toolMarkdown = '';

                if (functionName === 'identify_supply_demand_zone') {
                  const zone = functionArgs;
                  toolMarkdown = `\n\n**${zone.zone_type === 'supply' ? '🔴 Supply' : '🟢 Demand'} Zone Identified**\n`;
                  toolMarkdown += `- **Price Range**: $${zone.price_from} - $${zone.price_to}\n`;
                  toolMarkdown += `- **Strength**: ${zone.strength}\n`;
                  if (zone.timeframe) toolMarkdown += `- **Timeframe**: ${zone.timeframe}\n`;
                  if (zone.confluence_factors && zone.confluence_factors.length > 0) {
                    toolMarkdown += `- **Confluence**: ${zone.confluence_factors.join(', ')}\n`;
                  }
                } else if (functionName === 'recommend_trade_setup') {
                  const trade = functionArgs;
                  toolMarkdown = `\n\n**📊 Trade Setup Recommendation**\n`;
                  toolMarkdown += `- **Direction**: ${trade.direction.toUpperCase()}\n`;
                  toolMarkdown += `- **Entry**: $${trade.entry_price}\n`;
                  toolMarkdown += `- **Stop Loss**: $${trade.stop_loss}\n`;
                  toolMarkdown += `- **Targets**: ${trade.targets.map((t: number) => `$${t}`).join(', ')}\n`;
                  toolMarkdown += `- **Risk/Reward**: 1:${trade.risk_reward_ratio}\n`;
                  toolMarkdown += `- **Confidence**: ${trade.confidence}%\n`;
                  if (trade.invalidation_price) toolMarkdown += `- **Invalidation**: $${trade.invalidation_price}\n`;
                  if (trade.key_factors && trade.key_factors.length > 0) {
                    toolMarkdown += `\n**Key Factors**:\n${trade.key_factors.map((f: string) => `- ${f}`).join('\n')}\n`;
                  }
                }

                // Send formatted markdown as a chunk
                if (toolMarkdown) {
                  handlers.onChunk?.(toolMarkdown);
                }
              } catch (error) {
                console.error('Failed to parse tool event:', error);
              }
              break;

            case 'done':
              try {
                const result = JSON.parse(data) as AnalysisResult;
                handlers.onDone?.(result);
              } catch (error) {
                console.error('Failed to parse done event:', error);
                handlers.onError?.('Failed to parse analysis result');
              }
              break;

            case 'error':
              handlers.onError?.(data);
              break;

            default:
              console.warn('Unknown SSE event:', event);
          }
        }
      }
    } catch (error) {
      if (!cancelled) {
        const errorMessage = error instanceof Error ? error.message : 'Stream error';
        handlers.onError?.(errorMessage);
        handlers.onComplete?.();
      }
    }
  };

  // Start processing
  processStream();

  // Return cancel function
  return () => {
    cancelled = true;
    reader.cancel();
  };
}
