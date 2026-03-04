import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import {
  OnboardingProvider,
  SpotlightOverlay,
  WelcomeModal,
  HelpButton,
} from './components/Onboarding'
import './index.css'
import App from './App.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

// Wrapper component to access auth state for onboarding
function OnboardingWrapper({ children }: { children: React.ReactNode }) {
  const { session, isAuthenticated, isActiveSubscriber } = useAuth();

  return (
    <OnboardingProvider
      userId={session?.user?.id}
      isAuthenticated={isAuthenticated}
      hasSubscription={isActiveSubscriber}
    >
      {children}
      <SpotlightOverlay />
      <WelcomeModal />
      <HelpButton />
    </OnboardingProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <OnboardingWrapper>
              <App />
            </OnboardingWrapper>
          </AuthProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
