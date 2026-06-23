import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';
import { isJwtFormat, normalizeAccessToken } from '@/lib/auth-token';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

function debugLog(step: string, data: Record<string, unknown>, hypothesisId: string) {
  const payload = { step, ...data, at: Date.now() };
  try {
    sessionStorage.setItem('auth-debug-last', JSON.stringify(payload));
  } catch {
    // ignore quota errors
  }
  void fetch(`${API_BASE_URL}/auth/telemetry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ step, data, hypothesisId, at: Date.now() }),
  }).catch(() => {});
  // #region agent log
  fetch('http://127.0.0.1:7909/ingest/24def34c-6315-45bf-a5d3-0f76b2a3ef88',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ce6c75'},body:JSON.stringify({sessionId:'ce6c75',location:'AuthCallback.tsx',message:step,data,timestamp:Date.now(),hypothesisId})}).catch(()=>{});
  // #endregion
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

let callbackLock: string | null = null;

/**
 * OAuth 回调落地页。
 * 显式 exchangeCodeForSession,确保 PKCE 完成后再调 /auth/me。
 */
export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    void (async () => {
      await waitForAuthHydration();

      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const lockKey = code?.slice(0, 24) ?? 'no-code';

      if (callbackLock === lockKey) {
        return;
      }
      callbackLock = lockKey;

      // 丢弃陈旧 persist,仅信任本次 OAuth
      useAuthStore.persist.clearStorage();
      useAuthStore.setState({
        user: null,
        isAuthenticated: false,
        isLoading: true,
        hasHydrated: true,
      });

      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const hashError = hashParams.get('error_description') || hashParams.get('error');

      debugLog('callback_start', { hasCode: !!code, hashError: hashError ?? null }, 'A');

      if (hashError) {
        setErrorMessage(hashError);
        debugLog('finish', { path: '/login', reason: 'oauth_hash_error' }, 'D');
        window.location.replace('/login');
        return;
      }

      if (code) {
        const codeKey = `oauth_done_${code.slice(0, 24)}`;
        if (sessionStorage.getItem(codeKey) === '1') {
          const { isAuthenticated } = useAuthStore.getState();
          debugLog('duplicate_code', { isAuthenticated }, 'E');
          window.location.replace(isAuthenticated ? '/' : '/login');
          return;
        }
        sessionStorage.setItem(`oauth_processing_${code.slice(0, 24)}`, '1');
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
        debugLog('finish', { path: '/login', reason: 'no_access_token', exchangeError }, 'A');
        window.location.replace('/login');
        return;
      }

      const normalizedToken = normalizeAccessToken(accessToken);
      if (!isJwtFormat(normalizedToken)) {
        setErrorMessage('登录凭证格式无效,请重试');
        debugLog('finish', {
          path: '/login',
          reason: 'malformed_token',
          segments: normalizedToken.split('.').length,
          tokenLen: normalizedToken.length,
        }, 'J');
        window.location.replace('/login');
        return;
      }

      const result = await useAuthStore.getState().syncUserFromSession(normalizedToken);

      debugLog('sync_result', {
        ok: result.ok,
        authFailed: result.authFailed,
        status: result.status ?? null,
        error: result.error ?? null,
      }, 'C');

      if (code) {
        sessionStorage.setItem(`oauth_done_${code.slice(0, 24)}`, '1');
        sessionStorage.removeItem(`oauth_processing_${code.slice(0, 24)}`);
      }

      if (!result.ok) {
        setErrorMessage(result.error || `登录同步失败 (${result.status ?? 'unknown'})`);
        debugLog('finish', { path: '/login', reason: 'sync_failed' }, 'C');
        window.location.replace('/login');
        return;
      }

      debugLog('finish', {
        path: '/',
        reason: 'success',
        isAuthenticated: useAuthStore.getState().isAuthenticated,
      }, 'D');
      navigate('/', { replace: true });
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
