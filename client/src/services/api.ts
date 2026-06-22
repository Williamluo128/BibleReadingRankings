import axios from 'axios';
import { supabase } from '@/lib/supabase';
import type { ApiResponse, User } from '@bible-rankings/shared';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

function hasAuthHeader(config: { headers?: unknown }): boolean {
  const headers = config.headers as Record<string, string> | undefined;
  if (!headers) return false;
  return Boolean(headers.Authorization || headers.authorization);
}

function setAuthHeader(config: { headers?: unknown }, token: string): void {
  const headers = (config.headers ?? {}) as Record<string, string>;
  headers.Authorization = `Bearer ${token}`;
  config.headers = headers;
}

async function resolveAccessToken(explicitToken?: string): Promise<string | null> {
  const token = explicitToken?.trim();
  if (token) return token;

  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

// Request interceptor:从 Supabase session 取 access_token 注入
api.interceptors.request.use(async (config) => {
  if (hasAuthHeader(config)) {
    return config;
  }

  const token = await resolveAccessToken();
  if (token) {
    setAuthHeader(config, token);
  }
  return config;
});

// Response interceptor:401 时登出并跳转
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      supabase.auth.signOut();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export class AuthAPI {
  // GET /api/auth/me —— 返回本地用户(后端中间件会 upsert)
  static async getCurrentUser(accessToken?: string): Promise<User> {
    const token = await resolveAccessToken(accessToken);
    if (!token) {
      throw new Error('No access token available');
    }

    const response = await api.get<ApiResponse<{ user: User }>>('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data!.user;
  }

  // PATCH /api/auth/profile —— 更新 displayName / avatarUrl
  static async updateProfile(data: { displayName?: string; avatarUrl?: string }): Promise<User> {
    const response = await api.patch<ApiResponse<{ user: User }>>('/auth/profile', data);
    return response.data.data!.user;
  }
}
