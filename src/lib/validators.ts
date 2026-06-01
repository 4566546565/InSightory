import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(6, "密码至少6位"),
});

export const registerSchema = z.object({
  username: z.string().min(2, "用户名至少2个字符").max(20, "用户名最多20个字符"),
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(6, "密码至少6位"),
  displayName: z.string().min(1, "请填写显示名称").max(30),
  school: z.string().optional(),
  grade: z.string().optional(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
