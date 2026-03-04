import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "@/lib/api/auth";
import apiClient from "@/lib/api-client";
import type { Session } from "@/types/api";

interface AuthContextType {
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isActiveSubscriber: boolean;
  subscriptionMessage: string | null;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  syncSubscription: () => Promise<{ synced: boolean; status: string }>;
  hasSoulBlueprint: boolean | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSoulBlueprint, setHasSoulBlueprint] = useState<boolean | null>(null);

  const refreshSession = async () => {
    // Only fetch session if we have a token
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setSession(null);
      setHasSoulBlueprint(null);
      setIsLoading(false);
      return;
    }

    try {
      const newSession = await authApi.getSession();
      setSession(newSession);

      // Check if user has a soul blueprint
      try {
        await apiClient.get("/soul-blueprint");
        setHasSoulBlueprint(true);
      } catch {
        setHasSoulBlueprint(false);
      }

      // Check for pending callback URL after successful authentication
      const callbackUrl = sessionStorage.getItem("authCallbackUrl");
      if (callbackUrl) {
        sessionStorage.removeItem("authCallbackUrl");
        // Small delay to ensure session is fully set
        setTimeout(() => {
          window.location.href = callbackUrl;
        }, 100);
      }
    } catch (error) {
      console.error("Failed to fetch session:", error);
      setSession(null);
      setHasSoulBlueprint(null);
      localStorage.removeItem("auth_token"); // Clear invalid token
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const handleSignOut = async () => {
    try {
      await authApi.signOut();
      setSession(null);
      window.location.href = "/";
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  // Sync subscription from Stripe (fallback when webhooks fail)
  const syncSubscription = async (): Promise<{
    synced: boolean;
    status: string;
  }> => {
    try {
      const result = await authApi.syncSubscription();
      if (result.synced) {
        // Refresh session to get updated subscription data
        await refreshSession();
      }
      return result;
    } catch (error) {
      console.error("Failed to sync subscription:", error);
      return { synced: false, status: "error" };
    }
  };

  // Enhanced subscription check with grace period logic
  const isActiveSubscriber = (() => {
    if (!session?.user) return false;

    const { subscriptionStatus, subscriptionEndDate } = session.user;
    const now = Math.floor(Date.now() / 1000); // Current time in Unix timestamp
    const GRACE_PERIOD_DAYS = 7;
    const gracePeriodSeconds = GRACE_PERIOD_DAYS * 24 * 60 * 60;

    switch (subscriptionStatus) {
      case "active":
      case "trialing":
        // Active subscriptions always have access
        return true;

      case "past_due":
        // Past due gets grace period from subscription end date
        if (!subscriptionEndDate) return false;
        return now < subscriptionEndDate + gracePeriodSeconds;

      case "canceled":
        // Canceled subscriptions have access until period ends
        if (!subscriptionEndDate) return false;
        return now < subscriptionEndDate;

      case "incomplete":
      default:
        // No access for incomplete or unknown statuses
        return false;
    }
  })();

  // Generate subscription status message for UI
  const subscriptionMessage = (() => {
    if (!session?.user) return null;

    const { subscriptionStatus, subscriptionEndDate } = session.user;

    if (
      !subscriptionStatus ||
      subscriptionStatus === "active" ||
      subscriptionStatus === "trialing"
    ) {
      return null; // No message needed for active subscriptions
    }

    const now = Math.floor(Date.now() / 1000);
    const daysUntilExpiry = subscriptionEndDate
      ? Math.ceil((subscriptionEndDate - now) / (24 * 60 * 60))
      : 0;

    switch (subscriptionStatus) {
      case "past_due":
        if (daysUntilExpiry > 0) {
          return `Payment failed. You have ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? "s" : ""} remaining to update your payment method.`;
        }
        return "Your subscription has expired. Please renew to continue access.";

      case "canceled":
        if (daysUntilExpiry > 0) {
          return `Your subscription is canceled. Access ends in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? "s" : ""}.`;
        }
        return "Your subscription has ended. Subscribe to regain access.";

      case "incomplete":
        return "Your subscription setup is incomplete. Please complete payment to activate.";

      default:
        return null;
    }
  })();

  const value: AuthContextType = {
    session,
    isLoading,
    isAuthenticated: !!session?.user,
    isActiveSubscriber,
    subscriptionMessage,
    signOut: handleSignOut,
    refreshSession,
    syncSubscription,
    hasSoulBlueprint,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
