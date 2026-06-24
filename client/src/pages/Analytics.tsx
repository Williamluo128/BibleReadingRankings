import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { useReadingStore } from '@/stores/reading.store';
import { PageLayout } from '@/components/PageLayout';
import { PageShell } from '@/components/PageShell';
import { AnalyticsSkeleton } from '@/components/ui/Skeleton';
import { SimpleDailyBars } from '@/components/analytics/SimpleDailyBars';
import { ReadingAPI, type AnalyticsSummary } from '@/services/reading.api';
import { buildTrends, type DailyStatPoint } from '@/utils/analytics';
import { buildReadingInsight } from '@/utils/analytics-insight';

type TrendPeriod = 14 | 30;

function mergeSummary(
  cached: ReturnType<typeof useReadingStore.getState>['totalStats'],
  remote: AnalyticsSummary | null,
): AnalyticsSummary | null {
  if (remote) return remote;
  if (!cached) return null;

  return {
    totalVerses: cached.totalVerses,
    totalDays: cached.totalDays,
    todayVerses: cached.todayVerses,
    currentStreak: cached.currentStreak,
    versesProgress: 0,
    totalVersesInBible: 0,
  };
}

export const AnalyticsPage: React.FC = () => {
  const { user } = useAuthStore();
  const { totalStats, loadTotalStats } = useReadingStore();
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStatPoint[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [trendPeriod, setTrendPeriod] = useState<TrendPeriod>(14);

  useEffect(() => {
    if (!user) return;

    void loadTotalStats();
  }, [user, loadTotalStats]);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    void (async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        const data = await ReadingAPI.getAnalyticsDashboard();
        if (cancelled) return;
        setSummary(data.summary);
        setDailyStats(data.dailyStats);
      } catch (error) {
        console.error('Failed to load analytics data:', error);
        if (!cancelled) {
          setLoadError('加载分析数据失败，请稍后重试');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const displaySummary = useMemo(
    () => mergeSummary(totalStats, summary),
    [totalStats, summary],
  );

  const insight = useMemo(
    () => buildReadingInsight(dailyStats, displaySummary),
    [dailyStats, displaySummary],
  );

  const recentDays = useMemo(() => {
    const trends = buildTrends(dailyStats, 7);
    return [...trends].reverse();
  }, [dailyStats]);

  const showSkeleton = isLoading && !displaySummary;

  return (
    <PageLayout>
      <PageShell width="wide">
        <header className="mb-12 max-w-2xl">
          <h1 className="text-4xl font-normal text-ink mb-4 tracking-tight">阅读分析</h1>
          <p className="text-muted font-light leading-relaxed">{insight}</p>
        </header>

        {showSkeleton ? (
          <AnalyticsSkeleton />
        ) : loadError && !displaySummary ? (
          <div className="text-center py-24 text-red-600">{loadError}</div>
        ) : displaySummary ? (
          <div className="space-y-16">
            {loadError && (
              <p className="text-sm text-red-600 border-l-2 border-red-500 pl-4">{loadError}</p>
            )}

            <section>
              <h2 className="text-label mb-8">概览</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border-warm">
                <div className="bg-surface p-6">
                  <div className="text-xs uppercase tracking-widest text-muted mb-2">今日阅读</div>
                  <div className="text-3xl stat-value">{displaySummary.todayVerses}</div>
                  <div className="text-xs text-muted mt-1">节</div>
                </div>
                <div className="bg-surface p-6">
                  <div className="text-xs uppercase tracking-widest text-muted mb-2">累计节数</div>
                  <div className="text-3xl stat-value">{displaySummary.totalVerses}</div>
                  <div className="text-xs text-muted mt-1">节</div>
                </div>
                <div className="bg-surface p-6">
                  <div className="text-xs uppercase tracking-widest text-muted mb-2">阅读天数</div>
                  <div className="text-3xl stat-value">{displaySummary.totalDays}</div>
                  <div className="text-xs text-muted mt-1">天</div>
                </div>
                <div className="bg-surface p-6">
                  <div className="text-xs uppercase tracking-widest text-muted mb-2">连续阅读</div>
                  <div className="text-3xl stat-value">{displaySummary.currentStreak}</div>
                  <div className="text-xs text-muted mt-1">天</div>
                </div>
              </div>
            </section>

            {displaySummary.versesProgress > 0 && (
              <section>
                <h2 className="text-label mb-4">全书进度</h2>
                <div className="bg-surface border border-border-warm p-6">
                  <div className="flex justify-between items-baseline mb-3">
                    <span className="text-2xl stat-value">
                      {displaySummary.versesProgress.toFixed(1)}%
                    </span>
                    <span className="text-sm text-muted">
                      {displaySummary.totalVerses} / {displaySummary.totalVersesInBible} 节
                    </span>
                  </div>
                  <div className="w-full bg-border-warm h-1.5">
                    <div
                      className="bg-ink h-1.5"
                      style={{ width: `${Math.min(displaySummary.versesProgress, 100)}%` }}
                    />
                  </div>
                </div>
              </section>
            )}

            <section>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-label">近期阅读</h2>
                <div className="flex gap-4">
                  {([14, 30] as TrendPeriod[]).map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setTrendPeriod(days)}
                      className={`text-sm transition-colors focus-ring ${
                        trendPeriod === days
                          ? 'text-ink font-medium'
                          : 'text-muted hover:text-ink'
                      }`}
                    >
                      {days} 天
                    </button>
                  ))}
                </div>
              </div>
              <div className="border border-border-warm p-6 bg-surface">
                <SimpleDailyBars dailyStats={dailyStats} days={trendPeriod} />
              </div>
            </section>

            <section>
              <h2 className="text-label mb-8">最近 7 天</h2>
              <div className="space-y-0">
                {recentDays.map((day) => (
                  <div
                    key={day.date}
                    className="flex items-center justify-between py-4 border-b border-border-warm"
                  >
                    <span className="text-ink">
                      {new Date(`${day.date}T00:00:00`).toLocaleDateString('zh-CN', {
                        month: 'long',
                        day: 'numeric',
                        weekday: 'short',
                      })}
                    </span>
                    <span className="stat-value text-xl">
                      {day.versesRead}{' '}
                      <span className="text-sm text-muted font-normal">节</span>
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="border-t border-border-warm pt-10">
              <Link
                to="/bible"
                className="text-sm text-muted hover:text-ink transition-colors focus-ring"
              >
                继续阅读 →
              </Link>
            </section>
          </div>
        ) : null}
      </PageShell>
    </PageLayout>
  );
};
