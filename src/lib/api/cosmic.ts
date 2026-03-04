import apiClient from "../api-client";
import type { CosmicIntelligence, NEOScore, HoraGrid } from "@/types/cosmic";

export const cosmicApi = {
  async getDaily(timezone?: string): Promise<CosmicIntelligence> {
    const tz = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    const response = await apiClient.get(`/cosmic/daily?timezone=${encodeURIComponent(tz)}`);
    return response.data;
  },

  async getNeoScore(timezone?: string): Promise<{ neoScore: NEOScore }> {
    const tz = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    const response = await apiClient.get(`/cosmic/neo-score?timezone=${encodeURIComponent(tz)}`);
    return response.data;
  },

  async getHoraGrid(timezone?: string): Promise<{ horaGrid: HoraGrid }> {
    const tz = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    const response = await apiClient.get(`/cosmic/hora-grid?timezone=${encodeURIComponent(tz)}`);
    return response.data;
  },
};
