"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuizStore } from "@/store/quiz-store";
import { QuestionCard } from "@/components/quiz/question-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

export default function LessonPracticePage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.lessonId as string;

  const {
    questions,
    currentIndex,
    answers,
    isFinished,
    score,
    totalScore,
    setQuestions,
    setAnswer,
    nextQuestion,
    prevQuestion,
    goToQuestion,
    startQuiz,
    finishQuiz,
    reset,
  } = useQuizStore();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<Array<{ questionId: string; isCorrect: boolean }>>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetch("/api/quiz/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, count: 10 }),
      });
      const data = await res.json();
      if (data.success) {
        setQuestions(data.data);
        startQuiz();
      }
      setLoading(false);
    }
    load();
    return () => { reset(); };
  }, [lessonId]);

  async function handleSubmit() {
    setSubmitting(true);
    const answerArr = Object.entries(answers).map(([questionId, userAnswer]) => ({
      questionId,
      userAnswer,
    }));

    const res = await fetch("/api/quiz/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        answers: answerArr,
        mode: "PRACTICE",
        knowledgePointIds: [],
        timeSpent: 0,
      }),
    });

    const data = await res.json();
    if (data.success) {
      setResults(data.data.results);
      finishQuiz(data.data.score, data.data.totalScore);
    }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold mb-2">暂无可用题目</h2>
        <p className="text-muted-foreground mb-4">该课程暂未添加题目</p>
        <Link href="/practice"><Button>返回练习中心</Button></Link>
      </div>
    );
  }

  if (isFinished && score !== null) {
    const percentage = Math.round((score / totalScore) * 100);
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-2xl">练习完成</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold mb-4 text-primary">{score}/{totalScore}</div>
            <Progress value={percentage} className="h-3 mb-4" />
            <p className="text-muted-foreground mb-6">正确率 {percentage}%</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => { reset(); router.refresh(); }}>
                再练一次
              </Button>
              <Link href="/practice">
                <Button variant="outline">返回练习中心</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>答题详情</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {questions.map((q, i) => {
                const result = results.find((r) => r.questionId === q.id);
                return (
                  <div key={q.id} className="flex items-center gap-3 p-2 rounded-md border">
                    {result?.isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                    )}
                    <span className="text-sm">第{i + 1}题</span>
                    <Badge variant={result?.isCorrect ? "default" : "destructive"} className="ml-auto">
                      {result?.isCorrect ? "正确" : "错误"}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <Link href="/practice">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="h-4 w-4 mr-1" />退出练习
          </Button>
        </Link>
        <div className="text-sm text-muted-foreground">
          已答 {Object.keys(answers).length}/{questions.length} 题
        </div>
      </div>

      <Progress value={progress} className="h-2" />

      <QuestionCard
        key={currentQuestion.id}
        question={currentQuestion}
        index={currentIndex}
        total={questions.length}
        selectedAnswer={answers[currentQuestion.id]}
        onAnswer={setAnswer}
      />

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={prevQuestion}
          disabled={currentIndex === 0}
        >
          上一题
        </Button>

        <div className="flex gap-1 flex-wrap justify-center">
          {questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => goToQuestion(i)}
              className={`w-8 h-8 rounded text-xs ${
                i === currentIndex
                  ? "bg-primary text-primary-foreground"
                  : answers[q.id] !== undefined
                  ? "bg-accent text-accent-foreground"
                  : "border text-muted-foreground hover:bg-accent"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {currentIndex < questions.length - 1 ? (
          <Button onClick={nextQuestion}>下一题</Button>
        ) : (
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "提交中..." : "提交答卷"}
          </Button>
        )}
      </div>
    </div>
  );
}
