// =============================================================================
// Onboarding System Exports
// =============================================================================

// Provider & Context
export { OnboardingProvider, useOnboarding } from './OnboardingProvider';

// Components
export { SpotlightOverlay } from './SpotlightOverlay';
export { WelcomeModal } from './WelcomeModal';
export { FeatureDiscoveryBadge, InlineTip } from './FeatureDiscoveryBadge';
export { HelpButton, useHelpKeyboardShortcut } from './HelpButton';

// Tour Configurations
export {
  type TourStep,
  type TourConfig,
  welcomeTour,
  analysisResultsTour,
  conversationTour,
  allTours,
  getTour,
  getAutoStartTours,
} from './tourConfigs';
