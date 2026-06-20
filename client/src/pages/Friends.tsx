import React, { useEffect, useState } from 'react';
import { useFriendshipStore } from '@/stores/friendship.store';
import { Navigation } from '@/components/Navigation';
import { useAuthStore } from '@/stores/auth.store';

export const FriendsPage: React.FC = () => {
  const { user } = useAuthStore();
  const {
    friends,
    receivedRequests,
    searchResults,
    isLoading,
    isSearching,
    error,
    loadFriends,
    loadReceivedRequests,
    loadSentRequests,
    searchUsers,
    sendFriendRequest,
    respondToRequest,
    removeFriend,
    clearSearchResults,
    clearError,
  } = useFriendshipStore();

  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      loadFriends();
      loadReceivedRequests();
      loadSentRequests();
    }
  }, [user, loadFriends, loadReceivedRequests, loadSentRequests]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 2) {
      searchUsers(searchQuery);
    } else {
      clearSearchResults();
    }
  };

  const handleSendRequest = async (targetUserId: string) => {
    try {
      await sendFriendRequest(targetUserId);
    } catch (error) {
      // 错误已在store中处理
    }
  };

  const handleRespondToRequest = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      await respondToRequest(requestId, action);
    } catch (error) {
      // 错误已在store中处理
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (window.confirm('确定要删除这个好友吗？')) {
      try {
        await removeFriend(friendId);
      } catch (error) {
        // 错误已在store中处理
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="max-w-4xl mx-auto py-12 px-8">
        {/* Header - Minimalist */}
        <div className="mb-12 flex flex-col md:flex-row justify-between items-end border-b border-gray-100 pb-8">
          <div>
            <h1 className="text-4xl font-light text-gray-900 mb-2 tracking-tight">好友</h1>
            <p className="text-gray-500 font-light">管理你的好友列表和请求</p>
          </div>

          {/* Tabs - Minimalist Text */}
          <div className="flex space-x-8 mt-8 md:mt-0">
            <button
              className={`pb-1 text-sm uppercase tracking-wider transition-colors ${activeTab === 'friends'
                ? 'text-gray-900 border-b border-gray-900 font-medium'
                : 'text-gray-400 hover:text-gray-600 border-b border-transparent'
                }`}
              onClick={() => setActiveTab('friends')}
            >
              我的好友 ({friends.length})
            </button>
            <button
              className={`pb-1 text-sm uppercase tracking-wider transition-colors ${activeTab === 'requests'
                ? 'text-gray-900 border-b border-gray-900 font-medium'
                : 'text-gray-400 hover:text-gray-600 border-b border-transparent'
                }`}
              onClick={() => setActiveTab('requests')}
            >
              请求 ({receivedRequests.length})
            </button>
            <button
              className={`pb-1 text-sm uppercase tracking-wider transition-colors ${activeTab === 'search'
                ? 'text-gray-900 border-b border-gray-900 font-medium'
                : 'text-gray-400 hover:text-gray-600 border-b border-transparent'
                }`}
              onClick={() => setActiveTab('search')}
            >
              添加好友
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
          {activeTab === 'friends' && (
            <div>
              {isLoading ? (
                <div className="text-center py-12 text-gray-300 animate-pulse">加载中...</div>
              ) : friends.length > 0 ? (
                <div className="space-y-0">
                  {friends.map((friend) => (
                    <div key={friend.id} className="group flex items-center justify-between py-6 border-b border-gray-100 hover:bg-gray-50 transition-colors px-4 -mx-4">
                      <div className="flex items-center space-x-6">
                        <div className="w-12 h-12 bg-gray-100 flex items-center justify-center text-gray-500 text-lg font-medium">
                          {friend.displayName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-gray-900 font-medium">{friend.displayName}</h3>
                          <p className="text-xs text-gray-400 font-mono">@{friend.username}</p>
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(friend.friendshipDate).toLocaleDateString()} 添加
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-8">
                        <div className="text-right hidden sm:block">
                          <div className="text-gray-900 font-light">
                            {friend.totalStats.todayVerses} <span className="text-xs text-gray-400">今日</span>
                          </div>
                          <div className="text-xs text-gray-400">
                            累计 {friend.totalStats.totalVerses}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveFriend(friend.id)}
                          disabled={isLoading}
                          className="text-xs uppercase tracking-wider text-gray-400 hover:text-red-600 transition-colors"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24">
                  <h3 className="text-xl font-light text-gray-900 mb-2">暂无好友</h3>
                  <p className="text-gray-400 font-light">去添加一些好友，一起分享阅读进度吧！</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div>
              {isLoading ? (
                <div className="text-center py-12 text-gray-300 animate-pulse">加载中...</div>
              ) : receivedRequests.length > 0 ? (
                <div className="space-y-0">
                  {receivedRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between py-6 border-b border-gray-100">
                      <div className="flex items-center space-x-6">
                        <div className="w-12 h-12 bg-gray-100 flex items-center justify-center text-gray-500 text-lg font-medium">
                          {request.requester.displayName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-gray-900 font-medium">{request.requester.displayName}</h3>
                          <p className="text-xs text-gray-400 font-mono">@{request.requester.username}</p>
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-4">
                        <button
                          onClick={() => handleRespondToRequest(request.id, 'accept')}
                          disabled={isLoading}
                          className="text-sm font-medium text-gray-900 hover:text-gray-600"
                        >
                          接受
                        </button>
                        <button
                          onClick={() => handleRespondToRequest(request.id, 'reject')}
                          disabled={isLoading}
                          className="text-sm text-gray-400 hover:text-gray-600"
                        >
                          拒绝
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24">
                  <h3 className="text-xl font-light text-gray-900 mb-2">暂无请求</h3>
                  <p className="text-gray-400 font-light">没有待处理的好友请求</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'search' && (
            <div>
              <form onSubmit={handleSearch} className="mb-12 max-w-xl mx-auto">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索用户名或昵称..."
                    className="w-full py-4 px-0 bg-transparent border-b-2 border-gray-200 focus:border-gray-900 focus:outline-none text-xl font-light placeholder-gray-300 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={isSearching || searchQuery.trim().length < 2}
                    className="absolute right-0 bottom-4 text-sm uppercase tracking-widest font-medium text-gray-900 hover:text-gray-600 disabled:text-gray-300"
                  >
                    {isSearching ? '搜索中...' : '搜索'}
                  </button>
                </div>
              </form>

              {searchResults.length > 0 ? (
                <div className="space-y-0">
                  <div className="text-xs uppercase tracking-widest text-gray-400 mb-4">搜索结果</div>
                  {searchResults.map((user) => (
                    <div key={user.id} className="flex items-center justify-between py-6 border-b border-gray-100">
                      <div className="flex items-center space-x-6">
                        <div className="w-12 h-12 bg-gray-100 flex items-center justify-center text-gray-500 text-lg font-medium">
                          {user.displayName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-gray-900 font-medium">{user.displayName}</h3>
                          <p className="text-xs text-gray-400 font-mono">@{user.username}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSendRequest(user.id)}
                        disabled={isLoading}
                        className="text-sm font-medium text-gray-900 hover:text-gray-600 disabled:text-gray-300"
                      >
                        添加好友
                      </button>
                    </div>
                  ))}
                </div>
              ) : searchQuery && !isSearching ? (
                <div className="text-center py-24">
                  <h3 className="text-xl font-light text-gray-900 mb-2">未找到用户</h3>
                  <p className="text-gray-400 font-light">请尝试其他关键词</p>
                </div>
              ) : !searchQuery ? (
                <div className="text-center py-24">
                  <p className="text-gray-400 font-light">输入关键词开始搜索</p>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};