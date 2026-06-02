import { db } from "@/lib/db";
import { apiSuccess, apiError, NotFoundError } from "@/lib/errors";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const lesson = await db.lesson.findUnique({
      where: { id },
      include: {
        unit: {
          include: {
            textbook: { select: { id: true, title: true } },
          },
        },
        knowledgePoints: {
          orderBy: { sortOrder: "asc" },
          select: { id: true, title: true, difficulty: true, tags: true, sortOrder: true },
        },
      },
    });
    if (!lesson) throw new NotFoundError("课不存在");
    return apiSuccess(lesson);
  } catch (error) {
    return apiError(error);
  }
}
