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

async function resolveAccessToken(explicitToken?: string): Promise<string | null> {
  const token = explicitToken?.trim();
  if (token) return token;

  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

api.interceptors.request.use(async (config) => {
  const headers = config.headers as Record<string, string> | undefined;
  if (headers?.Authorization || headers?.authorization) {
    return config;
  }

  const token = await resolveAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return config;
});

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
  static async getCurrentUser(accessToken: string): Promise<User> {
    const token = accessToken.trim();
    if (!token) {
      throw new Error('No access token available');
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const body = await response.json() as ApiResponse<{ user: User }>;

    if (!response.ok || !body.success || !body.data?.user) {
      const err = new Error(body.error || `Auth failed with status ${response.status}`);
      (err as Error & { response?: { status: number } }).response = { status: response.status };
      throw err;
    }

    return body.data.user;
  }

  static async updateProfile(data: { displayName?: string; avatarUrl?: string }): Promise<User> {
    const response = await api.patch<ApiResponse<{ user: User }>>('/auth/profile', data);
    return response.data.data!.user;
  }
}
