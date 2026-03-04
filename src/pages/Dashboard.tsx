import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import SubscriptionModal from "@/components/SubscriptionModal";
import { IntelligenceDashboard } from "@/components/IntelligenceDashboard";

export default function Dashboard() {
  const { session, syncSubscription, isActiveSubscriber } = useAuth();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [searchParams] = useSearchParams();
  const [hasSynced, setHasSynced] = useState(false);

  // Sync subscription from Stripe when returning from checkout OR if subscription isn't active
  // This handles the case where webhook hasn't processed yet after payment
  useEffect(() => {
    const syncIfNeeded = async () => {
      const fromCheckout = searchParams.get("success") === "true";
      const needsSync = !isActiveSubscriber; // Always sync if not active (maybe just paid)

      // Clean up URL after reading the success param
      if (fromCheckout) {
        window.history.replaceState({}, "", "/dashboard");
      }

      // Sync if coming from checkout OR if not an active subscriber yet
      if ((fromCheckout || needsSync) && !hasSynced) {
        setHasSynced(true); // Prevent multiple sync attempts
        try {
          console.log("[Dashboard] Syncing subscription...", {
            fromCheckout,
            needsSync,
          });
          const result = await syncSubscription();
          if (result.synced) {
            console.log(
              "[Dashboard] Subscription synced successfully:",
              result.status,
            );
          } else {
            console.log(
              "[Dashboard] Sync completed, no active subscription found",
            );
          }
        } catch (error) {
          console.error("[Dashboard] Failed to sync subscription:", error);
        }
      }
    };

    if (session?.user) {
      syncIfNeeded();
    }
  }, [
    session?.user?.id,
    searchParams,
    syncSubscription,
    isActiveSubscriber,
    hasSynced,
  ]);

  return (
    <>
      {/* Intelligence Dashboard - Shown to ALL logged-in users */}
      <div className="bg-gradient-hero min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="logo-container logo-float group cursor-default">
              {/* Animated AI Chart Trader 3 Logo */}
              <div className="flex items-center gap-4">
                {/* Candlestick Chart Icon */}
                <div className="relative flex items-end gap-1.5 h-12">
                  {/* Bar 1 - Short bearish */}
                  <div className="logo-bar-1 w-2.5 h-6 rounded-sm bg-gradient-to-t from-red-500 to-red-400 shadow-lg shadow-red-500/30" />
                  {/* Bar 2 - Medium bullish */}
                  <div className="logo-bar-2 w-2.5 h-9 rounded-sm bg-gradient-to-t from-emerald-500 to-emerald-400 shadow-lg shadow-emerald-500/30" />
                  {/* Bar 3 - Tall bullish */}
                  <div className="logo-bar-3 w-2.5 h-12 rounded-sm bg-gradient-to-t from-emerald-500 to-cyan-400 shadow-lg shadow-cyan-500/30" />
                  {/* Bar 4 - Medium bearish */}
                  <div className="logo-bar-4 w-2.5 h-7 rounded-sm bg-gradient-to-t from-red-500 to-red-400 shadow-lg shadow-red-500/30" />
                </div>

                {/* Text Section */}
                <div className="flex flex-col">
                  <div className="logo-text-reveal flex items-baseline gap-2">
                    <span className="ai-text-shimmer text-3xl font-extrabold tracking-tight">
                      AI
                    </span>
                    <span className="text-3xl font-bold text-white tracking-tight">
                      Chart Trader
                    </span>
                    {/* Version 3 Badge */}
                    <span className="logo-badge-pop logo-badge-glow ml-1 inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600/90 to-cyan-500/90 text-white text-lg font-black border border-white/20">
                      3
                    </span>
                  </div>
                  <p
                    className="logo-text-reveal mt-1 text-gray-400 text-sm"
                    style={{ animationDelay: "0.5s" }}
                  >
                    Institutional-grade analysis • Real-time data
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/analysis"
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all"
              >
                New Analysis
              </Link>
            </div>
          </div>

          {/* Intelligence Dashboard */}
          <IntelligenceDashboard />

          {/* Quick Links */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              to="/analysis"
              className="glass-card p-4 flex items-center gap-3 hover:border-purple-500/50 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:bg-purple-500/30 transition-colors">
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-white">
                New Analysis
              </span>
            </Link>
            <Link
              to="/history"
              className="glass-card p-4 flex items-center gap-3 hover:border-blue-500/50 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/30 transition-colors">
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-white">History</span>
            </Link>
            <button
              onClick={() => setShowSubscriptionModal(true)}
              className="glass-card p-4 flex items-center gap-3 hover:border-emerald-500/50 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/30 transition-colors">
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
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-white">Billing</span>
            </button>
            {session?.user?.email?.toLowerCase() ===
              "ivanleejackson@gmail.com" && (
              <Link
                to="/admin"
                className="glass-card p-4 flex items-center gap-3 hover:border-orange-500/50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400 group-hover:bg-orange-500/30 transition-colors">
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
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <span className="text-sm font-medium text-white">Admin</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />
    </>
  );
}
