import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/Button';
import { api } from '@/services/api';

interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalGroups: number;
  totalReadingSessions: number;
  totalReadingTime: number;
}

interface Group {
  id: string;
  name: string;
  code: string;
  description?: string;
  isPublic: boolean;
  createdAt: string;
  owner: {
    id: string;
    username: string;
    displayName: string;
  };
  memberCount: number;
}

export const AdminPage: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'groups' | 'system'>('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 检查管理员权限
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  useEffect(() => {
    if (isAdmin) {
      loadStats();
    }
  }, [isAdmin]);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (error: any) {
      setError('加载统计数据失败');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (error: any) {
      setError('加载用户列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      await loadUsers();
    } catch (error: any) {
      setError('修改用户角色失败');
    }
  };

  const handleUserStatusChange = async (userId: string, isActive: boolean) => {
    try {
      await api.put(`/admin/users/${userId}/status`, { isActive });
      await loadUsers();
    } catch (error: any) {
      setError('修改用户状态失败');
    }
  };

  const loadGroups = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/admin/groups');
      setGroups(response.data);
    } catch (error: any) {
      setError('加载群组列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('确定要删除这个群组吗？此操作不可恢复。')) {
      return;
    }

    try {
      await api.delete(`/admin/groups/${groupId}`);
      await loadGroups();
    } catch (error: any) {
      setError('删除群组失败');
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

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">访问被拒绝</h1>
            <p className="mt-2 text-gray-600">您没有访问管理界面的权限</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">系统管理</h1>
          
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={() => setError('')}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          )}
          
          {/* 标签页导航 */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-4 px-6 text-sm font-medium border-b-2 ${
                    activeTab === 'overview'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  系统概览
                </button>
                <button
                  onClick={() => {
                    setActiveTab('users');
                    if (users.length === 0) loadUsers();
                  }}
                  className={`py-4 px-6 text-sm font-medium border-b-2 ${
                    activeTab === 'users'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  用户管理
                </button>
                <button
                  onClick={() => setActiveTab('groups')}
                  className={`py-4 px-6 text-sm font-medium border-b-2 ${
                    activeTab === 'groups'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  群组管理
                </button>
                {isSuperAdmin && (
                  <button
                    onClick={() => setActiveTab('system')}
                    className={`py-4 px-6 text-sm font-medium border-b-2 ${
                      activeTab === 'system'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    系统设置
                  </button>
                )}
              </nav>
            </div>
            
            <div className="p-6">
              {/* 系统概览 */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">系统概览</h2>
                    <Button onClick={loadStats} disabled={isLoading} size="sm">
                      刷新数据
                    </Button>
                  </div>
                  
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                      <p className="mt-2 text-gray-600">加载中...</p>
                    </div>
                  ) : stats ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="bg-blue-50 p-6 rounded-lg">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                              </svg>
                            </div>
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">总用户数</dt>
                              <dd className="text-lg font-semibold text-gray-900">{stats.totalUsers}</dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-green-50 p-6 rounded-lg">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">活跃用户</dt>
                              <dd className="text-lg font-semibold text-gray-900">{stats.activeUsers}</dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-purple-50 p-6 rounded-lg">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                            </div>
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">总群组数</dt>
                              <dd className="text-lg font-semibold text-gray-900">{stats.totalGroups}</dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-orange-50 p-6 rounded-lg">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                            </div>
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">阅读会话</dt>
                              <dd className="text-lg font-semibold text-gray-900">{stats.totalReadingSessions}</dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
              
              {/* 用户管理 */}
              {activeTab === 'users' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">用户管理</h2>
                    <Button onClick={loadUsers} disabled={isLoading} size="sm">
                      刷新列表
                    </Button>
                  </div>
                  
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                      <p className="mt-2 text-gray-600">加载中...</p>
                    </div>
                  ) : (
                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              用户
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              角色
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              状态
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              最后登录
                            </th>
                            {isSuperAdmin && (
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                操作
                              </th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {users.map((userData) => (
                            <tr key={userData.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                    <span className="text-primary-600 font-semibold">
                                      {userData.displayName.charAt(0)}
                                    </span>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{userData.displayName}</div>
                                    <div className="text-sm text-gray-500">@{userData.username}</div>
                                    <div className="text-sm text-gray-500">{userData.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                  userData.role === 'SUPER_ADMIN' 
                                    ? 'bg-purple-100 text-purple-800'
                                    : userData.role === 'ADMIN'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {userData.role === 'SUPER_ADMIN' ? '超级管理员' : userData.role === 'ADMIN' ? '管理员' : '普通用户'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                  userData.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {userData.isActive ? '活跃' : '禁用'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {userData.lastLoginAt ? new Date(userData.lastLoginAt).toLocaleString() : '从未登录'}
                              </td>
                              {isSuperAdmin && userData.id !== user?.id && (
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                  <select
                                    value={userData.role}
                                    onChange={(e) => handleUserRoleChange(userData.id, e.target.value)}
                                    className="text-xs border border-gray-300 rounded px-2 py-1"
                                  >
                                    <option value="USER">普通用户</option>
                                    <option value="ADMIN">管理员</option>
                                    <option value="SUPER_ADMIN">超级管理员</option>
                                  </select>
                                  <button
                                    onClick={() => handleUserStatusChange(userData.id, !userData.isActive)}
                                    className={`text-xs px-2 py-1 rounded ${
                                      userData.isActive 
                                        ? 'text-red-600 hover:text-red-900' 
                                        : 'text-green-600 hover:text-green-900'
                                    }`}
                                  >
                                    {userData.isActive ? '禁用' : '启用'}
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
              
              {/* 群组管理 */}
              {activeTab === 'groups' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">群组管理</h2>
                    <Button onClick={() => loadGroups()} disabled={isLoading} size="sm">
                      刷新列表
                    </Button>
                  </div>
                  
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                      <p className="mt-2 text-gray-600">加载中...</p>
                    </div>
                  ) : (
                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              群组信息
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              群主
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              成员数
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              类型
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              创建时间
                            </th>
                            {isSuperAdmin && (
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                操作
                              </th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {groups.map((group) => (
                            <tr key={group.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{group.name}</div>
                                  <div className="text-sm text-gray-500">代码: {group.code}</div>
                                  {group.description && (
                                    <div className="text-sm text-gray-500 mt-1">{group.description}</div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{group.owner.displayName}</div>
                                <div className="text-sm text-gray-500">@{group.owner.username}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {group.memberCount || 0}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                  group.isPublic ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                                }`}>
                                  {group.isPublic ? '公开' : '私有'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(group.createdAt).toLocaleDateString()}
                              </td>
                              {isSuperAdmin && (
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <button
                                    onClick={() => handleDeleteGroup(group.id)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    删除
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {groups.length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-gray-500">暂无群组数据</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {/* 系统设置 */}
              {activeTab === 'system' && isSuperAdmin && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">系统设置</h2>
                  
                  {/* 系统信息 */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">系统信息</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">系统版本</label>
                        <div className="mt-1 text-sm text-gray-900">v1.0.0</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">数据库状态</label>
                        <div className="mt-1">
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            正常运行
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">最后备份时间</label>
                        <div className="mt-1 text-sm text-gray-900">2024-01-01 12:00:00</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">服务器状态</label>
                        <div className="mt-1">
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            正常运行
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 系统配置 */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">系统配置</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700">允许用户注册</label>
                          <p className="text-sm text-gray-500">是否允许新用户自主注册账户</p>
                        </div>
                        <input
                          type="checkbox"
                          defaultChecked={true}
                          className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700">邮件验证</label>
                          <p className="text-sm text-gray-500">注册时是否需要邮件验证</p>
                        </div>
                        <input
                          type="checkbox"
                          defaultChecked={false}
                          className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700">维护模式</label>
                          <p className="text-sm text-gray-500">开启后仅管理员可访问系统</p>
                        </div>
                        <input
                          type="checkbox"
                          defaultChecked={false}
                          className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <Button>保存设置</Button>
                    </div>
                  </div>

                  {/* 数据管理 */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">数据管理</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">数据备份</h4>
                        <p className="text-sm text-gray-500 mb-4">导出系统数据进行备份</p>
                        <Button variant="outline" size="sm">
                          创建备份
                        </Button>
                      </div>
                      
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">数据清理</h4>
                        <p className="text-sm text-gray-500 mb-4">清理过期的日志和临时数据</p>
                        <Button variant="outline" size="sm">
                          清理数据
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* 危险操作 */}
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-red-900 mb-4">危险操作</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-red-900">重置所有用户数据</label>
                          <p className="text-sm text-red-600">此操作将删除所有用户的阅读记录和统计数据，不可恢复</p>
                        </div>
                        <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-50">
                          重置数据
                        </Button>
                      </div>
                    </div>
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