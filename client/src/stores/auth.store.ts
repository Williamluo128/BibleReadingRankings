import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@bible-rankings/shared';
import { supabase } from '@/lib/supabase';
import { AuthAPI } from '@/services/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasHydrated: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  syncUserFromSession: (accessToken: string) => Promise<{ ok: boolean; authFailed: boolean; status?: number; error?: string }>;
  setUser: (user: User | null) => void;
}

function waitForAuthHydration(): Promise<void> {
  if (useAuthStore.getState().hasHydrated) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const unsubscribe = useAuthStore.subscribe((state) => {
      if (state.hasHydrated) {
        unsubscribe();
        resolve();
      }
    });
  });
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
      hasHydrated: false,

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
          return { ok: false, authFailed: false, error: 'empty_token' };
        }

        set({ isLoading: true });
        try {
          const user = await AuthAPI.getCurrentUser(token);
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
          // #region agent log
          fetch('http://127.0.0.1:7909/ingest/24def34c-6315-45bf-a5d3-0f76b2a3ef88',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ce6c75'},body:JSON.stringify({sessionId:'ce6c75',location:'auth.store.ts:syncUserFromSession',message:'sync ok',data:{userId:user.id},timestamp:Date.now(),hypothesisId:'C'})}).catch(()=>{});
          // #endregion
          return { ok: true, authFailed: false };
        } catch (error) {
          console.error('Failed to sync user from session:', error);
          const status = (error as { response?: { status?: number; code?: string } })?.response?.status;
          const code = (error as { response?: { status?: number; code?: string } })?.response?.code;
          const message = error instanceof Error ? error.message : 'unknown';
          // #region agent log
          fetch('http://127.0.0.1:7909/ingest/24def34c-6315-45bf-a5d3-0f76b2a3ef88',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ce6c75'},body:JSON.stringify({sessionId:'ce6c75',location:'auth.store.ts:syncUserFromSession',message:'sync failed',data:{status,code,message},timestamp:Date.now(),hypothesisId:'C'})}).catch(()=>{});
          // #endregion
          set({ isLoading: false });
          return { ok: false, authFailed: isAuthFailure(error), status, error: code ? `${code}: ${message}` : message };
        }
      },

      checkAuth: async () => {
        await waitForAuthHydration();

        const { user, isAuthenticated } = get();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.access_token) {
          if (isAuthenticated && user) {
            // OAuth 刚完成时 Supabase session 可能尚未可读,保留已同步的 zustand 状态
            set({ isLoading: false });
            // #region agent log
            fetch('http://127.0.0.1:7909/ingest/24def34c-6315-45bf-a5d3-0f76b2a3ef88',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ce6c75'},body:JSON.stringify({sessionId:'ce6c75',location:'auth.store.ts:checkAuth',message:'keep zustand auth without session',data:{userId:user.id},timestamp:Date.now(),hypothesisId:'D',runId:'post-fix'})}).catch(()=>{});
            // #endregion
            return;
          }
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
          return;
        }

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

useAuthStore.persist.onFinishHydration(() => {
  useAuthStore.setState({ hasHydrated: true });
});

supabase.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_OUT') {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }
});
