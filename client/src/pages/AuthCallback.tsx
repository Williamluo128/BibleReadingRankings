import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, waitForAccessToken } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';

/**
 * OAuth 回调落地页。
 * Supabase PKCE 完成后带着 ?code= 跳回这里,SDK 异步交换 session。
 */
export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
      return;
    }

    let done = false;
    const finish = (path: '/' | '/login') => {
      if (done) return;
      done = true;
      navigate(path, { replace: true });
    };

    const unsub = useAuthStore.subscribe(s => {
      if (s.isAuthenticated) {
        finish('/');
      }
    });

    const completeLogin = async (accessToken: string) => {
      const result = await useAuthStore.getState().syncUserFromSession(accessToken);
      finish(result.ok ? '/' : '/login');
    };

    // 优先监听 SIGNED_IN(PKCE 交换完成后触发,此时 access_token 一定可用)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.access_token) {
        void completeLogin(session.access_token);
      }
    });

    // 兜底:轮询等待 access_token(防止 onAuthStateChange 已先触发)
    void (async () => {
      const token = await waitForAccessToken();
      if (!token) {
        finish('/login');
        return;
      }
      if (!useAuthStore.getState().isAuthenticated) {
        await completeLogin(token);
      }
    })();

    const timeout = setTimeout(() => finish('/login'), 15000);

    return () => {
      unsub();
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [navigate, isAuthenticated]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-sm text-gray-500 font-light">正在完成登录...</p>
      </div>
    </div>
  );
};
