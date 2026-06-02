import { requireAuth } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/errors";

export async function GET() {
  try {
    const user = await requireAuth();
    const bookmarks = await db.bookmark.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    return apiSuccess(bookmarks);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const { targetType, targetId } = await req.json();
    const bookmark = await db.bookmark.create({
      data: { userId: user.id, targetType, targetId },
    });
    return apiSuccess(bookmark);
  } catch (error) {
    return apiError(error);
  }
}
