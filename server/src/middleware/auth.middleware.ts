import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
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

// jose 是纯 ESM 包;在 Vercel CommonJS 环境必须用 dynamic import,不能用 require()
type JoseModule = typeof import('jose');
type RemoteJWKSet = ReturnType<JoseModule['createRemoteJWKSet']>;

let joseModule: JoseModule | null = null;
let jwks: RemoteJWKSet | null = null;

async function getJose(): Promise<JoseModule> {
  if (!joseModule) {
    // 避免 tsc 把 import() 编译成 require();Vercel CommonJS 需要真正的 dynamic import
    const dynamicImport = new Function(
      'specifier',
      'return import(specifier)',
    ) as (specifier: string) => Promise<JoseModule>;
    joseModule = await dynamicImport('jose');
  }
  return joseModule;
}

async function getJWKS(): Promise<RemoteJWKSet> {
  if (!jwks) {
    const { createRemoteJWKSet } = await getJose();
    jwks = createRemoteJWKSet(new URL(`${env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`));
  }
  return jwks;
}

const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
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

/**
 * 验证 Supabase 签发的 access token,返回其中的用户身份信息。
 * 优先 JWKS(ES256/RS256),失败时回退到 JWT secret(HS256)。
 */
async function verifySupabaseToken(token: string): Promise<SupabaseUserInfo> {
  const { jwtVerify } = await getJose();
  let payload: SupabaseJWTPayload;

  try {
    ({ payload } = await jwtVerify(token, await getJWKS(), {
      issuer: `${env.SUPABASE_URL}/auth/v1`,
      algorithms: ['RS256', 'ES256'],
    }));
  } catch {
    const secret = new TextEncoder().encode(env.SUPABASE_JWT_SECRET);
    ({ payload } = await jwtVerify(token, secret, {
      issuer: `${env.SUPABASE_URL}/auth/v1`,
      algorithms: ['HS256'],
    }));
  }

  const info = extractUserInfo(payload as SupabaseJWTPayload);

  // JWT 里可能没有 email,从 Supabase Admin API 补全
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
    console.error('[auth] token 验证失败:', error instanceof Error ? `${error.name}: ${error.message}` : error);
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
