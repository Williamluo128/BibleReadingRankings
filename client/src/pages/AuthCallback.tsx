import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';

/**
 * OAuth 回调落地页。
 * 显式 exchangeCodeForSession,确保 PKCE 完成后再调 /auth/me。
 */
export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const finish = (path: '/' | '/login') => {
      navigate(path, { replace: true });
    };

    void (async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const hashError = hashParams.get('error_description') || hashParams.get('error');

      if (hashError) {
        finish('/login');
        return;
      }

      // React StrictMode 会双 mount;用 sessionStorage 防止同一 code 重复 exchange
      if (code) {
        const codeKey = `oauth_code_${code.slice(0, 24)}`;
        if (sessionStorage.getItem(codeKey)) {
          finish(useAuthStore.getState().isAuthenticated ? '/' : '/login');
          return;
        }
        sessionStorage.setItem(codeKey, '1');
      }

      let accessToken: string | null = null;

      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (error || !data.session?.access_token) {
          const { data: { session } } = await supabase.auth.getSession();
          accessToken = session?.access_token ?? null;
        } else {
          accessToken = data.session.access_token;
        }
      } else {
        const { data: { session } } = await supabase.auth.getSession();
        accessToken = session?.access_token ?? null;
      }

      if (!accessToken) {
        finish('/login');
        return;
      }

      const result = await useAuthStore.getState().syncUserFromSession(accessToken);
      finish(result.ok ? '/' : '/login');
    })();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-sm text-gray-500 font-light">正在完成登录...</p>
      </div>
    </div>
  );
};
