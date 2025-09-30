import { PrismaClient } from '@prisma/client';
import type { LeaderboardEntry, UserRank } from '@bible-rankings/shared';

const prisma = new PrismaClient();

export class LeaderboardService {
  
  static async getLeaderboard(currentUserId: string, period: string, limit: number): Promise<LeaderboardEntry[]> {
    const dateFilter = this.getDateFilter(period);
    
    // 获取所有用户的阅读统计
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        displayName: true,
        dailyStats: {
          where: dateFilter,
          select: {
            versesRead: true,
            date: true
          }
        }
      }
    });

    // 计算每个用户的统计数据
    const leaderboard: LeaderboardEntry[] = users.map((user) => {
      let totalVerses = 0;
      let totalDays = 0;
      const uniqueDates = new Set<string>();

      user.dailyStats.forEach(stat => {
        totalVerses += stat.versesRead;
        uniqueDates.add(stat.date);
      });

      totalDays = uniqueDates.size;

      return {
        userId: user.id,
        username: user.username,
        displayName: user.displayName,
        totalVerses,
        totalDays,
        averageVersesPerDay: totalDays > 0 ? Math.round(totalVerses / totalDays) : 0,
        isCurrentUser: user.id === currentUserId,
        rank: 0 // 将在排序后设置
      };
    });

    // 按总阅读节数排序
    leaderboard.sort((a, b) => {
      if (b.totalVerses !== a.totalVerses) {
        return b.totalVerses - a.totalVerses;
      }
      // 如果总节数相同，按阅读天数排序
      if (b.totalDays !== a.totalDays) {
        return b.totalDays - a.totalDays;
      }
      // 如果都相同，按用户名排序
      return a.username.localeCompare(b.username);
    });

    // 设置排名
    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return leaderboard.slice(0, limit);
  }

  static async getFriendsLeaderboard(currentUserId: string, period: string): Promise<LeaderboardEntry[]> {
    const dateFilter = this.getDateFilter(period);
    
    // 获取所有相关用户IDs（好友 + 群组成员）
    const userIds = await this.getAllRelatedUserIds(currentUserId);

    // 获取这些用户的阅读统计
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds }
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        dailyStats: {
          where: dateFilter,
          select: {
            versesRead: true,
            date: true
          }
        }
      }
    });

    // 计算每个用户的统计数据
    const friendsLeaderboard: LeaderboardEntry[] = users.map((user) => {
      let totalVerses = 0;
      let totalDays = 0;
      const uniqueDates = new Set<string>();

      user.dailyStats.forEach(stat => {
        totalVerses += stat.versesRead;
        uniqueDates.add(stat.date);
      });

      totalDays = uniqueDates.size;

      return {
        userId: user.id,
        username: user.username,
        displayName: user.displayName,
        totalVerses,
        totalDays,
        averageVersesPerDay: totalDays > 0 ? Math.round(totalVerses / totalDays) : 0,
        isCurrentUser: user.id === currentUserId,
        rank: 0
      };
    });

    // 按总阅读节数排序
    friendsLeaderboard.sort((a, b) => {
      if (b.totalVerses !== a.totalVerses) {
        return b.totalVerses - a.totalVerses;
      }
      if (b.totalDays !== a.totalDays) {
        return b.totalDays - a.totalDays;
      }
      return a.username.localeCompare(b.username);
    });

    // 设置排名
    friendsLeaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return friendsLeaderboard;
  }

  static async getUserRank(userId: string, period: string): Promise<UserRank> {
    // 获取完整的排行榜来计算用户排名
    const fullLeaderboard = await this.getLeaderboard(userId, period, 1000);
    
    const userEntry = fullLeaderboard.find(entry => entry.userId === userId);
    
    if (!userEntry) {
      return {
        rank: fullLeaderboard.length + 1,
        totalUsers: fullLeaderboard.length,
        totalVerses: 0,
        totalDays: 0,
        averageVersesPerDay: 0
      };
    }

    return {
      rank: userEntry.rank,
      totalUsers: fullLeaderboard.length,
      totalVerses: userEntry.totalVerses,
      totalDays: userEntry.totalDays,
      averageVersesPerDay: userEntry.averageVersesPerDay
    };
  }

  // 获取所有相关用户IDs（传统好友 + 群组成员）
  private static async getAllRelatedUserIds(currentUserId: string): Promise<string[]> {
    // 1. 获取传统好友IDs
    const friendships = await prisma.friendship.findMany({
      where: {
        AND: [
          {
            OR: [
              { requesterId: currentUserId },
              { addresseeId: currentUserId }
            ]
          },
          { status: 'ACCEPTED' }
        ]
      },
      select: {
        requesterId: true,
        addresseeId: true
      }
    });

    const friendIds = friendships.map(f => 
      f.requesterId === currentUserId ? f.addresseeId : f.requesterId
    );

    // 2. 获取用户所在的所有群组
    const userGroups = await prisma.groupMember.findMany({
      where: {
        userId: currentUserId
      },
      select: {
        groupId: true
      }
    });

    const groupIds = userGroups.map(g => g.groupId);

    // 3. 获取这些群组中的所有其他成员
    let groupMemberIds: string[] = [];
    if (groupIds.length > 0) {
      const groupMembers = await prisma.groupMember.findMany({
        where: {
          groupId: { in: groupIds },
          userId: { not: currentUserId } // 排除当前用户
        },
        select: {
          userId: true
        }
      });

      groupMemberIds = groupMembers.map(m => m.userId);
    }

    // 4. 合并好友和群组成员ID，去重
    const allRelatedUserIds = [...new Set([...friendIds, ...groupMemberIds])];

    // 5. 添加当前用户ID到列表中
    return [currentUserId, ...allRelatedUserIds];
  }

  private static getDateFilter(period: string): any {
    const now = new Date();
    
    switch (period) {
      case 'daily':
        const today = now.toISOString().split('T')[0]; // YYYY-MM-DD format
        return {
          date: {
            gte: today
          }
        };
      
      case 'weekly':
        const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
        return {
          date: {
            gte: weekStart.toISOString().split('T')[0]
          }
        };
      
      case 'monthly':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return {
          date: {
            gte: monthStart.toISOString().split('T')[0]
          }
        };
      
      case 'all-time':
      default:
        return {}; // 无日期过滤，返回所有时间的数据
    }
  }
}