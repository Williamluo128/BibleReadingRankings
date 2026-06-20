import React, { useEffect, useState } from 'react';
import { useLeaderboardStore } from '@/stores/leaderboard.store';
import { useAuthStore } from '@/stores/auth.store';
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

  const [activeTab, setActiveTab] = useState<'global' | 'friends'>('global');

  useEffect(() => {
    if (user) {
      loadGlobalLeaderboard(currentPeriod);
      loadFriendsLeaderboard(currentPeriod);
      loadUserRank(currentPeriod);
    }
  }, [user, currentPeriod]);

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

  const currentLeaderboard = activeTab === 'global' ? globalLeaderboard : friendsLeaderboard;

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="max-w-5xl mx-auto py-12 px-8">
        {/* Header - Minimalist */}
        <div className="mb-16 text-center">
          <h1 className="text-4xl font-light text-gray-900 mb-4 tracking-tight">阅读排行榜</h1>
          <p className="text-gray-500 font-light">与朋友们比较阅读进度，激励彼此成长</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-12 border-l-2 border-red-500 pl-4 py-2 text-red-600">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button onClick={clearError} className="text-gray-400 hover:text-gray-900">✕</button>
            </div>
          </div>
        )}

        {/* User Rank - Minimalist Stat Row */}
        {userRank && (
          <div className="mb-16 border-y border-gray-100 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-light text-gray-900 mb-1">#{userRank.rank}</div>
                <div className="text-xs uppercase tracking-widest text-gray-400">当前排名</div>
              </div>
              <div>
                <div className="text-3xl font-light text-gray-900 mb-1">{userRank.totalVerses}</div>
                <div className="text-xs uppercase tracking-widest text-gray-400">阅读节数</div>
              </div>
              <div>
                <div className="text-3xl font-light text-gray-900 mb-1">{userRank.totalDays}</div>
                <div className="text-xs uppercase tracking-widest text-gray-400">阅读天数</div>
              </div>
              <div>
                <div className="text-3xl font-light text-gray-900 mb-1">{userRank.averageVersesPerDay}</div>
                <div className="text-xs uppercase tracking-widest text-gray-400">日均阅读</div>
              </div>
            </div>
          </div>
        )}

        {/* Controls Container */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 space-y-6 md:space-y-0">
          {/* Tabs - Minimalist */}
          <div className="flex space-x-8">
            <button
              className={`pb-2 text-sm uppercase tracking-wider transition-colors ${activeTab === 'global'
                ? 'text-gray-900 border-b-2 border-gray-900 font-medium'
                : 'text-gray-400 hover:text-gray-600 border-b-2 border-transparent'
                }`}
              onClick={() => handleTabChange('global')}
            >
              全站排行
            </button>
            <button
              className={`pb-2 text-sm uppercase tracking-wider transition-colors ${activeTab === 'friends'
                ? 'text-gray-900 border-b-2 border-gray-900 font-medium'
                : 'text-gray-400 hover:text-gray-600 border-b-2 border-transparent'
                }`}
              onClick={() => handleTabChange('friends')}
            >
              好友排行
            </button>
          </div>

          {/* Period Selector - Minimalist Text Buttons */}
          <div className="flex space-x-4">
            {(['daily', 'weekly', 'monthly', 'all-time'] as LeaderboardPeriod[]).map((period) => (
              <button
                key={period}
                onClick={() => handlePeriodChange(period)}
                disabled={isLoading}
                className={`text-sm transition-colors ${currentPeriod === period
                  ? 'text-gray-900 font-medium'
                  : 'text-gray-400 hover:text-gray-600'
                  }`}
              >
                {getPeriodLabel(period)}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard List */}
        <div>
          {isLoading ? (
            <div className="text-center py-24">
              <div className="animate-pulse text-gray-300">加载中...</div>
            </div>
          ) : currentLeaderboard.length > 0 ? (
            <div className="space-y-0">
              {currentLeaderboard.map((entry) => (
                <div
                  key={entry.userId}
                  className={`
                    group flex items-center justify-between py-6 border-b border-gray-100 
                    hover:bg-gray-50 transition-colors px-4 -mx-4
                    ${entry.isCurrentUser ? 'bg-gray-50' : ''}
                  `}
                >
                  <div className="flex items-center space-x-6">
                    <div className="w-12 text-center">
                      <span className={`text-xl font-light ${entry.rank <= 3 ? 'text-gray-900' : 'text-gray-400'
                        }`}>
                        {entry.rank <= 3 ? `#${entry.rank}` : entry.rank}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-100 flex items-center justify-center text-gray-500 text-sm font-medium">
                        {entry.displayName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-gray-900 font-medium">
                          {entry.displayName}
                          {entry.isCurrentUser && <span className="ml-2 text-xs text-gray-400">(我)</span>}
                        </h3>
                        <p className="text-xs text-gray-400 font-mono">@{entry.username}</p>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-light text-gray-900">
                      {entry.totalVerses} <span className="text-sm text-gray-400">节</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {entry.totalDays} 天 | 日均 {entry.averageVersesPerDay}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24">
              <h3 className="text-xl font-light text-gray-900 mb-2">暂无数据</h3>
              <p className="text-gray-400 font-light">
                {activeTab === 'friends'
                  ? '添加好友后查看排行'
                  : '开始阅读，成为第一名'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};