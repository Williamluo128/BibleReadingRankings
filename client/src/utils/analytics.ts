import type { HeatmapData, ReadingTrendData } from '@/services/reading.api';

export interface DailyStatPoint {
  date: string;
  versesRead: number;
}

function getHeatmapLevel(versesRead: number): number {
  if (versesRead === 0) return 0;
  if (versesRead < 10) return 1;
  if (versesRead < 25) return 2;
  if (versesRead < 50) return 3;
  return 4;
}

export function buildTrends(dailyStats: DailyStatPoint[], days: number): ReadingTrendData[] {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);

  const statsMap = new Map(dailyStats.map((s) => [s.date, s.versesRead]));
  const result: ReadingTrendData[] = [];

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const date = d.toISOString().split('T')[0];
    result.push({ date, versesRead: statsMap.get(date) ?? 0 });
  }

  return result;
}

export function buildHeatmap(dailyStats: DailyStatPoint[], year: number): HeatmapData[] {
  const statsMap = new Map(dailyStats.map((s) => [s.date, s.versesRead]));
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);
  const result: HeatmapData[] = [];

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const date = d.toISOString().split('T')[0];
    const count = statsMap.get(date) ?? 0;
    result.push({ date, count, level: getHeatmapLevel(count) });
  }

  return result;
}
