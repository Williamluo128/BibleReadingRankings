import nodemailer from 'nodemailer';
import { env } from '@/config/env';

export class EmailService {
  private static transporter: nodemailer.Transporter | null = null;

  /**
   * 初始化邮件传输器
   */
  private static getTransporter(): nodemailer.Transporter {
    if (!this.transporter) {
      // 开发环境使用 Ethereal Email (虚拟邮箱)
      // 生产环境可以配置真实的SMTP服务
      this.transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER || 'ethereal.user@ethereal.email',
          pass: process.env.SMTP_PASS || 'ethereal.pass'
        }
      });
    }
    return this.transporter;
  }

  /**
   * 发送密码重置邮件
   */
  static async sendPasswordResetEmail(
    email: string, 
    resetToken: string,
    username: string
  ): Promise<void> {
    try {
      const transporter = this.getTransporter();
      
      // 构建重置链接
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
      
      const mailOptions = {
        from: process.env.FROM_EMAIL || '"圣经阅读排行榜" <noreply@bible-rankings.com>',
        to: email,
        subject: '密码重置请求 - 圣经阅读排行榜',
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <h2 style="color: #333; text-align: center;">密码重置请求</h2>
            
            <p>亲爱的 ${username}，</p>
            
            <p>我们收到了您重置密码的请求。如果这不是您发起的操作，请忽略此邮件。</p>
            
            <p>要重置您的密码，请点击下面的链接：</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                重置密码
              </a>
            </div>
            
            <p>或者复制以下链接到浏览器地址栏：</p>
            <p style="word-break: break-all; color: #666; font-size: 14px;">
              ${resetUrl}
            </p>
            
            <p style="color: #666; font-size: 14px;">
              <strong>注意：</strong>此链接将在1小时后失效。如果链接已失效，请重新发起密码重置请求。
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              这是一封系统自动发送的邮件，请勿回复。<br>
              如有疑问，请联系我们的客服支持。
            </p>
          </div>
        `,
        text: `
亲爱的 ${username}，

我们收到了您重置密码的请求。如果这不是您发起的操作，请忽略此邮件。

要重置您的密码，请复制以下链接到浏览器地址栏：
${resetUrl}

注意：此链接将在1小时后失效。如果链接已失效，请重新发起密码重置请求。

这是一封系统自动发送的邮件，请勿回复。
如有疑问，请联系我们的客服支持。

圣经阅读排行榜团队
        `
      };

      const info = await transporter.sendMail(mailOptions);
      
      console.log('密码重置邮件发送成功:', {
        messageId: info.messageId,
        to: email,
        previewUrl: nodemailer.getTestMessageUrl(info) // 开发环境预览URL
      });
      
    } catch (error) {
      console.error('发送密码重置邮件失败:', error);
      throw new Error('邮件发送失败，请稍后重试');
    }
  }

  /**
   * 发送测试邮件（用于验证邮件配置）
   */
  static async sendTestEmail(email: string): Promise<void> {
    try {
      const transporter = this.getTransporter();
      
      const mailOptions = {
        from: process.env.FROM_EMAIL || '"圣经阅读排行榜" <noreply@bible-rankings.com>',
        to: email,
        subject: '测试邮件 - 圣经阅读排行榜',
        html: `
          <h2>邮件服务测试</h2>
          <p>如果您收到这封邮件，说明邮件服务配置正确。</p>
          <p>发送时间：${new Date().toLocaleString('zh-CN')}</p>
        `,
        text: `
邮件服务测试

如果您收到这封邮件，说明邮件服务配置正确。
发送时间：${new Date().toLocaleString('zh-CN')}
        `
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('测试邮件发送成功:', info.messageId);
      
    } catch (error) {
      console.error('发送测试邮件失败:', error);
      throw new Error('邮件发送失败');
    }
  }
}