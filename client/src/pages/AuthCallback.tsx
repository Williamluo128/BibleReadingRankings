import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';

/**
 * OAuth 回调落地页。
 * Supabase OAuth 完成后带着 hash fragment 跳回这里,SDK 自动提取 token 建立 session。
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

    // 等 Supabase 处理完 URL hash 后再同步用户,避免与 onAuthStateChange 竞争
    const syncTimer = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        finish('/login');
        return;
      }

      const result = await useAuthStore.getState().syncUserFromSession(session.access_token);
      if (result.ok) {
        finish('/');
      } else {
        finish('/login');
      }
    }, 0);

    const timeout = setTimeout(() => finish('/login'), 10000);

    return () => {
      unsub();
      clearTimeout(syncTimer);
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
