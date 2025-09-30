import { api } from './api';
import type { 
  ApiResponse,
  Group,
  GroupMember,
  CreateGroupRequest,
  UpdateGroupRequest,
  JoinGroupRequest,
  GroupWithMembers,
  GroupLeaderboardEntry,
  GroupRole
} from '@bible-rankings/shared';

interface GroupsResponse {
  groups: Group[];
}

interface GroupResponse {
  group: Group;
}

interface GroupDetailsResponse {
  group: GroupWithMembers;
}

interface GroupMemberResponse {
  member: GroupMember;
}

interface GroupLeaderboardResponse {
  leaderboard: GroupLeaderboardEntry[];
  period: string;
}

export class GroupAPI {
  // 创建群组
  static async createGroup(data: CreateGroupRequest): Promise<Group> {
    const response = await api.post<ApiResponse<GroupResponse>>('/groups', data);
    return response.data.data!.group;
  }

  // 通过代码加入群组
  static async joinGroup(data: JoinGroupRequest): Promise<GroupMember> {
    const response = await api.post<ApiResponse<GroupMemberResponse>>('/groups/join', data);
    return response.data.data!.member;
  }

  // 获取用户的群组列表
  static async getUserGroups(): Promise<Group[]> {
    const response = await api.get<ApiResponse<GroupsResponse>>('/groups');
    return response.data.data!.groups;
  }

  // 获取群组详情
  static async getGroupDetails(groupId: string): Promise<GroupWithMembers> {
    const response = await api.get<ApiResponse<GroupDetailsResponse>>(`/groups/${groupId}`);
    return response.data.data!.group;
  }

  // 获取群组排行榜
  static async getGroupLeaderboard(groupId: string, period: string = 'all-time'): Promise<{
    leaderboard: GroupLeaderboardEntry[];
    period: string;
  }> {
    const response = await api.get<ApiResponse<GroupLeaderboardResponse>>(
      `/groups/${groupId}/leaderboard?period=${period}`
    );
    return response.data.data!;
  }

  // 更新群组信息
  static async updateGroup(groupId: string, data: UpdateGroupRequest): Promise<Group> {
    const response = await api.put<ApiResponse<GroupResponse>>(`/groups/${groupId}`, data);
    return response.data.data!.group;
  }

  // 更新成员角色
  static async updateMemberRole(groupId: string, memberId: string, role: GroupRole): Promise<GroupMember> {
    const response = await api.put<ApiResponse<GroupMemberResponse>>(
      `/groups/${groupId}/members/${memberId}`, 
      { role }
    );
    return response.data.data!.member;
  }

  // 移除群组成员
  static async removeMember(groupId: string, memberId: string): Promise<void> {
    await api.delete(`/groups/${groupId}/members/${memberId}`);
  }

  // 离开群组
  static async leaveGroup(groupId: string): Promise<void> {
    await api.post(`/groups/${groupId}/leave`);
  }

  // 删除群组
  static async deleteGroup(groupId: string): Promise<void> {
    await api.delete(`/groups/${groupId}`);
  }
}