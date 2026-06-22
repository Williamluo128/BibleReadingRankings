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

// Request interceptor:从 Supabase session 取 access_token 注入
api.interceptors.request.use(async (config) => {
  // 已手动注入 token 时跳过(避免在 onAuthStateChange 回调链里再次 getSession 死锁)
  if (config.headers.Authorization) {
    return config;
  }
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
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
    const response = await api.get<ApiResponse<{ user: User }>>(
      '/auth/me',
      accessToken
        ? { headers: { Authorization: `Bearer ${accessToken}` } }
        : undefined,
    );
    return response.data.data!.user;
  }

  // PATCH /api/auth/profile —— 更新 displayName / avatarUrl
  static async updateProfile(data: { displayName?: string; avatarUrl?: string }): Promise<User> {
    const response = await api.patch<ApiResponse<{ user: User }>>('/auth/profile', data);
    return response.data.data!.user;
  }
}
