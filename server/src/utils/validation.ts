import { z } from 'zod';

// 更新资料:displayName / avatarUrl,均可选
export const updateProfileSchema = z.object({
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
