import { create } from 'zustand';
import { GroupAPI } from '@/services/group.api';
import type { 
  Group, 
  GroupMember,
  CreateGroupRequest, 
  UpdateGroupRequest,
  JoinGroupRequest,
  GroupWithMembers,
  GroupLeaderboardEntry,
  GroupRole
} from '@bible-rankings/shared';

interface GroupState {
  // 数据
  groups: Group[];
  currentGroup: GroupWithMembers | null;
  leaderboard: GroupLeaderboardEntry[];
  currentPeriod: string;
  
  // 状态
  isLoading: boolean;
  isCreating: boolean;
  isJoining: boolean;
  error: string | null;
  
  // 操作
  loadGroups: () => Promise<void>;
  createGroup: (data: CreateGroupRequest) => Promise<Group>;
  joinGroup: (data: JoinGroupRequest) => Promise<void>;
  loadGroupDetails: (groupId: string) => Promise<void>;
  loadGroupLeaderboard: (groupId: string, period?: string) => Promise<void>;
  updateGroup: (groupId: string, data: UpdateGroupRequest) => Promise<void>;
  updateMemberRole: (groupId: string, memberId: string, role: GroupRole) => Promise<void>;
  removeMember: (groupId: string, memberId: string) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
  deleteGroup: (groupId: string) => Promise<void>;
  setPeriod: (period: string) => void;
  clearError: () => void;
  clearCurrentGroup: () => void;
}

export const useGroupStore = create<GroupState>((set, get) => ({
  // 初始状态
  groups: [],
  currentGroup: null,
  leaderboard: [],
  currentPeriod: 'all-time',
  isLoading: false,
  isCreating: false,
  isJoining: false,
  error: null,

  // 加载用户的群组列表
  loadGroups: async () => {
    set({ isLoading: true, error: null });
    try {
      const groups = await GroupAPI.getUserGroups();
      set({ groups, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '加载群组列表失败',
        isLoading: false 
      });
    }
  },

  // 创建群组
  createGroup: async (data: CreateGroupRequest) => {
    set({ isCreating: true, error: null });
    try {
      const group = await GroupAPI.createGroup(data);
      
      // 添加到群组列表
      const { groups } = get();
      set({ 
        groups: [group, ...groups],
        isCreating: false 
      });
      
      return group;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '创建群组失败',
        isCreating: false 
      });
      throw error;
    }
  },

  // 加入群组
  joinGroup: async (data: JoinGroupRequest) => {
    set({ isJoining: true, error: null });
    try {
      await GroupAPI.joinGroup(data);
      
      // 重新加载群组列表
      await get().loadGroups();
      set({ isJoining: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '加入群组失败',
        isJoining: false 
      });
      throw error;
    }
  },

  // 加载群组详情
  loadGroupDetails: async (groupId: string) => {
    set({ isLoading: true, error: null });
    try {
      const group = await GroupAPI.getGroupDetails(groupId);
      set({ 
        currentGroup: group,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '加载群组详情失败',
        isLoading: false 
      });
    }
  },

  // 加载群组排行榜
  loadGroupLeaderboard: async (groupId: string, period = 'all-time') => {
    set({ isLoading: true, error: null });
    try {
      const { leaderboard } = await GroupAPI.getGroupLeaderboard(groupId, period);
      set({ 
        leaderboard,
        currentPeriod: period,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '加载群组排行榜失败',
        isLoading: false 
      });
    }
  },

  // 更新群组信息
  updateGroup: async (groupId: string, data: UpdateGroupRequest) => {
    set({ isLoading: true, error: null });
    try {
      const updatedGroup = await GroupAPI.updateGroup(groupId, data);
      
      // 更新群组列表
      const { groups } = get();
      const updatedGroups = groups.map(group => 
        group.id === groupId ? updatedGroup : group
      );
      set({ groups: updatedGroups });

      // 如果是当前群组，也更新当前群组
      const { currentGroup } = get();
      if (currentGroup && currentGroup.id === groupId) {
        set({ 
          currentGroup: {
            ...currentGroup,
            ...updatedGroup
          }
        });
      }

      set({ isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '更新群组信息失败',
        isLoading: false 
      });
      throw error;
    }
  },

  // 更新成员角色
  updateMemberRole: async (groupId: string, memberId: string, role: GroupRole) => {
    set({ isLoading: true, error: null });
    try {
      await GroupAPI.updateMemberRole(groupId, memberId, role);
      
      // 重新加载群组详情
      await get().loadGroupDetails(groupId);
      set({ isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '更新成员角色失败',
        isLoading: false 
      });
      throw error;
    }
  },

  // 移除群组成员
  removeMember: async (groupId: string, memberId: string) => {
    set({ isLoading: true, error: null });
    try {
      await GroupAPI.removeMember(groupId, memberId);
      
      // 重新加载群组详情
      await get().loadGroupDetails(groupId);
      set({ isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '移除成员失败',
        isLoading: false 
      });
      throw error;
    }
  },

  // 离开群组
  leaveGroup: async (groupId: string) => {
    set({ isLoading: true, error: null });
    try {
      await GroupAPI.leaveGroup(groupId);
      
      // 从群组列表中移除
      const { groups } = get();
      const updatedGroups = groups.filter(group => group.id !== groupId);
      set({ 
        groups: updatedGroups,
        currentGroup: null,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '离开群组失败',
        isLoading: false 
      });
      throw error;
    }
  },

  // 删除群组
  deleteGroup: async (groupId: string) => {
    set({ isLoading: true, error: null });
    try {
      await GroupAPI.deleteGroup(groupId);
      
      // 从群组列表中移除
      const { groups } = get();
      const updatedGroups = groups.filter(group => group.id !== groupId);
      set({ 
        groups: updatedGroups,
        currentGroup: null,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '删除群组失败',
        isLoading: false 
      });
      throw error;
    }
  },

  // 设置时间周期
  setPeriod: (period: string) => {
    set({ currentPeriod: period });
  },

  // 清除错误
  clearError: () => {
    set({ error: null });
  },

  // 清除当前群组
  clearCurrentGroup: () => {
    set({ currentGroup: null, leaderboard: [] });
  },
}));