import { Request, Response } from 'express';
import { ReadingService } from '@/services/reading.service';
import type { ApiResponse } from '@bible-rankings/shared';

export class ReadingController {
  // 记录单个经文阅读
  static async recordVerse(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { verseId } = req.body;

      if (!verseId) {
        const response: ApiResponse = {
          success: false,
          error: 'Verse ID is required'
        };
        res.status(400).json(response);
        return;
      }

      const record = await ReadingService.recordVerseRead(userId, verseId);

      const response: ApiResponse = {
        success: true,
        data: { record },
        message: 'Verse reading recorded successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to record verse reading'
      };

      res.status(500).json(response);
    }
  }

  // 批量记录多个经文阅读
  static async recordMultipleVerses(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { verseIds } = req.body;

      if (!verseIds || !Array.isArray(verseIds) || verseIds.length === 0) {
        const response: ApiResponse = {
          success: false,
          error: 'Verse IDs array is required'
        };
        res.status(400).json(response);
        return;
      }

      const result = await ReadingService.recordMultipleVerses(userId, verseIds);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: `${result.count} verses recorded successfully`
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to record verses'
      };

      res.status(500).json(response);
    }
  }

  // 获取用户阅读记录
  static async getReadingRecords(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { date } = req.query;

      const records = await ReadingService.getUserReadingRecords(
        userId,
        date as string
      );

      const response: ApiResponse = {
        success: true,
        data: { records },
        message: 'Reading records retrieved successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to retrieve reading records'
      };

      res.status(500).json(response);
    }
  }

  // 获取用户每日统计
  static async getDailyStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const days = req.query.days ? parseInt(req.query.days as string) : 30;

      const stats = await ReadingService.getUserDailyStats(userId, days);

      const response: ApiResponse = {
        success: true,
        data: { stats },
        message: 'Daily stats retrieved successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to retrieve daily stats'
      };

      res.status(500).json(response);
    }
  }

  // 获取用户总体统计
  static async getTotalStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const stats = await ReadingService.getUserTotalStats(userId);

      const response: ApiResponse = {
        success: true,
        data: stats,
        message: 'Total stats retrieved successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to retrieve total stats'
      };

      res.status(500).json(response);
    }
  }

  // 检查经文阅读状态
  static async getReadStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { verseIds } = req.body;

      if (!verseIds || !Array.isArray(verseIds)) {
        const response: ApiResponse = {
          success: false,
          error: 'Verse IDs array is required'
        };
        res.status(400).json(response);
        return;
      }

      const readVerseIds = await ReadingService.getUserReadVerses(userId, verseIds);

      const response: ApiResponse = {
        success: true,
        data: { readVerseIds },
        message: 'Read status retrieved successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to check read status'
      };

      res.status(500).json(response);
    }
  }

  // 获取阅读趋势数据（用于折线图）
  static async getReadingTrends(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const days = req.query.days ? parseInt(req.query.days as string) : 30;

      const trends = await ReadingService.getReadingTrends(userId, days);

      const response: ApiResponse = {
        success: true,
        data: { trends },
        message: 'Reading trends retrieved successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to retrieve reading trends'
      };

      res.status(500).json(response);
    }
  }

  // 获取阅读热力图数据
  static async getReadingHeatmap(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();

      const heatmap = await ReadingService.getReadingHeatmap(userId, year);

      const response: ApiResponse = {
        success: true,
        data: { heatmap },
        message: 'Reading heatmap retrieved successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to retrieve reading heatmap'
      };

      res.status(500).json(response);
    }
  }

  // 获取阅读进度统计（旧约/新约比例等）
  static async getAnalyticsDashboard(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const dashboard = await ReadingService.getAnalyticsDashboard(userId);

      const response: ApiResponse = {
        success: true,
        data: dashboard,
        message: 'Analytics dashboard retrieved successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to retrieve analytics dashboard',
      };

      res.status(500).json(response);
    }
  }

  // 获取阅读进度统计（旧约/新约比例等）
  static async getProgressStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      const progress = await ReadingService.getProgressStats(userId);

      const response: ApiResponse = {
        success: true,
        data: progress,
        message: 'Progress stats retrieved successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to retrieve progress stats'
      };

      res.status(500).json(response);
    }
  }
}