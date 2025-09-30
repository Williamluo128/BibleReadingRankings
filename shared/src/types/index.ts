// 用户相关类型
export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  displayName: string;
}

export interface LoginRequest {
  emailOrUsername: string; // 可以是邮箱或用户名
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// 圣经相关类型
export interface BibleBook {
  id: number;
  nameCn: string;
  nameCnShort: string;
  nameEn: string;
  abbreviation: string;
  testament: 'OT' | 'NT';
  bookOrder: number;
}

export interface BibleChapter {
  id: string;
  bookId: number;
  chapterNumber: number;
  verseCount: number;
  book?: BibleBook;
}

export interface BibleVerse {
  id: string;
  chapterId: string;
  verseNumber: number;
  textCn: string;
  textEn: string;
  chapter?: BibleChapter;
}

// 阅读记录相关类型
export interface ReadingRecord {
  id: string;
  userId: string;
  verseId: string;
  readAt: Date;
  date: string; // YYYY-MM-DD format
}

export interface DailyStats {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD format
  versesRead: number;
  user?: User;
}

// 好友系统相关类型
export type FriendshipStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface Friendship {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: FriendshipStatus;
  createdAt: Date;
  requester?: User;
  addressee?: User;
}

export interface FriendRequest {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: FriendshipStatus;
  createdAt: Date;
  updatedAt: Date;
  requester: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
  addressee: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
}

export interface Friend {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  friendshipDate: Date;
  totalStats: {
    totalVerses: number;
    totalDays: number;
    todayVerses: number;
  };
}

export interface SendFriendRequestData {
  targetUserId: string;
}

export interface RespondToRequestData {
  action: 'accept' | 'reject';
}

// 群组相关类型
export type GroupRole = 'MEMBER' | 'ADMIN' | 'OWNER';

export interface Group {
  id: string;
  name: string;
  description?: string;
  code: string;
  ownerId: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  owner?: User;
  memberCount?: number;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: GroupRole;
  joinedAt: Date;
  user?: User;
  group?: Group;
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
  isPublic?: boolean;
}

export interface UpdateGroupRequest {
  name?: string;
  description?: string;
  isPublic?: boolean;
}

export interface JoinGroupRequest {
  code: string;
}

export interface GroupWithMembers {
  id: string;
  name: string;
  description?: string;
  code: string;
  ownerId: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  owner: User;
  members: Array<{
    id: string;
    role: GroupRole;
    joinedAt: Date;
    user: User;
  }>;
}

export interface GroupLeaderboardEntry {
  userId: string;
  username: string;
  displayName: string;
  totalVerses: number;
  totalDays: number;
  averageVersesPerDay: number;
  rank: number;
  role: GroupRole;
}

// 排行榜相关类型
export interface RankingEntry {
  user: User;
  versesRead: number;
  rank: number;
  date: string;
}

export interface RankingResponse {
  rankings: RankingEntry[];
  currentUserRank?: RankingEntry;
  totalParticipants: number;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  displayName: string;
  totalVerses: number;
  totalDays: number;
  averageVersesPerDay: number;
  isCurrentUser: boolean;
  rank: number;
}

export interface UserRank {
  rank: number;
  totalUsers: number;
  totalVerses: number;
  totalDays: number;
  averageVersesPerDay: number;
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 错误类型
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}