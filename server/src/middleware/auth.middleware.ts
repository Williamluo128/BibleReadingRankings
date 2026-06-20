import { Request, Response, NextFunction } from 'express';
import { jwtVerify, createRemoteJWKSet } from 'jose';
import { AuthService, SupabaseUserInfo } from '@/services/auth.service';
import { env } from '@/config/env';
import type { User } from '@bible-rankings/shared';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

// Supabase 的 JWKS 端点,用于用公钥验签 access token
const JWKS = createRemoteJWKSet(new URL(`${env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`));

interface SupabaseJWTPayload {
  sub: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
    avatar_url?: string;
    picture?: string;
  };
}

/**
 * 验证 Supabase 签发的 access token,返回其中的用户身份信息。
 * 使用 Supabase 的 JWKS 公钥(而非 JWT secret)验签,更安全且支持密钥轮换。
 */
async function verifySupabaseToken(token: string): Promise<SupabaseUserInfo> {
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: `${env.SUPABASE_URL}/auth/v1`,
    algorithms: ['ES256', 'RS256'],
  });

  const data = payload as SupabaseJWTPayload;
  if (!data.sub) {
    throw new Error('Token missing sub');
  }

  return {
    sub: data.sub,
    email: data.email || '',
    name: data.user_metadata?.full_name || data.user_metadata?.name || null,
    avatarUrl: data.user_metadata?.avatar_url || data.user_metadata?.picture || null,
  };
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Access token is required'
      });
      return;
    }

    // 1) 用 Supabase 公钥验签
    const info = await verifySupabaseToken(token);

    // 2) 在本地 users 表 upsert,保持 req.user 的 shape 不变
    const user = await AuthService.upsertUserFromSupabase(info);
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    // 3) 注入 req.user(与改造前 shape 完全一致,40+ 处消费点零改动)
    req.user = user;
    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      error: 'Invalid token'
    });
  }
};

export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const info = await verifySupabaseToken(token);
      const user = await AuthService.upsertUserFromSupabase(info);
      if (user) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Ignore errors for optional auth
    next();
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
      return;
    }

    next();
  };
};
