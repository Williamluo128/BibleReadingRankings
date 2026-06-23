import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { env, ensureEnv } from '@/config/env';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { authRoutes } from './auth.routes';
import { bibleRoutes } from './bible.routes';
import { readingRoutes } from './reading.routes';
import { friendshipRoutes } from './friendship.routes';
import { leaderboardRouter } from './leaderboard.routes';
import { groupRoutes } from './group.routes';
import adminRoutes from './admin';

const router = Router();

async function probeAuthConfig(): Promise<{
  supabaseHost: string;
  jwtSecretOk: boolean;
  serviceRoleOk: boolean;
}> {
  ensureEnv();
  const supabaseHost = new URL(env.SUPABASE_URL).host;
  let jwtSecretOk = false;
  let serviceRoleOk = false;

  try {
    const probeToken = jwt.sign(
      { sub: '00000000-0000-4000-8000-000000000099', aud: 'authenticated' },
      env.SUPABASE_JWT_SECRET,
      { issuer: `${env.SUPABASE_URL}/auth/v1`, expiresIn: '1m' },
    );
    jwt.verify(probeToken, env.SUPABASE_JWT_SECRET, {
      issuer: `${env.SUPABASE_URL}/auth/v1`,
      audience: 'authenticated',
    });
    jwtSecretOk = true;
  } catch {
    jwtSecretOk = false;
  }

  try {
    const probeJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJwcm9iZSJ9.invalid';
    const { error } = await getSupabaseAdmin().auth.getUser(probeJwt);
    serviceRoleOk = !!error && !/invalid api key/i.test(error.message);
  } catch {
    serviceRoleOk = false;
  }

  return { supabaseHost, jwtSecretOk, serviceRoleOk };
}

// GET /api —— API 根路径(健康检查入口)
router.get('/', async (_req, res) => {
  try {
    const auth = await probeAuthConfig();
    res.json({
      success: true,
      message: 'Bible Reading Rankings API',
      health: '/api/health',
      timestamp: new Date().toISOString(),
      auth,
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: error instanceof Error ? error.message : 'API unavailable',
      timestamp: new Date().toISOString(),
    });
  }
});

// API Routes
router.use('/auth', authRoutes);
router.use('/bible', bibleRoutes);
router.use('/reading', readingRoutes);
router.use('/friends', friendshipRoutes);
router.use('/leaderboard', leaderboardRouter);
router.use('/groups', groupRoutes);
router.use('/admin', adminRoutes);

// Health check
router.get('/health', async (_req, res) => {
  try {
    const auth = await probeAuthConfig();
    res.json({
      success: true,
      message: 'API is running',
      timestamp: new Date().toISOString(),
      auth,
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: error instanceof Error ? error.message : 'Health check failed',
      timestamp: new Date().toISOString(),
    });
  }
});

export { router as apiRoutes };