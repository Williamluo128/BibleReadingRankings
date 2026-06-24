import { DAILY_QUOTES, type DailyQuoteItem } from '@/data/daily-quotes';

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/** 按日期确定性选取当日金句，同一天内结果一致 */
export function getDailyQuote(date: Date = new Date()): DailyQuoteItem {
  const index = getDayOfYear(date) % DAILY_QUOTES.length;
  return DAILY_QUOTES[index]!;
}

export function getDailyQuoteLabel(kind: DailyQuoteItem['kind']): string {
  return kind === 'scripture' ? '今日经文' : '今日名言';
}
