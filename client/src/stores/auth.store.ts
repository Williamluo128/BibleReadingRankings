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
  syncUserFromSession: (accessToken: string) => Promise<boolean>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      // 应用启动时默认"加载中",直到 checkAuth / onAuthStateChange 给出明确结论。
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
        set({ isLoading: true });
        try {
          const user = await AuthAPI.getCurrentUser(accessToken);
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
          return true;
        } catch (error) {
          console.error('Failed to sync user from session:', error);
          set({ isLoading: false });
          return false;
        }
      },

      checkAuth: async () => {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
          return;
        }

        const synced = await get().syncUserFromSession(session.access_token);
        if (!synced) {
          await supabase.auth.signOut();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // 持久化恢复后仍需重新校验 Supabase session,避免过期 token 误判已登录
        if (state) {
          state.isLoading = true;
        }
      },
    }
  )
);

// 全局监听 Supabase auth 状态变化(session 建立/销毁)
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session) {
    // 延迟到当前 auth 事件处理完成后再调 API,避免在回调内 getSession 死锁
    setTimeout(() => {
      void useAuthStore.getState().syncUserFromSession(session.access_token);
    }, 0);
  } else if (event === 'SIGNED_OUT') {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }
});
