import { db } from "@/lib/db";

export async function getQuestionsForLesson(lessonId: string, count: number = 10) {
  const questions = await db.question.findMany({
    where: {
      isPublished: true,
      knowledgePointLinks: {
        some: {
          knowledgePoint: { lessonId },
        },
      },
      type: { in: ["MC", "TRUE_FALSE"] },
    },
    select: {
      id: true,
      type: true,
      difficulty: true,
      stem: true,
      options: true,
      timeEstimate: true,
    },
  });

  // Shuffle and limit
  const shuffled = questions.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function scoreQuiz(
  answers: Array<{ questionId: string; userAnswer: unknown }>,
  correctAnswers: Map<string, unknown>
): { score: number; total: number; results: Array<{ questionId: string; isCorrect: boolean }> } {
  let score = 0;
  const results = answers.map((a) => {
    const correct = correctAnswers.get(a.questionId);
    let isCorrect = false;

    if (Array.isArray(a.userAnswer) && Array.isArray(correct)) {
      isCorrect =
        a.userAnswer.length === correct.length &&
        a.userAnswer.every((v: unknown) => correct.includes(v));
    } else {
      isCorrect = String(a.userAnswer) === String(correct);
    }

    if (isCorrect) score++;
    return { questionId: a.questionId, isCorrect };
  });

  return { score, total: answers.length, results };
}
