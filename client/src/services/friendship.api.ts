import { api } from './api';
import type { 
  ApiResponse,
  User,
  Friend,
  FriendRequest,
  SendFriendRequestData,
  RespondToRequestData
} from '@bible-rankings/shared';

interface SearchUsersResponse {
  users: User[];
}

interface FriendsResponse {
  friends: Friend[];
}

interface FriendRequestsResponse {
  requests: FriendRequest[];
}

interface FriendRequestResponse {
  friendship: FriendRequest;
}

interface FriendshipStatusResponse {
  areFriends: boolean;
  status: string;
}

export class FriendshipAPI {
  // 搜索用户
  static async searchUsers(query: string): Promise<User[]> {
    const response = await api.get<ApiResponse<SearchUsersResponse>>('/friends/search', {
      params: { q: query }
    });
    return response.data.data!.users;
  }

  // 发送好友请求
  static async sendFriendRequest(targetUserId: string): Promise<FriendRequest> {
    const response = await api.post<ApiResponse<FriendRequestResponse>>('/friends/request', {
      targetUserId
    });
    return response.data.data!.friendship;
  }

  // 获取收到的好友请求
  static async getReceivedRequests(): Promise<FriendRequest[]> {
    const response = await api.get<ApiResponse<FriendRequestsResponse>>('/friends/requests/received');
    return response.data.data!.requests;
  }

  // 获取发送的好友请求
  static async getSentRequests(): Promise<FriendRequest[]> {
    const response = await api.get<ApiResponse<FriendRequestsResponse>>('/friends/requests/sent');
    return response.data.data!.requests;
  }

  // 响应好友请求（接受/拒绝）
  static async respondToRequest(
    requestId: string, 
    action: 'accept' | 'reject'
  ): Promise<FriendRequest> {
    const response = await api.put<ApiResponse<FriendRequestResponse>>(
      `/friends/requests/${requestId}/respond`,
      { action }
    );
    return response.data.data!.friendship;
  }

  // 获取好友列表
  static async getFriends(): Promise<Friend[]> {
    const response = await api.get<ApiResponse<FriendsResponse>>('/friends');
    return response.data.data!.friends;
  }

  // 删除好友
  static async removeFriend(friendId: string): Promise<void> {
    await api.delete(`/friends/${friendId}`);
  }

  // 检查好友状态
  static async getFriendshipStatus(targetUserId: string): Promise<FriendshipStatusResponse> {
    const response = await api.get<ApiResponse<FriendshipStatusResponse>>(
      `/friends/${targetUserId}/status`
    );
    return response.data.data!;
  }
}