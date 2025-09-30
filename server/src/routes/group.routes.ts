import { Router } from 'express';
import { GroupController } from '@/controllers/group.controller';
import { authenticateToken } from '@/middleware/auth.middleware';

const router = Router();

// POST /api/groups - 创建群组
router.post('/', authenticateToken, GroupController.createGroup);

// POST /api/groups/join - 通过代码加入群组
router.post('/join', authenticateToken, GroupController.joinGroup);

// GET /api/groups - 获取用户的群组列表
router.get('/', authenticateToken, GroupController.getUserGroups);

// GET /api/groups/:groupId - 获取群组详情
router.get('/:groupId', authenticateToken, GroupController.getGroupDetails);

// PUT /api/groups/:groupId - 更新群组信息
router.put('/:groupId', authenticateToken, GroupController.updateGroup);

// DELETE /api/groups/:groupId - 删除群组
router.delete('/:groupId', authenticateToken, GroupController.deleteGroup);

// POST /api/groups/:groupId/leave - 离开群组
router.post('/:groupId/leave', authenticateToken, GroupController.leaveGroup);

// GET /api/groups/:groupId/leaderboard - 获取群组排行榜
router.get('/:groupId/leaderboard', authenticateToken, GroupController.getGroupLeaderboard);

// PUT /api/groups/:groupId/members/:memberId - 更新成员角色
router.put('/:groupId/members/:memberId', authenticateToken, GroupController.updateMemberRole);

// DELETE /api/groups/:groupId/members/:memberId - 移除群组成员
router.delete('/:groupId/members/:memberId', authenticateToken, GroupController.removeMember);

// 暂时注释掉这些新的API，等实现后再启用
// GET /api/groups/:groupId/details - 获取群组详细信息（包含成员和通知）
// router.get('/:groupId/details', authenticateToken, GroupController.getGroupFullDetails);

// POST /api/groups/:groupId/notices - 创建群组通知
// router.post('/:groupId/notices', authenticateToken, GroupController.createNotice);

// PUT /api/groups/:groupId/notices/:noticeId - 更新群组通知
// router.put('/:groupId/notices/:noticeId', authenticateToken, GroupController.updateNotice);

// DELETE /api/groups/:groupId/notices/:noticeId - 删除群组通知
// router.delete('/:groupId/notices/:noticeId', authenticateToken, GroupController.deleteNotice);

// PUT /api/groups/:groupId/members/:memberId/role - 修改成员角色
// router.put('/:groupId/members/:memberId/role', authenticateToken, GroupController.updateMemberRole);

export { router as groupRoutes };