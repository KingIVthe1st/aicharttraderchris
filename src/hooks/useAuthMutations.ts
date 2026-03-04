import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/lib/api/auth';
import { useAuth } from './useAuth';

export function useSignUpWithPassword() {
  const { refreshSession } = useAuth();

  return useMutation({
    mutationFn: async ({ email, password, name }: { email: string; password: string; name?: string }) => {
      const result = await authApi.signUpWithPassword(email, password, name);
      await refreshSession();
      return result;
    },
  });
}

export function useSignOut() {
  const { signOut } = useAuth();

  return useMutation({
    mutationFn: async () => {
      await signOut();
    },
  });
}

export function useGoogleSignIn() {
  return useMutation({
    mutationFn: async (callbackUrl?: string) => {
      const url = await authApi.getGoogleAuthUrl(callbackUrl);
      window.location.href = url;
    },
  });
}

export function useSignInWithPassword() {
  const { refreshSession } = useAuth();

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const result = await authApi.signInWithPassword(email, password);
      await refreshSession();
      return result;
    },
  });
}
