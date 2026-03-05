import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from './OnboardingProvider';

// =============================================================================
// Welcome Modal Component
// First-time user experience with premium design
// =============================================================================
export function WelcomeModal() {
  const { isWelcomeModalOpen, closeWelcomeModal, startTour } = useOnboarding();
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<'trader' | 'mentor' | null>(null);
  const [step, setStep] = useState(0);

  if (!isWelcomeModalOpen) return null;

  const handleStartTour = () => {
    closeWelcomeModal();
    // Navigate to the analysis page first so tour targets exist in the DOM
    navigate('/analysis');
    setTimeout(() => startTour('welcome-tour'), 400);
  };

  const handleSkipTour = () => {
    closeWelcomeModal();
  };

  const content = (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleSkipTour}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 animate-in fade-in zoom-in duration-300">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl shadow-2xl border border-slate-700/50 overflow-hidden">
          {/* Header with animated gradient */}
          <div className="relative h-48 bg-gradient-to-br from-blue-600 via-cyan-500 to-purple-600 overflow-hidden">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-20">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
                <rect width="100" height="100" fill="url(#grid)" />
              </svg>
            </div>

            {/* Floating chart elements */}
            <div className="absolute top-8 left-8 w-16 h-12 bg-white/10 rounded-lg backdrop-blur-sm flex items-end gap-1 p-2">
              <div className="w-2 h-4 bg-green-400/80 rounded-sm" />
              <div className="w-2 h-6 bg-green-400/80 rounded-sm" />
              <div className="w-2 h-3 bg-red-400/80 rounded-sm" />
              <div className="w-2 h-8 bg-green-400/80 rounded-sm" />
              <div className="w-2 h-5 bg-green-400/80 rounded-sm" />
            </div>

            <div className="absolute top-12 right-12 w-20 h-14 bg-white/10 rounded-lg backdrop-blur-sm p-2">
              <div className="h-2 w-12 bg-white/50 rounded mb-1" />
              <div className="h-2 w-8 bg-cyan-300/50 rounded mb-1" />
              <div className="h-2 w-10 bg-green-300/50 rounded" />
            </div>

            {/* Logo/Title */}
            <div className="absolute bottom-6 left-8">
              <h1 className="text-3xl font-bold text-white mb-1">
                Welcome to Chart Trader AI
              </h1>
              <p className="text-white/80">
                Professional-grade AI analysis for futures traders
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {step === 0 && (
              <>
                {/* Features overview */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="text-center p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-white mb-1">Multi-TF Analysis</h3>
                    <p className="text-xs text-slate-400">Upload charts from any timeframe</p>
                  </div>

                  <div className="text-center p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-white mb-1">Scored Setups</h3>
                    <p className="text-xs text-slate-400">AI ranks 3 setups by probability</p>
                  </div>

                  <div className="text-center p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-400 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-white mb-1">Learn While Trading</h3>
                    <p className="text-xs text-slate-400">Mentor Mode teaches WHY</p>
                  </div>
                </div>

                <button
                  onClick={() => setStep(1)}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                >
                  Get Started
                </button>
              </>
            )}

            {step === 1 && (
              <>
                {/* Mode selection */}
                <h2 className="text-xl font-bold text-white mb-2 text-center">
                  Choose Your Analysis Mode
                </h2>
                <p className="text-slate-400 text-center mb-6">
                  You can switch between modes anytime
                </p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <button
                    onClick={() => setSelectedMode('trader')}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${
                      selectedMode === 'trader'
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-3">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-white mb-1">Trader Mode</h3>
                    <p className="text-sm text-slate-400">
                      Quick, actionable setups with scores. Just the numbers, no fluff.
                    </p>
                    <div className="mt-3 text-xs text-slate-500">
                      Best for: Experienced traders
                    </div>
                  </button>

                  <button
                    onClick={() => setSelectedMode('mentor')}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${
                      selectedMode === 'mentor'
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-3">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-white mb-1">Mentor Mode</h3>
                    <p className="text-sm text-slate-400">
                      Educational analysis explaining WHY setups work. Learn as you trade.
                    </p>
                    <div className="mt-3 text-xs text-slate-500">
                      Best for: Learning traders
                    </div>
                  </button>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(0)}
                    className="px-6 py-3 text-slate-400 hover:text-white transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleStartTour}
                    disabled={!selectedMode}
                    className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                      selectedMode
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-blue-500/25'
                        : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    Take the Tour
                  </button>
                </div>

                <button
                  onClick={handleSkipTour}
                  className="w-full mt-3 py-2 text-sm text-slate-500 hover:text-slate-400 transition-colors"
                >
                  Skip tour, I'll figure it out
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
