import { z } from 'zod';

// 更新资料:username / displayName / avatarUrl,均可选
export const updateProfileSchema = z.object({
  username: z.string()
    .min(3, '用户名至少3个字符')
    .max(30, '用户名不能超过30个字符')
    .regex(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线')
    .transform((val) => val.toLowerCase())
    .optional(),
  displayName: z.string()
    .min(1, '显示名称不能为空')
    .max(50, '显示名称不能超过50个字符')
    .optional(),
  avatarUrl: z.string()
    .url('头像必须是有效的 URL')
    .max(500, '头像 URL 过长')
    .nullable()
    .optional(),
});

export const validateRequest = <T>(schema: z.ZodSchema<T>) => {
  return (req: any, res: any, next: any) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.errors
        });
      }
      next(error);
    }
  };
};
