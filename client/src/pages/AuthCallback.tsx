import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

/**
 * OAuth 回调落地页。
 * Supabase OAuth 完成后会带着 hash fragment (#access_token=...) 跳回这里。
 * Supabase JS SDK 会自动提取 token 并建立 session,
 * auth.store.ts 的 onAuthStateChange('SIGNED_IN') 会处理后续同步。
 * 此页面只需等待 session 建立,然后跳转首页。
 */
export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase SDK 会自动从 URL hash 提取 token 并触发 onAuthStateChange
    // 我们只需监听一次 session 变化,拿到 session 后跳转
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // session 建立成功,onAuthStateChange 在 auth.store 里会调 /auth/me 同步用户
        // 给一点延迟让 store 完成用户同步
        setTimeout(() => navigate('/', { replace: true }), 500);
      } else if (event === 'TOKEN_REFRESHED' && session) {
        navigate('/', { replace: true });
      }
    });

    // 检查当前是否已有 session(可能 SDK 已经提取了)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setTimeout(() => navigate('/', { replace: true }), 500);
      }
    });

    return () => subscription.unsubscribe();
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
