import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { Navigation } from '@/components/Navigation';
import { ReadingTrendChart } from '@/components/analytics/ReadingTrendChart';
import { ReadingHeatmap } from '@/components/analytics/ReadingHeatmap';
import { TestamentPieChart } from '@/components/analytics/TestamentPieChart';
import { ProgressRing } from '@/components/analytics/ProgressRing';
import { ReadingHabitSummary } from '@/components/analytics/ReadingHabitSummary';
import { ReadingAPI, type ProgressStatsResponse } from '@/services/reading.api';
import { buildHeatmap, buildTrends, type DailyStatPoint } from '@/utils/analytics';

type TrendPeriod = 30 | 90 | 180;
type BookFilter = 'all' | 'OT' | 'NT';

const currentYear = new Date().getFullYear();

export const AnalyticsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStatPoint[]>([]);
  const [progressStats, setProgressStats] = useState<ProgressStatsResponse | null>(null);
  const [trendPeriod, setTrendPeriod] = useState<TrendPeriod>(30);
  const [bookFilter, setBookFilter] = useState<BookFilter>('all');
  const [showAllBooks, setShowAllBooks] = useState(false);

  useEffect(() => {
    if (!user) return;

    void (async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        const { progress, dailyStats: stats } = await ReadingAPI.getAnalyticsDashboard();
        setProgressStats(progress);
        setDailyStats(stats);
      } catch (error) {
        console.error('Failed to load analytics data:', error);
        setLoadError('加载分析数据失败，请稍后重试');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [user]);

  const trendData = useMemo(
    () => buildTrends(dailyStats, trendPeriod),
    [dailyStats, trendPeriod],
  );

  const heatmapData = useMemo(
    () => buildHeatmap(dailyStats, currentYear),
    [dailyStats],
  );

  const filteredBooks = useMemo(() => {
    if (!progressStats) return [];

    return progressStats.books
      .filter((book) => {
        if (bookFilter === 'all') return book.readVerses > 0;
        return book.testament === bookFilter && book.readVerses > 0;
      })
      .sort((a, b) => b.progress - a.progress || a.bookId - b.bookId);
  }, [progressStats, bookFilter]);

  const visibleBooks = showAllBooks ? filteredBooks : filteredBooks.slice(0, 12);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <main className="max-w-7xl mx-auto py-12 px-8">
        <div className="mb-16 text-center">
          <h1 className="text-4xl font-light text-gray-900 mb-4 tracking-tight">阅读分析</h1>
          <p className="text-gray-500 font-light">深入了解您的阅读习惯和进度</p>
        </div>

        {isLoading ? (
          <div className="space-y-20 animate-pulse">
            <div className="h-40 bg-gray-50" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-gray-100">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="bg-white h-28" />
              ))}
            </div>
            <div className="h-64 bg-gray-50" />
          </div>
        ) : loadError ? (
          <div className="text-center py-24 text-red-600">{loadError}</div>
        ) : (
          <div className="space-y-20">
            {progressStats && (
              <section>
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-8">
                  总体进度
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  <ProgressRing
                    progress={progressStats.overall.versesProgress}
                    label="经文进度"
                    value={`${progressStats.overall.readVerses} / ${progressStats.overall.totalVerses}`}
                  />
                  <ProgressRing
                    progress={progressStats.overall.chaptersProgress}
                    label="章节进度"
                    value={`${progressStats.overall.readChapters} / ${progressStats.overall.totalChapters}`}
                  />
                  <div className="flex flex-col items-center justify-center">
                    <div className="text-center">
                      <div className="text-5xl font-light text-gray-900 mb-2">
                        {progressStats.streaks.current}
                      </div>
                      <div className="text-xs uppercase tracking-widest text-gray-400 mb-4">
                        当前连续天数
                      </div>
                      <div className="text-gray-500 text-sm">
                        最长: {progressStats.streaks.longest} 天
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-8">
                阅读习惯摘要
              </h2>
              <ReadingHabitSummary trends={trendData} periodDays={trendPeriod} />
            </section>

            <section>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-900">
                  阅读趋势
                </h2>
                <div className="flex space-x-4">
                  {([30, 90, 180] as TrendPeriod[]).map((days) => (
                    <button
                      key={days}
                      onClick={() => setTrendPeriod(days)}
                      className={`text-sm transition-colors ${trendPeriod === days
                        ? 'text-gray-900 font-medium'
                        : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                      {days} 天
                    </button>
                  ))}
                </div>
              </div>
              <div className="border border-gray-100 p-8">
                <ReadingTrendChart data={trendData} />
              </div>
            </section>

            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-8">
                {currentYear} 年阅读热力图
              </h2>
              <div className="border border-gray-100 p-8">
                <ReadingHeatmap data={heatmapData} year={currentYear} />
              </div>
            </section>

            {progressStats && (
              <section>
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-8">
                  新旧约阅读分布
                </h2>
                <div className="border border-gray-100 p-8">
                  <TestamentPieChart
                    oldTestament={progressStats.testament.oldTestament}
                    newTestament={progressStats.testament.newTestament}
                  />
                </div>
              </section>
            )}

            {progressStats && filteredBooks.length > 0 && (
              <section>
                <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-gray-900">
                    书卷阅读进度
                  </h2>
                  <div className="flex space-x-4">
                    {([
                      ['all', '全部'],
                      ['OT', '旧约'],
                      ['NT', '新约'],
                    ] as const).map(([value, label]) => (
                      <button
                        key={value}
                        onClick={() => setBookFilter(value)}
                        className={`text-sm transition-colors ${bookFilter === value
                          ? 'text-gray-900 font-medium'
                          : 'text-gray-400 hover:text-gray-600'
                          }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-100">
                  {visibleBooks.map((book) => (
                    <Link
                      key={book.bookId}
                      to="/bible"
                      className="bg-white p-6 hover:bg-gray-50 transition-colors block"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {book.bookName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {book.progress.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 h-1">
                        <div
                          className="bg-gray-900 h-1 transition-all duration-500"
                          style={{ width: `${book.progress}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {book.readVerses} / {book.totalVerses} 节
                      </div>
                    </Link>
                  ))}
                </div>
                {filteredBooks.length > 12 && (
                  <button
                    onClick={() => setShowAllBooks((v) => !v)}
                    className="mt-6 text-sm text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    {showAllBooks ? '收起' : `查看全部 ${filteredBooks.length} 卷`}
                  </button>
                )}
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
