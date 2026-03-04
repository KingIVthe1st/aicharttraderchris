import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { stripeApi } from '@/lib/api/stripe';

export default function Pricing() {
  const { isAuthenticated, isActiveSubscriber } = useAuth();
  const [searchParams] = useSearchParams();
  const subscriptionRequired = searchParams.get('subscription_required') === 'true';
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      window.location.href = '/signin?redirect=/pricing';
      return;
    }

    setIsRedirecting(true);
    try {
      await stripeApi.redirectToCheckout(
        `${window.location.origin}/dashboard`,
        `${window.location.origin}/pricing`
      );
    } catch (error) {
      console.error('Failed to redirect to checkout:', error);
      setIsRedirecting(false);
    }
  };

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">Pricing</h2>
          <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Professional Trading Analysis
          </p>
          <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
            Get AI-powered analysis for your trades with precision tick validation
          </p>
        </div>

        {subscriptionRequired && (
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-orange-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-orange-800">
                    Subscription Required
                  </h3>
                  <p className="mt-1 text-sm text-orange-700">
                    You need an active subscription to access trading analysis features.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-12 max-w-lg mx-auto">
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
            {/* Pricing Card */}
            <div className="px-6 py-8 sm:p-10">
              <div className="flex items-baseline text-gray-900">
                <span className="text-5xl font-extrabold tracking-tight">$20</span>
                <span className="ml-1 text-2xl font-medium text-gray-500">/month</span>
              </div>

              <ul className="mt-6 space-y-4">
                <li className="flex items-start">
                  <svg
                    className="flex-shrink-0 h-6 w-6 text-green-500"
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
                  <span className="ml-3 text-base text-gray-700">
                    Unlimited trade analyses
                  </span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="flex-shrink-0 h-6 w-6 text-green-500"
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
                  <span className="ml-3 text-base text-gray-700">
                    AI-powered chart analysis
                  </span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="flex-shrink-0 h-6 w-6 text-green-500"
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
                  <span className="ml-3 text-base text-gray-700">
                    Precision tick validation
                  </span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="flex-shrink-0 h-6 w-6 text-green-500"
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
                  <span className="ml-3 text-base text-gray-700">
                    Risk:reward analysis (2:1 minimum)
                  </span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="flex-shrink-0 h-6 w-6 text-green-500"
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
                  <span className="ml-3 text-base text-gray-700">
                    Full analysis history
                  </span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="flex-shrink-0 h-6 w-6 text-green-500"
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
                  <span className="ml-3 text-base text-gray-700">
                    Instant access upon subscription
                  </span>
                </li>
              </ul>

              <div className="mt-8">
                {isActiveSubscriber ? (
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-4">
                      You have an active subscription
                    </p>
                    <a
                      href={stripeApi.getCustomerPortalUrl()}
                      className="inline-flex items-center justify-center px-5 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Manage Subscription
                    </a>
                  </div>
                ) : (
                  <button
                    onClick={handleSubscribe}
                    disabled={isRedirecting}
                    className="w-full bg-blue-600 text-white rounded-lg px-5 py-3 text-base font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRedirecting
                      ? 'Redirecting...'
                      : isAuthenticated
                        ? 'Subscribe Now'
                        : 'Sign Up & Subscribe'}
                  </button>
                )}
              </div>

              <p className="mt-4 text-sm text-center text-gray-500">
                Cancel anytime. No questions asked.
              </p>
            </div>

            {/* Bottom Section */}
            <div className="px-6 py-6 bg-gray-50 sm:px-10">
              <p className="text-xs text-gray-500 text-center">
                By subscribing, you agree to our{' '}
                <Link to="/terms" className="text-blue-600 hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h3>

          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium text-gray-900">
                When will I be charged?
              </h4>
              <p className="mt-2 text-base text-gray-500">
                You'll be charged immediately upon subscription. Your subscription renews monthly at $20/month
                and you get instant access to all features.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-medium text-gray-900">
                Can I cancel my subscription?
              </h4>
              <p className="mt-2 text-base text-gray-500">
                Yes, you can cancel anytime through your account dashboard. Your access will continue
                until the end of your current billing period.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-medium text-gray-900">
                What instruments do you support?
              </h4>
              <p className="mt-2 text-base text-gray-500">
                We support all major futures contracts including ES, NQ, YM, RTY, CL, GC, and many
                others. Our system uses precise tick specifications for each instrument.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-medium text-gray-900">
                How accurate is the AI analysis?
              </h4>
              <p className="mt-2 text-base text-gray-500">
                Our AI is trained on professional trading setups and validates every aspect of your
                trade including tick precision, risk:reward ratios, and bias alignment. However, all
                trading involves risk and our analysis is for educational purposes only.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
