import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { registerSchema } from "@/lib/validators";
import { apiSuccess, apiError } from "@/lib/errors";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } },
        { status: 400 }
      );
    }

    const { username, email, password, displayName, school, grade } = parsed.data;

    const existing = await db.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      return Response.json(
        { success: false, error: { code: "CONFLICT", message: existing.email === email ? "该邮箱已注册" : "该用户名已被占用" } },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await db.user.create({
      data: { username, email, passwordHash, displayName, role: "STUDENT", school, grade },
    });

    return apiSuccess({ id: user.id, username: user.username, email: user.email, role: user.role });
  } catch (error) {
    return apiError(error);
  }
}
