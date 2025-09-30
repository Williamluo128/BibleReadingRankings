import { Request, Response } from 'express';
import { FriendshipService } from '@/services/friendship.service';
import type { ApiResponse } from '@bible-rankings/shared';

export class FriendshipController {
  // 搜索用户
  static async searchUsers(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { q: searchQuery } = req.query;

      if (!searchQuery || typeof searchQuery !== 'string' || searchQuery.trim().length < 2) {
        const response: ApiResponse = {
          success: false,
          error: '搜索关键字至少需要2个字符'
        };
        res.status(400).json(response);
        return;
      }

      const users = await FriendshipService.searchUsers(userId, searchQuery.trim());

      const response: ApiResponse = {
        success: true,
        data: { users },
        message: `找到 ${users.length} 个用户`
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : '搜索用户失败'
      };

      res.status(500).json(response);
    }
  }

  // 发送好友请求
  static async sendFriendRequest(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { targetUserId } = req.body;

      if (!targetUserId) {
        const response: ApiResponse = {
          success: false,
          error: '目标用户ID是必需的'
        };
        res.status(400).json(response);
        return;
      }

      if (targetUserId === userId) {
        const response: ApiResponse = {
          success: false,
          error: '不能添加自己为好友'
        };
        res.status(400).json(response);
        return;
      }

      const friendship = await FriendshipService.sendFriendRequest(userId, targetUserId);

      const response: ApiResponse = {
        success: true,
        data: { friendship },
        message: '好友请求发送成功'
      };

      res.status(201).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : '发送好友请求失败'
      };

      res.status(400).json(response);
    }
  }

  // 获取收到的好友请求
  static async getReceivedRequests(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const requests = await FriendshipService.getReceivedRequests(userId);

      const response: ApiResponse = {
        success: true,
        data: { requests },
        message: `有 ${requests.length} 个待处理的好友请求`
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: '获取好友请求失败'
      };

      res.status(500).json(response);
    }
  }

  // 获取发送的好友请求
  static async getSentRequests(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const requests = await FriendshipService.getSentRequests(userId);

      const response: ApiResponse = {
        success: true,
        data: { requests },
        message: `已发送 ${requests.length} 个好友请求`
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: '获取已发送请求失败'
      };

      res.status(500).json(response);
    }
  }

  // 响应好友请求
  static async respondToRequest(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { requestId } = req.params;
      const { action } = req.body;

      if (!action || !['accept', 'reject'].includes(action)) {
        const response: ApiResponse = {
          success: false,
          error: 'action 必须是 "accept" 或 "reject"'
        };
        res.status(400).json(response);
        return;
      }

      const friendship = await FriendshipService.respondToRequest(requestId, userId, action);

      const response: ApiResponse = {
        success: true,
        data: { friendship },
        message: action === 'accept' ? '已接受好友请求' : '已拒绝好友请求'
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : '处理好友请求失败'
      };

      res.status(400).json(response);
    }
  }

  // 获取好友列表
  static async getFriends(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const friends = await FriendshipService.getFriends(userId);

      const response: ApiResponse = {
        success: true,
        data: { friends },
        message: `你有 ${friends.length} 个好友`
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: '获取好友列表失败'
      };

      res.status(500).json(response);
    }
  }

  // 删除好友
  static async removeFriend(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { friendId } = req.params;

      await FriendshipService.removeFriend(userId, friendId);

      const response: ApiResponse = {
        success: true,
        message: '已删除好友'
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : '删除好友失败'
      };

      res.status(400).json(response);
    }
  }

  // 检查好友状态
  static async getFriendshipStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { targetUserId } = req.params;

      const areFriends = await FriendshipService.areFriends(userId, targetUserId);

      const response: ApiResponse = {
        success: true,
        data: { 
          areFriends,
          status: areFriends ? 'friends' : 'not_friends'
        },
        message: areFriends ? '已是好友' : '不是好友'
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: '检查好友状态失败'
      };

      res.status(500).json(response);
    }
  }
}