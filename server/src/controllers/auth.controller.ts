import { Request, Response } from 'express';
import { AuthService } from '@/services/auth.service';
import type { ApiResponse } from '@bible-rankings/shared';

export class AuthController {
  // GET /api/auth/me —— 返回当前登录用户(中间件已 upsert 并注入 req.user)
  static async me(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: { user },
        message: 'User profile retrieved successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to get user profile'
      };

      res.status(500).json(response);
    }
  }

  // PATCH /api/auth/profile —— 更新 displayName / avatarUrl
  static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({
          success: false,
          error: '未登录，请先登录'
        });
        return;
      }

      const updated = await AuthService.updateProfile(user.id, req.body);

      const response: ApiResponse = {
        success: true,
        data: { user: updated },
        message: '资料更新成功'
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : '更新资料失败'
      };

      res.status(400).json(response);
    }
  }
}
