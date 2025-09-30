import React, { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api } from '@/services/api';

export const SettingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  
  // 密码修改相关状态
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // 处理密码修改
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrors({});
    setPasswordSuccess(false);
    
    // 表单验证
    const errors: Record<string, string> = {};
    
    if (!passwordForm.currentPassword) {
      errors.currentPassword = '请输入当前密码';
    }
    
    if (!passwordForm.newPassword) {
      errors.newPassword = '请输入新密码';
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = '新密码长度至少为6位';
    }
    
    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = '请确认新密码';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = '两次输入的密码不一致';
    }
    
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      errors.newPassword = '新密码不能与当前密码相同';
    }
    
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setIsPasswordLoading(true);
    
    try {
      await api.post('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      setPasswordSuccess(true);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // 3秒后清除成功消息
      setTimeout(() => setPasswordSuccess(false), 3000);
      
    } catch (error: any) {
      setPasswordErrors({
        general: error.response?.data?.error || '修改密码失败，请重试'
      });
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    
    // 清除对应字段的错误
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (passwordErrors.general) {
      setPasswordErrors(prev => ({ ...prev, general: '' }));
    }
  };

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
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">账户设置</h1>
          
          {/* 标签页导航 */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`py-4 px-6 text-sm font-medium border-b-2 ${
                    activeTab === 'profile'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  个人信息
                </button>
                <button
                  onClick={() => setActiveTab('password')}
                  className={`py-4 px-6 text-sm font-medium border-b-2 ${
                    activeTab === 'password'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  修改密码
                </button>
              </nav>
            </div>
            
            <div className="p-6">
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">个人信息</h2>
                  
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">用户名</label>
                      <div className="mt-1 text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                        {user.username}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">显示名称</label>
                      <div className="mt-1 text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                        {user.displayName}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">邮箱地址</label>
                      <div className="mt-1 text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                        {user.email}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">用户角色</label>
                      <div className="mt-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          user.role === 'SUPER_ADMIN' 
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
                  
                  <div className="pt-4">
                    <p className="text-sm text-gray-500">
                      如需修改个人信息，请联系管理员。
                    </p>
                  </div>
                </div>
              )}
              
              {activeTab === 'password' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">修改密码</h2>
                  
                  {passwordSuccess && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                      密码修改成功！
                    </div>
                  )}
                  
                  {passwordErrors.general && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                      {passwordErrors.general}
                    </div>
                  )}
                  
                  <form onSubmit={handlePasswordSubmit} className="space-y-6">
                    <div>
                      <Input
                        label="当前密码"
                        name="currentPassword"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordInputChange}
                        error={passwordErrors.currentPassword}
                        placeholder="请输入当前密码"
                      />
                    </div>
                    
                    <div>
                      <Input
                        label="新密码"
                        name="newPassword"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={passwordForm.newPassword}
                        onChange={handlePasswordInputChange}
                        error={passwordErrors.newPassword}
                        placeholder="请输入新密码（至少6位）"
                      />
                    </div>
                    
                    <div>
                      <Input
                        label="确认新密码"
                        name="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordInputChange}
                        error={passwordErrors.confirmPassword}
                        placeholder="请再次输入新密码"
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setPasswordForm({
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: ''
                          });
                          setPasswordErrors({});
                          setPasswordSuccess(false);
                        }}
                      >
                        取消
                      </Button>
                      
                      <Button
                        type="submit"
                        isLoading={isPasswordLoading}
                        disabled={!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                      >
                        修改密码
                      </Button>
                    </div>
                  </form>
                  
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-sm font-medium text-blue-900 mb-2">密码安全提示</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• 密码长度至少6位</li>
                      <li>• 建议使用大小写字母、数字和特殊字符的组合</li>
                      <li>• 不要使用过于简单或常见的密码</li>
                      <li>• 定期更换密码以保障账户安全</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};