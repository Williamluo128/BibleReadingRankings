import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';

/**
 * OAuth 回调落地页。
 * Supabase OAuth 完成后带着 hash fragment 跳回这里,SDK 自动提取 token 建立 session。
 * 我们等待"本地用户已同步到 store"后再跳转首页,避免 ProtectedRoute 误判。
 */
export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);

  useEffect(() => {
    // 情况1:store 里已有 user(可能 onAuthStateChange 已先一步同步完)→ 直接跳
    if (user) {
      navigate('/', { replace: true });
      return;
    }

    // 情况2:监听 store 变化,等 onAuthStateChange 同步完 user 后跳
    let done = false;
    const unsub = useAuthStore.subscribe(s => {
      if (s.user && !done) {
        done = true;
        navigate('/', { replace: true });
      }
    });

    // 兜底:如果 SDK 已经提取了 session,主动触发一次 checkAuth(它会调 /auth/me 同步)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        useAuthStore.getState().checkAuth();
      }
    });

    // 超时保护:8 秒还没成功,跳回登录页避免卡死
    const timer = setTimeout(() => {
      if (!done) {
        done = true;
        navigate('/login', { replace: true });
      }
    }, 8000);

    return () => {
      unsub();
      clearTimeout(timer);
    };
  }, [navigate, user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-sm text-gray-500 font-light">正在完成登录...</p>
      </div>
    </div>
  );
};
