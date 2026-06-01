import { db } from "@/lib/db";
import { apiSuccess, apiError, NotFoundError } from "@/lib/errors";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const textbook = await db.textbook.findUnique({
      where: { id },
      include: {
        units: {
          orderBy: { sortOrder: "asc" },
          include: {
            lessons: {
              orderBy: { sortOrder: "asc" },
              select: { id: true, title: true, lessonNumber: true, sortOrder: true },
            },
          },
        },
      },
    });
    if (!textbook) throw new NotFoundError("教材不存在");
    return apiSuccess(textbook);
  } catch (error) {
    return apiError(error);
  }
}
