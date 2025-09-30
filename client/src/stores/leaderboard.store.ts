import { create } from 'zustand';
import type { LeaderboardEntry, UserRank } from '@bible-rankings/shared';
import { LeaderboardAPI, LeaderboardPeriod } from '@/services/leaderboard.api';

interface LeaderboardState {
  // 数据状态
  globalLeaderboard: LeaderboardEntry[];
  friendsLeaderboard: LeaderboardEntry[];
  userRank: UserRank | null;
  currentPeriod: LeaderboardPeriod;
  
  // UI状态
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadGlobalLeaderboard: (period?: LeaderboardPeriod, limit?: number) => Promise<void>;
  loadFriendsLeaderboard: (period?: LeaderboardPeriod) => Promise<void>;
  loadUserRank: (period?: LeaderboardPeriod) => Promise<void>;
  setPeriod: (period: LeaderboardPeriod) => void;
  refreshAll: () => Promise<void>;
  clearError: () => void;
  resetLeaderboardState: () => void;
}

export const useLeaderboardStore = create<LeaderboardState>((set, get) => ({
  // 初始状态
  globalLeaderboard: [],
  friendsLeaderboard: [],
  userRank: null,
  currentPeriod: 'weekly',
  isLoading: false,
  error: null,

  // 加载全站排行榜
  loadGlobalLeaderboard: async (period = 'weekly', limit = 50) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await LeaderboardAPI.getGlobalLeaderboard(period, limit);
      
      set({ 
        globalLeaderboard: response.leaderboard,
        currentPeriod: period,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '加载全站排行榜失败',
        isLoading: false 
      });
    }
  },

  // 加载好友排行榜
  loadFriendsLeaderboard: async (period = 'weekly') => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await LeaderboardAPI.getFriendsLeaderboard(period);
      
      set({ 
        friendsLeaderboard: response.leaderboard,
        currentPeriod: period,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '加载好友排行榜失败',
        isLoading: false 
      });
    }
  },

  // 加载用户排名
  loadUserRank: async (period = 'weekly') => {
    try {
      set({ error: null });
      
      const userRank = await LeaderboardAPI.getUserRank(period);
      
      set({ 
        userRank,
        currentPeriod: period
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '加载用户排名失败'
      });
    }
  },

  // 设置时间段
  setPeriod: (period: LeaderboardPeriod) => {
    set({ currentPeriod: period });
  },

  // 刷新所有数据
  refreshAll: async () => {
    const { currentPeriod } = get();
    await Promise.all([
      get().loadGlobalLeaderboard(currentPeriod),
      get().loadFriendsLeaderboard(currentPeriod),
      get().loadUserRank(currentPeriod)
    ]);
  },

  // 清除错误
  clearError: () => {
    set({ error: null });
  },

  // 重置排行榜状态
  resetLeaderboardState: () => {
    set({
      globalLeaderboard: [],
      friendsLeaderboard: [],
      userRank: null,
      currentPeriod: 'weekly',
      error: null,
      isLoading: false,
    });
  },
}));