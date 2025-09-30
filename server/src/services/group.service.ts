import { prisma } from '@/config/database';
import type { 
  Group, 
  GroupMember, 
  CreateGroupRequest, 
  UpdateGroupRequest,
  GroupWithMembers,
  GroupLeaderboardEntry,
  GroupRole
} from '@bible-rankings/shared';

export class GroupService {
  // 生成唯一的群组代码
  private static generateGroupCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // 创建群组
  static async createGroup(userId: string, data: CreateGroupRequest): Promise<Group> {
    let code = this.generateGroupCode();
    
    // 确保代码唯一
    let existingGroup = await prisma.group.findUnique({ where: { code } });
    while (existingGroup) {
      code = this.generateGroupCode();
      existingGroup = await prisma.group.findUnique({ where: { code } });
    }

    const group = await prisma.group.create({
      data: {
        name: data.name,
        description: data.description,
        code,
        ownerId: userId,
        isPublic: data.isPublic || false,
      },
      include: {
        owner: true,
        _count: {
          select: { members: true }
        }
      }
    });

    // 自动将创建者添加为群组成员
    await prisma.groupMember.create({
      data: {
        groupId: group.id,
        userId,
        role: 'OWNER'
      }
    });

    return {
      id: group.id,
      name: group.name,
      description: group.description,
      code: group.code,
      ownerId: group.ownerId,
      isPublic: group.isPublic,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
      owner: group.owner,
      memberCount: 1 // 刚创建，只有创建者
    };
  }

  // 通过代码加入群组
  static async joinGroupByCode(userId: string, code: string): Promise<GroupMember> {
    const group = await prisma.group.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!group) {
      throw new Error('群组代码无效');
    }

