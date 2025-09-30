import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '@/config/database';
import { env } from '@/config/env';
import { EmailService } from './email.service';
import type { 
  CreateUserRequest, 
  LoginRequest, 
  AuthResponse, 
  User,
  ForgotPasswordRequest,
  ResetPasswordRequest 
} from '@bible-rankings/shared';

export class AuthService {
  static async register(userData: CreateUserRequest): Promise<AuthResponse> {
    const { username, email, password, displayName } = userData;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      throw new Error('User already exists with this email or username');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        displayName,
      },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    // Generate JWT
    const token = this.generateToken(newUser.id);

    return {
      user: newUser as User,
      token,
    };
  }

  static async login(loginData: LoginRequest): Promise<AuthResponse> {
    const { emailOrUsername, password } = loginData;

    // 检查是否是邮箱格式
    const isEmail = emailOrUsername.includes('@');
    
    // Find user by email or username
    const user = await prisma.user.findFirst({
      where: isEmail 
        ? { email: emailOrUsername }
        : { username: emailOrUsername },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        role: true,
        passwordHash: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!user) {
      throw new Error(isEmail ? '邮箱不存在' : '用户名不存在');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('密码错误');
    }

    // Generate JWT
    const token = this.generateToken(user.id);

    // Remove password from response
    const { passwordHash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword as User,
      token,
    };
  }

  static async getUserById(userId: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return user as User | null;
  }

  static generateToken(userId: string): string {
    return jwt.sign({ userId }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });
  }

  static verifyToken(token: string): { userId: string } {
    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as { userId: string };
      return payload;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  // 忘记密码 - 生成重置令牌
  static async forgotPassword(email: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        username: true,
        email: true
      }
    });

    if (!user) {
      throw new Error('邮箱不存在');
    }

    // 生成重置令牌
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1小时后过期

    // 保存重置令牌到数据库
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    });

    // 发送密码重置邮件
    try {
      await EmailService.sendPasswordResetEmail(
        user.email,
        resetToken,
        user.username
      );
      console.log(`密码重置邮件已发送到: ${email}`);
    } catch (error) {
      console.error('发送密码重置邮件失败:', error);
      // 即使邮件发送失败，我们也不抛出错误，避免暴露用户是否存在
      // 在生产环境中，应该有重试机制或者记录失败日志
    }
  }

  // 重置密码
  static async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gte: new Date() // 令牌未过期
        }
      }
    });

    if (!user) {
      throw new Error('重置令牌无效或已过期');
    }

    // 哈希新密码
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // 更新密码并清除重置令牌
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null
      }
    });
  }

  // 验证重置令牌
  static async validateResetToken(token: string): Promise<boolean> {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gte: new Date()
        }
      }
    });

    return !!user;
  }

  // 用户修改密码
  static async changePassword(
    userId: string, 
    currentPassword: string, 
    newPassword: string
  ): Promise<void> {
    // 获取用户当前密码哈希
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        passwordHash: true
      }
    });

    if (!user) {
      throw new Error('用户不存在');
    }

    // 验证当前密码
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      throw new Error('当前密码错误');
    }

    // 哈希新密码
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // 更新密码
    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
        // 清除重置令牌（如果有的话）
        resetToken: null,
        resetTokenExpiry: null
      }
    });
  }
}