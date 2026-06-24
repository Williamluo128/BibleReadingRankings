import React, { useMemo } from 'react';
import type { DailyStatPoint } from '@/utils/analytics';
import { buildTrends } from '@/utils/analytics';

interface SimpleDailyBarsProps {
  dailyStats: DailyStatPoint[];
  days?: number;
}

function formatLabel(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export const SimpleDailyBars: React.FC<SimpleDailyBarsProps> = ({ dailyStats, days = 14 }) => {
  const trend = useMemo(() => buildTrends(dailyStats, days), [dailyStats, days]);
  const max = useMemo(
    () => Math.max(1, ...trend.map((d) => d.versesRead)),
    [trend],
  );

  if (trend.every((d) => d.versesRead === 0)) {
    return (
      <p className="text-muted font-light py-8 text-center">近 {days} 天暂无阅读记录</p>
    );
  }

  return (
    <div className="space-y-3">
      {trend.map((day) => (
        <div key={day.date} className="flex items-center gap-4">
          <span className="text-xs text-muted w-12 shrink-0 tabular-nums">
            {formatLabel(day.date)}
          </span>
          <div className="flex-1 h-2 bg-border-warm">
            <div
              className="h-2 bg-ink transition-all duration-300"
              style={{ width: `${(day.versesRead / max) * 100}%` }}
            />
          </div>
          <span className="text-xs text-muted w-10 text-right tabular-nums shrink-0">
            {day.versesRead}
          </span>
        </div>
      ))}
    </div>
  );
};
