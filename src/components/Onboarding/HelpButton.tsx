import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useOnboarding } from "./OnboardingProvider";
import { allTours } from "./tourConfigs";

// =============================================================================
// Help Button Component
// Persistent floating help button with tour restart and quick help
// =============================================================================
export function HelpButton() {
  const {
    restartTour,
    hasTourCompleted,
    isOnboardingMuted,
    muteOnboarding,
    unmuteOnboarding,
    resetAllProgress,
    activeTour,
    isAuthenticated,
  } = useOnboarding();

  const [isOpen, setIsOpen] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setShowConfirmReset(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Don't show if user is not authenticated (only show in dashboard)
  if (!isAuthenticated) return null;

  // Don't show during active tour
  if (activeTour) return null;

  const quickHelpItems = [
    {
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      title: "Upload Charts",
      description: "Start with higher timeframes (Daily, 4H) for context",
    },
    {
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      title: "Reading Scores",
      description: "70+ = High probability, 50-69 = Medium, <50 = Low",
    },
    {
      icon: (
        <svg
          className="w-4 h-4"
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
      ),
      title: "Best Trading Times",
      description: "9:45-11:30 ET (Prime) or 13:30-15:45 ET (Good)",
    },
    {
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
      title: "Intelligence Dashboard",
      description: "COT data validates S&D zones. Check before every trade!",
    },
    {
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
      ),
      title: "Conviction Multiplier",
      description: "1.0x = Standard size. Higher = aligned signals, go bigger.",
    },
  ];

  const handleRestart = (tourId: string) => {
    setIsOpen(false);
    restartTour(tourId);
  };

  const handleReset = () => {
    if (showConfirmReset) {
      resetAllProgress();
      setShowConfirmReset(false);
      setIsOpen(false);
    } else {
      setShowConfirmReset(true);
    }
  };

  const button = (
    <button
      ref={buttonRef}
      onClick={() => setIsOpen(!isOpen)}
      className={`fixed bottom-6 right-6 z-[9990] w-14 h-14 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center group ${
        isOpen
          ? "bg-slate-700 rotate-45"
          : "bg-gradient-to-br from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 hover:scale-110 hover:shadow-blue-500/50"
      }`}
    >
      {isOpen ? (
        <svg
          className="w-6 h-6 text-white"
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
      ) : (
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      )}

      {/* Pulse animation when closed */}
      {!isOpen && (
        <span className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-20" />
      )}
    </button>
  );

  const menu = isOpen && (
    <div
      ref={menuRef}
      className="fixed bottom-24 right-6 z-[9990] w-80 animate-in slide-in-from-bottom-4 fade-in duration-200 max-h-[calc(100vh-140px)]"
    >
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden max-h-[calc(100vh-140px)] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-700/50 bg-gradient-to-r from-blue-600/10 to-cyan-500/10">
          <h3 className="font-bold text-white flex items-center gap-2">
            <svg
              className="w-5 h-5 text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Help & Tutorials
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Learn to use Chart Trader AI effectively
          </p>
        </div>

        {/* Quick Help */}
        <div className="p-4 border-b border-slate-700/50">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Quick Tips
          </h4>
          <div className="space-y-2">
            {quickHelpItems.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center text-blue-400">
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  <p className="text-xs text-slate-400">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tours */}
        <div className="p-4 border-b border-slate-700/50">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Interactive Tours
          </h4>
          <div className="space-y-2">
            {Object.values(allTours).map((tour) => {
              const completed = hasTourCompleted(tour.id);
              return (
                <button
                  key={tour.id}
                  onClick={() => handleRestart(tour.id)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        completed
                          ? "bg-green-500/20 text-green-400"
                          : "bg-blue-500/20 text-blue-400"
                      }`}
                    >
                      {completed ? (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-white">
                        {tour.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {tour.steps.length} steps
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 group-hover:text-blue-400 transition-colors">
                    {completed ? "Restart" : "Start"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Settings */}
        <div className="p-4">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Settings
          </h4>
          <div className="space-y-2">
            {/* Mute toggle */}
            <button
              onClick={() =>
                isOnboardingMuted ? unmuteOnboarding() : muteOnboarding()
              }
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isOnboardingMuted
                      ? "bg-slate-700 text-slate-400"
                      : "bg-blue-500/20 text-blue-400"
                  }`}
                >
                  {isOnboardingMuted ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                      />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-white">
                  {isOnboardingMuted
                    ? "Enable tips & tours"
                    : "Disable tips & tours"}
                </span>
              </div>
              <div
                className={`w-10 h-6 rounded-full transition-colors ${
                  isOnboardingMuted ? "bg-slate-700" : "bg-blue-500"
                }`}
              >
                <div
                  className={`w-4 h-4 mt-1 rounded-full bg-white transition-transform ${
                    isOnboardingMuted ? "ml-1" : "ml-5"
                  }`}
                />
              </div>
            </button>

            {/* Reset progress */}
            <button
              onClick={handleReset}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                showConfirmReset
                  ? "bg-red-500/10 border border-red-500/30"
                  : "hover:bg-slate-800/50"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  showConfirmReset
                    ? "bg-red-500/20 text-red-400"
                    : "bg-slate-700 text-slate-400"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>
              <span
                className={`text-sm ${showConfirmReset ? "text-red-400" : "text-slate-400"}`}
              >
                {showConfirmReset
                  ? "Click again to confirm reset"
                  : "Reset all tour progress"}
              </span>
            </button>
          </div>
        </div>

        {/* Keyboard shortcuts hint */}
        <div className="px-4 py-3 bg-slate-800/30 border-t border-slate-700/50">
          <p className="text-xs text-slate-500 text-center">
            Press{" "}
            <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-400">
              ?
            </kbd>{" "}
            anytime for help
          </p>
        </div>
      </div>
    </div>
  );

  return createPortal(
    <>
      {button}
      {menu}
    </>,
    document.body,
  );
}

// =============================================================================
// Keyboard shortcut handler
// =============================================================================
export function useHelpKeyboardShortcut(onHelp: () => void) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if ? key is pressed (shift + /)
      if (e.key === "?" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Don't trigger if user is typing in an input
        const target = e.target as HTMLElement;
        if (
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable
        ) {
          return;
        }
        e.preventDefault();
        onHelp();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onHelp]);
}
