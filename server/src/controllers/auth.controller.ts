import { Request, Response } from 'express';
import { AuthService } from '@/services/auth.service';
import type { 
  ApiResponse, 
  CreateUserRequest, 
  LoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest 
} from '@bible-rankings/shared';

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const userData: CreateUserRequest = req.body;
      const result = await AuthService.register(userData);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'User registered successfully'
      };

      res.status(201).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      };

      res.status(400).json(response);
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const loginData: LoginRequest = req.body;
      const result = await AuthService.login(loginData);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Login successful'
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed'
      };

      res.status(401).json(response);
    }
  }

  static async me(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user; // Set by auth middleware

      const response: ApiResponse = {
        success: true,
        data: { user },
        message: 'User profile retrieved successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to get user profile'
      };

      res.status(500).json(response);
    }
  }

  static async logout(req: Request, res: Response): Promise<void> {
    // In a stateless JWT system, logout is handled client-side by removing the token
    // Optionally, implement token blacklisting here
    const response: ApiResponse = {
      success: true,
      message: 'Logout successful'
    };

    res.status(200).json(response);
  }

  // 忘记密码
  static async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email }: ForgotPasswordRequest = req.body;

      if (!email || !email.trim()) {
        return res.status(400).json({
          success: false,
          error: '邮箱地址不能为空'
        });
      }

      await AuthService.forgotPassword(email);

      const response: ApiResponse = {
        success: true,
        message: '如果该邮箱已注册，您将收到密码重置邮件'
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : '发送重置邮件失败'
      };

      res.status(400).json(response);
    }
  }

  // 重置密码
  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, newPassword }: ResetPasswordRequest = req.body;

      if (!token || !token.trim()) {
        return res.status(400).json({
          success: false,
          error: '重置令牌不能为空'
        });
      }

      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          error: '新密码长度至少为6位'
        });
      }

      await AuthService.resetPassword(token, newPassword);

      const response: ApiResponse = {
        success: true,
        message: '密码重置成功'
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : '重置密码失败'
      };

      res.status(400).json(response);
    }
  }

  // 验证重置令牌
  static async validateResetToken(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params;

      if (!token) {
        return res.status(400).json({
          success: false,
          error: '重置令牌不能为空'
        });
      }

      const isValid = await AuthService.validateResetToken(token);

      const response: ApiResponse = {
        success: true,
        data: { isValid },
        message: isValid ? '令牌有效' : '令牌无效或已过期'
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : '验证令牌失败'
      };

      res.status(500).json(response);
    }
  }

  // 修改密码
  static async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          error: '未登录，请先登录'
        });
      }

      if (!currentPassword || !currentPassword.trim()) {
        return res.status(400).json({
          success: false,
          error: '当前密码不能为空'
        });
      }

      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          error: '新密码长度至少为6位'
        });
      }

      if (currentPassword === newPassword) {
        return res.status(400).json({
          success: false,
          error: '新密码不能与当前密码相同'
        });
      }

      await AuthService.changePassword(user.id, currentPassword, newPassword);

      const response: ApiResponse = {
        success: true,
        message: '密码修改成功'
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : '修改密码失败'
      };

      res.status(400).json(response);
    }
  }
}