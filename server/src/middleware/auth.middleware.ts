import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { createClient } from '@supabase/supabase-js';
import { AuthService, SupabaseUserInfo } from '@/services/auth.service';
import { env } from '@/config/env';
import type { User } from '@bible-rankings/shared';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const jwks = jwksClient({
  jwksUri: `${env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`,
  cache: true,
  rateLimit: true,
});

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
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      env.SUPABASE_JWT_SECRET,
      {
        issuer: `${env.SUPABASE_URL}/auth/v1`,
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
  let payload: SupabaseJWTPayload;

  try {
    payload = await verifyWithJwks(token);
  } catch {
    payload = await verifyWithSecret(token);
  }

  const info = extractUserInfo(payload);

  if (!info.email) {
    const { data, error } = await supabaseAdmin.auth.admin.getUserById(info.sub);
    if (!error && data.user?.email) {
      info.email = data.user.email;
      info.name = info.name || data.user.user_metadata?.full_name || data.user.user_metadata?.name || null;
      info.avatarUrl = info.avatarUrl || data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture || null;
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
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Access token is required',
      });
      return;
    }

    const info = await verifySupabaseToken(token);

    let user: User;
    try {
      user = await AuthService.upsertUserFromSupabase(info);
    } catch (dbError) {
      console.error('[auth] 用户同步失败:', dbError);
      res.status(500).json({
        success: false,
        error: 'Failed to sync user profile',
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
