import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@bible-rankings/shared';
import { supabase } from '@/lib/supabase';
import { AuthAPI } from '@/services/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  syncUserFromSession: (accessToken: string) => Promise<{ ok: boolean; authFailed: boolean }>;
  setUser: (user: User | null) => void;
}

function isAuthFailure(error: unknown): boolean {
  const status = (error as { response?: { status?: number } })?.response?.status;
  return status === 401 || status === 403;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      signInWithGoogle: async () => {
        set({ isLoading: true });
        try {
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: `${window.location.origin}/auth/callback`,
            },
          });
          if (error) {
            set({ isLoading: false });
            throw error;
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await supabase.auth.signOut();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      syncUserFromSession: async (accessToken: string) => {
        const token = accessToken?.trim();
        if (!token) {
          return { ok: false, authFailed: false };
        }

        set({ isLoading: true });
        try {
          const user = await AuthAPI.getCurrentUser(token);
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
          return { ok: true, authFailed: false };
        } catch (error) {
          console.error('Failed to sync user from session:', error);
          set({ isLoading: false });
          return { ok: false, authFailed: isAuthFailure(error) };
        }
      },

      checkAuth: async () => {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.access_token) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
          return;
        }

        const { user, isAuthenticated } = get();
        if (isAuthenticated && user) {
          set({ isLoading: false });
          return;
        }

        const result = await get().syncUserFromSession(session.access_token);
        if (!result.ok && result.authFailed) {
          await supabase.auth.signOut();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user, isLoading: false });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isLoading = true;
        }
      },
    }
  )
);

supabase.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_OUT') {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }
});
