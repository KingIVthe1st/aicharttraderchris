import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSignUpWithPassword } from '@/hooks/useAuthMutations';

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const navigate = useNavigate();

  const signUpWithPassword = useSignUpWithPassword();

  // Extract redirect parameters from URL
  const callbackUrl = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const redirectUrl = params.get('redirect');
    const autoCheckout = params.get('autoCheckout');

    // If we have both redirect and autoCheckout, preserve them
    if (redirectUrl && autoCheckout) {
      return `${redirectUrl}?autoCheckout=${autoCheckout}`;
    }

    // If we just have redirect, use it
    if (redirectUrl) {
      return redirectUrl;
    }

    // Default to dashboard
    return '/dashboard';
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signUpWithPassword.mutateAsync({
        email: formData.email,
        password: formData.password,
        name: formData.name || undefined,
      });

      // Redirect to callback URL after successful signup
      navigate(callbackUrl);
    } catch (error) {
      console.error('Sign up failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/signin" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {/* Sign Up Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="sr-only">
                Full Name (optional)
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Full Name (optional)"
              />
            </div>

            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password (min 8 characters)"
              />
            </div>

            {signUpWithPassword.error && (
              <div className="text-red-600 text-sm text-center">
                {signUpWithPassword.error instanceof Error
                  ? signUpWithPassword.error.message
                  : 'Failed to create account. Please try again.'}
              </div>
            )}

            <button
              type="submit"
              disabled={signUpWithPassword.isPending}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {signUpWithPassword.isPending ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="text-xs text-center text-gray-500">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
