import { Router } from 'express';
import { ReadingController } from '@/controllers/reading.controller';
import { authenticateToken } from '@/middleware/auth.middleware';

const router = Router();

// 所有路由都需要认证
router.use(authenticateToken);

// POST /api/reading/verse - 记录单个经文阅读
router.post('/verse', ReadingController.recordVerse);

// POST /api/reading/verses - 批量记录多个经文阅读
router.post('/verses', ReadingController.recordMultipleVerses);

// GET /api/reading/records - 获取阅读记录
router.get('/records', ReadingController.getReadingRecords);

// GET /api/reading/stats/daily - 获取每日统计
router.get('/stats/daily', ReadingController.getDailyStats);

// GET /api/reading/stats/total - 获取总体统计
router.get('/stats/total', ReadingController.getTotalStats);

// POST /api/reading/status - 检查经文阅读状态
router.post('/status', ReadingController.getReadStatus);

// GET /api/reading/trends - 获取阅读趋势数据
router.get('/trends', ReadingController.getReadingTrends);

// GET /api/reading/heatmap - 获取阅读热力图数据
router.get('/heatmap', ReadingController.getReadingHeatmap);

// GET /api/reading/analytics - 分析页统一数据（进度 + 每日统计）
router.get('/analytics', ReadingController.getAnalyticsDashboard);

// GET /api/reading/books/:bookId/chapters/progress - 书卷章节阅读进度
router.get('/books/:bookId/chapters/progress', ReadingController.getBookChapterProgress);

// DELETE /api/reading/books/:bookId/progress - 重置书卷阅读记录
router.delete('/books/:bookId/progress', ReadingController.resetBookProgress);

// GET /api/reading/progress - 获取阅读进度统计
router.get('/progress', ReadingController.getProgressStats);

export { router as readingRoutes };