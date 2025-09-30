import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api } from '@/services/api';

interface GroupMember {
  id: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  joinedAt: string;
  user: {
    id: string;
    username: string;
    displayName: string;
  };
}

interface GroupNotice {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
  author: {
    displayName: string;
  };
}

interface GroupDetails {
  id: string;
  name: string;
  code: string;
  description?: string;
  isPublic: boolean;
  createdAt: string;
  ownerId: string;
  owner: {
    id: string;
    username: string;
    displayName: string;
  };
  members: GroupMember[];
  notices: GroupNotice[];
}

export const GroupManagementPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [group, setGroup] = useState<GroupDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'notices' | 'settings' | 'share'>('overview');
  
  // 编辑状态
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    isPublic: false
  });
  
  // 通知相关状态
  const [showNoticeForm, setShowNoticeForm] = useState(false);
  const [noticeForm, setNoticeForm] = useState({
    title: '',
    content: '',
    isPinned: false
  });

  const isOwner = group?.ownerId === user?.id;
  const isAdmin = group?.members.find(m => m.user.id === user?.id)?.role === 'ADMIN';
  const canManage = isOwner || isAdmin;

  useEffect(() => {
    if (groupId) {
      loadGroupDetails();
    }
  }, [groupId]);

  const loadGroupDetails = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/groups/${groupId}/details`);
      setGroup(response.data);
      setEditForm({
        name: response.data.name,
        description: response.data.description || '',
        isPublic: response.data.isPublic
      });
    } catch (error: any) {
      setError('加载群组详情失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateGroup = async () => {
    try {
      await api.put(`/groups/${groupId}`, editForm);
      await loadGroupDetails();
      setIsEditing(false);
    } catch (error: any) {
      setError('更新群组信息失败');
    }
  };

  const handleLeaveGroup = async () => {
    if (!confirm('确定要退出群组吗？')) return;
    
    try {
      await api.post(`/groups/${groupId}/leave`);
      navigate('/groups');
    } catch (error: any) {
      setError('退出群组失败');
    }
  };

  const handleDeleteGroup = async () => {
    if (!confirm('确定要删除群组吗？此操作不可恢复。')) return;
    
    try {
      await api.delete(`/groups/${groupId}`);
      navigate('/groups');
    } catch (error: any) {
      setError('删除群组失败');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('确定要移除此成员吗？')) return;
    
    try {
      await api.delete(`/groups/${groupId}/members/${memberId}`);
      await loadGroupDetails();
    } catch (error: any) {
      setError('移除成员失败');
    }
  };

  const handlePromoteMember = async (memberId: string, role: 'ADMIN' | 'MEMBER') => {
    try {
      await api.put(`/groups/${groupId}/members/${memberId}/role`, { role });
      await loadGroupDetails();
    } catch (error: any) {
      setError('修改成员权限失败');
    }
  };

  const handleCreateNotice = async () => {
    try {
      await api.post(`/groups/${groupId}/notices`, noticeForm);
      await loadGroupDetails();
      setShowNoticeForm(false);
      setNoticeForm({ title: '', content: '', isPinned: false });
    } catch (error: any) {
      setError('创建通知失败');
    }
  };

  const handleTogglePinNotice = async (noticeId: string, isPinned: boolean) => {
    try {
      await api.put(`/groups/${groupId}/notices/${noticeId}`, { isPinned });
      await loadGroupDetails();
    } catch (error: any) {
      setError('修改通知状态失败');
    }
  };

  const handleDeleteNotice = async (noticeId: string) => {
    if (!confirm('确定要删除此通知吗？')) return;
    
    try {
      await api.delete(`/groups/${groupId}/notices/${noticeId}`);
      await loadGroupDetails();
    } catch (error: any) {
      setError('删除通知失败');
    }
  };

  const generateShareLink = () => {
    return `${window.location.origin}/groups/join/${group?.code}`;
  };

  const generateQRCodeUrl = (code: string) => {
    const shareLink = generateShareLink();
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shareLink)}`;
  };

  const downloadShareImage = async () => {
    if (!group) return;

    // 创建canvas来生成分享图片
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 600;
    canvas.height = 800;

    // 背景
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 主背景
    ctx.fillStyle = '#ffffff';
    ctx.roundRect(40, 40, canvas.width - 80, canvas.height - 80, 20);
    ctx.fill();

    // 标题
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('邀请您加入群组', canvas.width / 2, 120);

    // 群组名称
    ctx.font = 'bold 28px Arial';
    ctx.fillStyle = '#059669';
    ctx.fillText(group.name, canvas.width / 2, 180);

    // 描述
    if (group.description) {
      ctx.font = '20px Arial';
      ctx.fillStyle = '#6b7280';
      ctx.fillText(group.description, canvas.width / 2, 220);
    }

    // 群组代码
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#1f2937';
    ctx.fillText('群组代码', canvas.width / 2, 300);
    
    ctx.font = 'bold 36px monospace';
    ctx.fillStyle = '#dc2626';
    ctx.fillText(group.code, canvas.width / 2, 350);

    // 二维码占位符
    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(canvas.width / 2 - 100, 400, 200, 200);
    ctx.fillStyle = '#6b7280';
    ctx.font = '16px Arial';
    ctx.fillText('扫码加入', canvas.width / 2, 510);

    // 说明文字
    ctx.font = '18px Arial';
    ctx.fillStyle = '#6b7280';
    ctx.fillText('圣经阅读排行榜', canvas.width / 2, 680);
    ctx.fillText('与朋友一起读经，共同成长', canvas.width / 2, 710);

    // 下载图片
    const link = document.createElement('a');
    link.download = `群组邀请-${group.name}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('已复制到剪贴板');
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">群组不存在</h1>
            <Button onClick={() => navigate('/groups')} className="mt-4">
              返回群组列表
            </Button>
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
          {/* Header */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
                <p className="text-gray-600 mt-1">群组代码: {group.code}</p>
                {group.description && (
                  <p className="text-gray-600 mt-2">{group.description}</p>
                )}
              </div>
              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  onClick={() => navigate('/groups')}
                >
                  返回列表
                </Button>
                {!isOwner && (
                  <Button
                    variant="outline"
                    onClick={handleLeaveGroup}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    退出群组
                  </Button>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
              <button
                onClick={() => setError('')}
                className="ml-4 text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          )}

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
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
                  概览
                </button>
                <button
                  onClick={() => setActiveTab('members')}
                  className={`py-4 px-6 text-sm font-medium border-b-2 ${
                    activeTab === 'members'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  成员管理 ({group.members.length})
                </button>
                <button
                  onClick={() => setActiveTab('notices')}
                  className={`py-4 px-6 text-sm font-medium border-b-2 ${
                    activeTab === 'notices'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  群组通知
                </button>
                <button
                  onClick={() => setActiveTab('share')}
                  className={`py-4 px-6 text-sm font-medium border-b-2 ${
                    activeTab === 'share'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  分享群组
                </button>
                {canManage && (
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`py-4 px-6 text-sm font-medium border-b-2 ${
                      activeTab === 'settings'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    群组设置
                  </button>
                )}
              </nav>
            </div>

            <div className="p-6">
              {/* 概览 */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium text-blue-900">成员数量</h3>
                      <p className="text-2xl font-bold text-blue-600">{group.members.length}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium text-green-900">群组类型</h3>
                      <p className="text-lg font-semibold text-green-600">
                        {group.isPublic ? '公开群组' : '私有群组'}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium text-purple-900">创建时间</h3>
                      <p className="text-lg font-semibold text-purple-600">
                        {new Date(group.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">群主信息</h3>
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-semibold">
                          {group.owner.displayName.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">{group.owner.displayName}</p>
                        <p className="text-sm text-gray-500">@{group.owner.username}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 成员管理 */}
              {activeTab === 'members' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">成员管理</h2>
                    {canManage && (
                      <Button size="sm">邀请成员</Button>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    {group.members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-600 font-semibold">
                              {member.user.displayName.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
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
                        
                        {canManage && member.role !== 'OWNER' && member.user.id !== user?.id && (
                          <div className="flex space-x-2">
                            {member.role === 'MEMBER' ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handlePromoteMember(member.id, 'ADMIN')}
                              >
                                设为管理员
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handlePromoteMember(member.id, 'MEMBER')}
                              >
                                取消管理员
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRemoveMember(member.id)}
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              移除
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 群组通知 */}
              {activeTab === 'notices' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">群组通知</h2>
                    {canManage && (
                      <Button onClick={() => setShowNoticeForm(true)}>
                        发布通知
                      </Button>
                    )}
                  </div>

                  {showNoticeForm && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">发布新通知</h3>
                      <div className="space-y-4">
                        <Input
                          label="通知标题"
                          value={noticeForm.title}
                          onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                          placeholder="输入通知标题"
                        />
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            通知内容
                          </label>
                          <textarea
                            value={noticeForm.content}
                            onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                            rows={4}
                            className="block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            placeholder="输入通知内容"
                          />
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="isPinned"
                            checked={noticeForm.isPinned}
                            onChange={(e) => setNoticeForm({ ...noticeForm, isPinned: e.target.checked })}
                            className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          />
                          <label htmlFor="isPinned" className="ml-2 text-sm text-gray-700">
                            置顶通知
                          </label>
                        </div>
                        <div className="flex space-x-4">
                          <Button onClick={handleCreateNotice}>
                            发布通知
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowNoticeForm(false);
                              setNoticeForm({ title: '', content: '', isPinned: false });
                            }}
                          >
                            取消
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {group.notices && group.notices.length > 0 ? (
                      group.notices
                        .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
                        .map((notice) => (
                          <div key={notice.id} className={`p-4 border rounded-lg ${
                            notice.isPinned ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200 bg-white'
                          }`}>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-medium text-gray-900">{notice.title}</h4>
                                  {notice.isPinned && (
                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                      置顶
                                    </span>
                                  )}
                                </div>
                                <p className="text-gray-600 mt-2">{notice.content}</p>
                                <div className="text-sm text-gray-500 mt-2">
                                  {notice.author.displayName} · {new Date(notice.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                              {canManage && (
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleTogglePinNotice(notice.id, !notice.isPinned)}
                                    className="text-sm text-primary-600 hover:text-primary-800"
                                  >
                                    {notice.isPinned ? '取消置顶' : '置顶'}
                                  </button>
                                  <button
                                    onClick={() => handleDeleteNotice(notice.id)}
                                    className="text-sm text-red-600 hover:text-red-800"
                                  >
                                    删除
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">暂无群组通知</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 分享群组 */}
              {activeTab === 'share' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">分享群组</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">邀请链接</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            分享链接
                          </label>
                          <div className="flex">
                            <input
                              type="text"
                              value={generateShareLink()}
                              readOnly
                              className="flex-1 rounded-l-md border border-gray-300 px-3 py-2 text-sm bg-gray-50"
                            />
                            <Button
                              onClick={() => copyToClipboard(generateShareLink())}
                              className="rounded-l-none"
                              size="sm"
                            >
                              复制
                            </Button>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            群组代码
                          </label>
                          <div className="flex">
                            <input
                              type="text"
                              value={group.code}
                              readOnly
                              className="flex-1 rounded-l-md border border-gray-300 px-3 py-2 text-sm bg-gray-50 font-mono"
                            />
                            <Button
                              onClick={() => copyToClipboard(group.code)}
                              className="rounded-l-none"
                              size="sm"
                            >
                              复制
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">二维码分享</h3>
                      <div className="text-center">
                        <img
                          src={generateQRCodeUrl(group.code)}
                          alt="群组二维码"
                          className="w-48 h-48 border border-gray-200 rounded mx-auto mb-4"
                        />
                        <p className="text-sm text-gray-500 mb-4">扫码加入群组</p>
                        <Button
                          onClick={downloadShareImage}
                          variant="outline"
                          size="sm"
                        >
                          下载分享图片
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <svg className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h3 className="text-sm font-medium text-blue-800">分享方式</h3>
                        <ul className="mt-1 text-sm text-blue-700">
                          <li>• 复制邀请链接分享到微信、QQ等社交平台</li>
                          <li>• 分享群组代码，让朋友手动输入加入</li>
                          <li>• 保存二维码图片，通过图片分享</li>
                          <li>• 下载专用分享图片，包含群组信息和二维码</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 群组设置 */}
              {activeTab === 'settings' && canManage && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">群组设置</h2>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">基本信息</h3>
                    
                    {isEditing ? (
                      <div className="space-y-4">
                        <Input
                          label="群组名称"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          placeholder="输入群组名称"
                        />
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            群组描述
                          </label>
                          <textarea
                            value={editForm.description}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            rows={3}
                            className="block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            placeholder="输入群组描述"
                          />
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="isPublic"
                            checked={editForm.isPublic}
                            onChange={(e) => setEditForm({ ...editForm, isPublic: e.target.checked })}
                            className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          />
                          <label htmlFor="isPublic" className="ml-2 text-sm text-gray-700">
                            公开群组（其他用户可以看到并申请加入）
                          </label>
                        </div>
                        
                        <div className="flex space-x-4">
                          <Button onClick={handleUpdateGroup}>
                            保存更改
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setIsEditing(false);
                              setEditForm({
                                name: group.name,
                                description: group.description || '',
                                isPublic: group.isPublic
                              });
                            }}
                          >
                            取消
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">群组名称</label>
                          <p className="mt-1 text-sm text-gray-900">{group.name}</p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">群组描述</label>
                          <p className="mt-1 text-sm text-gray-900">{group.description || '暂无描述'}</p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">群组类型</label>
                          <p className="mt-1 text-sm text-gray-900">
                            {group.isPublic ? '公开群组' : '私有群组'}
                          </p>
                        </div>
                        
                        <Button onClick={() => setIsEditing(true)}>
                          编辑信息
                        </Button>
                      </div>
                    )}
                  </div>

                  {isOwner && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-red-900 mb-4">危险操作</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-red-900">删除群组</p>
                          <p className="text-sm text-red-600">此操作将永久删除群组及所有相关数据，不可恢复</p>
                        </div>
                        <Button
                          onClick={handleDeleteGroup}
                          variant="outline"
                          className="border-red-300 text-red-700 hover:bg-red-50"
                        >
                          删除群组
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};