import type { DailyStatPoint } from '@/utils/analytics';
import type { ProgressStatsResponse } from '@/services/reading.api';
import { buildTrends } from '@/utils/analytics';

export function buildReadingInsight(
  dailyStats: DailyStatPoint[],
  progress: ProgressStatsResponse | null,
): string {
  if (!progress || dailyStats.length === 0) {
    return '开始阅读后，这里会显示你的习惯洞察。';
  }

  const trends = buildTrends(dailyStats, 30);
  const last7 = trends.slice(-7);
  const prev7 = trends.slice(-14, -7);
  const last7Total = last7.reduce((sum, d) => sum + d.versesRead, 0);
  const prev7Total = prev7.reduce((sum, d) => sum + d.versesRead, 0);
  const weekDelta = last7Total - prev7Total;

  const versesPct = progress.overall.versesProgress.toFixed(1);
  const streak = progress.streaks.current;

  if (weekDelta > 0) {
    return `近 7 天比前一周多读 ${weekDelta} 节；全书进度 ${versesPct}%，连续 ${streak} 天。`;
  }
  if (weekDelta < 0) {
    return `近 7 天比前一周少读 ${Math.abs(weekDelta)} 节；全书进度 ${versesPct}%，连续 ${streak} 天。`;
  }
  if (streak > 0) {
    return `本周阅读量持平；已连续阅读 ${streak} 天，全书进度 ${versesPct}%。`;
  }
  return `全书进度 ${versesPct}%；保持每日阅读，连续天数会在这里显示。`;
}
