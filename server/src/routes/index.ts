import { Router } from 'express';
import { authRoutes } from './auth.routes';
import { bibleRoutes } from './bible.routes';
import { readingRoutes } from './reading.routes';
import { friendshipRoutes } from './friendship.routes';
import { leaderboardRouter } from './leaderboard.routes';
import { groupRoutes } from './group.routes';
import adminRoutes from './admin';

const router = Router();

// API Routes
router.use('/auth', authRoutes);
router.use('/bible', bibleRoutes);
router.use('/reading', readingRoutes);
router.use('/friends', friendshipRoutes);
router.use('/leaderboard', leaderboardRouter);
router.use('/groups', groupRoutes);
router.use('/admin', adminRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

export { router as apiRoutes };