import { requireAuth } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/errors";

export async function GET() {
  try {
    const user = await requireAuth();
    const notes = await db.note.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
    });
    return apiSuccess(notes);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const { targetType, targetId, content } = await req.json();
    const note = await db.note.create({
      data: { userId: user.id, targetType, targetId, content },
    });
    return apiSuccess(note);
  } catch (error) {
    return apiError(error);
  }
}
