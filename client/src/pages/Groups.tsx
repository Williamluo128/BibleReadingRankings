import React, { useEffect, useState } from 'react';
import { useGroupStore } from '@/stores/group.store';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/Button';
import { Navigation } from '@/components/Navigation';
import type { CreateGroupRequest, JoinGroupRequest } from '@bible-rankings/shared';

export const GroupsPage: React.FC = () => {
  const { user } = useAuthStore();
  const {
    groups,
    currentGroup,
    isLoading,
    isCreating,
    isJoining,
    error,
    loadGroups,
    createGroup,
    joinGroup,
    loadGroupDetails,
    clearError,
    clearCurrentGroup,
  } = useGroupStore();

  const [activeTab, setActiveTab] = useState<'groups' | 'create' | 'join' | 'details'>('groups');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  // 创建群组表单状态
  const [createForm, setCreateForm] = useState<CreateGroupRequest>({
    name: '',
    description: '',
    isPublic: false
  });

  // 加入群组表单状态
  const [joinForm, setJoinForm] = useState<JoinGroupRequest>({
    code: ''
  });

  useEffect(() => {
    if (user) {
      loadGroups();
    }
  }, [user, loadGroups]);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim()) return;

    try {
      await createGroup(createForm);
      setCreateForm({ name: '', description: '', isPublic: false });
      setActiveTab('groups');
    } catch (error) {
      // 错误已在store中处理
    }
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinForm.code.trim()) return;

    try {
      await joinGroup(joinForm);
      setJoinForm({ code: '' });
      setActiveTab('groups');
    } catch (error) {
      // 错误已在store中处理
    }
  };

  const handleViewGroupDetails = async (groupId: string) => {
    setSelectedGroupId(groupId);
    await loadGroupDetails(groupId);
    setActiveTab('details');
  };

  const handleBackToGroups = () => {
    setActiveTab('groups');
    setSelectedGroupId(null);
    clearCurrentGroup();
  };

  const generateQRCodeUrl = (code: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(code)}`;
  };

  const handleLeaveGroup = async () => {
    if (!currentGroup || !confirm('确定要退出群组吗？')) return;
    
    try {
      await api.post(`/groups/${currentGroup.id}/leave`);
      // 重新加载群组列表
      loadGroups();
      // 清除当前群组详情
      setActiveTab('groups');
      setSelectedGroupId(null);
      clearCurrentGroup();
    } catch (error: any) {
      // 错误处理
      console.error('退出群组失败:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">群组管理</h1>
          <p className="mt-2 text-gray-600">加入教会、小组或创建你自己的阅读群组</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'groups'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('groups')}
            >
              我的群组 ({groups.length})
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'create'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('create')}
            >
              创建群组
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'join'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('join')}
            >
              加入群组
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow">
          {/* 群组列表 */}
          {activeTab === 'groups' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">我的群组</h2>
                <Button
                  onClick={() => loadGroups()}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                >
                  刷新
                </Button>
              </div>

              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">加载中...</p>
                </div>
              ) : groups.length > 0 ? (
                <div className="space-y-4">
                  {groups.map((group) => (
                    <div key={group.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-medium text-gray-900">{group.name}</h3>
                            {group.ownerId === user?.id && (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-primary-100 text-primary-800">
                                群主
                              </span>
                            )}
                          </div>
                          {group.description && (
                            <p className="mt-1 text-sm text-gray-500">{group.description}</p>
                          )}
                          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                            <span>成员: {group.memberCount || 0}</span>
                            <span>代码: {group.code}</span>
                            <span className={group.isPublic ? 'text-green-600' : 'text-orange-600'}>
                              {group.isPublic ? '公开群组' : '私有群组'}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleViewGroupDetails(group.id)}
                            size="sm"
                            variant="outline"
                          >
                            查看详情
                          </Button>
                          {group.ownerId === user?.id && (
                            <Button
                              onClick={() => window.location.href = `/groups/manage/${group.id}`}
                              size="sm"
                            >
                              管理群组
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">还没有加入任何群组</h3>
                  <p className="text-gray-600 mb-4">创建一个群组或加入现有的群组来开始吧！</p>
                  <div className="space-x-3">
                    <Button onClick={() => setActiveTab('create')}>
                      创建群组
                    </Button>
                    <Button variant="outline" onClick={() => setActiveTab('join')}>
                      加入群组
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 创建群组 */}
          {activeTab === 'create' && (
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">创建新群组</h2>
              
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div>
                  <label htmlFor="groupName" className="block text-sm font-medium text-gray-700">
                    群组名称 *
                  </label>
                  <input
                    type="text"
                    id="groupName"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    placeholder="例如：恩典教会读经小组"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    maxLength={50}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="groupDescription" className="block text-sm font-medium text-gray-700">
                    群组描述
                  </label>
                  <textarea
                    id="groupDescription"
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    placeholder="描述群组的目的和特色..."
                    rows={3}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    maxLength={200}
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={createForm.isPublic}
                    onChange={(e) => setCreateForm({ ...createForm, isPublic: e.target.checked })}
                    className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">
                    公开群组（其他用户可以看到并申请加入）
                  </label>
                </div>

                <div className="flex space-x-3">
                  <Button
                    type="submit"
                    disabled={isCreating || !createForm.name.trim()}
                  >
                    {isCreating ? '创建中...' : '创建群组'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab('groups')}
                  >
                    取消
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* 加入群组 */}
          {activeTab === 'join' && (
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">加入群组</h2>
              
              <form onSubmit={handleJoinGroup} className="space-y-4">
                <div>
                  <label htmlFor="groupCode" className="block text-sm font-medium text-gray-700">
                    群组代码
                  </label>
                  <input
                    type="text"
                    id="groupCode"
                    value={joinForm.code}
                    onChange={(e) => setJoinForm({ code: e.target.value.toUpperCase() })}
                    placeholder="输入8位群组代码，例如：ABC12345"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    maxLength={8}
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    请联系群组管理员获取群组代码或扫描群组二维码
                  </p>
                </div>

                <div className="flex space-x-3">
                  <Button
                    type="submit"
                    disabled={isJoining || !joinForm.code.trim()}
                  >
                    {isJoining ? '加入中...' : '加入群组'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab('groups')}
                  >
                    返回
                  </Button>
                </div>
              </form>

              {/* QR码扫描说明 */}
              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start">
                  <svg className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-medium text-blue-800">如何加入群组？</h3>
                    <ul className="mt-1 text-sm text-blue-700">
                      <li>• 方式一：向群组管理员索要8位群组代码，在上方输入加入</li>
                      <li>• 方式二：使用手机扫描群组二维码（未来功能）</li>
                      <li>• 方式三：如果是公开群组，可以在群组列表中直接申请加入</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 群组详情 */}
          {activeTab === 'details' && currentGroup && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <Button
                  variant="outline"
                  onClick={handleBackToGroups}
                  size="sm"
                >
                  ← 返回群组列表
                </Button>
              </div>

              {/* 群组信息 */}
              <div className="mb-8">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h2 className="text-2xl font-bold text-gray-900">{currentGroup.name}</h2>
                      {currentGroup.ownerId === user?.id && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                          群主
                        </span>
                      )}
                    </div>
                    {currentGroup.description && (
                      <p className="text-gray-600 mb-3">{currentGroup.description}</p>
                    )}
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <span>成员: {currentGroup.members.length}</span>
                      <span>群组代码: <strong className="font-mono text-gray-900">{currentGroup.code}</strong></span>
                      <span className={currentGroup.isPublic ? 'text-green-600' : 'text-orange-600'}>
                        {currentGroup.isPublic ? '公开群组' : '私有群组'}
                      </span>
                    </div>
                  </div>
                  
                  {/* QR码 */}
                  <div className="ml-6">
                    <div className="text-center">
                      <img
                        src={generateQRCodeUrl(currentGroup.code)}
                        alt="群组二维码"
                        className="w-32 h-32 border border-gray-200 rounded"
                      />
                      <p className="mt-2 text-xs text-gray-500">扫码加入群组</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 成员列表 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">群组成员</h3>
                <div className="space-y-3">
                  {currentGroup.members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-semibold">
                            {member.user.displayName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900">{member.user.displayName}</h4>
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                              member.role === 'OWNER' 
                                ? 'bg-purple-100 text-purple-800'
                                : member.role === 'ADMIN'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {member.role === 'OWNER' ? '群主' : member.role === 'ADMIN' ? '管理员' : '成员'}
                            </span>
                            {member.user.id === user?.id && (
                              <span className="text-primary-600 text-xs">(我)</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">@{member.user.username}</p>
                          <p className="text-xs text-gray-400">
                            加入时间: {new Date(member.joinedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      {/* 管理操作 */}
                      {(currentGroup.ownerId === user?.id || 
                        (currentGroup.members.find(m => m.user.id === user?.id)?.role === 'ADMIN' && 
                         member.role === 'MEMBER')) && 
                       member.user.id !== user?.id && (
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            管理
                          </Button>
                        </div>
                      )}
                      
                      {/* 退出群组按钮 */}
                      {member.user.id === user?.id && currentGroup.ownerId !== user?.id && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleLeaveGroup()}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          退出群组
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};