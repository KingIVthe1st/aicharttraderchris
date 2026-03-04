import React, { useState, useEffect } from 'react';
import { useOnboarding } from './OnboardingProvider';

// =============================================================================
// Feature Discovery Badge Component
// Shows a pulsing badge on new/undiscovered features
// =============================================================================
interface FeatureDiscoveryBadgeProps {
  featureId: string;
  children: React.ReactNode;
  tooltipText?: string;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  variant?: 'dot' | 'new' | 'tip';
}

export function FeatureDiscoveryBadge({
  featureId,
  children,
  tooltipText,
  position = 'top-right',
  variant = 'dot',
}: FeatureDiscoveryBadgeProps) {
  const { hasSeenFeature, markFeatureSeen, isOnboardingMuted } = useOnboarding();
  const [showTooltip, setShowTooltip] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const seen = hasSeenFeature(featureId);

  useEffect(() => {
    // Delay showing badge to avoid flash on page load
    const timer = setTimeout(() => {
      if (!seen && !isOnboardingMuted) {
        setIsVisible(true);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [seen, isOnboardingMuted]);

  const handleInteraction = () => {
    markFeatureSeen(featureId);
    setIsVisible(false);
  };

  const positionClasses = {
    'top-right': '-top-1 -right-1',
    'top-left': '-top-1 -left-1',
    'bottom-right': '-bottom-1 -right-1',
    'bottom-left': '-bottom-1 -left-1',
  };

  const renderBadge = () => {
    if (variant === 'dot') {
      return (
        <span
          className={`absolute ${positionClasses[position]} flex h-3 w-3`}
        >
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500" />
        </span>
      );
    }

    if (variant === 'new') {
      return (
        <span
          className={`absolute ${positionClasses[position]} px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-full shadow-lg shadow-blue-500/30`}
        >
          New
        </span>
      );
    }

    if (variant === 'tip') {
      return (
        <span
          className={`absolute ${positionClasses[position]} w-5 h-5 flex items-center justify-center text-xs bg-gradient-to-r from-amber-500 to-orange-400 text-white rounded-full shadow-lg`}
        >
          ?
        </span>
      );
    }
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={handleInteraction}
    >
      {children}

      {/* Badge */}
      {isVisible && (
        <div className="animate-in fade-in duration-300">
          {renderBadge()}
        </div>
      )}

      {/* Tooltip */}
      {showTooltip && tooltipText && isVisible && (
        <div
          className={`absolute z-50 px-3 py-2 text-sm text-white bg-slate-900 rounded-lg shadow-xl border border-slate-700 whitespace-nowrap ${
            position.includes('top') ? 'bottom-full mb-2' : 'top-full mt-2'
          } ${position.includes('right') ? 'right-0' : 'left-0'}`}
        >
          {tooltipText}
          <span className="text-xs text-slate-400 block mt-0.5">
            Click to dismiss
          </span>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Inline Tip Component
// A simple inline tooltip for contextual help
// =============================================================================
interface InlineTipProps {
  tipId: string;
  children: React.ReactNode;
  dismissable?: boolean;
}

export function InlineTip({ tipId, children, dismissable = true }: InlineTipProps) {
  const { hasSeenFeature, markFeatureSeen, isOnboardingMuted } = useOnboarding();
  const [isVisible, setIsVisible] = useState(false);

  const seen = hasSeenFeature(tipId);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!seen && !isOnboardingMuted) {
        setIsVisible(true);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [seen, isOnboardingMuted]);

  const handleDismiss = () => {
    markFeatureSeen(tipId);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-lg p-3 mb-4 animate-in slide-in-from-top duration-300">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
          <svg
            className="w-4 h-4 text-blue-400"
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
        </div>
        <div className="flex-1 text-sm text-slate-300">{children}</div>
        {dismissable && (
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-slate-500 hover:text-slate-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
