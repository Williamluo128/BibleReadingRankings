import { Request, Response, NextFunction } from 'express';
import { prisma } from '@/config/database';
import { UserRole, User } from '@bible-rankings/shared';

// 扩展Request接口以包含用户信息
export interface AuthenticatedRequest extends Request {
  user?: User;
}

/**
 * 检查用户是否具有管理员权限（ADMIN 或 SUPER_ADMIN）
 */
export const requireAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: '未登录，请先登录'
      });
      return;
    }

    // 检查是否具有管理员权限
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      res.status(403).json({
        success: false,
        error: '权限不足，需要管理员权限'
      });
      return;
    }

    next();
  } catch (error) {
    console.error('管理员权限验证错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器内部错误'
    });
  }
};

/**
 * 检查用户是否具有超级管理员权限
 */
export const requireSuperAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: '未登录，请先登录'
      });
      return;
    }

    // 检查是否具有超级管理员权限
    if (req.user.role !== 'SUPER_ADMIN') {
      res.status(403).json({
        success: false,
        error: '权限不足，需要超级管理员权限'
      });
      return;
    }

    next();
  } catch (error) {
    console.error('超级管理员权限验证错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器内部错误'
    });
  }
};