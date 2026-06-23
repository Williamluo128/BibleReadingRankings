import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';

function debugLog(step: string, data: Record<string, unknown>, hypothesisId: string) {
  try {
    sessionStorage.setItem('auth-debug-last', JSON.stringify({ step, ...data, at: Date.now() }));
  } catch {
    // ignore quota errors
  }
  // #region agent log
  fetch('http://127.0.0.1:7909/ingest/24def34c-6315-45bf-a5d3-0f76b2a3ef88',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ce6c75'},body:JSON.stringify({sessionId:'ce6c75',location:'AuthCallback.tsx',message:step,data,timestamp:Date.now(),hypothesisId})}).catch(()=>{});
  // #endregion
}

/**
 * OAuth 回调落地页。
 * 显式 exchangeCodeForSession,确保 PKCE 完成后再调 /auth/me。
 */
export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!hasHydrated || startedRef.current) {
      return;
    }
    startedRef.current = true;

    const finish = (path: '/' | '/login', reason: string) => {
      debugLog('finish', { path, reason }, 'D');
      navigate(path, { replace: true });
    };

    void (async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const hashError = hashParams.get('error_description') || hashParams.get('error');

      debugLog('callback_start', { hasCode: !!code, hashError: hashError ?? null }, 'A');

      if (hashError) {
        setErrorMessage(hashError);
        finish('/login', 'oauth_hash_error');
        return;
      }

      if (code) {
        const codeKey = `oauth_done_${code.slice(0, 24)}`;
        if (sessionStorage.getItem(codeKey) === '1') {
          const { isAuthenticated } = useAuthStore.getState();
          debugLog('duplicate_code', { isAuthenticated }, 'E');
          finish(isAuthenticated ? '/' : '/login', 'duplicate_code');
          return;
        }
      }

      let accessToken: string | null = null;
      let exchangeError: string | null = null;

      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        debugLog('exchange_result', {
          ok: !error && !!data.session?.access_token,
          error: error?.message ?? null,
          tokenLen: data.session?.access_token?.length ?? 0,
        }, 'A');

        if (error || !data.session?.access_token) {
          exchangeError = error?.message ?? 'exchange returned no session';
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
        setErrorMessage(exchangeError || '未能获取登录凭证,请重试');
        if (code) {
          sessionStorage.setItem(`oauth_done_${code.slice(0, 24)}`, '1');
        }
        finish('/login', 'no_access_token');
        return;
      }

      const result = await useAuthStore.getState().syncUserFromSession(accessToken);

      debugLog('sync_result', {
        ok: result.ok,
        authFailed: result.authFailed,
        status: result.status ?? null,
        error: result.error ?? null,
      }, 'C');

      if (code) {
        sessionStorage.setItem(`oauth_done_${code.slice(0, 24)}`, '1');
      }

      if (!result.ok) {
        setErrorMessage(result.error || `登录同步失败 (${result.status ?? 'unknown'})`);
        finish('/login', 'sync_failed');
        return;
      }

      finish('/', 'success');
    })();
  }, [hasHydrated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-sm text-gray-500 font-light">正在完成登录...</p>
        {errorMessage && (
          <p className="mt-4 text-sm text-red-600 max-w-sm mx-auto">{errorMessage}</p>
        )}
      </div>
    </div>
  );
};
