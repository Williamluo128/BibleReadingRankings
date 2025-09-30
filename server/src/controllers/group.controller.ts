import { Request, Response } from 'express';
import { GroupService } from '@/services/group.service';
import type { 
  CreateGroupRequest, 
  UpdateGroupRequest, 
  JoinGroupRequest,
  GroupRole 
} from '@bible-rankings/shared';

export class GroupController {
  // 创建群组
  static async createGroup(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const data: CreateGroupRequest = req.body;

      if (!data.name || data.name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: '群组名称不能为空'
        });
      }

      if (data.name.length > 50) {
        return res.status(400).json({
          success: false,
          error: '群组名称不能超过50个字符'
        });
      }

      if (data.description && data.description.length > 200) {
        return res.status(400).json({
          success: false,
          error: '群组描述不能超过200个字符'
        });
      }

      const group = await GroupService.createGroup(userId, data);

      res.json({
        success: true,
        data: { group },
        message: '群组创建成功'
      });
    } catch (error) {
      console.error('创建群组失败:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '创建群组失败'
      });
    }
  }

  // 通过代码加入群组
  static async joinGroup(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { code }: JoinGroupRequest = req.body;

      if (!code || code.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: '群组代码不能为空'
        });
      }

      const member = await GroupService.joinGroupByCode(userId, code.trim().toUpperCase());

      res.json({
        success: true,
        data: { member },
        message: '成功加入群组'
      });
    } catch (error) {
      console.error('加入群组失败:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '加入群组失败'
      });
    }
  }

  // 获取用户的群组列表
  static async getUserGroups(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const groups = await GroupService.getUserGroups(userId);

      res.json({
        success: true,
        data: { groups },
        message: '群组列表获取成功'
      });
    } catch (error) {
      console.error('获取群组列表失败:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '获取群组列表失败'
      });
    }
  }

  // 获取群组详情
  static async getGroupDetails(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { groupId } = req.params;

      const group = await GroupService.getGroupDetails(groupId, userId);

      res.json({
        success: true,
        data: { group },
        message: '群组详情获取成功'
      });
    } catch (error) {
      console.error('获取群组详情失败:', error);
      const status = error instanceof Error && error.message.includes('不是该群组的成员') ? 403 : 500;
      res.status(status).json({
        success: false,
        error: error instanceof Error ? error.message : '获取群组详情失败'
      });
    }
  }

  // 获取群组排行榜
  static async getGroupLeaderboard(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { groupId } = req.params;
      const { period = 'all-time' } = req.query;

      if (typeof period !== 'string' || !['daily', 'weekly', 'monthly', 'all-time'].includes(period)) {
        return res.status(400).json({
          success: false,
          error: '无效的时间周期参数'
        });
      }

      const leaderboard = await GroupService.getGroupLeaderboard(groupId, userId, period);

      res.json({
        success: true,
        data: { leaderboard, period },
        message: '群组排行榜获取成功'
      });
    } catch (error) {
      console.error('获取群组排行榜失败:', error);
      const status = error instanceof Error && error.message.includes('不是该群组的成员') ? 403 : 500;
      res.status(status).json({
        success: false,
        error: error instanceof Error ? error.message : '获取群组排行榜失败'
      });
    }
  }

  // 更新群组信息
  static async updateGroup(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { groupId } = req.params;
      const data: UpdateGroupRequest = req.body;

      if (data.name !== undefined) {
        if (!data.name || data.name.trim().length === 0) {
          return res.status(400).json({
            success: false,
            error: '群组名称不能为空'
          });
        }
        if (data.name.length > 50) {
          return res.status(400).json({
            success: false,
            error: '群组名称不能超过50个字符'
          });
        }
      }

      if (data.description !== undefined && data.description && data.description.length > 200) {
        return res.status(400).json({
          success: false,
          error: '群组描述不能超过200个字符'
        });
      }

      const group = await GroupService.updateGroup(groupId, userId, data);

      res.json({
        success: true,
        data: { group },
        message: '群组信息更新成功'
      });
    } catch (error) {
      console.error('更新群组信息失败:', error);
      const status = error instanceof Error && error.message.includes('没有权限') ? 403 : 500;
      res.status(status).json({
        success: false,
        error: error instanceof Error ? error.message : '更新群组信息失败'
      });
    }
  }

  // 更新成员角色
  static async updateMemberRole(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { groupId, memberId } = req.params;
      const { role }: { role: GroupRole } = req.body;

      if (!role || !['MEMBER', 'ADMIN'].includes(role)) {
        return res.status(400).json({
          success: false,
          error: '无效的角色'
        });
      }

      const member = await GroupService.updateMemberRole(groupId, userId, memberId, role);

      res.json({
        success: true,
        data: { member },
        message: '成员角色更新成功'
      });
    } catch (error) {
      console.error('更新成员角色失败:', error);
      const status = error instanceof Error && error.message.includes('没有权限') ? 403 : 500;
      res.status(status).json({
        success: false,
        error: error instanceof Error ? error.message : '更新成员角色失败'
      });
    }
  }

  // 移除群组成员
  static async removeMember(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { groupId, memberId } = req.params;

      await GroupService.removeMember(groupId, userId, memberId);

      res.json({
        success: true,
        message: '成员移除成功'
      });
    } catch (error) {
      console.error('移除成员失败:', error);
      const status = error instanceof Error && error.message.includes('没有权限') ? 403 : 400;
      res.status(status).json({
        success: false,
        error: error instanceof Error ? error.message : '移除成员失败'
      });
    }
  }

  // 离开群组
  static async leaveGroup(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { groupId } = req.params;

      await GroupService.leaveGroup(groupId, userId);

      res.json({
        success: true,
        message: '已成功离开群组'
      });
    } catch (error) {
      console.error('离开群组失败:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '离开群组失败'
      });
    }
  }

  // 删除群组
  static async deleteGroup(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { groupId } = req.params;

      await GroupService.deleteGroup(groupId, userId);

      res.json({
        success: true,
        message: '群组删除成功'
      });
    } catch (error) {
      console.error('删除群组失败:', error);
      const status = error instanceof Error && error.message.includes('只有群主') ? 403 : 500;
      res.status(status).json({
        success: false,
        error: error instanceof Error ? error.message : '删除群组失败'
      });
    }
  }
}