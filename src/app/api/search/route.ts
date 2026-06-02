import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/errors";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q") || "";
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "20");

    if (!q || q.length < 1) {
      return apiSuccess({ lessons: [], knowledgePoints: [], questions: [], total: 0 });
    }

    const lessonResults = await db.lesson.findMany({
      where: {
        OR: [
          { title: { contains: q } },
        ],
      },
      select: {
        id: true,
        title: true,
        lessonNumber: true,
        unit: {
          select: {
            id: true,
            title: true,
            textbook: { select: { id: true, title: true } },
          },
        },
      },
      take: pageSize,
      skip: (page - 1) * pageSize,
    });

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
      lessons: lessonResults,
      knowledgePoints: kpResults,
      questions: questionResults,
      total: lessonResults.length + kpResults.length + questionResults.length,
    });
  } catch (error) {
    return apiError(error);
  }
}
