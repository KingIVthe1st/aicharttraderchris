import { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useOnboarding } from './OnboardingProvider';

// =============================================================================
// Types
// =============================================================================
interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

// =============================================================================
// Spotlight Overlay Component
// =============================================================================
export function SpotlightOverlay() {
  const {
    activeTour,
    activeStep,
    activeStepIndex,
    nextStep,
    prevStep,
    skipTour,
  } = useOnboarding();

  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [isAnimating, setIsAnimating] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // =============================================================================
  // Calculate spotlight position
  // =============================================================================
  const calculateSpotlight = useCallback(() => {
    if (!activeStep) {
      setSpotlightRect(null);
      return;
    }

    const element = document.querySelector(activeStep.targetSelector);
    if (!element) {
      console.warn(`[Spotlight] Target not found: ${activeStep.targetSelector}`);
      // Show centered tooltip if target not found
      setSpotlightRect(null);
      setTooltipPosition({
        top: window.innerHeight / 2 - 100,
        left: window.innerWidth / 2 - 200,
      });
      return;
    }

    const rect = element.getBoundingClientRect();
    const padding = activeStep.spotlightPadding || 8;

    const newRect: SpotlightRect = {
      top: rect.top - padding + window.scrollY,
      left: rect.left - padding + window.scrollX,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    };

    setSpotlightRect(newRect);

    // Calculate tooltip position
    const tooltipWidth = 360;
    const tooltipHeight = 200; // Approximate
    let tooltipTop = 0;
    let tooltipLeft = 0;

    switch (activeStep.position) {
      case 'top':
        tooltipTop = newRect.top - tooltipHeight - 16;
        tooltipLeft = newRect.left + newRect.width / 2 - tooltipWidth / 2;
        break;
      case 'bottom':
        tooltipTop = newRect.top + newRect.height + 16;
        tooltipLeft = newRect.left + newRect.width / 2 - tooltipWidth / 2;
        break;
      case 'left':
        tooltipTop = newRect.top + newRect.height / 2 - tooltipHeight / 2;
        tooltipLeft = newRect.left - tooltipWidth - 16;
        break;
      case 'right':
        tooltipTop = newRect.top + newRect.height / 2 - tooltipHeight / 2;
        tooltipLeft = newRect.left + newRect.width + 16;
        break;
      case 'center':
      default:
        tooltipTop = window.innerHeight / 2 - tooltipHeight / 2;
        tooltipLeft = window.innerWidth / 2 - tooltipWidth / 2;
        break;
    }

    // Clamp to viewport
    tooltipTop = Math.max(16, Math.min(window.innerHeight - tooltipHeight - 16, tooltipTop));
    tooltipLeft = Math.max(16, Math.min(window.innerWidth - tooltipWidth - 16, tooltipLeft));

    setTooltipPosition({ top: tooltipTop, left: tooltipLeft });
  }, [activeStep]);

  // =============================================================================
  // Effects
  // =============================================================================
  useEffect(() => {
    if (activeStep) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);

      // Initial calculation
      calculateSpotlight();

      // Scroll target into view
      const element = document.querySelector(activeStep.targetSelector);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      return () => clearTimeout(timer);
    }
  }, [activeStep, calculateSpotlight]);

  // Recalculate on resize/scroll
  useEffect(() => {
    if (!activeTour) return;

    const handleResize = () => calculateSpotlight();
    const handleScroll = () => calculateSpotlight();

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [activeTour, calculateSpotlight]);

  // =============================================================================
  // Keyboard navigation
  // =============================================================================
  useEffect(() => {
    if (!activeTour) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          skipTour();
          break;
        case 'ArrowRight':
        case 'Enter':
          nextStep();
          break;
        case 'ArrowLeft':
          prevStep();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTour, nextStep, prevStep, skipTour]);

  // =============================================================================
  // Render
  // =============================================================================
  if (!activeTour || !activeStep) return null;

  const totalSteps = activeTour.steps.length;
  const progress = ((activeStepIndex + 1) / totalSteps) * 100;

  const overlay = (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {/* Dimmed background with spotlight cutout */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-auto"
        style={{ transition: 'all 0.3s ease-out' }}
      >
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {spotlightRect && (
              <rect
                x={spotlightRect.left}
                y={spotlightRect.top}
                width={spotlightRect.width}
                height={spotlightRect.height}
                rx="12"
                fill="black"
                style={{
                  transition: isAnimating ? 'all 0.3s ease-out' : 'none',
                }}
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.75)"
          mask="url(#spotlight-mask)"
          onClick={skipTour}
        />
      </svg>

      {/* Spotlight glow effect */}
      {spotlightRect && activeStep.highlight && (
        <div
          className="absolute rounded-xl pointer-events-none"
          style={{
            top: spotlightRect.top - 4,
            left: spotlightRect.left - 4,
            width: spotlightRect.width + 8,
            height: spotlightRect.height + 8,
            boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 30px rgba(59, 130, 246, 0.3)',
            transition: 'all 0.3s ease-out',
          }}
        />
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="absolute pointer-events-auto"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          width: 360,
          transition: 'all 0.3s ease-out',
          opacity: isAnimating ? 0 : 1,
          transform: isAnimating ? 'translateY(10px)' : 'translateY(0)',
        }}
      >
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden">
          {/* Progress bar */}
          <div className="h-1 bg-slate-700">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Step counter */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-blue-400 uppercase tracking-wider">
                Step {activeStepIndex + 1} of {totalSteps}
              </span>
              <button
                onClick={skipTour}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                Skip tour
              </button>
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-white mb-2">
              {activeStep.title}
            </h3>

            {/* Description */}
            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              {activeStep.description}
            </p>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={prevStep}
                disabled={activeStepIndex === 0}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeStepIndex === 0
                    ? 'text-slate-600 cursor-not-allowed'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                Back
              </button>

              <div className="flex gap-1.5">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === activeStepIndex
                        ? 'bg-blue-500 w-6'
                        : i < activeStepIndex
                        ? 'bg-blue-400/50'
                        : 'bg-slate-600'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={nextStep}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
              >
                {activeStepIndex === totalSteps - 1 ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>

          {/* Keyboard hint */}
          <div className="px-6 py-3 bg-slate-800/50 border-t border-slate-700/50">
            <p className="text-xs text-slate-500 text-center">
              Press <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-400">Enter</kbd> to continue,{' '}
              <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-400">Esc</kbd> to skip
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}
