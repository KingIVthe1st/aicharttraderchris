import apiClient from '../api-client';
import type { AnalysisHistoryResponse, AnalysisHistoryItem } from '@/types/api';

export const historyApi = {
  /**
   * Get user's analysis history
   */
  async getHistory(): Promise<AnalysisHistoryItem[]> {
    const response = await apiClient.get<AnalysisHistoryResponse>('/history');
    return response.data.analyses;
  },

  /**
   * Get specific analysis by ID with full conversation
   */
  async getAnalysis(id: string): Promise<any> {
    const response = await apiClient.get(`/history/${id}`);
    return response.data.analysis;
  },

  /**
   * Add message to existing conversation (returns ReadableStream for SSE)
   */
  async continueConversation(id: string, message: string, images?: string[], mode?: 'trader' | 'mentor'): Promise<Response> {
    const response = await fetch(`${apiClient.defaults.baseURL}/history/${id}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify({ message, images, mode })
    });

    if (!response.ok) {
      throw new Error('Failed to continue conversation');
    }

    return response;
  },
};
