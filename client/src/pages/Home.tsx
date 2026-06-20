import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { useReadingStore } from '@/stores/reading.store';
import { Button } from '@/components/ui/Button';
import { Navigation } from '@/components/Navigation';

export const HomePage: React.FC = () => {
  const { user } = useAuthStore();
  const { totalStats, loadTotalStats, dailyStats, loadDailyStats, isLoading } = useReadingStore();

  useEffect(() => {
    if (user) {
      loadTotalStats();
      loadDailyStats(7);
    }
  }, [user, loadTotalStats, loadDailyStats]);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <main className="max-w-5xl mx-auto py-12 px-8">
        {/* Header - Minimalist */}
        <div className="mb-16 text-center">
          <h1 className="text-5xl font-light text-gray-900 mb-4 tracking-tight">
            欢迎回来，{user?.displayName}
          </h1>
          <p className="text-gray-500 font-light text-lg">
            继续您的圣经阅读之旅
          </p>
        </div>

        {/* Stats Grid - Minimalist */}
        {totalStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-20 border-y border-gray-100 py-12">
            <div className="text-center">
              <div className="text-4xl font-light text-gray-900 mb-2">{totalStats.todayVerses}</div>
              <div className="text-xs uppercase tracking-widest text-gray-400">今日阅读</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-light text-gray-900 mb-2">{totalStats.totalVerses}</div>
              <div className="text-xs uppercase tracking-widest text-gray-400">累计节数</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-light text-gray-900 mb-2">{totalStats.totalDays}</div>
              <div className="text-xs uppercase tracking-widest text-gray-400">阅读天数</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-light text-gray-900 mb-2">{totalStats.currentStreak}</div>
              <div className="text-xs uppercase tracking-widest text-gray-400">连续天数</div>
            </div>
          </div>
        )}

        {/* Recent Activity - Minimalist */}
        <div className="mb-20">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-8">最近阅读</h2>
          {isLoading ? (
            <div className="text-center py-12 text-gray-300 animate-pulse">加载中...</div>
          ) : dailyStats && dailyStats.length > 0 ? (
            <div className="space-y-0">
              {dailyStats.map((stat) => (
                <div key={stat.date} className="flex items-center justify-between py-4 border-b border-gray-100">
                  <div>
                    <div className="text-gray-900 font-medium">
                      {new Date(stat.date).toLocaleDateString('zh-CN', {
                        month: 'long',
                        day: 'numeric',
                        weekday: 'short'
                      })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-light text-gray-900">
                      {stat.versesRead} <span className="text-sm text-gray-400">节</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400 font-light">
              还没有阅读记录，开始您的第一次阅读吧！
            </div>
          )}
        </div>

        {/* Call to Action - Minimalist */}
        <div className="border-t border-gray-100 pt-12 text-center">
          <h3 className="text-2xl font-light text-gray-900 mb-4">
            {totalStats?.todayVerses && totalStats.todayVerses > 0 ? '继续今天的阅读之旅' : '开始您的圣经阅读之旅'}
          </h3>
          <p className="text-gray-500 font-light mb-8 max-w-xl mx-auto">
            {totalStats?.todayVerses && totalStats.todayVerses > 0
              ? `今天已阅读 ${totalStats.todayVerses} 节，继续保持！`
              : '与朋友一起追踪阅读进度，让阅读变得更有趣。'
            }
          </p>
          <div className="flex justify-center space-x-6">
            <Link to="/bible">
              <Button>{totalStats?.todayVerses && totalStats.todayVerses > 0 ? '继续阅读' : '开始阅读'}</Button>
            </Link>
            <Link to="/leaderboard">
              <Button variant="outline">查看排行榜</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};