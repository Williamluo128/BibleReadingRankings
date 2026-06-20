import { prisma } from '@/config/database';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/config/env';
import type { User, UserRole } from '@bible-rankings/shared';

// 后端管理员客户端(service_role key,可绕过 RLS,仅服务端使用)
const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export interface UserListQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  orderBy?: 'createdAt' | 'updatedAt' | 'username' | 'email';
  orderDirection?: 'asc' | 'desc';
}

export interface UserWithStats extends User {
  stats: {
    totalVerses: number;
    totalDays: number;
    friendsCount: number;
    groupsCount: number;
    lastActiveAt?: Date;
  };
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  displayName?: string;
  role?: UserRole;
  isActive?: boolean;
}

export class AdminService {
  /**
   * 获取用户列表（带分页和筛选）
   */
  static async getUsers(query: UserListQuery): Promise<{
    users: UserWithStats[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 20,
      search = '',
      role,
      orderBy = 'createdAt',
      orderDirection = 'desc'
    } = query;

    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: any = {};

    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (role) {
      where.role = role;
    }

    // 获取用户列表
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          email: true,
          displayName: true,
          avatarUrl: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          readingRecords: {
            select: {
              id: true,
              readAt: true
            }
          },
          sentRequests: {
            where: { status: 'ACCEPTED' },
            select: { id: true }
          },
          receivedRequests: {
            where: { status: 'ACCEPTED' },
            select: { id: true }
          },
          groupMemberships: {
            select: { id: true }
          }
        },
        skip,
        take: limit,
        orderBy: { [orderBy]: orderDirection }
      }),
      prisma.user.count({ where })
    ]);

    // 计算统计信息
    const usersWithStats: UserWithStats[] = users.map(user => {
      const uniqueDates = new Set(
        user.readingRecords.map(record => record.readAt.toISOString().split('T')[0])
      );

      const friendsCount = user.sentRequests.length + user.receivedRequests.length;
      const lastActiveAt = user.readingRecords.length > 0 
        ? new Date(Math.max(...user.readingRecords.map(r => r.readAt.getTime())))
        : undefined;

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        role: user.role as UserRole,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        stats: {
          totalVerses: user.readingRecords.length,
          totalDays: uniqueDates.size,
          friendsCount,
          groupsCount: user.groupMemberships.length,
          lastActiveAt
        }
      };
    });

    return {
      users: usersWithStats,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * 获取用户详细信息
   */
  static async getUserDetails(userId: string): Promise<UserWithStats | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        readingRecords: {
          select: {
            id: true,
            readAt: true,
            verse: {
              select: {
                chapter: {
                  select: {
                    book: {
                      select: {
                        nameCn: true,
                        nameEn: true
                      }
                    }
                  }
                }
              }
            }
          },
          take: 10,
          orderBy: { readAt: 'desc' }
        },
        sentRequests: {
          where: { status: 'ACCEPTED' },
          select: { 
            id: true,
            addressee: {
              select: {
                id: true,
                username: true,
                displayName: true
              }
            }
          }
        },
        receivedRequests: {
          where: { status: 'ACCEPTED' },
          select: { 
            id: true,
            requester: {
              select: {
                id: true,
                username: true,
                displayName: true
              }
            }
          }
        },
        groupMemberships: {
          select: {
            id: true,
            role: true,
            joinedAt: true,
            group: {
              select: {
                id: true,
                name: true,
                code: true
              }
            }
          }
        }
      }
    });

    if (!user) return null;

    const uniqueDates = new Set(
      user.readingRecords.map(record => record.readAt.toISOString().split('T')[0])
    );

    const friendsCount = user.sentRequests.length + user.receivedRequests.length;
    const lastActiveAt = user.readingRecords.length > 0 
      ? new Date(Math.max(...user.readingRecords.map(r => r.readAt.getTime())))
      : undefined;

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      role: user.role as UserRole,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      stats: {
        totalVerses: user.readingRecords.length,
        totalDays: uniqueDates.size,
        friendsCount,
        groupsCount: user.groupMemberships.length,
        lastActiveAt
      }
    };
  }

  /**
   * 更新用户信息
   */
  static async updateUser(userId: string, updateData: UpdateUserRequest): Promise<User> {
    const updateFields: any = {};

    if (updateData.username) updateFields.username = updateData.username;
    if (updateData.email) updateFields.email = updateData.email;
    if (updateData.displayName) updateFields.displayName = updateData.displayName;
    if (updateData.role) updateFields.role = updateData.role;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateFields,
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return updatedUser as User;
  }

  /**
   * 重置用户密码(通过 Supabase Admin API,密码哈希由 Supabase 托管)
   */
  static async resetUserPassword(userId: string, newPassword: string): Promise<void> {
    // 先查本地用户拿到 supabaseUid
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { supabaseUid: true } });
    if (!user) {
      throw new Error('用户不存在');
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(user.supabaseUid, {
      password: newPassword,
    });
    if (error) {
      throw new Error(`重置密码失败: ${error.message}`);
    }
  }

  /**
   * 删除用户（软删除 - 暂时设为禁用）
   */
  static async deleteUser(userId: string): Promise<void> {
    // 注意：这里实际上不删除用户，而是可以添加一个 isActive 字段来标记
    // 目前先抛出错误，提醒需要更仔细考虑删除策略
    throw new Error('用户删除功能需要更仔细的设计，建议使用禁用功能');
  }

  /**
   * 获取系统统计信息
   */
  static async getSystemStats(): Promise<{
    totalUsers: number;
    totalVerses: number;
    totalGroups: number;
    totalFriendships: number;
    activeUsersToday: number;
    activeUsersThisWeek: number;
  }> {
    const today = new Date();
    const todayStart = new Date(today.setHours(0, 0, 0, 0));
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalVerses,
      totalGroups,
      totalFriendships,
      activeUsersToday,
      activeUsersThisWeek
    ] = await Promise.all([
      prisma.user.count(),
      prisma.readingRecord.count(),
      prisma.group.count(),
      prisma.friendship.count({ where: { status: 'ACCEPTED' } }),
      prisma.user.count({
        where: {
          readingRecords: {
            some: {
              readAt: {
                gte: todayStart
              }
            }
          }
        }
      }),
      prisma.user.count({
        where: {
          readingRecords: {
            some: {
              readAt: {
                gte: weekAgo
              }
            }
          }
        }
      })
    ]);

    return {
      totalUsers,
      totalVerses,
      totalGroups,
      totalFriendships,
      activeUsersToday,
      activeUsersThisWeek
    };
  }
}