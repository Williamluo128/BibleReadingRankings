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
  loadReadStatus: (verseIds: string[]) => Promise<void>;
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
    try {
      set({ isLoading: true, error: null });
      
      // 调用API记录阅读
      await ReadingAPI.recordVerse(verseId);
      
      // 更新本地状态
      const currentReadVerses = new Set(get().readVerses);
      currentReadVerses.add(verseId);
      
      set({ 
        readVerses: currentReadVerses,
        isLoading: false 
      });
      
      // 刷新统计数据
      get().loadTotalStats();
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '保存阅读记录失败',
        isLoading: false 
      });
      throw error;
    }
  },

  markMultipleVersesAsRead: async (verseIds: string[]) => {
    try {
      set({ isLoading: true, error: null });
      
      // 过滤出未读的经文
      const currentReadVerses = get().readVerses;
      const unreadVerses = verseIds.filter(id => !currentReadVerses.has(id));
      
      if (unreadVerses.length === 0) {
        set({ isLoading: false });
        return;
      }
      
      // 调用API批量记录阅读
      await ReadingAPI.recordMultipleVerses(unreadVerses);
      
      // 更新本地状态
      const updatedReadVerses = new Set(currentReadVerses);
      unreadVerses.forEach(id => updatedReadVerses.add(id));
      
      set({ 
        readVerses: updatedReadVerses,
        isLoading: false 
      });
      
      // 刷新统计数据
      get().loadTotalStats();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '批量保存阅读记录失败',
        isLoading: false 
      });
      throw error;
    }
  },

  loadReadStatus: async (verseIds: string[]) => {
    try {
      set({ isLoading: true, error: null });
      
      const readVerseIds = await ReadingAPI.getReadStatus(verseIds);
      
      set({ 
        readVerses: new Set(readVerseIds),
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '加载阅读状态失败',
        isLoading: false 
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