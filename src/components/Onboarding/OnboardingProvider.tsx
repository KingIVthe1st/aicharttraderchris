import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { allTours, getTour, type TourConfig, type TourStep } from './tourConfigs';

// =============================================================================
// Types
// =============================================================================
interface TourProgress {
  tourId: string;
  version: number;
  currentStep: number;
  completed: boolean;
  skipped: boolean;
  startedAt: string;
  completedAt?: string;
}

interface OnboardingState {
  // Current active tour
  activeTour: TourConfig | null;
  activeStep: TourStep | null;
  activeStepIndex: number;

  // Progress tracking
  completedTours: Record<string, TourProgress>;

  // UI state
  isWelcomeModalOpen: boolean;
  isOnboardingMuted: boolean;

  // Feature discovery
  seenFeatures: Set<string>;
}

interface OnboardingContextType extends OnboardingState {
  // Auth state (for conditional rendering)
  isAuthenticated: boolean;

  // Tour controls
  startTour: (tourId: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  completeTour: () => void;
  restartTour: (tourId: string) => void;

  // Welcome modal
  openWelcomeModal: () => void;
  closeWelcomeModal: () => void;

  // Feature discovery
  markFeatureSeen: (featureId: string) => void;
  hasSeenFeature: (featureId: string) => boolean;

  // Global controls
  muteOnboarding: () => void;
  unmuteOnboarding: () => void;
  resetAllProgress: () => void;

  // Queries
  hasTourCompleted: (tourId: string) => boolean;
  getTourProgress: (tourId: string) => TourProgress | null;
  getAvailableTours: () => TourConfig[];
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

// =============================================================================
// Storage Keys
// =============================================================================
const STORAGE_KEYS = {
  COMPLETED_TOURS: 'onboarding_completed_tours',
  SEEN_FEATURES: 'onboarding_seen_features',
  MUTED: 'onboarding_muted',
  WELCOME_SHOWN: 'onboarding_welcome_shown',
};

// =============================================================================
// Provider Component
// =============================================================================
interface OnboardingProviderProps {
  children: ReactNode;
  userId?: string;
  isAuthenticated?: boolean;
  hasSubscription?: boolean;
}

export function OnboardingProvider({
  children,
  userId: _userId,
  isAuthenticated = false,
  hasSubscription = false,
}: OnboardingProviderProps) {
  // State
  const [activeTour, setActiveTour] = useState<TourConfig | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [completedTours, setCompletedTours] = useState<Record<string, TourProgress>>({});
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const [isOnboardingMuted, setIsOnboardingMuted] = useState(false);
  const [seenFeatures, setSeenFeatures] = useState<Set<string>>(new Set());

  // Derived state
  const activeStep = activeTour?.steps[activeStepIndex] || null;

  // =============================================================================
  // Persistence - Load from localStorage
  // =============================================================================
  useEffect(() => {
    // Load completed tours
    const storedTours = localStorage.getItem(STORAGE_KEYS.COMPLETED_TOURS);
    if (storedTours) {
      try {
        setCompletedTours(JSON.parse(storedTours));
      } catch (e) {
        console.error('[Onboarding] Failed to parse completed tours:', e);
      }
    }

    // Load seen features
    const storedFeatures = localStorage.getItem(STORAGE_KEYS.SEEN_FEATURES);
    if (storedFeatures) {
      try {
        setSeenFeatures(new Set(JSON.parse(storedFeatures)));
      } catch (e) {
        console.error('[Onboarding] Failed to parse seen features:', e);
      }
    }

    // Load muted state
    const muted = localStorage.getItem(STORAGE_KEYS.MUTED);
    setIsOnboardingMuted(muted === 'true');

    // Check if welcome modal should show (first visit for authenticated users)
    const welcomeShown = localStorage.getItem(STORAGE_KEYS.WELCOME_SHOWN);
    if (isAuthenticated && !welcomeShown) {
      setIsWelcomeModalOpen(true);
    }
  }, [isAuthenticated]);

  // =============================================================================
  // Persistence - Save to localStorage
  // =============================================================================
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMPLETED_TOURS, JSON.stringify(completedTours));
  }, [completedTours]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SEEN_FEATURES, JSON.stringify([...seenFeatures]));
  }, [seenFeatures]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MUTED, String(isOnboardingMuted));
  }, [isOnboardingMuted]);

  // =============================================================================
  // Tour Controls
  // =============================================================================
  const startTour = useCallback((tourId: string) => {
    if (isOnboardingMuted) return;

    const tour = getTour(tourId);
    if (!tour) {
      console.error(`[Onboarding] Tour not found: ${tourId}`);
      return;
    }

    // Check eligibility
    if (tour.requiresAuth && !isAuthenticated) {
      console.log(`[Onboarding] Tour ${tourId} requires auth`);
      return;
    }
    if (tour.requiresSubscription && !hasSubscription) {
      console.log(`[Onboarding] Tour ${tourId} requires subscription`);
      return;
    }

    // Check if already completed (and showOnce is true)
    const progress = completedTours[tourId];
    if (tour.showOnce && progress?.completed && progress.version === tour.version) {
      console.log(`[Onboarding] Tour ${tourId} already completed`);
      return;
    }

    // Start the tour
    setActiveTour(tour);
    setActiveStepIndex(0);

    // Track start
    const newProgress: TourProgress = {
      tourId,
      version: tour.version,
      currentStep: 0,
      completed: false,
      skipped: false,
      startedAt: new Date().toISOString(),
    };
    setCompletedTours(prev => ({ ...prev, [tourId]: newProgress }));

    // Analytics
    console.log(`[Onboarding] Started tour: ${tourId}`);
  }, [isOnboardingMuted, isAuthenticated, hasSubscription, completedTours]);

  const nextStep = useCallback(() => {
    if (!activeTour) return;

    const nextIndex = activeStepIndex + 1;
    if (nextIndex >= activeTour.steps.length) {
      // Tour completed
      completeTour();
    } else {
      setActiveStepIndex(nextIndex);
      // Update progress
      setCompletedTours(prev => ({
        ...prev,
        [activeTour.id]: { ...prev[activeTour.id], currentStep: nextIndex },
      }));
    }
  }, [activeTour, activeStepIndex]);

  const prevStep = useCallback(() => {
    if (!activeTour || activeStepIndex === 0) return;
    setActiveStepIndex(activeStepIndex - 1);
  }, [activeTour, activeStepIndex]);

  const skipTour = useCallback(() => {
    if (!activeTour) return;

    setCompletedTours(prev => ({
      ...prev,
      [activeTour.id]: {
        ...prev[activeTour.id],
        skipped: true,
        completedAt: new Date().toISOString(),
      },
    }));

    console.log(`[Onboarding] Skipped tour: ${activeTour.id}`);
    setActiveTour(null);
    setActiveStepIndex(0);
  }, [activeTour]);

  const completeTour = useCallback(() => {
    if (!activeTour) return;

    setCompletedTours(prev => ({
      ...prev,
      [activeTour.id]: {
        ...prev[activeTour.id],
        completed: true,
        completedAt: new Date().toISOString(),
      },
    }));

    console.log(`[Onboarding] Completed tour: ${activeTour.id}`);
    setActiveTour(null);
    setActiveStepIndex(0);
  }, [activeTour]);

  const restartTour = useCallback((tourId: string) => {
    // Clear progress for this tour
    setCompletedTours(prev => {
      const updated = { ...prev };
      delete updated[tourId];
      return updated;
    });
    // Start it fresh
    startTour(tourId);
  }, [startTour]);

  // =============================================================================
  // Welcome Modal
  // =============================================================================
  const openWelcomeModal = useCallback(() => {
    setIsWelcomeModalOpen(true);
  }, []);

  const closeWelcomeModal = useCallback(() => {
    setIsWelcomeModalOpen(false);
    localStorage.setItem(STORAGE_KEYS.WELCOME_SHOWN, 'true');
  }, []);

  // =============================================================================
  // Feature Discovery
  // =============================================================================
  const markFeatureSeen = useCallback((featureId: string) => {
    setSeenFeatures(prev => new Set([...prev, featureId]));
  }, []);

  const hasSeenFeature = useCallback((featureId: string) => {
    return seenFeatures.has(featureId);
  }, [seenFeatures]);

  // =============================================================================
  // Global Controls
  // =============================================================================
  const muteOnboarding = useCallback(() => {
    setIsOnboardingMuted(true);
    setActiveTour(null);
    setActiveStepIndex(0);
  }, []);

  const unmuteOnboarding = useCallback(() => {
    setIsOnboardingMuted(false);
  }, []);

  const resetAllProgress = useCallback(() => {
    setCompletedTours({});
    setSeenFeatures(new Set());
    setIsOnboardingMuted(false);
    localStorage.removeItem(STORAGE_KEYS.COMPLETED_TOURS);
    localStorage.removeItem(STORAGE_KEYS.SEEN_FEATURES);
    localStorage.removeItem(STORAGE_KEYS.MUTED);
    localStorage.removeItem(STORAGE_KEYS.WELCOME_SHOWN);
  }, []);

  // =============================================================================
  // Queries
  // =============================================================================
  const hasTourCompleted = useCallback((tourId: string) => {
    const progress = completedTours[tourId];
    return progress?.completed || false;
  }, [completedTours]);

  const getTourProgress = useCallback((tourId: string) => {
    return completedTours[tourId] || null;
  }, [completedTours]);

  const getAvailableTours = useCallback(() => {
    return Object.values(allTours).filter(tour => {
      if (tour.requiresAuth && !isAuthenticated) return false;
      if (tour.requiresSubscription && !hasSubscription) return false;
      return true;
    });
  }, [isAuthenticated, hasSubscription]);

  // =============================================================================
  // Context Value
  // =============================================================================
  const value: OnboardingContextType = {
    // State
    activeTour,
    activeStep,
    activeStepIndex,
    completedTours,
    isWelcomeModalOpen,
    isOnboardingMuted,
    seenFeatures,
    // Auth state
    isAuthenticated,
    // Tour controls
    startTour,
    nextStep,
    prevStep,
    skipTour,
    completeTour,
    restartTour,
    // Welcome modal
    openWelcomeModal,
    closeWelcomeModal,
    // Feature discovery
    markFeatureSeen,
    hasSeenFeature,
    // Global controls
    muteOnboarding,
    unmuteOnboarding,
    resetAllProgress,
    // Queries
    hasTourCompleted,
    getTourProgress,
    getAvailableTours,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

// =============================================================================
// Hook
// =============================================================================
export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
