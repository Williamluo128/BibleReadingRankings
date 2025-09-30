import React, { useEffect, useState } from 'react';
import { useFriendshipStore } from '@/stores/friendship.store';
import { Button } from '@/components/ui/Button';
import { Navigation } from '@/components/Navigation';
import { useAuthStore } from '@/stores/auth.store';

export const FriendsPage: React.FC = () => {
  const { user } = useAuthStore();
  const {
    friends,
    receivedRequests,
    sentRequests,
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
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">好友管理</h1>
          <p className="mt-2 text-gray-600">添加好友，查看彼此的阅读进度</p>
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
                activeTab === 'friends'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('friends')}
            >
              我的好友 ({friends.length})
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'requests'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('requests')}
            >
              好友请求 ({receivedRequests.length})
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'search'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('search')}
            >
              添加好友
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow">
          {activeTab === 'friends' && (
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">我的好友</h2>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">加载中...</p>
                </div>
              ) : friends.length > 0 ? (
                <div className="space-y-4">
                  {friends.map((friend) => (
                    <div key={friend.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-semibold text-lg">
                            {friend.displayName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{friend.displayName}</h3>
                          <p className="text-sm text-gray-500">@{friend.username}</p>
                          <div className="text-xs text-gray-400 mt-1">
                            成为好友于 {new Date(friend.friendshipDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right text-sm">
                          <div className="text-gray-900 font-medium">
                            今日: {friend.totalStats.todayVerses} 节
                          </div>
                          <div className="text-gray-500">
                            总计: {friend.totalStats.totalVerses} 节
                          </div>
                          <div className="text-gray-500">
                            {friend.totalStats.totalDays} 天
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveFriend(friend.id)}
                          disabled={isLoading}
                        >
                          删除
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">还没有好友</h3>
                  <p className="text-gray-600">去添加一些好友，一起分享阅读进度吧！</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">好友请求</h2>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">加载中...</p>
                </div>
              ) : receivedRequests.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-700">收到的请求</h3>
                  {receivedRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-semibold text-lg">
                            {request.requester.displayName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{request.requester.displayName}</h3>
                          <p className="text-sm text-gray-500">@{request.requester.username}</p>
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleRespondToRequest(request.id, 'accept')}
                          disabled={isLoading}
                        >
                          接受
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRespondToRequest(request.id, 'reject')}
                          disabled={isLoading}
                        >
                          拒绝
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">没有待处理的好友请求</h3>
                  <p className="text-gray-600">当有人向你发送好友请求时，会显示在这里</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'search' && (
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">搜索并添加好友</h2>
              
              <form onSubmit={handleSearch} className="mb-6">
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索用户名或昵称..."
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <Button 
                    type="submit" 
                    disabled={isSearching || searchQuery.trim().length < 2}
                  >
                    {isSearching ? '搜索中...' : '搜索'}
                  </Button>
                </div>
              </form>

              {searchResults.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-700">搜索结果</h3>
                  {searchResults.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-semibold text-lg">
                            {user.displayName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{user.displayName}</h3>
                          <p className="text-sm text-gray-500">@{user.username}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleSendRequest(user.id)}
                        disabled={isLoading}
                      >
                        添加好友
                      </Button>
                    </div>
                  ))}
                </div>
              ) : searchQuery && !isSearching ? (
                <div className="text-center py-8">
                  <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">没有找到用户</h3>
                  <p className="text-gray-600">试试其他搜索关键词</p>
                </div>
              ) : !searchQuery ? (
                <div className="text-center py-8">
                  <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">搜索用户</h3>
                  <p className="text-gray-600">输入用户名或昵称来搜索其他用户</p>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};