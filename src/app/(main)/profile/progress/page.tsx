import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = { title: "学习进度" };

export default async function ProgressPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const allKps = await db.knowledgePoint.count();
  const completedKps = await db.learningProgress.count({
    where: { userId: user.id, status: { in: ["COMPLETED", "MASTERED"] } },
  });
  const progress = allKps > 0 ? (completedKps / allKps) * 100 : 0;

  const completedByLesson = await db.learningProgress.groupBy({
    by: ["knowledgePointId"],
    where: { userId: user.id, status: { in: ["COMPLETED", "MASTERED"] } },
  });
  const completedKpIds = new Set(completedByLesson.map((p) => p.knowledgePointId));

  const textbooks = await db.textbook.findMany({
    where: { isActive: true },
    include: {
      units: {
        include: {
          lessons: {
            include: {
              knowledgePoints: { select: { id: true } },
            },
          },
        },
      },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">学习进度</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />总体进度
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-2">{completedKps} / {allKps}</div>
          <Progress value={progress} className="h-3 mb-2" />
          <p className="text-sm text-muted-foreground">已完成 {Math.round(progress)}% 的知识点</p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {textbooks.map((tb) => (
          <Card key={tb.id}>
            <CardHeader>
              <CardTitle className="text-lg">{tb.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tb.units.map((unit) => (
                <div key={unit.id}>
                  <h4 className="text-sm font-medium mb-1">第{unit.unitNumber}单元 {unit.title}</h4>
                  {unit.lessons.map((lesson) => {
                    const lessonCompleted = lesson.knowledgePoints.filter((kp) => completedKpIds.has(kp.id)).length;
                    const lessonTotal = lesson.knowledgePoints.length;
                    const lessonPct = lessonTotal > 0 ? (lessonCompleted / lessonTotal) * 100 : 0;
                    return (
                      <Link key={lesson.id} href={`/knowledge/${tb.id}/${unit.id}/${lesson.id}`}>
                        <div className="flex items-center gap-2 py-1 text-sm cursor-pointer hover:bg-muted/50 rounded px-1 transition-colors">
                          <span className="w-16 text-muted-foreground">第{lesson.lessonNumber}课</span>
                          <Progress value={lessonPct} className="h-2 flex-1" />
                          <span className="text-muted-foreground text-xs w-12 text-right">
                            {lessonCompleted}/{lessonTotal}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
