import axios from 'axios';
import type { 
  ApiResponse, 
  AuthResponse, 
  CreateUserRequest, 
  LoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest
} from '@bible-rankings/shared';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export class AuthAPI {
  static async register(userData: CreateUserRequest): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', userData);
    return response.data.data!;
  }

  static async login(loginData: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', loginData);
    return response.data.data!;
  }

  static async getCurrentUser(): Promise<AuthResponse> {
    const response = await api.get<ApiResponse<AuthResponse>>('/auth/me');
    return response.data.data!;
  }

  static async logout(): Promise<void> {
    await api.post('/auth/logout');
  }

  static async forgotPassword(email: string): Promise<string> {
    const response = await api.post<ApiResponse<{ resetToken: string }>>('/auth/forgot-password', { email });
    return response.data.data!.resetToken;
  }

  static async resetPassword(token: string, newPassword: string): Promise<void> {
    await api.post<ApiResponse<void>>('/auth/reset-password', { token, newPassword });
  }

  static async validateResetToken(token: string): Promise<boolean> {
    const response = await api.get<ApiResponse<{ isValid: boolean }>>(`/auth/validate-reset-token/${token}`);
    return response.data.data!.isValid;
  }
}