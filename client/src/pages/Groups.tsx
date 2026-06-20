import React, { useEffect, useState } from 'react';
import { useGroupStore } from '@/stores/group.store';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/Button';
import { Navigation } from '@/components/Navigation';
import type { CreateGroupRequest, JoinGroupRequest } from '@bible-rankings/shared';

import { api } from '@/services/api';

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
  // const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null); // Removed unused state

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
    // setSelectedGroupId(groupId);
    await loadGroupDetails(groupId);
    setActiveTab('details');
  };

  const handleBackToGroups = () => {
    setActiveTab('groups');
    // setSelectedGroupId(null);
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
      // setSelectedGroupId(null);
      clearCurrentGroup();
    } catch (error: any) {
      // 错误处理
      console.error('退出群组失败:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="max-w-4xl mx-auto py-12 px-8">
        {/* Header - Minimalist */}
        <div className="mb-12 flex flex-col md:flex-row justify-between items-end border-b border-gray-100 pb-8">
          <div>
            <h1 className="text-4xl font-light text-gray-900 mb-2 tracking-tight">群组</h1>
            <p className="text-gray-500 font-light">加入教会、小组或创建你自己的阅读群组</p>
          </div>

          {/* Tabs - Minimalist Text */}
          <div className="flex space-x-8 mt-8 md:mt-0">
            <button
              className={`pb-1 text-sm uppercase tracking-wider transition-colors ${activeTab === 'groups'
                ? 'text-gray-900 border-b border-gray-900 font-medium'
                : 'text-gray-400 hover:text-gray-600 border-b border-transparent'
                }`}
              onClick={() => setActiveTab('groups')}
            >
              我的群组 ({groups.length})
            </button>
            <button
              className={`pb-1 text-sm uppercase tracking-wider transition-colors ${activeTab === 'create'
                ? 'text-gray-900 border-b border-gray-900 font-medium'
                : 'text-gray-400 hover:text-gray-600 border-b border-transparent'
                }`}
              onClick={() => setActiveTab('create')}
            >
              创建群组
            </button>
            <button
              className={`pb-1 text-sm uppercase tracking-wider transition-colors ${activeTab === 'join'
                ? 'text-gray-900 border-b border-gray-900 font-medium'
                : 'text-gray-400 hover:text-gray-600 border-b border-transparent'
                }`}
              onClick={() => setActiveTab('join')}
            >
              加入群组
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 border-l-2 border-red-500 pl-4 py-2 text-red-600 flex justify-between">
            <span>{error}</span>
            <button onClick={clearError} className="text-gray-400 hover:text-gray-900">✕</button>
          </div>
        )}

        {/* Content */}
        <div>
          {/* 群组列表 */}
          {activeTab === 'groups' && (
            <div>
              <div className="flex justify-end mb-6">
                <button
                  onClick={() => loadGroups()}
                  disabled={isLoading}
                  className="text-xs uppercase tracking-wider text-gray-400 hover:text-gray-900"
                >
                  刷新列表
                </button>
              </div>

              {isLoading ? (
                <div className="text-center py-12 text-gray-300 animate-pulse">加载中...</div>
              ) : groups.length > 0 ? (
                <div className="space-y-0">
                  {groups.map((group) => (
                    <div key={group.id} className="group py-8 border-b border-gray-100 hover:bg-gray-50 transition-colors px-4 -mx-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <h3 className="text-xl font-medium text-gray-900">{group.name}</h3>
                            {group.ownerId === user?.id && (
                              <span className="text-xs uppercase tracking-widest text-gray-400 border border-gray-200 px-2 py-0.5">
                                群主
                              </span>
                            )}
                            <span className={`text-xs uppercase tracking-widest px-2 py-0.5 ${group.isPublic ? 'text-green-600 bg-green-50' : 'text-gray-500 bg-gray-100'
                              }`}>
                              {group.isPublic ? '公开' : '私有'}
                            </span>
                          </div>

                          {group.description && (
                            <p className="text-gray-500 font-light mb-4 max-w-2xl">{group.description}</p>
                          )}

                          <div className="flex items-center space-x-6 text-sm text-gray-400 font-mono">
                            <span>成员: {group.memberCount || 0}</span>
                            <span>代码: {group.code}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => handleViewGroupDetails(group.id)}
                            className="text-sm font-medium text-gray-900 hover:text-gray-600 border-b border-gray-900 hover:border-gray-600 pb-0.5 transition-colors"
                          >
                            查看详情
                          </button>
                          {group.ownerId === user?.id && (
                            <button
                              onClick={() => window.location.href = `/groups/manage/${group.id}`}
                              className="text-sm text-gray-400 hover:text-gray-900 transition-colors"
                            >
                              管理
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24">
                  <h3 className="text-xl font-light text-gray-900 mb-2">暂无群组</h3>
                  <p className="text-gray-400 font-light mb-8">创建一个群组或加入现有的群组来开始吧！</p>
                  <div className="space-x-6">
                    <button
                      onClick={() => setActiveTab('create')}
                      className="text-sm font-medium text-gray-900 border-b border-gray-900 pb-1 hover:text-gray-600 hover:border-gray-600"
                    >
                      创建群组
                    </button>
                    <button
                      onClick={() => setActiveTab('join')}
                      className="text-sm text-gray-500 hover:text-gray-900"
                    >
                      加入群组
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 创建群组 */}
          {activeTab === 'create' && (
            <div className="max-w-xl mx-auto py-8">
              <form onSubmit={handleCreateGroup} className="space-y-8">
                <div className="space-y-6">
                  <div>
                    <label htmlFor="groupName" className="block text-sm font-medium text-gray-900 mb-2">
                      群组名称
                    </label>
                    <input
                      type="text"
                      id="groupName"
                      value={createForm.name}
                      onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                      placeholder="例如：恩典教会读经小组"
                      className="w-full border-b border-gray-300 py-2 focus:border-gray-900 focus:outline-none transition-colors bg-transparent placeholder-gray-300"
                      maxLength={50}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="groupDescription" className="block text-sm font-medium text-gray-900 mb-2">
                      群组描述
                    </label>
                    <textarea
                      id="groupDescription"
                      value={createForm.description}
                      onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                      placeholder="描述群组的目的和特色..."
                      rows={3}
                      className="w-full border-b border-gray-300 py-2 focus:border-gray-900 focus:outline-none transition-colors bg-transparent placeholder-gray-300 resize-none"
                      maxLength={200}
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={createForm.isPublic}
                      onChange={(e) => setCreateForm({ ...createForm, isPublic: e.target.checked })}
                      className="h-4 w-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                    />
                    <label htmlFor="isPublic" className="ml-3 block text-sm text-gray-600">
                      公开群组 <span className="text-gray-400">(其他用户可以看到并申请加入)</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-6 pt-8">
                  <button
                    type="button"
                    onClick={() => setActiveTab('groups')}
                    className="text-sm text-gray-400 hover:text-gray-900"
                  >
                    取消
                  </button>
                  <Button
                    type="submit"
                    disabled={isCreating || !createForm.name.trim()}
                    className="w-32"
                  >
                    {isCreating ? '创建中...' : '创建群组'}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* 加入群组 */}
          {activeTab === 'join' && (
            <div className="max-w-xl mx-auto py-8">
              <form onSubmit={handleJoinGroup} className="space-y-8">
                <div>
                  <label htmlFor="groupCode" className="block text-sm font-medium text-gray-900 mb-2">
                    群组代码
                  </label>
                  <input
                    type="text"
                    id="groupCode"
                    value={joinForm.code}
                    onChange={(e) => setJoinForm({ code: e.target.value.toUpperCase() })}
                    placeholder="输入8位群组代码"
                    className="w-full border-b border-gray-300 py-2 focus:border-gray-900 focus:outline-none transition-colors bg-transparent placeholder-gray-300 font-mono text-lg tracking-widest uppercase"
                    maxLength={8}
                    required
                  />
                  <p className="mt-2 text-xs text-gray-400">
                    请联系群组管理员获取群组代码
                  </p>
                </div>

                <div className="flex items-center justify-end space-x-6 pt-8">
                  <button
                    type="button"
                    onClick={() => setActiveTab('groups')}
                    className="text-sm text-gray-400 hover:text-gray-900"
                  >
                    取消
                  </button>
                  <Button
                    type="submit"
                    disabled={isJoining || !joinForm.code.trim()}
                    className="w-32"
                  >
                    {isJoining ? '加入中...' : '加入群组'}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* 群组详情 */}
          {activeTab === 'details' && currentGroup && (
            <div>
              <div className="mb-8">
                <button
                  onClick={handleBackToGroups}
                  className="text-sm text-gray-400 hover:text-gray-900 flex items-center space-x-2"
                >
                  <span>←</span>
                  <span>返回列表</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-12">
                  <div>
                    <div className="flex items-center space-x-4 mb-4">
                      <h2 className="text-3xl font-light text-gray-900">{currentGroup.name}</h2>
                      {currentGroup.ownerId === user?.id && (
                        <span className="text-xs uppercase tracking-widest text-gray-400 border border-gray-200 px-2 py-0.5">
                          群主
                        </span>
                      )}
                    </div>

                    {currentGroup.description && (
                      <p className="text-gray-600 leading-relaxed mb-6">{currentGroup.description}</p>
                    )}

                    <div className="flex items-center space-x-8 text-sm text-gray-500 font-mono border-t border-gray-100 pt-6">
                      <span>成员: {currentGroup.members.length}</span>
                      <span>代码: <span className="text-gray-900">{currentGroup.code}</span></span>
                      <span className={currentGroup.isPublic ? 'text-green-600' : 'text-gray-400'}>
                        {currentGroup.isPublic ? '公开' : '私有'}
                      </span>
                    </div>
                  </div>

                  {/* Members List */}
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-6">群组成员</h3>
                    <div className="space-y-0">
                      {currentGroup.members.map((member) => (
                        <div key={member.id} className="flex items-center justify-between py-4 border-b border-gray-100">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gray-100 flex items-center justify-center text-gray-500 text-sm font-medium">
                              {member.user.displayName.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-gray-900 font-medium">{member.user.displayName}</span>
                                <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 ${member.role === 'OWNER'
                                  ? 'bg-gray-900 text-white'
                                  : member.role === 'ADMIN'
                                    ? 'bg-gray-200 text-gray-800'
                                    : 'bg-gray-50 text-gray-500'
                                  }`}>
                                  {member.role === 'OWNER' ? '群主' : member.role === 'ADMIN' ? '管理员' : '成员'}
                                </span>
                                {member.user.id === user?.id && (
                                  <span className="text-gray-400 text-xs">(我)</span>
                                )}
                              </div>
                              <p className="text-xs text-gray-400 font-mono mt-0.5">@{member.user.username}</p>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-4">
                            <div className="text-xs text-gray-400 hidden sm:block">
                              {new Date(member.joinedAt).toLocaleDateString()} 加入
                            </div>

                            {member.user.id === user?.id && currentGroup.ownerId !== user?.id && (
                              <button
                                onClick={() => handleLeaveGroup()}
                                className="text-xs uppercase tracking-wider text-gray-400 hover:text-red-600 transition-colors"
                              >
                                退出
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sidebar Info (QR Code) */}
                <div className="lg:col-span-1">
                  <div className="bg-gray-50 p-8 text-center">
                    <img
                      src={generateQRCodeUrl(currentGroup.code)}
                      alt="群组二维码"
                      className="w-48 h-48 mx-auto mb-6 mix-blend-multiply"
                    />
                    <p className="text-sm text-gray-500 mb-2">扫码加入群组</p>
                    <p className="text-xs text-gray-400 font-mono">{currentGroup.code}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};