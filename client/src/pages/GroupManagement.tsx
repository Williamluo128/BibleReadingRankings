import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/PageLayout';
import { PageShell } from '@/components/PageShell';
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

  const generateQRCodeUrl = () => {
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
      <PageLayout>
        <PageShell>
          <div className="text-center py-24">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ink mx-auto" />
            <p className="mt-4 text-muted">加载中…</p>
          </div>
        </PageShell>
      </PageLayout>
    );
  }

  if (!group) {
    return (
      <PageLayout>
        <PageShell>
          <div className="text-center py-24">
            <h1 className="text-2xl font-normal text-ink">群组不存在</h1>
            <Button onClick={() => navigate('/groups')} className="mt-6">
              返回群组列表
            </Button>
          </div>
        </PageShell>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageShell>
        {/* Header - Minimalist */}
        <div className="mb-12 border-b border-gray-100 pb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <div className="flex items-center space-x-4 mb-2">
                <h1 className="text-4xl font-light text-gray-900 tracking-tight">{group.name}</h1>
                <span className="text-sm font-mono text-gray-400 border border-gray-200 px-2 py-0.5 rounded-none">
                  {group.code}
                </span>
              </div>
              {group.description && (
                <p className="text-gray-500 font-light max-w-2xl">{group.description}</p>
              )}
            </div>
            <div className="flex space-x-6">
              <button
                onClick={() => navigate('/groups')}
                className="text-sm text-gray-400 hover:text-gray-900 transition-colors"
              >
                返回列表
              </button>
              {!isOwner && (
                <button
                  onClick={handleLeaveGroup}
                  className="text-sm text-red-400 hover:text-red-600 transition-colors"
                >
                  退出群组
                </button>
              )}
            </div>
          </div>

          {/* Tabs - Minimalist Text */}
          <div className="flex space-x-8 mt-12 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-1 text-sm uppercase tracking-wider whitespace-nowrap transition-colors ${activeTab === 'overview'
                ? 'text-gray-900 border-b border-gray-900 font-medium'
                : 'text-gray-400 hover:text-gray-600 border-b border-transparent'
                }`}
            >
              概览
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`pb-1 text-sm uppercase tracking-wider whitespace-nowrap transition-colors ${activeTab === 'members'
                ? 'text-gray-900 border-b border-gray-900 font-medium'
                : 'text-gray-400 hover:text-gray-600 border-b border-transparent'
                }`}
            >
              成员管理 ({group.members.length})
            </button>
            <button
              onClick={() => setActiveTab('notices')}
              className={`pb-1 text-sm uppercase tracking-wider whitespace-nowrap transition-colors ${activeTab === 'notices'
                ? 'text-gray-900 border-b border-gray-900 font-medium'
                : 'text-gray-400 hover:text-gray-600 border-b border-transparent'
                }`}
            >
              群组通知
            </button>
            <button
              onClick={() => setActiveTab('share')}
              className={`pb-1 text-sm uppercase tracking-wider whitespace-nowrap transition-colors ${activeTab === 'share'
                ? 'text-gray-900 border-b border-gray-900 font-medium'
                : 'text-gray-400 hover:text-gray-600 border-b border-transparent'
                }`}
            >
              分享群组
            </button>
            {canManage && (
              <button
                onClick={() => setActiveTab('settings')}
                className={`pb-1 text-sm uppercase tracking-wider whitespace-nowrap transition-colors ${activeTab === 'settings'
                  ? 'text-gray-900 border-b border-gray-900 font-medium'
                  : 'text-gray-400 hover:text-gray-600 border-b border-transparent'
                  }`}
              >
                群组设置
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-8 border-l-2 border-red-500 pl-4 py-2 text-red-600 flex justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-gray-400 hover:text-gray-900">✕</button>
          </div>
        )}

        {/* Content */}
        <div>
          {/* 概览 */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="md:col-span-2 space-y-12">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-6">群组统计</h3>
                  <div className="grid grid-cols-3 gap-8">
                    <div>
                      <div className="text-3xl font-light text-gray-900 mb-1">{group.members.length}</div>
                      <div className="text-xs uppercase tracking-wider text-gray-400">成员数量</div>
                    </div>
                    <div>
                      <div className="text-3xl font-light text-gray-900 mb-1">
                        {group.isPublic ? '公开' : '私有'}
                      </div>
                      <div className="text-xs uppercase tracking-wider text-gray-400">群组类型</div>
                    </div>
                    <div>
                      <div className="text-3xl font-light text-gray-900 mb-1">
                        {new Date(group.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs uppercase tracking-wider text-gray-400">创建时间</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-6">群主信息</h3>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-medium text-lg">
                      {group.owner.displayName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{group.owner.displayName}</p>
                      <p className="text-sm text-gray-400 font-mono">@{group.owner.username}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-1 border-l border-gray-100 pl-12">
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-6">快速操作</h3>
                <div className="space-y-4">
                  <button
                    onClick={() => setActiveTab('share')}
                    className="block w-full text-left text-sm text-gray-600 hover:text-gray-900 hover:underline"
                  >
                    邀请朋友加入 →
                  </button>
                  {canManage && (
                    <button
                      onClick={() => setActiveTab('notices')}
                      className="block w-full text-left text-sm text-gray-600 hover:text-gray-900 hover:underline"
                    >
                      发布新通知 →
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 成员管理 */}
          {activeTab === 'members' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-light text-gray-900">成员列表</h2>
                {canManage && (
                  <Button size="sm" onClick={() => setActiveTab('share')}>邀请成员</Button>
                )}
              </div>

              <div className="space-y-0 border-t border-gray-100">
                {group.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between py-4 border-b border-gray-100 group hover:bg-gray-50 px-4 -mx-4 transition-colors">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-100 flex items-center justify-center text-gray-500 text-sm font-medium mr-4">
                        {member.user.displayName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900">{member.user.displayName}</h4>
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
                        <div className="flex items-center space-x-4 mt-0.5">
                          <p className="text-xs text-gray-400 font-mono">@{member.user.username}</p>
                          <p className="text-xs text-gray-300">
                            {new Date(member.joinedAt).toLocaleDateString()} 加入
                          </p>
                        </div>
                      </div>
                    </div>

                    {canManage && member.role !== 'OWNER' && member.user.id !== user?.id && (
                      <div className="flex space-x-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        {member.role === 'MEMBER' ? (
                          <button
                            onClick={() => handlePromoteMember(member.id, 'ADMIN')}
                            className="text-xs uppercase tracking-wider text-gray-400 hover:text-gray-900"
                          >
                            设为管理员
                          </button>
                        ) : (
                          <button
                            onClick={() => handlePromoteMember(member.id, 'MEMBER')}
                            className="text-xs uppercase tracking-wider text-gray-400 hover:text-gray-900"
                          >
                            取消管理员
                          </button>
                        )}
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-xs uppercase tracking-wider text-red-400 hover:text-red-600"
                        >
                          移除
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 群组通知 */}
          {activeTab === 'notices' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-light text-gray-900">群组通知</h2>
                {canManage && (
                  <Button onClick={() => setShowNoticeForm(true)}>
                    发布通知
                  </Button>
                )}
              </div>

              {showNoticeForm && (
                <div className="bg-gray-50 p-8 mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-6">发布新通知</h3>
                  <div className="space-y-6">
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
                        className="block w-full border-b border-gray-300 py-2 focus:border-gray-900 focus:outline-none bg-transparent resize-none placeholder-gray-400"
                        placeholder="输入通知内容"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isPinned"
                        checked={noticeForm.isPinned}
                        onChange={(e) => setNoticeForm({ ...noticeForm, isPinned: e.target.checked })}
                        className="h-4 w-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                      />
                      <label htmlFor="isPinned" className="ml-3 text-sm text-gray-600">
                        置顶通知
                      </label>
                    </div>
                    <div className="flex space-x-6 pt-4">
                      <Button onClick={handleCreateNotice}>
                        发布通知
                      </Button>
                      <button
                        onClick={() => {
                          setShowNoticeForm(false);
                          setNoticeForm({ title: '', content: '', isPinned: false });
                        }}
                        className="text-sm text-gray-400 hover:text-gray-900"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {group.notices && group.notices.length > 0 ? (
                  group.notices
                    .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
                    .map((notice) => (
                      <div key={notice.id} className={`p-6 border-l-2 ${notice.isPinned ? 'border-yellow-400 bg-yellow-50/30' : 'border-gray-200 hover:bg-gray-50'
                        } transition-colors`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="text-lg font-medium text-gray-900">{notice.title}</h4>
                              {notice.isPinned && (
                                <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-yellow-100 text-yellow-800">
                                  置顶
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 leading-relaxed mb-4">{notice.content}</p>
                            <div className="text-xs text-gray-400 font-mono">
                              {notice.author.displayName} · {new Date(notice.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          {canManage && (
                            <div className="flex flex-col space-y-2 ml-4">
                              <button
                                onClick={() => handleTogglePinNotice(notice.id, !notice.isPinned)}
                                className="text-xs uppercase tracking-wider text-gray-400 hover:text-gray-900 text-right"
                              >
                                {notice.isPinned ? '取消置顶' : '置顶'}
                              </button>
                              <button
                                onClick={() => handleDeleteNotice(notice.id)}
                                className="text-xs uppercase tracking-wider text-gray-400 hover:text-red-600 text-right"
                              >
                                删除
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-12 text-gray-400 font-light">暂无群组通知</div>
                )}
              </div>
            </div>
          )}

          {/* 分享群组 */}
          {activeTab === 'share' && (
            <div className="max-w-3xl mx-auto space-y-12">
              <div className="text-center">
                <h2 className="text-2xl font-light text-gray-900 mb-2">邀请朋友加入</h2>
                <p className="text-gray-500 font-light">分享以下信息让朋友加入群组</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
                      分享链接
                    </label>
                    <div className="flex border-b border-gray-300 pb-1">
                      <input
                        type="text"
                        value={generateShareLink()}
                        readOnly
                        className="flex-1 bg-transparent border-none p-0 text-gray-900 focus:ring-0 text-sm font-mono"
                      />
                      <button
                        onClick={() => copyToClipboard(generateShareLink())}
                        className="text-xs uppercase tracking-wider text-gray-400 hover:text-gray-900 ml-4"
                      >
                        复制
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
                      群组代码
                    </label>
                    <div className="flex border-b border-gray-300 pb-1">
                      <input
                        type="text"
                        value={group.code}
                        readOnly
                        className="flex-1 bg-transparent border-none p-0 text-gray-900 focus:ring-0 text-2xl font-mono tracking-widest"
                      />
                      <button
                        onClick={() => copyToClipboard(group.code)}
                        className="text-xs uppercase tracking-wider text-gray-400 hover:text-gray-900 ml-4"
                      >
                        复制
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center bg-gray-50 p-8">
                  <img
                    src={generateQRCodeUrl()}
                    alt="群组二维码"
                    className="w-40 h-40 mix-blend-multiply mb-6"
                  />
                  <button
                    onClick={downloadShareImage}
                    className="text-xs uppercase tracking-wider text-gray-500 hover:text-gray-900 border-b border-gray-300 hover:border-gray-900 pb-0.5 transition-colors"
                  >
                    下载分享图片
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 群组设置 */}
          {activeTab === 'settings' && canManage && (
            <div className="max-w-2xl mx-auto">
              <h2 className="text-xl font-light text-gray-900 mb-8">群组设置</h2>

              {isEditing ? (
                <div className="space-y-8">
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
                      className="block w-full border-b border-gray-300 py-2 focus:border-gray-900 focus:outline-none bg-transparent resize-none placeholder-gray-400"
                      placeholder="输入群组描述"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={editForm.isPublic}
                      onChange={(e) => setEditForm({ ...editForm, isPublic: e.target.checked })}
                      className="h-4 w-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                    />
                    <label htmlFor="isPublic" className="ml-3 text-sm text-gray-600">
                      公开群组 <span className="text-gray-400">(其他用户可以看到并申请加入)</span>
                    </label>
                  </div>

                  <div className="flex space-x-6 pt-4">
                    <Button onClick={handleUpdateGroup}>
                      保存更改
                    </Button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditForm({
                          name: group.name,
                          description: group.description || '',
                          isPublic: group.isPublic
                        });
                      }}
                      className="text-sm text-gray-400 hover:text-gray-900"
                    >
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="border-b border-gray-100 pb-8">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">群组名称</label>
                        <p className="text-lg text-gray-900">{group.name}</p>
                      </div>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-xs uppercase tracking-wider text-gray-400 hover:text-gray-900"
                      >
                        编辑
                      </button>
                    </div>

                    <div className="mb-4">
                      <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">群组描述</label>
                      <p className="text-gray-600">{group.description || '暂无描述'}</p>
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">群组类型</label>
                      <p className="text-gray-900">{group.isPublic ? '公开群组' : '私有群组'}</p>
                    </div>
                  </div>

                  {isOwner && (
                    <div className="pt-4 mt-8 border-t border-gray-100">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-red-600 mb-4">危险区域</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        删除群组是不可逆的操作，所有数据将被永久删除。
                      </p>
                      <button
                        onClick={handleDeleteGroup}
                        className="text-sm text-red-600 border border-red-200 hover:bg-red-50 px-4 py-2 transition-colors"
                      >
                        删除群组
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </PageShell>
    </PageLayout>
  );
};