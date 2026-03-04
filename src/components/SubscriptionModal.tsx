import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, CheckCircleIcon, ClockIcon, CreditCardIcon } from 'lucide-react';
import { format } from 'date-fns';
import apiClient from '@/lib/api-client';

interface SubscriptionDetails {
  status: string;
  isActive: boolean;
  planName: string;
  planType: string;
  endDate: string | null;
  daysRemaining: number;
  yearsPurchased: number;
  isManaged: boolean;
  canManageStripe: boolean;
  createdAt: string;
}

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchSubscriptionDetails();
    }
  }, [isOpen]);

  const fetchSubscriptionDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/subscription');
      setSubscription(response.data);
    } catch (err: any) {
      console.error('Failed to fetch subscription details:', err);
      setError(err.response?.data?.error || 'Failed to load subscription details');
    } finally {
      setLoading(false);
    }
  };

  const handleManageStripe = async () => {
    try {
      const response = await apiClient.post('/stripe/portal');
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (err: any) {
      console.error('Failed to open Stripe portal:', err);
      alert('Failed to open subscription management. Please try again.');
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setCanceling(true);
      await apiClient.post('/subscription/cancel');

      // Refresh subscription details
      await fetchSubscriptionDetails();
      setShowCancelConfirm(false);

      // Show success message
      alert('Your subscription has been canceled successfully. You will retain access until the end of your current billing period.');
    } catch (err: any) {
      console.error('Failed to cancel subscription:', err);
      alert(err.response?.data?.error || 'Failed to cancel subscription. Please try again or contact support.');
    } finally {
      setCanceling(false);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <X className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 mb-6">
                      Subscription Details
                    </Dialog.Title>

                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : error ? (
                      <div className="rounded-md bg-red-50 p-4">
                        <div className="flex">
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error</h3>
                            <div className="mt-2 text-sm text-red-700">{error}</div>
                          </div>
                        </div>
                      </div>
                    ) : subscription ? (
                      <div className="space-y-4">
                        {/* Status Badge */}
                        <div className="flex items-center justify-between py-3 border-b">
                          <span className="text-sm font-medium text-gray-500">Status</span>
                          <span
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                              subscription.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {subscription.isActive ? (
                              <>
                                <CheckCircleIcon className="h-4 w-4" />
                                Active
                              </>
                            ) : (
                              'Inactive'
                            )}
                          </span>
                        </div>

                        {/* Plan Name */}
                        <div className="flex items-center justify-between py-3 border-b">
                          <span className="text-sm font-medium text-gray-500">Plan</span>
                          <span className="text-sm font-semibold text-gray-900">{subscription.planName}</span>
                        </div>

                        {/* Years Purchased (if applicable) */}
                        {subscription.yearsPurchased > 0 && (
                          <div className="flex items-center justify-between py-3 border-b">
                            <span className="text-sm font-medium text-gray-500">Years Purchased</span>
                            <span className="text-sm font-semibold text-gray-900">
                              {subscription.yearsPurchased} Year{subscription.yearsPurchased > 1 ? 's' : ''}
                            </span>
                          </div>
                        )}

                        {/* Payment Status */}
                        {subscription.isActive && (
                          <div className="flex items-center justify-between py-3 border-b">
                            <span className="text-sm font-medium text-gray-500">Payment Status</span>
                            <span className="inline-flex items-center gap-2 text-sm font-semibold text-green-600">
                              <CheckCircleIcon className="h-4 w-4" />
                              Paid in Full
                            </span>
                          </div>
                        )}

                        {/* End Date */}
                        {subscription.endDate && (
                          <div className="flex items-center justify-between py-3 border-b">
                            <span className="text-sm font-medium text-gray-500">Valid Until</span>
                            <span className="text-sm font-semibold text-gray-900">
                              {format(new Date(Number(subscription.endDate) * 1000), 'MMMM d, yyyy')}
                            </span>
                          </div>
                        )}

                        {/* Days Remaining */}
                        {subscription.isActive && subscription.daysRemaining > 0 && (
                          <div className="flex items-center justify-between py-3 border-b">
                            <span className="text-sm font-medium text-gray-500">Days Remaining</span>
                            <span className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600">
                              <ClockIcon className="h-4 w-4" />
                              {subscription.daysRemaining.toLocaleString()} days
                            </span>
                          </div>
                        )}

                        {/* Member Since */}
                        {subscription.createdAt && (
                          <div className="flex items-center justify-between py-3 border-b">
                            <span className="text-sm font-medium text-gray-500">Member Since</span>
                            <span className="text-sm text-gray-900">
                              {format(new Date(Number(subscription.createdAt) * 1000), 'MMMM d, yyyy')}
                            </span>
                          </div>
                        )}

                        {/* Manage with Stripe (if applicable) */}
                        {subscription.canManageStripe && subscription.isManaged && (
                          <div className="mt-6">
                            <button
                              onClick={handleManageStripe}
                              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              <CreditCardIcon className="h-4 w-4" />
                              Manage Billing in Stripe
                            </button>
                          </div>
                        )}

                        {/* Cancel Subscription - Available for all active subscriptions */}
                        {subscription.isActive && (
                          <div className="mt-6">
                            <button
                              onClick={() => setShowCancelConfirm(true)}
                              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              <X className="h-4 w-4" />
                              Cancel Subscription
                            </button>
                          </div>
                        )}

                        {/* Info Box */}
                        {subscription.isActive && subscription.yearsPurchased >= 10 && (
                          <div className="mt-6 rounded-lg bg-blue-50 p-4">
                            <p className="text-sm text-blue-800">
                              <strong>Premium Access:</strong> You have lifetime access to all features. Your subscription is fully paid and will remain active until {subscription.endDate ? format(new Date(Number(subscription.endDate) * 1000), 'MMMM yyyy') : 'the end date'}.
                            </p>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300"
                    onClick={onClose}
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>

        {/* Cancellation Confirmation Dialog */}
        <Transition.Root show={showCancelConfirm} as={Fragment}>
          <Dialog as="div" className="relative z-[60]" onClose={() => setShowCancelConfirm(false)}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <div className="fixed inset-0 z-10 overflow-y-auto">
              <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                  enterTo="opacity-100 translate-y-0 sm:scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                  leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                  <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                    <div className="sm:flex sm:items-start">
                      <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <X className="h-6 w-6 text-red-600" aria-hidden="true" />
                      </div>
                      <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                        <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                          Cancel Subscription
                        </Dialog.Title>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">
                            Are you sure you want to cancel your subscription? You will retain access to all premium features until{' '}
                            {subscription?.endDate ? format(new Date(Number(subscription.endDate) * 1000), 'MMMM d, yyyy') : 'the end of your billing period'}.
                          </p>
                          <p className="mt-2 text-sm text-gray-500">
                            This action cannot be undone, but you can always resubscribe later.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
                      <button
                        type="button"
                        disabled={canceling}
                        className="inline-flex w-full justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleCancelSubscription}
                      >
                        {canceling ? 'Canceling...' : 'Yes, Cancel Subscription'}
                      </button>
                      <button
                        type="button"
                        disabled={canceling}
                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => setShowCancelConfirm(false)}
                      >
                        Keep Subscription
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>
      </Dialog>
    </Transition.Root>
  );
}
