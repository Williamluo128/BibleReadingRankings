import { Router } from 'express';
import { FriendshipController } from '@/controllers/friendship.controller';
import { authenticateToken } from '@/middleware/auth.middleware';

const router = Router();

// 所有路由都需要认证
router.use(authenticateToken);

// GET /api/friends/search?q=username - 搜索用户
router.get('/search', FriendshipController.searchUsers);

// POST /api/friends/request - 发送好友请求
router.post('/request', FriendshipController.sendFriendRequest);

// GET /api/friends/requests/received - 获取收到的好友请求
router.get('/requests/received', FriendshipController.getReceivedRequests);

// GET /api/friends/requests/sent - 获取发送的好友请求
router.get('/requests/sent', FriendshipController.getSentRequests);

// PUT /api/friends/requests/:requestId/respond - 响应好友请求
router.put('/requests/:requestId/respond', FriendshipController.respondToRequest);

// GET /api/friends - 获取好友列表
router.get('/', FriendshipController.getFriends);

// DELETE /api/friends/:friendId - 删除好友
router.delete('/:friendId', FriendshipController.removeFriend);

// GET /api/friends/:targetUserId/status - 检查好友状态
router.get('/:targetUserId/status', FriendshipController.getFriendshipStatus);

export { router as friendshipRoutes };