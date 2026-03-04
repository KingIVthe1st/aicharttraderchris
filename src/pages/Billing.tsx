import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { stripeApi } from "@/lib/api/stripe";
import type { ValidateCouponResponse } from "@/types/api";

export default function Billing() {
  const { isAuthenticated } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] =
    useState<ValidateCouponResponse | null>(null);

  // Auto-trigger checkout after signup - passes coupon directly to avoid React state timing issues
  const triggerAutoCheckout = async (couponFromSession?: string) => {
    setIsRedirecting(true);
    setCouponError("");

    try {
      // Pass coupon directly from session storage, not from state (which may not be updated yet)
      // Include ?success=true so Dashboard knows to sync subscription from Stripe
      await stripeApi.redirectToCheckout(
        `${window.location.origin}/dashboard?success=true`,
        `${window.location.origin}/billing`,
        couponFromSession,
      );
    } catch (error: any) {
      console.error("Failed to redirect to checkout:", error);
      let errorMessage = "Failed to start checkout. ";
      if (error.response?.data?.error) {
        errorMessage += error.response.data.error;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += "Please try again or contact support.";
      }
      setCouponError(errorMessage);
      setIsRedirecting(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const autoCheckout = params.get("autoCheckout");
    const pendingCoupon = sessionStorage.getItem("pendingCoupon");

    if (autoCheckout === "true" && isAuthenticated && !isRedirecting) {
      // Restore coupon to state for display (even though we pass it directly)
      if (pendingCoupon) {
        setCouponCode(pendingCoupon);
        sessionStorage.removeItem("pendingCoupon");
      }

      // Remove autoCheckout param from URL
      window.history.replaceState({}, "", "/billing");

      // Trigger checkout with coupon passed directly (not from state)
      triggerAutoCheckout(pendingCoupon || undefined);
    }
  }, [isAuthenticated]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    setIsValidating(true);
    setCouponError("");
    setValidationResult(null);

    try {
      const result = await stripeApi.validateCoupon(couponCode.trim());

      if (result.valid) {
        setValidationResult(result);
      } else {
        setCouponError(result.error || "Invalid coupon code");
      }
    } catch (error: any) {
      console.error("Failed to validate coupon:", error);
      setCouponError(
        error.message || "Failed to validate coupon. Please try again.",
      );
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      // Save coupon code to session storage for after signup
      if (validationResult?.valid && couponCode) {
        sessionStorage.setItem("pendingCoupon", couponCode);
      }
      // Redirect to signup with auto-checkout flag
      window.location.href = "/signup?redirect=/billing&autoCheckout=true";
      return;
    }

    setIsRedirecting(true);
    setCouponError("");

    try {
      // Use validated coupon if available, otherwise use raw input
      const finalCouponCode = validationResult?.valid ? couponCode : undefined;

      // Include ?success=true so Dashboard knows to sync subscription from Stripe
      await stripeApi.redirectToCheckout(
        `${window.location.origin}/dashboard?success=true`,
        `${window.location.origin}/billing`,
        finalCouponCode,
      );
    } catch (error: any) {
      console.error("Failed to redirect to checkout:", error);

      // Show detailed error message to user
      let errorMessage = "Failed to start checkout. ";
      if (error.response?.data?.error) {
        errorMessage += error.response.data.error;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += "Please try again or contact support.";
      }

      setCouponError(errorMessage);
      setIsRedirecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Subtle Header */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">AC</span>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            AI Chart Trader
          </span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-extrabold text-white mb-4">
              Professional Trading Analysis
            </h1>
            <p className="text-xl text-gray-300">
              AI-powered chart analysis for serious traders
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-white/5 backdrop-blur-md border-2 border-blue-500/30 rounded-3xl overflow-hidden shadow-2xl">
            {/* Pricing Section */}
            <div className="p-10">
              <div className="text-center mb-8">
                {validationResult?.valid ? (
                  <div>
                    {/* Original Price (Crossed Out) */}
                    <div className="inline-flex items-baseline line-through text-gray-500 mb-2">
                      <span className="text-4xl font-bold">
                        ${validationResult.originalPrice}
                      </span>
                      <span className="ml-2 text-xl">/month</span>
                    </div>
                    {/* Discounted Price */}
                    <div className="inline-flex items-baseline">
                      <span className="text-6xl font-extrabold text-green-400">
                        ${validationResult.finalPrice}
                      </span>
                      <span className="ml-2 text-2xl font-medium text-gray-400">
                        /month
                      </span>
                    </div>
                    {/* Discount Badge */}
                    <div className="mt-3">
                      <span className="inline-flex items-center px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30">
                        <svg
                          className="w-5 h-5 text-green-400 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-green-300 font-semibold">
                          {validationResult.discount} discount applied!
                        </span>
                      </span>
                    </div>
                    <p className="mt-3 text-gray-400">
                      Professional tier access
                    </p>
                  </div>
                ) : (
                  <div>
                    {/* Regular Price */}
                    <div className="inline-flex items-baseline">
                      <span className="text-6xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        $97
                      </span>
                      <span className="ml-2 text-2xl font-medium text-gray-400">
                        /month
                      </span>
                    </div>
                    <p className="mt-3 text-gray-400">
                      Professional tier access
                    </p>
                  </div>
                )}
              </div>

              {/* Features List */}
              <ul className="space-y-4 mb-10">
                {[
                  "Unlimited AI-powered trade analyses",
                  "Advanced chart analysis with GPT-5.1",
                  "Precision tick validation",
                  "Risk:reward analysis (2:1 minimum)",
                  "Full analysis history & insights",
                  "Instant access upon subscription",
                  "Cancel anytime - no questions asked",
                ].map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg
                      className="flex-shrink-0 h-6 w-6 text-green-400 mt-0.5"
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
                    <span className="ml-3 text-gray-200">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Coupon Code Input */}
              <div className="mb-6">
                <label
                  htmlFor="coupon"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Have a coupon code? (Optional)
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    id="coupon"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value);
                      setCouponError("");
                      setValidationResult(null);
                    }}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" &&
                        !isValidating &&
                        !isRedirecting
                      ) {
                        handleApplyCoupon();
                      }
                    }}
                    placeholder="Enter coupon code"
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    disabled={isRedirecting || isValidating}
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={
                      isValidating || isRedirecting || !couponCode.trim()
                    }
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 whitespace-nowrap"
                  >
                    {isValidating ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Checking...
                      </span>
                    ) : (
                      "Apply Coupon"
                    )}
                  </button>
                </div>

                {/* Success Message */}
                {validationResult?.valid && (
                  <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-start">
                    <svg
                      className="flex-shrink-0 w-5 h-5 text-green-400 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-300">
                        Coupon applied successfully!
                      </p>
                      <p className="text-xs text-green-400 mt-1">
                        You'll save $
                        {(
                          (validationResult.originalPrice || 0) -
                          (validationResult.finalPrice || 0)
                        ).toFixed(2)}
                        /month
                        {validationResult.duration &&
                          validationResult.duration !== "once" && (
                            <span> ({validationResult.duration})</span>
                          )}
                      </p>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {couponError && (
                  <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start">
                    <svg
                      className="flex-shrink-0 w-5 h-5 text-red-400 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="ml-3 text-sm text-red-300">{couponError}</p>
                  </div>
                )}
              </div>

              {/* CTA Button */}
              <div className="space-y-4">
                <button
                  onClick={handleSubscribe}
                  disabled={isRedirecting}
                  className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 text-white rounded-lg px-8 py-4 text-lg font-semibold hover:from-blue-600 hover:via-purple-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {isRedirecting
                    ? "Redirecting to secure checkout..."
                    : isAuthenticated
                      ? "Subscribe Now"
                      : "Sign Up & Subscribe"}
                </button>
              </div>

              {/* Trust Badge */}
              <div className="mt-6 text-center">
                <div className="inline-flex items-center space-x-2 text-gray-400 text-sm">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Secure payment powered by Stripe</span>
                </div>
              </div>
            </div>

            {/* Footer Section */}
            <div className="px-10 py-6 bg-white/5 border-t border-white/10">
              <p className="text-xs text-gray-400 text-center">
                By subscribing, you agree to automatic monthly billing at
                $97/month. You can cancel anytime with no penalties or fees. All
                trading involves risk.
              </p>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-16 space-y-6">
            <h3 className="text-2xl font-bold text-white text-center mb-8">
              Frequently Asked Questions
            </h3>

            {[
              {
                q: "When will I be charged?",
                a: validationResult?.valid
                  ? `You will be charged $${validationResult.finalPrice} immediately upon subscription with your coupon discount applied. Your subscription renews monthly at the same discounted rate and you get instant access to all features.`
                  : "You will be charged $97 immediately upon subscription. Your subscription renews monthly at the same rate and you get instant access to all features.",
              },
              {
                q: "Can I cancel my subscription?",
                a: "Yes, you can cancel anytime through your account dashboard. Your access will continue until the end of your current billing period. No questions asked.",
              },
              {
                q: "What instruments do you support?",
                a: "We support all major futures contracts including ES, NQ, YM, RTY, CL, GC, and many others. Our system uses precise tick specifications for each instrument.",
              },
              {
                q: "How accurate is the AI analysis?",
                a: "Our AI is powered by GPT-5.1 and trained on professional trading setups. It validates every aspect of your trade including tick precision, risk:reward ratios, and bias alignment. However, all trading involves risk and our analysis is for educational purposes only.",
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6"
              >
                <h4 className="text-lg font-semibold text-white mb-2">
                  {faq.q}
                </h4>
                <p className="text-gray-300">{faq.a}</p>
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <div className="mt-12 p-6 bg-orange-500/10 border border-orange-500/20 rounded-lg">
            <p className="text-sm text-orange-300 text-center">
              <strong>Risk Disclosure:</strong> Trading futures and forex
              involves substantial risk of loss and is not suitable for all
              investors. Past performance is not indicative of future results.
              The analysis provided is for educational purposes only and should
              not be considered as financial advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
