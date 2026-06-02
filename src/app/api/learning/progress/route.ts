import { requireAuth } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/errors";

export async function GET() {
  try {
    const user = await requireAuth();
    const progress = await db.learningProgress.findMany({
      where: { userId: user.id },
      include: {
        knowledgePoint: {
          select: { id: true, title: true, lessonId: true },
        },
      },
    });
    return apiSuccess(progress);
  } catch (error) {
    return apiError(error);
  }
}
