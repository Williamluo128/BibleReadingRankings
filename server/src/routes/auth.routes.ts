import { Router } from 'express';
import { AuthController } from '@/controllers/auth.controller';
import { authenticateToken } from '@/middleware/auth.middleware';
import { validateRequest, registerSchema, loginSchema } from '@/utils/validation';

const router = Router();

// POST /api/auth/register
router.post('/register', 
  validateRequest(registerSchema),
  AuthController.register
);

// POST /api/auth/login
router.post('/login',
  validateRequest(loginSchema),
  AuthController.login
);

// GET /api/auth/me
router.get('/me', 
  authenticateToken,
  AuthController.me
);

// POST /api/auth/logout
router.post('/logout',
  authenticateToken,
  AuthController.logout
);

// POST /api/auth/forgot-password
router.post('/forgot-password',
  AuthController.forgotPassword
);

// POST /api/auth/reset-password
router.post('/reset-password',
  AuthController.resetPassword
);

// GET /api/auth/validate-reset-token/:token
router.get('/validate-reset-token/:token',
  AuthController.validateResetToken
);

// POST /api/auth/change-password
router.post('/change-password',
  authenticateToken,
  AuthController.changePassword
);

export { router as authRoutes };