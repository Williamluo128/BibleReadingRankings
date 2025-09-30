import { api } from './api';
import type { 
  ApiResponse,
  LeaderboardEntry,
  UserRank
} from '@bible-rankings/shared';

interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  period: string;
  totalUsers: number;
}

interface FriendsLeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  period: string;
  totalFriends: number;
}

interface UserRankResponse extends UserRank {}

export type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly' | 'all-time';

export class LeaderboardAPI {
  // 获取全站排行榜
  static async getGlobalLeaderboard(
    period: LeaderboardPeriod = 'weekly',
    limit: number = 50
  ): Promise<LeaderboardResponse> {
    const response = await api.get<ApiResponse<LeaderboardResponse>>('/leaderboard/global', {
      params: { period, limit }
    });
    return response.data.data!;
  }

  // 获取好友排行榜
  static async getFriendsLeaderboard(
    period: LeaderboardPeriod = 'weekly'
  ): Promise<FriendsLeaderboardResponse> {
    const response = await api.get<ApiResponse<FriendsLeaderboardResponse>>('/leaderboard/friends', {
      params: { period }
    });
    return response.data.data!;
  }

  // 获取当前用户排名
  static async getUserRank(period: LeaderboardPeriod = 'weekly'): Promise<UserRankResponse> {
    const response = await api.get<ApiResponse<UserRankResponse>>('/leaderboard/my-rank', {
      params: { period }
    });
    return response.data.data!;
  }
}