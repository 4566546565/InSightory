import { db } from "@/lib/db";
import { apiSuccess, apiError, NotFoundError } from "@/lib/errors";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const unit = await db.unit.findUnique({
      where: { id },
      include: {
        textbook: { select: { id: true, title: true } },
        lessons: {
          orderBy: { sortOrder: "asc" },
          select: { id: true, title: true, lessonNumber: true, sortOrder: true },
        },
      },
    });
    if (!unit) throw new NotFoundError("单元不存在");
    return apiSuccess(unit);
  } catch (error) {
    return apiError(error);
  }
}
