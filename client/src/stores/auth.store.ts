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
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

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
          // 浏览器会跳转到 Google,不需要在这里设 isAuthenticated
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

      checkAuth: async () => {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          set({ isAuthenticated: false, isLoading: false });
          return;
        }

        set({ isLoading: true });
        try {
          // 调后端 /auth/me → 触发 upsert + 获取本地用户
          const user = await AuthAPI.getCurrentUser();
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          console.error('Auth check failed:', error);
          // session 无效则登出
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
    }
  )
);

// 全局监听 Supabase auth 状态变化(session 建立/销毁)
supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'SIGNED_IN' && session) {
    // 新 session 建立(如 OAuth 回调后):调后端同步用户
    try {
      const user = await AuthAPI.getCurrentUser();
      const store = useAuthStore.getState();
      store.setUser(user);
      useAuthStore.setState({ isLoading: false });
    } catch (error) {
      console.error('Failed to sync user after sign in:', error);
      useAuthStore.setState({ isLoading: false });
    }
  } else if (event === 'SIGNED_OUT') {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }
});
