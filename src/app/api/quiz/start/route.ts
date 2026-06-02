import { requireAuth } from "@/lib/auth-helpers";
import { getQuestionsForLesson } from "@/lib/quiz-engine";
import { apiSuccess, apiError } from "@/lib/errors";

export async function POST(req: Request) {
  try {
    await requireAuth();
    const { lessonId, count } = await req.json();
    const questions = await getQuestionsForLesson(lessonId, count || 10);
    return apiSuccess(questions);
  } catch (error) {
    return apiError(error);
  }
}
