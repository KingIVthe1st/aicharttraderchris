import apiClient from "../api-client";
import type { Session } from "@/types/api";

export const authApi = {
  /**
   * Get current session
   */
  async getSession(): Promise<Session | null> {
    try {
      const response = await apiClient.get<Session>("/auth/session");
      return response.data;
    } catch (error) {
      return null;
    }
  },

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    await apiClient.post("/auth/signout");
  },

  /**
   * Sign up with email and password
   */
  async signUpWithPassword(
    email: string,
    password: string,
    name?: string,
  ): Promise<{ user: any; token: string }> {
    const response = await apiClient.post("/auth/signup", {
      email,
      password,
      name,
    });

    // Store token in localStorage for authenticated requests
    if (response.data.token) {
      localStorage.setItem("auth_token", response.data.token);
      // Set token in axios headers for future requests
      apiClient.defaults.headers.common["Authorization"] =
        `Bearer ${response.data.token}`;
    }

    return response.data;
  },

  /**
   * Sign in with email and password (traditional)
   */
  async signInWithPassword(
    email: string,
    password: string,
  ): Promise<{ user: any; token: string }> {
    const response = await apiClient.post("/auth/signin", {
      email,
      password,
    });

    // Store token in localStorage for authenticated requests
    if (response.data.token) {
      localStorage.setItem("auth_token", response.data.token);
      // Set token in axios headers for future requests
      apiClient.defaults.headers.common["Authorization"] =
        `Bearer ${response.data.token}`;
    }

    return response.data;
  },

  /**
   * Get Google OAuth URL
   */
  async getGoogleAuthUrl(callbackUrl?: string): Promise<string> {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
    const params = new URLSearchParams({
      callbackUrl: callbackUrl || window.location.origin,
    });
    return `${API_URL}/api/auth/signin/google?${params.toString()}`;
  },

  /**
   * Sync subscription status from Stripe
   * This is used as a fallback when webhooks fail to update the database
   */
  async syncSubscription(): Promise<{
    synced: boolean;
    status: string;
    message?: string;
  }> {
    try {
      const response = await apiClient.post("/subscription/sync");
      return response.data;
    } catch (error) {
      console.error("Failed to sync subscription:", error);
      return {
        synced: false,
        status: "error",
        message: "Failed to sync subscription",
      };
    }
  },
};
