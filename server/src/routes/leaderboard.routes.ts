import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { LeaderboardController } from '../controllers/leaderboard.controller';

export const leaderboardRouter = Router();

// 获取全站排行榜
leaderboardRouter.get('/global', authenticateToken, LeaderboardController.getLeaderboard);

// 获取好友排行榜
leaderboardRouter.get('/friends', authenticateToken, LeaderboardController.getFriendsLeaderboard);

// 获取当前用户的排名信息
leaderboardRouter.get('/my-rank', authenticateToken, LeaderboardController.getUserRank);