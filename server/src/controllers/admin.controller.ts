import { Request, Response } from 'express';
import { AdminService, UserListQuery, UpdateUserRequest } from '@/services/admin.service';
import { AuthenticatedRequest } from '@/middleware/admin.middleware';
import { z } from 'zod';

// 验证schemas
const getUsersQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 20),
  search: z.string().optional(),
  role: z.enum(['USER', 'ADMIN', 'SUPER_ADMIN']).optional(),
  orderBy: z.enum(['createdAt', 'updatedAt', 'username', 'email']).optional(),
  orderDirection: z.enum(['asc', 'desc']).optional()
});

const updateUserSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  email: z.string().email().optional(),
  displayName: z.string().min(1).max(50).optional(),
  role: z.enum(['USER', 'ADMIN', 'SUPER_ADMIN']).optional()
});

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6).max(100)
});

export class AdminController {
  /**
   * 获取用户列表
   * GET /api/admin/users
   */
  static async getUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const validatedQuery = getUsersQuerySchema.parse(req.query);
      const result = await AdminService.getUsers(validatedQuery as UserListQuery);

      res.json({
        success: true,
        data: result,
        message: `找到 ${result.total} 个用户`
      });
    } catch (error: any) {
      console.error('获取用户列表错误:', error);
      
      if (error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          error: '参数验证失败',
          details: error.errors
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: '获取用户列表失败'
      });
    }
  }

  /**
   * 获取用户详细信息
   * GET /api/admin/users/:userId
   */
  static async getUserDetails(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      if (!userId) {
        res.status(400).json({
          success: false,
          error: '用户ID不能为空'
        });
        return;
      }

      const user = await AdminService.getUserDetails(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          error: '用户不存在'
        });
        return;
      }

      res.json({
        success: true,
        data: { user },
        message: '用户详细信息获取成功'
      });
    } catch (error: any) {
      console.error('获取用户详情错误:', error);
      res.status(500).json({
        success: false,
        error: '获取用户详情失败'
      });
    }
  }

  /**
   * 更新用户信息
   * PUT /api/admin/users/:userId
   */
  static async updateUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const validatedData = updateUserSchema.parse(req.body);

      if (!userId) {
        res.status(400).json({
          success: false,
          error: '用户ID不能为空'
        });
        return;
      }

      // 检查是否试图修改自己的角色
      if (validatedData.role && req.user?.id === userId) {
        res.status(400).json({
          success: false,
          error: '不能修改自己的角色'
        });
        return;
      }

      // 只有超级管理员可以设置超级管理员角色
      if (validatedData.role === 'SUPER_ADMIN' && req.user?.role !== 'SUPER_ADMIN') {
        res.status(403).json({
          success: false,
          error: '只有超级管理员可以设置超级管理员角色'
        });
        return;
      }

      const updatedUser = await AdminService.updateUser(userId, validatedData as UpdateUserRequest);

      res.json({
        success: true,
        data: { user: updatedUser },
        message: '用户信息更新成功'
      });
    } catch (error: any) {
      console.error('更新用户信息错误:', error);
      
      if (error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          error: '参数验证失败',
          details: error.errors
        });
        return;
      }

      if (error.code === 'P2002') {
        res.status(400).json({
          success: false,
          error: '用户名或邮箱已存在'
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: '更新用户信息失败'
      });
    }
  }

  /**
   * 重置用户密码
   * POST /api/admin/users/:userId/reset-password
   */
  static async resetUserPassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const validatedData = resetPasswordSchema.parse(req.body);

      if (!userId) {
        res.status(400).json({
          success: false,
          error: '用户ID不能为空'
        });
        return;
      }

      // 检查是否试图重置自己的密码（应该通过正常流程）
      if (req.user?.id === userId) {
        res.status(400).json({
          success: false,
          error: '请通过正常流程修改自己的密码'
        });
        return;
      }

      await AdminService.resetUserPassword(userId, validatedData.newPassword);

      res.json({
        success: true,
        message: '用户密码重置成功'
      });
    } catch (error: any) {
      console.error('重置用户密码错误:', error);
      
      if (error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          error: '参数验证失败',
          details: error.errors
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: '重置用户密码失败'
      });
    }
  }

  /**
   * 获取系统统计信息
   * GET /api/admin/stats
   */
  static async getSystemStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const stats = await AdminService.getSystemStats();

      res.json({
        success: true,
        data: stats,
        message: '系统统计信息获取成功'
      });
    } catch (error: any) {
      console.error('获取系统统计错误:', error);
      res.status(500).json({
        success: false,
        error: '获取系统统计失败'
      });
    }
  }

  /**
   * 删除用户（暂时禁用）
   * DELETE /api/admin/users/:userId
   */
  static async deleteUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      if (!userId) {
        res.status(400).json({
          success: false,
          error: '用户ID不能为空'
        });
        return;
      }

      // 检查是否试图删除自己
      if (req.user?.id === userId) {
        res.status(400).json({
          success: false,
          error: '不能删除自己的账户'
        });
        return;
      }

      // 暂时禁用删除功能
      res.status(501).json({
        success: false,
        error: '删除用户功能暂未实现，请使用角色管理功能'
      });
    } catch (error: any) {
      console.error('删除用户错误:', error);
      res.status(500).json({
        success: false,
        error: '删除用户失败'
      });
    }
  }
}