import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { useReadingStore } from '@/stores/reading.store';
import { Button } from '@/components/ui/Button';
import { PageLayout } from '@/components/PageLayout';
import { PageShell } from '@/components/PageShell';
import { Reveal } from '@/components/Reveal';
import { DailyQuote } from '@/components/DailyQuote';
import { HomeActivitySkeleton, HomeStatsSkeleton } from '@/components/ui/Skeleton';

export const HomePage: React.FC = () => {
  const { user } = useAuthStore();
  const { totalStats, loadTotalStats, dailyStats, loadDailyStats, isLoading } = useReadingStore();

  useEffect(() => {
    if (user) {
      loadTotalStats();
      loadDailyStats(7);
    }
  }, [user, loadTotalStats, loadDailyStats]);

  const hasReadToday = (totalStats?.todayVerses ?? 0) > 0;

  return (
    <PageLayout>
      <PageShell>
        <Reveal>
          <header className="mb-16 max-w-2xl">
            <h1 className="text-5xl font-normal text-ink mb-4 tracking-tight text-balance">
              欢迎回来，{user?.displayName}
            </h1>
            <p className="text-muted font-light text-lg leading-relaxed">
              {hasReadToday
                ? `今天已读 ${totalStats?.todayVerses} 节，继续保持节奏。`
                : '今天还没有阅读记录，从一段经文开始。'}
            </p>
            <DailyQuote />
          </header>
        </Reveal>

        <Reveal delayMs={80}>
          {isLoading && !totalStats ? (
            <HomeStatsSkeleton />
          ) : totalStats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border-warm mb-20">
              <div className="col-span-2 md:row-span-2 bg-surface p-8 md:p-12 flex flex-col justify-end min-h-[200px]">
                <div className="text-6xl md:text-7xl stat-value mb-3">{totalStats.todayVerses}</div>
                <div className="text-label">今日阅读 · 节</div>
              </div>
              <div className="bg-surface p-6 md:p-8 flex flex-col justify-end">
                <div className="text-3xl md:text-4xl stat-value mb-2">{totalStats.totalVerses}</div>
                <div className="text-label">累计节数</div>
              </div>
              <div className="bg-surface p-6 md:p-8 flex flex-col justify-end">
                <div className="text-3xl md:text-4xl stat-value mb-2">{totalStats.totalDays}</div>
                <div className="text-label">阅读天数</div>
              </div>
              <div className="col-span-2 md:col-span-2 bg-surface p-6 md:p-8 flex flex-col justify-end">
                <div className="text-3xl md:text-4xl stat-value mb-2">{totalStats.currentStreak}</div>
                <div className="text-label">连续阅读天数</div>
              </div>
            </div>
          ) : null}
        </Reveal>

        <Reveal delayMs={120}>
          <section className="mb-20">
            <h2 className="text-label mb-8">最近阅读</h2>
            {isLoading ? (
              <HomeActivitySkeleton />
            ) : dailyStats && dailyStats.length > 0 ? (
              <div className="space-y-0">
                {dailyStats.map((stat) => (
                  <div key={stat.date} className="flex items-center justify-between py-4 border-b border-border-warm">
                    <div className="text-ink font-medium">
                      {new Date(stat.date).toLocaleDateString('zh-CN', {
                        month: 'long',
                        day: 'numeric',
                        weekday: 'short',
                      })}
                    </div>
                    <div className="text-xl stat-value">
                      {stat.versesRead} <span className="text-sm text-muted font-normal">节</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-muted font-light border-b border-border-warm">
                还没有阅读记录，开始第一次阅读
              </div>
            )}
          </section>
        </Reveal>

        <Reveal delayMs={160}>
          <section className="border-t border-border-warm pt-12 max-w-2xl">
            <h3 className="text-2xl font-normal text-ink mb-4">
              {hasReadToday ? '继续今天的阅读' : '开始阅读'}
            </h3>
            <p className="text-muted font-light mb-8 leading-relaxed">
              {hasReadToday
                ? '从上次停下的地方接着读，或查看本周排行。'
                : '打开圣经选择书卷与章节，标记读过的经文即可追踪进度。'}
            </p>
            <div className="flex flex-wrap items-center gap-6">
              <Link to="/bible">
                <Button>{hasReadToday ? '继续阅读' : '开始阅读'}</Button>
              </Link>
              <Link to="/leaderboard" className="text-sm text-muted hover:text-ink transition-colors focus-ring">
                查看排行榜 →
              </Link>
            </div>
          </section>
        </Reveal>
      </PageShell>
    </PageLayout>
  );
};
