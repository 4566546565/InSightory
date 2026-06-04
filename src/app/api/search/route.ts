import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/errors";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET(req: Request) {
  try {
    await requireAuth();

    const url = new URL(req.url);
    const q = (url.searchParams.get("q") || "").trim();
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10) || 1);
    const requestedPageSize = parseInt(url.searchParams.get("pageSize") || "20", 10) || 20;
    const pageSize = Math.min(Math.max(1, requestedPageSize), 50);

    if (q.length < 2) {
      return apiSuccess({ knowledgePoints: [], questions: [], total: 0 });
    }

    const kpResults = await db.knowledgePoint.findMany({
      where: {
        OR: [
          { title: { contains: q } },
          { tags: { hasSome: [q] } },
        ],
      },
      select: {
        id: true,
        title: true,
        difficulty: true,
        tags: true,
        lesson: {
          select: {
            id: true,
            title: true,
            unit: { select: { id: true, textbookId: true } },
          },
        },
      },
      take: pageSize,
      skip: (page - 1) * pageSize,
    });

    const questionResults = await db.question.findMany({
      where: {
        isPublished: true,
        OR: [
          { tags: { hasSome: [q] } },
        ],
      },
      select: {
        id: true,
        type: true,
        difficulty: true,
        stem: true,
        tags: true,
      },
      take: pageSize,
      skip: (page - 1) * pageSize,
    });

    return apiSuccess({
      knowledgePoints: kpResults,
      questions: questionResults,
      total: kpResults.length + questionResults.length,
    });
  } catch (error) {
    return apiError(error);
  }
}
