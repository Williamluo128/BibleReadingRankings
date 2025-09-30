import { Router } from 'express';
import { AdminController } from '@/controllers/admin.controller';
import { authenticateToken } from '@/middleware/auth.middleware';
import { requireAdmin, requireSuperAdmin } from '@/middleware/admin.middleware';

const router = Router();

// 所有管理员路由都需要身份验证
router.use(authenticateToken);

// =============================================================================
// 系统统计 - 需要管理员权限
// =============================================================================

// GET /api/admin/stats - 获取系统统计信息
router.get('/stats', requireAdmin, AdminController.getSystemStats);

// =============================================================================
// 用户管理 - 需要管理员权限
// =============================================================================

// GET /api/admin/users - 获取用户列表
router.get('/users', requireAdmin, AdminController.getUsers);

// GET /api/admin/users/:userId - 获取用户详细信息
router.get('/users/:userId', requireAdmin, AdminController.getUserDetails);

// PUT /api/admin/users/:userId - 更新用户信息
router.put('/users/:userId', requireAdmin, AdminController.updateUser);

// POST /api/admin/users/:userId/reset-password - 重置用户密码
router.post('/users/:userId/reset-password', requireAdmin, AdminController.resetUserPassword);

// DELETE /api/admin/users/:userId - 删除用户（需要超级管理员权限）
router.delete('/users/:userId', requireSuperAdmin, AdminController.deleteUser);

export { router as adminRoutes };