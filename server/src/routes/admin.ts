import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import { prisma } from '../config/database';
import { z } from 'zod';

const router = Router();

// 系统统计数据
router.get('/stats', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const [
      totalUsers,
      totalGroups,
      totalReadingSessions
    ] = await Promise.all([
      prisma.user.count(),
      prisma.group.count(),
      prisma.readingRecord.count()
    ]);

    res.json({
      totalUsers,
      activeUsers: totalUsers, // 暂时设为总用户数，因为没有isActive字段
      totalGroups,
      totalReadingSessions,
      totalReadingTime: 0 // 暂时返回0，后续可以计算总阅读时间
    });
  } catch (error) {
    console.error('获取系统统计失败:', error);
    res.status(500).json({ error: '获取系统统计失败' });
  }
});

// 获取所有用户列表
router.get('/users', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        role: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // 添加isActive和lastLoginAt字段（模拟数据）
    const usersWithExtraFields = users.map(user => ({
      ...user,
      isActive: true, // 暂时设为true，因为数据库没有这个字段
      lastLoginAt: user.updatedAt // 使用updatedAt作为lastLoginAt的替代
    }));

    res.json(usersWithExtraFields);
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({ error: '获取用户列表失败' });
  }
});

// 修改用户角色（仅超级管理员）
const updateUserRoleSchema = z.object({
  role: z.enum(['USER', 'ADMIN', 'SUPER_ADMIN'])
});

router.put('/users/:userId/role', authenticateToken, requireRole(['SUPER_ADMIN']), async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = updateUserRoleSchema.parse(req.body);

    // 不能修改自己的角色
    if (userId === req.user!.id) {
      return res.status(400).json({ error: '不能修改自己的角色' });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        username: true,
        displayName: true,
        role: true
      }
    });

    res.json(user);
  } catch (error) {
    console.error('修改用户角色失败:', error);
    res.status(500).json({ error: '修改用户角色失败' });
  }
});

// 修改用户状态（仅超级管理员）
const updateUserStatusSchema = z.object({
  isActive: z.boolean()
});

router.put('/users/:userId/status', authenticateToken, requireRole(['SUPER_ADMIN']), async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = updateUserStatusSchema.parse(req.body);

    // 不能修改自己的状态
    if (userId === req.user!.id) {
      return res.status(400).json({ error: '不能修改自己的状态' });
    }

    // 由于数据库没有isActive字段，暂时只返回用户信息
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        displayName: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 模拟isActive字段
    const userWithStatus = {
      ...user,
      isActive
    };

    res.json(userWithStatus);
  } catch (error) {
    console.error('修改用户状态失败:', error);
    res.status(500).json({ error: '修改用户状态失败' });
  }
});

// 获取所有群组列表
router.get('/groups', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const groups = await prisma.group.findMany({
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            displayName: true
          }
        },
        _count: {
          select: {
            members: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const groupsWithMemberCount = groups.map(group => ({
      ...group,
      memberCount: group._count.members
    }));

    res.json(groupsWithMemberCount);
  } catch (error) {
    console.error('获取群组列表失败:', error);
    res.status(500).json({ error: '获取群组列表失败' });
  }
});

// 删除群组（仅超级管理员）
router.delete('/groups/:groupId', authenticateToken, requireRole(['SUPER_ADMIN']), async (req, res) => {
  try {
    const { groupId } = req.params;

    // 先删除群组成员关系
    await prisma.groupMember.deleteMany({
      where: { groupId }
    });

    // 再删除群组
    await prisma.group.delete({
      where: { id: groupId }
    });

    res.json({ message: '群组删除成功' });
  } catch (error) {
    console.error('删除群组失败:', error);
    res.status(500).json({ error: '删除群组失败' });
  }
});

export default router;