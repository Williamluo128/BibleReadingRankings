import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { useReadingStore } from '@/stores/reading.store';
import { Button } from '@/components/ui/Button';
import { Navigation } from '@/components/Navigation';

export const HomePage: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { totalStats, loadTotalStats, dailyStats, loadDailyStats, isLoading } = useReadingStore();

  useEffect(() => {
    if (user) {
      loadTotalStats();
      loadDailyStats(7); // Load last 7 days
    }
  }, [user, loadTotalStats, loadDailyStats]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Reading Statistics Dashboard */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Statistics */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">累计阅读</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {isLoading ? '...' : totalStats?.totalVerses || 0} 节经文
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Today's Reading */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">今日阅读</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {isLoading ? '...' : totalStats?.todayVerses || 0} 节经文
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Reading Days */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">阅读天数</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {isLoading ? '...' : totalStats?.totalDays || 0} 天
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md mb-8">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">近期阅读活动</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">过去7天的阅读统计</p>
            </div>
            <ul className="divide-y divide-gray-200">
              {dailyStats.length > 0 ? (
                dailyStats.map((stat, index) => (
                  <li key={stat.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                          stat.versesRead > 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {new Date(stat.date).toLocaleDateString('zh-CN', { 
                              month: 'long', 
                              day: 'numeric',
                              weekday: 'short'
                            })}
                          </div>
                          <div className="text-sm text-gray-500">
                            阅读了 {stat.versesRead} 节经文
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-400">
                        {index === 0 && new Date(stat.date).toDateString() === new Date().toDateString() && '今天'}
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <li className="px-4 py-4 sm:px-6">
                  <div className="text-center text-gray-500">
                    还没有阅读记录，开始您的第一次阅读吧！
                  </div>
                </li>
              )}
            </ul>
          </div>

          {/* Call to Action */}
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 text-center">
            <div className="text-center">
              <svg className="h-12 w-12 text-primary-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className="text-lg font-medium text-primary-900 mb-2">
                {totalStats?.todayVerses > 0 ? '继续今天的阅读之旅' : '开始您的圣经阅读之旅！'}
              </h3>
              <p className="text-primary-700 mb-4">
                {totalStats?.todayVerses > 0 
                  ? `今天已阅读 ${totalStats.todayVerses} 节，继续保持！`
                  : '与朋友一起追踪阅读进度，让阅读变得更有趣。'
                }
              </p>
              <div className="space-x-4">
                <Link to="/bible">
                  <Button>{totalStats?.todayVerses > 0 ? '继续阅读' : '开始阅读'}</Button>
                </Link>
                <Link to="/leaderboard">
                  <Button variant="outline">查看排行榜</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};