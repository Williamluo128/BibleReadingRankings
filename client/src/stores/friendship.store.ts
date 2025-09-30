import { create } from 'zustand';
import type { User, Friend, FriendRequest } from '@bible-rankings/shared';
import { FriendshipAPI } from '@/services/friendship.api';

interface FriendshipState {
  // 数据状态
  friends: Friend[];
  receivedRequests: FriendRequest[];
  sentRequests: FriendRequest[];
  searchResults: User[];
  
  // UI状态
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
  
  // Actions - 好友管理
  loadFriends: () => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;
  
  // Actions - 好友请求管理
  loadReceivedRequests: () => Promise<void>;
  loadSentRequests: () => Promise<void>;
  sendFriendRequest: (targetUserId: string) => Promise<void>;
  respondToRequest: (requestId: string, action: 'accept' | 'reject') => Promise<void>;
  
  // Actions - 用户搜索
  searchUsers: (query: string) => Promise<void>;
  clearSearchResults: () => void;
  
  // Actions - 工具方法
  clearError: () => void;
  resetFriendshipState: () => void;
}

export const useFriendshipStore = create<FriendshipState>((set, get) => ({
  // 初始状态
  friends: [],
  receivedRequests: [],
  sentRequests: [],
  searchResults: [],
  isLoading: false,
  isSearching: false,
  error: null,

  // 加载好友列表
  loadFriends: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const friends = await FriendshipAPI.getFriends();
      
      set({ 
        friends,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '加载好友列表失败',
        isLoading: false 
      });
    }
  },

  // 删除好友
  removeFriend: async (friendId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      await FriendshipAPI.removeFriend(friendId);
      
      // 从本地状态中移除好友
      const currentFriends = get().friends;
      const updatedFriends = currentFriends.filter(friend => friend.id !== friendId);
      
      set({ 
        friends: updatedFriends,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '删除好友失败',
        isLoading: false 
      });
      throw error;
    }
  },

  // 加载收到的好友请求
  loadReceivedRequests: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const requests = await FriendshipAPI.getReceivedRequests();
      
      set({ 
        receivedRequests: requests,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '加载好友请求失败',
        isLoading: false 
      });
    }
  },

  // 加载发送的好友请求
  loadSentRequests: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const requests = await FriendshipAPI.getSentRequests();
      
      set({ 
        sentRequests: requests,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '加载已发送请求失败',
        isLoading: false 
      });
    }
  },

  // 发送好友请求
  sendFriendRequest: async (targetUserId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const friendship = await FriendshipAPI.sendFriendRequest(targetUserId);
      
      // 将新请求添加到已发送列表
      const currentSentRequests = get().sentRequests;
      set({ 
        sentRequests: [friendship, ...currentSentRequests],
        isLoading: false 
      });
      
      // 从搜索结果中移除该用户
      const currentSearchResults = get().searchResults;
      const updatedSearchResults = currentSearchResults.filter(user => user.id !== targetUserId);
      set({ searchResults: updatedSearchResults });
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '发送好友请求失败',
        isLoading: false 
      });
      throw error;
    }
  },

  // 响应好友请求
  respondToRequest: async (requestId: string, action: 'accept' | 'reject') => {
    try {
      set({ isLoading: true, error: null });
      
      const updatedFriendship = await FriendshipAPI.respondToRequest(requestId, action);
      
      // 从收到的请求中移除该请求
      const currentReceivedRequests = get().receivedRequests;
      const updatedReceivedRequests = currentReceivedRequests.filter(req => req.id !== requestId);
      
      set({ 
        receivedRequests: updatedReceivedRequests,
        isLoading: false 
      });
      
      // 如果接受了请求，刷新好友列表
      if (action === 'accept') {
        get().loadFriends();
      }
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '处理好友请求失败',
        isLoading: false 
      });
      throw error;
    }
  },

  // 搜索用户
  searchUsers: async (query: string) => {
    if (!query || query.trim().length < 2) {
      set({ searchResults: [] });
      return;
    }
    
    try {
      set({ isSearching: true, error: null });
      
      const users = await FriendshipAPI.searchUsers(query.trim());
      
      set({ 
        searchResults: users,
        isSearching: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '搜索用户失败',
        isSearching: false,
        searchResults: []
      });
    }
  },

  // 清空搜索结果
  clearSearchResults: () => {
    set({ searchResults: [] });
  },

  // 清除错误
  clearError: () => {
    set({ error: null });
  },

  // 重置好友状态
  resetFriendshipState: () => {
    set({
      friends: [],
      receivedRequests: [],
      sentRequests: [],
      searchResults: [],
      error: null,
      isLoading: false,
      isSearching: false,
    });
  },
}));