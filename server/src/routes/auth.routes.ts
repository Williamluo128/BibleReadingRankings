import { Router } from 'express';
import { AuthController } from '@/controllers/auth.controller';
import { authenticateToken } from '@/middleware/auth.middleware';
import { validateRequest, updateProfileSchema } from '@/utils/validation';

const router = Router();

// GET /api/auth/me —— 获取当前登录用户
router.get('/me',
  authenticateToken,
  AuthController.me
);

// PATCH /api/auth/profile —— 更新 username / displayName / avatarUrl
router.patch('/profile',
  authenticateToken,
  validateRequest(updateProfileSchema),
  AuthController.updateProfile
);

export { router as authRoutes };
