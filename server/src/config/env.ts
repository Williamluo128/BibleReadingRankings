import dotenv from 'dotenv';

dotenv.config();

function buildCorsOrigins(): string[] {
  const origins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map(s => s.trim().replace(/^"|"$/g, ''))
    .filter(Boolean);

  // Vercel 自动注入的部署域名
  for (const key of ['VERCEL_URL', 'VERCEL_BRANCH_URL'] as const) {
    const host = process.env[key];
    if (host) {
      origins.push(`https://${host}`);
    }
  }

  return [...new Set(origins)];
}

export const env = {
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL!,
  // Supabase:后端用 service_role key 调 Supabase API、用 JWT secret 验证 access token
  SUPABASE_URL: process.env.SUPABASE_URL!,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  SUPABASE_JWT_SECRET: process.env.SUPABASE_JWT_SECRET!,
  CORS_ORIGIN: buildCorsOrigins(),
  // 首次用 Google 登录时,邮箱命中此列表的用户自动赋予 SUPER_ADMIN 角色
  ADMIN_EMAILS: (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean),
};

const requiredEnvVars = ['DATABASE_URL', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_JWT_SECRET'];

// 延迟校验,避免模块加载阶段直接崩溃导致 Vercel 只返回 FUNCTION_INVOCATION_FAILED
let envValidated = false;

export function ensureEnv(): void {
  if (envValidated) {
    return;
  }

  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  }

  envValidated = true;
}
