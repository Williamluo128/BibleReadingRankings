import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { Navigation } from '@/components/Navigation';
import { ReadingTrendChart } from '@/components/analytics/ReadingTrendChart';
import { ReadingHeatmap } from '@/components/analytics/ReadingHeatmap';
import { TestamentPieChart } from '@/components/analytics/TestamentPieChart';
import { ProgressRing } from '@/components/analytics/ProgressRing';
import { ReadingAPI, type ReadingTrendData, type HeatmapData, type ProgressStatsResponse } from '@/services/reading.api';

export const AnalyticsPage: React.FC = () => {
    const { user } = useAuthStore();
    const [isLoading, setIsLoading] = useState(true);
    const [trendData, setTrendData] = useState<ReadingTrendData[]>([]);
    const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
    const [progressStats, setProgressStats] = useState<ProgressStatsResponse | null>(null);
    const [trendPeriod, setTrendPeriod] = useState<30 | 90 | 180>(30);

    useEffect(() => {
        if (user) {
            loadAnalyticsData();
        }
    }, [user, trendPeriod]);

    const loadAnalyticsData = async () => {
        try {
            setIsLoading(true);
            const [trends, heatmap, progress] = await Promise.all([
                ReadingAPI.getReadingTrends(trendPeriod),
                ReadingAPI.getReadingHeatmap(new Date().getFullYear()),
                ReadingAPI.getProgressStats(),
            ]);

            setTrendData(trends);
            setHeatmapData(heatmap);
            setProgressStats(progress);
        } catch (error) {
            console.error('Failed to load analytics data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <Navigation />

            <main className="max-w-7xl mx-auto py-12 px-8">
                {/* Header */}
                <div className="mb-16 text-center">
                    <h1 className="text-4xl font-light text-gray-900 mb-4 tracking-tight">阅读分析</h1>
                    <p className="text-gray-500 font-light">深入了解您的阅读习惯和进度</p>
                </div>

                {isLoading ? (
                    <div className="text-center py-24">
                        <div className="animate-pulse text-gray-300">加载中...</div>
                    </div>
                ) : (
                    <div className="space-y-20">
                        {/* 总体进度 */}
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

                        {/* 阅读趋势 */}
                        <section>
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-900">
                                    阅读趋势
                                </h2>
                                <div className="flex space-x-4">
                                    {[30, 90, 180].map((days) => (
                                        <button
                                            key={days}
                                            onClick={() => setTrendPeriod(days as 30 | 90 | 180)}
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

                        {/* 阅读热力图 */}
                        <section>
                            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-8">
                                {new Date().getFullYear()} 年阅读热力图
                            </h2>
                            <div className="border border-gray-100 p-8">
                                <ReadingHeatmap data={heatmapData} year={new Date().getFullYear()} />
                            </div>
                        </section>

                        {/* 新旧约比例 */}
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

                        {/* 书卷阅读进度 */}
                        {progressStats && progressStats.books.length > 0 && (
                            <section>
                                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-8">
                                    书卷阅读进度
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-100">
                                    {progressStats.books
                                        .filter(book => book.readVerses > 0)
                                        .sort((a, b) => b.progress - a.progress)
                                        .slice(0, 10)
                                        .map((book) => (
                                            <div key={book.bookId} className="bg-white p-6">
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
                                            </div>
                                        ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};
