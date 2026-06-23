import React from 'react';
import type { ReadingTrendData } from '@/services/reading.api';

interface ReadingHabitSummaryProps {
  trends: ReadingTrendData[];
  periodDays: number;
}

function formatDate(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

export const ReadingHabitSummary: React.FC<ReadingHabitSummaryProps> = ({ trends, periodDays }) => {
  const totalVerses = trends.reduce((sum, d) => sum + d.versesRead, 0);
  const activeDays = trends.filter((d) => d.versesRead > 0);
  const avgPerActiveDay = activeDays.length > 0 ? Math.round(totalVerses / activeDays.length) : 0;
  const bestDay = trends.reduce(
    (best, d) => (d.versesRead > best.versesRead ? d : best),
    trends[0] ?? { date: '', versesRead: 0 },
  );

  const last7 = trends.slice(-7);
  const prev7 = trends.slice(-14, -7);
  const last7Total = last7.reduce((sum, d) => sum + d.versesRead, 0);
  const prev7Total = prev7.reduce((sum, d) => sum + d.versesRead, 0);
  const weekDelta = last7Total - prev7Total;

  const cards = [
    {
      label: `${periodDays}天总阅读`,
      value: `${totalVerses} 节`,
      hint: `活跃 ${activeDays.length} 天`,
    },
    {
      label: '活跃日日均',
      value: `${avgPerActiveDay} 节`,
      hint: activeDays.length > 0 ? '按有阅读的天数计算' : '暂无阅读记录',
    },
    {
      label: '单日最高',
      value: bestDay.versesRead > 0 ? `${bestDay.versesRead} 节` : '—',
      hint: bestDay.versesRead > 0 ? formatDate(bestDay.date) : '暂无记录',
    },
    {
      label: '近7天 vs 前7天',
      value: weekDelta === 0 ? '持平' : `${weekDelta > 0 ? '+' : ''}${weekDelta} 节`,
      hint: `本周 ${last7Total} · 上周 ${prev7Total}`,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-gray-100">
      {cards.map((card) => (
        <div key={card.label} className="bg-white p-6">
          <div className="text-xs uppercase tracking-widest text-gray-400 mb-2">{card.label}</div>
          <div className="text-2xl font-light text-gray-900 mb-1">{card.value}</div>
          <div className="text-xs text-gray-500">{card.hint}</div>
        </div>
      ))}
    </div>
  );
};
