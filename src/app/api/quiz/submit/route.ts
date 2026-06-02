import { requireAuth } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/errors";
import type { InputJsonValue } from "@prisma/client/runtime/library";

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const { answers, mode, knowledgePointIds, timeSpent } = await req.json();

    if (!answers || !Array.isArray(answers)) {
      return Response.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "请提供答案" } },
        { status: 400 }
      );
    }

    // Fetch correct answers
    const questionIds = answers.map((a: { questionId: string }) => a.questionId);
    const questions = await db.question.findMany({
      where: { id: { in: questionIds } },
      select: { id: true, correctAnswer: true },
    });

    const correctMap = new Map(questions.map((q) => [q.id, q.correctAnswer]));

    let score = 0;
    const answerRecords: Array<{
      questionId: string;
      userAnswer: InputJsonValue;
      isCorrect: boolean;
      score: number;
    }> = [];

    for (const a of answers) {
      const correct = correctMap.get(a.questionId);
      let isCorrect = false;

      if (correct !== undefined) {
        if (Array.isArray(a.userAnswer) && Array.isArray(correct)) {
          isCorrect =
            a.userAnswer.length === correct.length &&
            (a.userAnswer as unknown[]).every((v: unknown) => (correct as unknown[]).includes(v));
        } else {
          isCorrect = String(a.userAnswer).trim() === String(correct).trim();
        }
      }

      if (isCorrect) score++;

      answerRecords.push({
        questionId: a.questionId,
        userAnswer: a.userAnswer,
        isCorrect,
        score: isCorrect ? 1 : 0,
      });
    }

    // Save attempt
    const attempt = await db.quizAttempt.create({
      data: {
        userId: user.id,
        mode: mode || "PRACTICE",
        knowledgePointIds: knowledgePointIds || [],
        score,
        totalScore: answers.length,
        timeSpent: timeSpent || 0,
        finishedAt: new Date(),
        answers: {
          create: answerRecords.map((r) => ({
            question: { connect: { id: r.questionId } },
            userAnswer: r.userAnswer,
            isCorrect: r.isCorrect,
            score: r.score,
          })),
        },
      },
    });

    // Auto-collect errors
    const wrongAnswers = answerRecords.filter((r) => !r.isCorrect);
    for (const wa of wrongAnswers) {
      await db.errorBookEntry.upsert({
        where: { userId_questionId: { userId: user.id, questionId: wa.questionId } },
        update: { wrongCount: { increment: 1 }, lastWrongAt: new Date(), wrongAnswer: wa.userAnswer },
        create: { userId: user.id, questionId: wa.questionId, wrongAnswer: wa.userAnswer },
      });
    }

    return apiSuccess({
      attemptId: attempt.id,
      score,
      totalScore: answers.length,
      results: answerRecords.map((r) => ({
        questionId: r.questionId,
        isCorrect: r.isCorrect,
      })),
    });
  } catch (error) {
    return apiError(error);
  }
}
