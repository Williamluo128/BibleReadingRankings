import { prisma } from '@/config/database';
import { env } from '@/config/env';
import type { User, UpdateProfileRequest } from '@bible-rankings/shared';

// 抹掉 Prisma 返回里的内部字段,并把 null 归一化为 undefined 以匹配 shared User 类型
function toUser(row: any): User {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    displayName: row.displayName,
    avatarUrl: row.avatarUrl ?? undefined,
    role: row.role,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/**
 * 从 Supabase JWT 解析出的用户身份,在本地 users 表里 upsert 一条记录。
 * 首次登录自动建号;username 从邮箱前缀生成;命中 ADMIN_EMAILS 的赋予 SUPER_ADMIN。
 * 中间件每次请求都会调用,因此 update 分支只同步可能变化的字段(email/头像)。
 */
export interface SupabaseUserInfo {
  sub: string;            // Supabase auth.users.id (UUID)
  email: string;
  name?: string | null;   // user_metadata.full_name
  avatarUrl?: string | null;
}

export class AuthService {
  /**
   * 按 Supabase uid 查本地用户(中间件验签后用)
   */
  static async getUserBySupabaseUid(supabaseUid: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { supabaseUid } });
    return user ? toUser(user) : null;
  }

  /**
   * 按本地 id 查用户(admin / profile 用)
   */
  static async getUserById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    return user ? toUser(user) : null;
  }

  /**
   * 首次/后续 Google 登录时,把 Supabase 身份同步到本地 users 表。
   * 返回本地 User(即注入 req.user 的对象)。
   */
  static async upsertUserFromSupabase(info: SupabaseUserInfo): Promise<User> {
    const isAdmin = env.ADMIN_EMAILS.includes(info.email.toLowerCase());
    const baseUsername = (info.email.split('@')[0] || 'user')
      .replace(/[^a-zA-Z0-9_]/g, '')
      .slice(0, 28) || 'user';
    const displayName = info.name?.trim() || info.email.split('@')[0] || 'User';

    // upsert:已存在则同步 email/头像;不存在则 create(含 username 生成)
    const existing = await prisma.user.findUnique({
      where: { supabaseUid: info.sub },
    });

    if (existing) {
      const updated = await prisma.user.update({
        where: { supabaseUid: info.sub },
        data: {
          email: info.email,
          avatarUrl: info.avatarUrl ?? existing.avatarUrl,
        },
      });
      return toUser(updated);
    }

    // 兼容旧账号:邮箱已存在但 supabaseUid 未绑定(Google 首次登录)
    const existingByEmail = await prisma.user.findUnique({
      where: { email: info.email },
    });

    if (existingByEmail) {
      const updated = await prisma.user.update({
        where: { id: existingByEmail.id },
        data: {
          supabaseUid: info.sub,
          avatarUrl: info.avatarUrl ?? existingByEmail.avatarUrl,
          role: isAdmin ? 'SUPER_ADMIN' : existingByEmail.role,
        },
      });
      return toUser(updated);
    }

    const username = await this.generateUniqueUsername(baseUsername);
    const created = await prisma.user.create({
      data: {
        supabaseUid: info.sub,
        email: info.email,
        username,
        displayName,
        avatarUrl: info.avatarUrl ?? null,
        role: isAdmin ? 'SUPER_ADMIN' : 'USER',
      },
    });
    return toUser(created);
  }

  /**
   * 生成唯一 username:邮箱前缀;冲突则加 -2、-3 …
   */
  static async generateUniqueUsername(base: string): Promise<string> {
    let candidate = base;
    let n = 2;
    // 限循环次数,避免极端情况下死循环
    for (let i = 0; i < 1000; i++) {
      const clash = await prisma.user.findUnique({ where: { username: candidate } });
      if (!clash) return candidate;
      candidate = `${base}-${n++}`;
    }
    // 兜底:加一段随机后缀
    return `${base}-${Math.random().toString(36).slice(2, 8)}`;
  }

  /**
   * 更新自己的资料(.displayName / avatarUrl)
   */
  static async updateProfile(userId: string, data: UpdateProfileRequest): Promise<User> {
    const updateData: any = {};
    if (data.displayName !== undefined) {
      updateData.displayName = data.displayName;
    }
    if (data.avatarUrl !== undefined) {
      updateData.avatarUrl = data.avatarUrl;
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
    return toUser(updated);
  }
}
