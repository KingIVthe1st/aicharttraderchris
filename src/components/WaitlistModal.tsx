import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, CheckCircle, Loader2, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/lib/api-client';

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WaitlistModal({ isOpen, onClose }: WaitlistModalProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState('');
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const handleInviteCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (inviteCode.trim().toLowerCase() === 'vip1125') {
      // Correct invite code - redirect to billing page
      onClose();
      navigate('/billing');
    } else {
      // Incorrect invite code
      setInviteError('Invalid invite code. Please check and try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post('/waitlist/join', formData);

      if (response.data.success) {
        setSuccess(true);
        // Reset form
        setFormData({ name: '', email: '', phone: '' });
      }
    } catch (err: any) {
      console.error('Failed to join waitlist:', err);
      setError(err.response?.data?.error || 'Failed to join waitlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setError(null);
    setInviteCode('');
    setInviteError(null);
    onClose();
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
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
                    onClick={handleClose}
                  >
                    <span className="sr-only">Close</span>
                    <X className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                {success ? (
                  // Success State
                  <div className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
                      <CheckCircle className="h-6 w-6 text-green-600" aria-hidden="true" />
                    </div>
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 mb-2">
                      You're on the list!
                    </Dialog.Title>
                    <p className="text-sm text-gray-500 mb-6">
                      Thank you for joining the waitlist! We'll notify you when spaces open up.
                    </p>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                      onClick={handleClose}
                    >
                      Got it
                    </button>
                  </div>
                ) : (
                  // Form State
                  <div>
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 mb-6">
                      Join the Waitlist
                    </Dialog.Title>

                    {/* Invite Code Section */}
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Key className="h-5 w-5 text-blue-600" />
                        <h4 className="text-sm font-semibold text-gray-900">Have an Invite Code?</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Enter your exclusive invite code to get immediate access
                      </p>

                      {inviteError && (
                        <div className="rounded-md bg-red-50 p-3 mb-3">
                          <p className="text-sm text-red-700">{inviteError}</p>
                        </div>
                      )}

                      <form onSubmit={handleInviteCodeSubmit} className="space-y-3">
                        <input
                          type="text"
                          value={inviteCode}
                          onChange={(e) => {
                            setInviteCode(e.target.value);
                            setInviteError(null);
                          }}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2 border text-gray-900 placeholder-gray-400"
                          placeholder="Enter invite code"
                        />
                        <button
                          type="submit"
                          className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                          <Key className="h-4 w-4" />
                          Verify Code
                        </button>
                      </form>
                    </div>

                    {/* Divider */}
                    <div className="relative mb-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">OR</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-6">
                      Be the first to know when we open new spaces. We'll keep you updated!
                    </p>

                    {error && (
                      <div className="rounded-md bg-red-50 p-4 mb-4">
                        <div className="flex">
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error</h3>
                            <div className="mt-2 text-sm text-red-700">{error}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="name"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2 border text-gray-900 placeholder-gray-400"
                          placeholder="John Doe"
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          id="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2 border text-gray-900 placeholder-gray-400"
                          placeholder="john@example.com"
                        />
                      </div>

                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number <span className="text-gray-400">(optional)</span>
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2 border text-gray-900 placeholder-gray-400"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>

                      <div className="mt-6 flex justify-end gap-3">
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300"
                          onClick={handleClose}
                          disabled={loading}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Joining...
                            </>
                          ) : (
                            'Join Waitlist'
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
