import { Request, Response } from 'express';
import { LeaderboardService } from '../services/leaderboard.service';
import { ValidatedRequest } from '../types/auth';

export class LeaderboardController {
  static async getLeaderboard(req: ValidatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const period = req.query.period as string || 'weekly'; // daily, weekly, monthly, all-time
      const limit = parseInt(req.query.limit as string) || 50;

      if (!['daily', 'weekly', 'monthly', 'all-time'].includes(period)) {
        res.status(400).json({
          success: false,
          message: '无效的时间段。支持的值: daily, weekly, monthly, all-time'
        });
        return;
      }

      const leaderboard = await LeaderboardService.getLeaderboard(userId, period, limit);

      res.json({
        success: true,
        data: {
          leaderboard,
          period,
          totalUsers: leaderboard.length
        }
      });
    } catch (error) {
      console.error('获取排行榜失败:', error);
      res.status(500).json({
        success: false,
        message: '获取排行榜失败'
      });
    }
  }

  static async getFriendsLeaderboard(req: ValidatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const period = req.query.period as string || 'weekly';

      if (!['daily', 'weekly', 'monthly', 'all-time'].includes(period)) {
        res.status(400).json({
          success: false,
          message: '无效的时间段。支持的值: daily, weekly, monthly, all-time'
        });
        return;
      }

      const friendsLeaderboard = await LeaderboardService.getFriendsLeaderboard(userId, period);

      res.json({
        success: true,
        data: {
          leaderboard: friendsLeaderboard,
          period,
          totalFriends: friendsLeaderboard.length
        }
      });
    } catch (error) {
      console.error('获取好友排行榜失败:', error);
      res.status(500).json({
        success: false,
        message: '获取好友排行榜失败'
      });
    }
  }

  static async getUserRank(req: ValidatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const period = req.query.period as string || 'weekly';

      if (!['daily', 'weekly', 'monthly', 'all-time'].includes(period)) {
        res.status(400).json({
          success: false,
          message: '无效的时间段。支持的值: daily, weekly, monthly, all-time'
        });
        return;
      }

      const userRank = await LeaderboardService.getUserRank(userId, period);

      res.json({
        success: true,
        data: userRank
      });
    } catch (error) {
      console.error('获取用户排名失败:', error);
      res.status(500).json({
        success: false,
        message: '获取用户排名失败'
      });
    }
  }
}