import React, { useEffect, useState } from 'react';
import { useLeaderboardStore } from '@/stores/leaderboard.store';
import { useGroupStore } from '@/stores/group.store';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/Button';
import { Navigation } from '@/components/Navigation';
import type { LeaderboardPeriod } from '@/services/leaderboard.api';

export const LeaderboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const {
    globalLeaderboard,
    friendsLeaderboard,
    userRank,
    currentPeriod,
    isLoading,
    error,
    loadGlobalLeaderboard,
    loadFriendsLeaderboard,
    loadUserRank,
    setPeriod,
    clearError,
  } = useLeaderboardStore();

  const { groups, loadGroups } = useGroupStore();
  const [activeTab, setActiveTab] = useState<'global' | 'friends' | 'groups'>('global');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');

  useEffect(() => {
    if (user) {
      loadGlobalLeaderboard(currentPeriod);
      loadFriendsLeaderboard(currentPeriod);
      loadUserRank(currentPeriod);
      loadGroups();
    }
  }, [user, currentPeriod, loadGroups]);

  useEffect(() => {
    if (groups.length > 0 && !selectedGroupId) {
      setSelectedGroupId(groups[0].id);
    }
  }, [groups, selectedGroupId]);

  const handlePeriodChange = (period: LeaderboardPeriod) => {
    setPeriod(period);
    if (activeTab === 'global') {
      loadGlobalLeaderboard(period);
    } else {
      loadFriendsLeaderboard(period);
    }
    loadUserRank(period);
  };

  const handleTabChange = (tab: 'global' | 'friends') => {
    setActiveTab(tab);
    if (tab === 'global' && globalLeaderboard.length === 0) {
      loadGlobalLeaderboard(currentPeriod);
    } else if (tab === 'friends' && friendsLeaderboard.length === 0) {
      loadFriendsLeaderboard(currentPeriod);
    }
  };

  const getPeriodLabel = (period: LeaderboardPeriod) => {
    const labels = {
      daily: '今日',
      weekly: '本周',
      monthly: '本月',
      'all-time': '全部时间'
    };
    return labels[period];
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) {
      return <span className="text-2xl">🏆</span>;
    } else if (rank === 2) {
      return <span className="text-2xl">🥈</span>;
    } else if (rank === 3) {
      return <span className="text-2xl">🥉</span>;
    }
    return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
  };

  const currentLeaderboard = activeTab === 'global' ? globalLeaderboard : friendsLeaderboard;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">阅读排行榜</h1>
          <p className="mt-2 text-gray-600">与朋友们比较阅读进度，激励彼此成长</p>
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

        {/* User Rank Card */}
        {userRank && (
          <div className="mb-8 bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">我的排名</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-primary-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-primary-600">#{userRank.rank}</div>
                  <div className="text-sm text-gray-600">排名</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">{userRank.totalVerses}</div>
                  <div className="text-sm text-gray-600">阅读节数</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">{userRank.totalDays}</div>
                  <div className="text-sm text-gray-600">阅读天数</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-600">{userRank.averageVersesPerDay}</div>
                  <div className="text-sm text-gray-600">日均阅读</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Period Selector */}
        <div className="mb-6 flex flex-wrap gap-2 justify-center">
          {(['daily', 'weekly', 'monthly', 'all-time'] as LeaderboardPeriod[]).map((period) => (
            <Button
              key={period}
              variant={currentPeriod === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePeriodChange(period)}
              disabled={isLoading}
            >
              {getPeriodLabel(period)}
            </Button>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex justify-center space-x-8">
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'global'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => handleTabChange('global')}
            >
              全站排行榜
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'friends'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => handleTabChange('friends')}
            >
              好友排行榜
            </button>
          </nav>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">
              {activeTab === 'global' ? '全站排行榜' : '好友排行榜'} - {getPeriodLabel(currentPeriod)}
            </h2>
            
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">加载中...</p>
              </div>
            ) : currentLeaderboard.length > 0 ? (
              <div className="space-y-4">
                {currentLeaderboard.map((entry) => (
                  <div 
                    key={entry.userId} 
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      entry.isCurrentUser 
                        ? 'border-primary-200 bg-primary-50' 
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                        {getRankIcon(entry.rank)}
                      </div>
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-semibold text-lg">
                          {entry.displayName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className={`font-medium ${
                          entry.isCurrentUser ? 'text-primary-900' : 'text-gray-900'
                        }`}>
                          {entry.displayName}
                          {entry.isCurrentUser && <span className="ml-2 text-primary-600">(我)</span>}
                        </h3>
                        <p className="text-sm text-gray-500">@{entry.username}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        {entry.totalVerses} 节
                      </div>
                      <div className="text-sm text-gray-500">
                        {entry.totalDays} 天 | 日均 {entry.averageVersesPerDay} 节
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 className="text-xl font-medium text-gray-900 mb-2">暂无排行数据</h3>
                <p className="text-gray-600">
                  {activeTab === 'friends' 
                    ? '添加一些好友并开始阅读圣经吧！' 
                    : '开始阅读圣经，成为第一个上榜的用户！'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};