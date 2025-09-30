import { prisma } from '@/config/database';
import type { User } from '@bible-rankings/shared';

export type FriendshipStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface FriendshipRequest {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: FriendshipStatus;
  createdAt: Date;
  updatedAt: Date;
  requester: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
  addressee: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
}

export interface Friend {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  friendshipDate: Date;
  totalStats: {
    totalVerses: number;
    totalDays: number;
    todayVerses: number;
  };
}

export class FriendshipService {
  // 搜索用户（排除自己和已是好友的用户）
  static async searchUsers(currentUserId: string, searchQuery: string): Promise<User[]> {
    // 获取当前用户的所有好友关系
    const existingFriendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { requesterId: currentUserId },
          { addresseeId: currentUserId }
        ],
        status: 'ACCEPTED'
      },
      select: {
        requesterId: true,
        addresseeId: true
      }
    });

    // 提取好友ID列表
    const friendIds = existingFriendships.map(f => 
      f.requesterId === currentUserId ? f.addresseeId : f.requesterId
    );

    // 搜索用户，排除自己和已是好友的用户
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [
              { username: { contains: searchQuery } },
              { displayName: { contains: searchQuery } }
            ]
          },
          { id: { not: currentUserId } }, // 排除自己
          { id: { notIn: friendIds } } // 排除已是好友的用户
        ]
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        createdAt: true
      },
      take: 20 // 限制搜索结果数量
    });

    return users;
  }

  // 发送好友请求
  static async sendFriendRequest(requesterId: string, addresseeId: string): Promise<FriendshipRequest> {
    // 检查是否已经存在好友关系或待处理的请求
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId, addresseeId },
          { requesterId: addresseeId, addresseeId: requesterId }
        ]
      }
    });

    if (existingFriendship) {
      if (existingFriendship.status === 'ACCEPTED') {
        throw new Error('已经是好友了');
      } else if (existingFriendship.status === 'PENDING') {
        throw new Error('好友请求已发送，请等待对方回应');
      }
    }

    // 检查目标用户是否存在
    const addressee = await prisma.user.findUnique({
      where: { id: addresseeId }
    });

    if (!addressee) {
      throw new Error('用户不存在');
    }

    // 创建好友请求
    const friendship = await prisma.friendship.create({
      data: {
        requesterId,
        addresseeId,
        status: 'PENDING'
      },
      include: {
        requester: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true
          }
        },
        addressee: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true
          }
        }
      }
    });

    return friendship;
  }

  // 获取收到的好友请求
  static async getReceivedRequests(userId: string): Promise<FriendshipRequest[]> {
    const requests = await prisma.friendship.findMany({
      where: {
        addresseeId: userId,
        status: 'PENDING'
      },
      include: {
        requester: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true
          }
        },
        addressee: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return requests;
  }

  // 获取发送的好友请求
  static async getSentRequests(userId: string): Promise<FriendshipRequest[]> {
    const requests = await prisma.friendship.findMany({
      where: {
        requesterId: userId,
        status: 'PENDING'
      },
      include: {
        requester: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true
          }
        },
        addressee: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return requests;
  }

  // 响应好友请求（接受/拒绝）
  static async respondToRequest(
    requestId: string, 
    userId: string, 
    action: 'accept' | 'reject'
  ): Promise<FriendshipRequest> {
    // 验证请求是否存在且是发给当前用户的
    const friendship = await prisma.friendship.findFirst({
      where: {
        id: requestId,
        addresseeId: userId,
        status: 'PENDING'
      }
    });

    if (!friendship) {
      throw new Error('好友请求不存在或已处理');
    }

    // 更新请求状态
    const updatedFriendship = await prisma.friendship.update({
      where: { id: requestId },
      data: {
        status: action === 'accept' ? 'ACCEPTED' : 'REJECTED'
      },
      include: {
        requester: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true
          }
        },
        addressee: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true
          }
        }
      }
    });

    return updatedFriendship;
  }

  // 获取好友列表
  static async getFriends(userId: string): Promise<Friend[]> {
    // 1. 获取传统好友
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { requesterId: userId },
          { addresseeId: userId }
        ],
        status: 'ACCEPTED'
      },
      include: {
        requester: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true
          }
        },
        addressee: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // 2. 获取群组成员作为"好友"
    const groupMembers = await this.getGroupMembersAsFriends(userId);

    // 3. 获取传统好友信息和阅读统计
    const traditionalFriends = await Promise.all(
      friendships.map(async (friendship) => {
        const friend = friendship.requesterId === userId 
          ? friendship.addressee 
          : friendship.requester;

        const stats = await this.getUserStats(friend.id);

        return {
          id: friend.id,
          username: friend.username,
          displayName: friend.displayName,
          avatarUrl: friend.avatarUrl,
          friendshipDate: friendship.createdAt,
          totalStats: stats
        };
      })
    );

    // 4. 合并传统好友和群组成员，去重
    const allFriends = [...traditionalFriends, ...groupMembers];
    const uniqueFriends = allFriends.filter((friend, index, self) => 
      index === self.findIndex(f => f.id === friend.id)
    );

    return uniqueFriends;
  }

  // 获取群组成员作为好友
  private static async getGroupMembersAsFriends(userId: string): Promise<Friend[]> {
    // 获取用户所在的所有群组
    const userGroups = await prisma.groupMember.findMany({
      where: { userId },
      select: { groupId: true }
    });

    if (userGroups.length === 0) {
      return [];
    }

    const groupIds = userGroups.map(g => g.groupId);

    // 获取这些群组中的其他成员
    const groupMembers = await prisma.groupMember.findMany({
      where: {
        groupId: { in: groupIds },
        userId: { not: userId }
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true
          }
        }
      },
      orderBy: {
        joinedAt: 'desc'
      }
    });

    // 转换为Friend格式
    const groupFriends = await Promise.all(
      groupMembers.map(async (member) => {
        const stats = await this.getUserStats(member.user.id);

        return {
          id: member.user.id,
          username: member.user.username,
          displayName: member.user.displayName,
          avatarUrl: member.user.avatarUrl,
          friendshipDate: member.joinedAt, // 使用加入群组的时间
          totalStats: stats
        };
      })
    );

    return groupFriends;
  }

  // 获取用户阅读统计的辅助方法
  private static async getUserStats(userId: string) {
    const totalVerses = await prisma.readingRecord.count({
      where: { userId }
    });

    const totalDays = await prisma.dailyStats.count({
      where: { 
        userId,
        versesRead: { gt: 0 }
      }
    });

    const today = new Date().toISOString().split('T')[0];
    const todayStats = await prisma.dailyStats.findUnique({
      where: {
        userId_date: {
          userId,
          date: today
        }
      }
    });

    return {
      totalVerses,
      totalDays,
      todayVerses: todayStats?.versesRead || 0
    };
  }

  // 删除好友
  static async removeFriend(userId: string, friendId: string): Promise<void> {
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: userId, addresseeId: friendId },
          { requesterId: friendId, addresseeId: userId }
        ],
        status: 'ACCEPTED'
      }
    });

    if (!friendship) {
      throw new Error('好友关系不存在');
    }

    await prisma.friendship.delete({
      where: { id: friendship.id }
    });
  }

  // 检查是否为好友
  static async areFriends(userId1: string, userId2: string): Promise<boolean> {
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: userId1, addresseeId: userId2 },
          { requesterId: userId2, addresseeId: userId1 }
        ],
        status: 'ACCEPTED'
      }
    });

    return !!friendship;
  }
}