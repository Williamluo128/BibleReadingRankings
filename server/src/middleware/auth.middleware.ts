import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { AuthService, SupabaseUserInfo } from '@/services/auth.service';
import { env, ensureEnv } from '@/config/env';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import type { User } from '@bible-rankings/shared';

function extractBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader) {
    return null;
  }

  let token = authHeader.trim();
  if (!/^bearer\s+/i.test(token)) {
    return null;
  }

  token = token.replace(/^bearer\s+/i, '').trim();
  while (/^bearer\s+/i.test(token)) {
    token = token.replace(/^bearer\s+/i, '').trim();
  }

  return token || null;
}

function isJwtFormat(token: string): boolean {
  const parts = token.split('.');
  return parts.length === 3 && parts.every((part) => part.length > 0);
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

function getJwks() {
  ensureEnv();
  return jwksClient({
    jwksUri: `${env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`,
    cache: true,
    rateLimit: true,
  });
}

interface SupabaseJWTPayload {
  sub: string;
  email?: string;
  user_metadata?: {
    email?: string;
    full_name?: string;
    name?: string;
    avatar_url?: string;
    picture?: string;
  };
}

function extractUserInfo(data: SupabaseJWTPayload): SupabaseUserInfo {
  if (!data.sub) {
    throw new Error('Token missing sub');
  }

  return {
    sub: data.sub,
    email: data.email || data.user_metadata?.email || '',
    name: data.user_metadata?.full_name || data.user_metadata?.name || null,
    avatarUrl: data.user_metadata?.avatar_url || data.user_metadata?.picture || null,
  };
}

function verifyWithSecret(token: string): Promise<SupabaseJWTPayload> {
  ensureEnv();
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      env.SUPABASE_JWT_SECRET,
      {
        issuer: `${env.SUPABASE_URL}/auth/v1`,
        audience: 'authenticated',
        algorithms: ['HS256'],
      },
      (error, decoded) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(decoded as SupabaseJWTPayload);
      },
    );
  });
}

function verifyWithJwks(token: string): Promise<SupabaseJWTPayload> {
  ensureEnv();
  const jwks = getJwks();
  return new Promise((resolve, reject) => {
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded || typeof decoded === 'string' || !decoded.header.kid) {
      reject(new Error('Invalid token header'));
      return;
    }

    jwks.getSigningKey(decoded.header.kid, (error, key) => {
      if (error || !key) {
        reject(error ?? new Error('Signing key not found'));
        return;
      }

      jwt.verify(
        token,
        key.getPublicKey(),
        {
          issuer: `${env.SUPABASE_URL}/auth/v1`,
          audience: 'authenticated',
          algorithms: ['RS256', 'ES256'],
        },
        (verifyError, payload) => {
          if (verifyError) {
            reject(verifyError);
            return;
          }
          resolve(payload as SupabaseJWTPayload);
        },
      );
    });
  });
}

async function verifySupabaseToken(token: string): Promise<SupabaseUserInfo> {
  // 优先用 Supabase Admin API 验签(最可靠,兼容密钥轮换与 ES256/HS256)
  const { data, error } = await getSupabaseAdmin().auth.getUser(token);
  if (!error && data.user) {
    const user = data.user;
    return {
      sub: user.id,
      email: user.email || '',
      name: user.user_metadata?.full_name || user.user_metadata?.name || null,
      avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
    };
  }

  if (error) {
    console.warn('[auth] Supabase getUser failed, fallback to local JWT verify:', error.message);
  }

  let payload: SupabaseJWTPayload;

  try {
    payload = await verifyWithJwks(token);
  } catch {
    payload = await verifyWithSecret(token);
  }

  const info = extractUserInfo(payload);

  if (!info.email) {
    const { data: userData, error: userError } = await getSupabaseAdmin().auth.admin.getUserById(info.sub);
    if (!userError && userData.user?.email) {
      info.email = userData.user.email;
      info.name = info.name || userData.user.user_metadata?.full_name || userData.user.user_metadata?.name || null;
      info.avatarUrl = info.avatarUrl || userData.user.user_metadata?.avatar_url || userData.user.user_metadata?.picture || null;
    }
  }

  if (!info.email) {
    throw new Error('Token missing email');
  }

  return info;
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractBearerToken(authHeader);

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Access token is required',
        code: 'ACCESS_TOKEN_REQUIRED',
      });
      return;
    }

    if (!isJwtFormat(token)) {
      console.warn('[auth] malformed token', {
        segments: token.split('.').length,
        length: token.length,
        prefix: token.slice(0, 6),
      });
      res.status(401).json({
        success: false,
        error: 'Access token is malformed',
        code: 'MALFORMED_TOKEN',
      });
      return;
    }

    const info = await verifySupabaseToken(token);

    let user: User;
    try {
      user = await AuthService.upsertUserFromSupabase(info);
    } catch (dbError) {
      const prismaCode = (dbError as { code?: string })?.code;
      console.error('[auth] 用户同步失败:', prismaCode ?? dbError);
      res.status(500).json({
        success: false,
        error: 'Failed to sync user profile',
        code: 'USER_SYNC_FAILED',
        detail: prismaCode,
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('[auth] token 验证失败:', error instanceof Error ? `${error.name}: ${error.message}` : error);
    res.status(403).json({
      success: false,
      error: 'Invalid token',
      code: 'INVALID_TOKEN',
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
    const token = extractBearerToken(authHeader);

    if (token && isJwtFormat(token)) {
      const info = await verifySupabaseToken(token);
      const user = await AuthService.upsertUserFromSupabase(info);
      if (user) {
        req.user = user;
      }
    }

    next();
  } catch {
    next();
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
      });
      return;
    }

    next();
  };
};
