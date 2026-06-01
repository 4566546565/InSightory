import { requireAuth } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/errors";

export async function GET() {
  try {
    const user = await requireAuth();
    const errors = await db.errorBookEntry.findMany({
      where: { userId: user.id },
      orderBy: { lastWrongAt: "desc" },
      include: {
        question: {
          select: { id: true, type: true, stem: true, difficulty: true, tags: true },
        },
      },
    });
    return apiSuccess(errors);
  } catch (error) {
    return apiError(error);
  }
}
