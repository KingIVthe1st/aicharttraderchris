import apiClient from "../api-client";
import type { SoulBlueprint, SoulBlueprintInput } from "@/types/cosmic";

export const soulBlueprintApi = {
  async create(data: SoulBlueprintInput): Promise<{ blueprint: SoulBlueprint }> {
    const response = await apiClient.post("/soul-blueprint", data);
    return response.data;
  },

  async get(): Promise<{ blueprint: SoulBlueprint; hasBlueprint: boolean } | null> {
    try {
      const response = await apiClient.get("/soul-blueprint");
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },
};
