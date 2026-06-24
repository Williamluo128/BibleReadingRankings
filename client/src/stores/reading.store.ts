import { create } from 'zustand';
import type { ReadingRecord, DailyStats } from '@bible-rankings/shared';
import { ReadingAPI } from '@/services/reading.api';

interface ReadingState {
  // 阅读状态
  readVerses: Set<string>; // 已读经文ID集合
  todayReadings: ReadingRecord[];
  dailyStats: DailyStats[];
  totalStats: {
    totalVerses: number;
    totalDays: number;
    todayVerses: number;
    currentStreak: number;
  } | null;
  
  // UI状态
  isLoading: boolean;
  error: string | null;
  
  // Actions
  markVerseAsRead: (verseId: string) => Promise<void>;
  markMultipleVersesAsRead: (verseIds: string[]) => Promise<void>;
  loadReadStatus: (verseIds: string[], bookId?: number) => Promise<void>;
  loadTodayReadings: () => Promise<void>;
  loadDailyStats: (days?: number) => Promise<void>;
  loadTotalStats: () => Promise<void>;
  clearError: () => void;
  resetReadingState: () => void;
}

export const useReadingStore = create<ReadingState>((set, get) => ({
  readVerses: new Set(),
  todayReadings: [],
  dailyStats: [],
  totalStats: null,
  isLoading: false,
  error: null,

  markVerseAsRead: async (verseId: string) => {
    const { readVerses, totalStats } = get();
    if (readVerses.has(verseId)) {
      return;
    }

    const prevReadVerses = new Set(readVerses);
    const prevStats = totalStats;

    const nextReadVerses = new Set(readVerses);
    nextReadVerses.add(verseId);

    set({
      readVerses: nextReadVerses,
      totalStats: totalStats
        ? {
            ...totalStats,
            todayVerses: totalStats.todayVerses + 1,
            totalVerses: totalStats.totalVerses + 1,
          }
        : totalStats,
      error: null,
    });

    try {
      await ReadingAPI.recordVerse(verseId);
    } catch (error) {
      set({
        readVerses: prevReadVerses,
        totalStats: prevStats,
        error: error instanceof Error ? error.message : '保存阅读记录失败',
      });
      throw error;
    }
  },

  markMultipleVersesAsRead: async (verseIds: string[]) => {
    const { readVerses, totalStats } = get();
    const unreadVerses = verseIds.filter((id) => !readVerses.has(id));

    if (unreadVerses.length === 0) {
      return;
    }

    const prevReadVerses = new Set(readVerses);
    const prevStats = totalStats;
    const addedCount = unreadVerses.length;

    const nextReadVerses = new Set(readVerses);
    unreadVerses.forEach((id) => nextReadVerses.add(id));

    set({
      readVerses: nextReadVerses,
      totalStats: totalStats
        ? {
            ...totalStats,
            todayVerses: totalStats.todayVerses + addedCount,
            totalVerses: totalStats.totalVerses + addedCount,
          }
        : totalStats,
      error: null,
    });

    try {
      await ReadingAPI.recordMultipleVerses(unreadVerses);
    } catch (error) {
      set({
        readVerses: prevReadVerses,
        totalStats: prevStats,
        error: error instanceof Error ? error.message : '批量保存阅读记录失败',
      });
      throw error;
    }
  },

  loadReadStatus: async (verseIds: string[], bookId?: number) => {
    try {
      const readVerseIds = await ReadingAPI.getReadStatus(verseIds, bookId);

      set({
        readVerses: new Set(readVerseIds),
        error: null,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '加载阅读状态失败',
      });
    }
  },

  loadTodayReadings: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const today = new Date().toISOString().split('T')[0];
      const records = await ReadingAPI.getReadingRecords(today);
      
      set({ 
        todayReadings: records,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '加载今日阅读记录失败',
        isLoading: false 
      });
    }
  },

  loadDailyStats: async (days: number = 30) => {
    try {
      set({ isLoading: true, error: null });
      
      const stats = await ReadingAPI.getDailyStats(days);
      
      set({ 
        dailyStats: stats,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '加载每日统计失败',
        isLoading: false 
      });
    }
  },

  loadTotalStats: async () => {
    try {
      const stats = await ReadingAPI.getTotalStats();
      
      set({ totalStats: stats });
    } catch (error) {
      console.error('Failed to load total stats:', error);
      // 不设置错误状态，因为这是后台刷新
    }
  },

  clearError: () => {
    set({ error: null });
  },

  resetReadingState: () => {
    set({
      readVerses: new Set(),
      todayReadings: [],
      dailyStats: [],
      totalStats: null,
      error: null,
    });
  },
}));