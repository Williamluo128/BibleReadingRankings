import React from 'react';
import { Navigation } from '@/components/Navigation';
import { useAuthStore } from '@/stores/auth.store';

export const SettingsPage: React.FC = () => {
  const { user } = useAuthStore();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">请先登录</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="max-w-3xl mx-auto py-12 px-8">
        {/* Header - Minimalist */}
        <div className="mb-12 border-b border-gray-100 pb-8">
          <h1 className="text-4xl font-light text-gray-900 tracking-tight mb-2">账户设置</h1>
          <p className="text-gray-500 font-light">管理您的个人信息</p>
        </div>

        {/* Content */}
        <div className="space-y-12">
          <div className="grid grid-cols-1 gap-12">
            <div className="border-b border-gray-100 pb-8">
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">用户名</label>
              <div className="text-xl font-light text-gray-900 font-mono">
                @{user.username}
              </div>
            </div>

            <div className="border-b border-gray-100 pb-8">
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">显示名称</label>
              <div className="text-xl font-light text-gray-900">
                {user.displayName}
              </div>
            </div>

            <div className="border-b border-gray-100 pb-8">
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">邮箱地址</label>
              <div className="text-xl font-light text-gray-900">
                {user.email}
              </div>
            </div>

            <div className="border-b border-gray-100 pb-8">
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">登录方式</label>
              <div className="text-xl font-light text-gray-900 flex items-center space-x-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span>Google</span>
              </div>
            </div>

            <div className="border-b border-gray-100 pb-8">
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">用户角色</label>
              <div>
                <span className={`text-xs uppercase tracking-wider px-2 py-1 ${user.role === 'SUPER_ADMIN'
                    ? 'bg-purple-100 text-purple-800'
                    : user.role === 'ADMIN'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                  {user.role === 'SUPER_ADMIN' ? '超级管理员' : user.role === 'ADMIN' ? '管理员' : '普通用户'}
                </span>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-400 font-light italic">
            如需修改个人信息，请联系管理员。
          </div>
        </div>
      </div>
    </div>
  );
};
