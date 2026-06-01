import { db } from "@/lib/db";
import { apiSuccess, apiError, NotFoundError } from "@/lib/errors";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const kp = await db.knowledgePoint.findUnique({
      where: { id },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            unit: {
              select: {
                id: true,
                title: true,
                textbook: { select: { id: true, title: true } },
              },
            },
          },
        },
      },
    });
    if (!kp) throw new NotFoundError("知识点不存在");
    return apiSuccess(kp);
  } catch (error) {
    return apiError(error);
  }
}