    // 检查用户是否已经是成员
    const existingMember = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: group.id,
          userId
        }
      }
    });

    if (existingMember) {
      throw new Error('您已经是该群组的成员');
    }

    const member = await prisma.groupMember.create({
      data: {
        groupId: group.id,
        userId,
        role: 'MEMBER'
      },
      include: {
        user: true,
        group: true
      }
    });

    return {
      id: member.id,
      groupId: member.groupId,
      userId: member.userId,
      role: member.role as GroupRole,
      joinedAt: member.joinedAt,
      user: member.user,
      group: member.group
    };
  }

  // 获取用户的群组列表
  static async getUserGroups(userId: string): Promise<Group[]> {
    const memberships = await prisma.groupMember.findMany({
      where: { userId },
      include: {
        group: {
          include: {
            owner: true,
            _count: {
              select: { members: true }
            }
          }
        }
      },
      orderBy: { joinedAt: 'desc' }
    });

    return memberships.map(membership => ({
      id: membership.group.id,
      name: membership.group.name,
      description: membership.group.description,
      code: membership.group.code,
      ownerId: membership.group.ownerId,
      isPublic: membership.group.isPublic,
      createdAt: membership.group.createdAt,
      updatedAt: membership.group.updatedAt,
      owner: membership.group.owner,
      memberCount: membership.group._count.members
    }));
  }

  // 获取群组详情
  static async getGroupDetails(groupId: string, userId: string): Promise<GroupWithMembers> {
    // 检查用户是否是群组成员
    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId
        }
      }
    });

    if (!membership) {
      throw new Error('您不是该群组的成员');
    }

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        owner: true,
        members: {
          include: {
            user: true
          },
          orderBy: [
            { role: 'desc' }, // OWNER > ADMIN > MEMBER
            { joinedAt: 'asc' }
          ]
        }
      }
    });

    if (!group) {
      throw new Error('群组不存在');
    }

    return {
      id: group.id,
      name: group.name,
      description: group.description,
      code: group.code,
      ownerId: group.ownerId,
      isPublic: group.isPublic,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
      owner: group.owner,
      members: group.members.map(member => ({
        id: member.id,
        role: member.role as GroupRole,
        joinedAt: member.joinedAt,
        user: member.user
      }))
    };
  }

  // 获取群组排行榜
  static async getGroupLeaderboard(groupId: string, userId: string, period: string): Promise<GroupLeaderboardEntry[]> {
    // 检查用户是否是群组成员
    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId
        }
      }
    });

    if (!membership) {
      throw new Error('您不是该群组的成员');
    }

    // 获取群组所有成员
    const members = await prisma.groupMember.findMany({
      where: { groupId },
      include: { user: true }
    });

    const memberIds = members.map(m => m.userId);
    const memberRoles = new Map(members.map(m => [m.userId, m.role as GroupRole]));

    // 获取日期过滤器
    const dateFilter = this.getDateFilter(period);

    // 获取成员的每日统计
    const users = await prisma.user.findMany({
      where: {
        id: { in: memberIds }
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        dailyStats: {
          where: dateFilter ? { date: dateFilter } : undefined,
          select: {
            versesRead: true,
            date: true
          }
        }
      }
    });

    // 计算统计信息并排序
    const leaderboard = users.map(user => {
      const totalVerses = user.dailyStats.reduce((sum, record) => sum + record.versesRead, 0);
      const uniqueDates = new Set(user.dailyStats.map(r => r.date));
      const totalDays = uniqueDates.size;
      const averageVersesPerDay = totalDays > 0 ? Math.round(totalVerses / totalDays) : 0;

      return {
        userId: user.id,
        username: user.username,
        displayName: user.displayName,
        totalVerses,
        totalDays,
        averageVersesPerDay,
        role: memberRoles.get(user.id) || 'MEMBER',
        rank: 0 // 临时设置，稍后计算
      };
    }).sort((a, b) => {
      if (b.totalVerses !== a.totalVerses) return b.totalVerses - a.totalVerses;
      if (b.totalDays !== a.totalDays) return b.totalDays - a.totalDays;
      return b.averageVersesPerDay - a.averageVersesPerDay;
    });

    // 设置排名
    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return leaderboard;
  }

  // 更新群组信息
  static async updateGroup(groupId: string, userId: string, data: UpdateGroupRequest): Promise<Group> {
    // 检查用户权限
    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId
        }
      }
    });

    if (!membership || (membership.role !== 'OWNER' && membership.role !== 'ADMIN')) {
      throw new Error('没有权限修改群组信息');
    }

    const group = await prisma.group.update({
      where: { id: groupId },
      data,
      include: {
        owner: true,
        _count: {
          select: { members: true }
        }
      }
    });

    return {
      id: group.id,
      name: group.name,
      description: group.description,
      code: group.code,
      ownerId: group.ownerId,
      isPublic: group.isPublic,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
      owner: group.owner,
      memberCount: group._count.members
    };
  }

  // 更新成员角色
  static async updateMemberRole(groupId: string, operatorId: string, memberId: string, newRole: GroupRole): Promise<GroupMember> {
    // 检查操作者权限
    const operatorMembership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: operatorId
        }
      }
    });

    if (!operatorMembership || (operatorMembership.role !== 'OWNER' && operatorMembership.role !== 'ADMIN')) {
      throw new Error('没有权限修改成员角色');
    }

    // 群主才能设置管理员
    if (newRole === 'ADMIN' && operatorMembership.role !== 'OWNER') {
      throw new Error('只有群主可以设置管理员');
    }

    // 不能修改群主角色
    if (newRole === 'OWNER') {
      throw new Error('不能设置多个群主');
    }

    const member = await prisma.groupMember.update({
      where: {
        groupId_userId: {
          groupId,
          userId: memberId
        }
      },
      data: { role: newRole },
      include: {
        user: true,
        group: true
      }
    });

    return {
      id: member.id,
      groupId: member.groupId,
      userId: member.userId,
      role: member.role as GroupRole,
      joinedAt: member.joinedAt,
      user: member.user,
      group: member.group
    };
  }

  // 移除群组成员
  static async removeMember(groupId: string, operatorId: string, memberId: string): Promise<void> {
    // 检查操作者权限
    const operatorMembership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: operatorId
        }
      }
    });

    if (!operatorMembership || (operatorMembership.role !== 'OWNER' && operatorMembership.role !== 'ADMIN')) {
      throw new Error('没有权限移除成员');
    }

    // 检查被移除的成员
    const targetMember = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: memberId
        }
      }
    });

    if (!targetMember) {
      throw new Error('成员不存在');
    }

    // 不能移除群主
    if (targetMember.role === 'OWNER') {
      throw new Error('不能移除群主');
    }

    // 管理员不能移除其他管理员
    if (operatorMembership.role === 'ADMIN' && targetMember.role === 'ADMIN') {
      throw new Error('管理员不能移除其他管理员');
    }

    await prisma.groupMember.delete({
      where: {
        groupId_userId: {
          groupId,
          userId: memberId
        }
      }
    });
  }

  // 离开群组
  static async leaveGroup(groupId: string, userId: string): Promise<void> {
    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId
        }
      }
    });

    if (!membership) {
      throw new Error('您不是该群组的成员');
    }

    // 群主不能直接离开群组
    if (membership.role === 'OWNER') {
      throw new Error('群主不能离开群组，请先转让群主身份或删除群组');
    }

    await prisma.groupMember.delete({
      where: {
        groupId_userId: {
          groupId,
          userId
        }
      }
    });
  }

  // 删除群组
  static async deleteGroup(groupId: string, userId: string): Promise<void> {
    const group = await prisma.group.findUnique({
      where: { id: groupId }
    });

    if (!group) {
      throw new Error('群组不存在');
    }

    if (group.ownerId !== userId) {
      throw new Error('只有群主可以删除群组');
    }

    await prisma.group.delete({
      where: { id: groupId }
    });
  }

  // 获取日期过滤器
  private static getDateFilter(period: string) {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    switch (period) {
      case 'daily':
        return { gte: today };
      case 'weekly':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return { gte: weekAgo.toISOString().split('T')[0] };
      case 'monthly':
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        return { gte: monthAgo.toISOString().split('T')[0] };
      case 'all-time':
      default:
        return undefined;
    }
  }
}