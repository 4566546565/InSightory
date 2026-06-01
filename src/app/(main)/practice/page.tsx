import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileQuestion, Target, Clock, BookOpen } from "lucide-react";
import { db } from "@/lib/db";

export const metadata = { title: "试题练习" };

export default async function PracticePage() {
  let textbooks: Array<{ id: string; title: string; units: Array<{ lessons: Array<{ id: string; title: string; lessonNumber: number }> }> }> = [];
  try {
    textbooks = await db.textbook.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: { units: { include: { lessons: { select: { id: true, title: true, lessonNumber: true } } } } },
    });
  } catch {
    textbooks = [];
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">试题练习</h1>
        <p className="text-muted-foreground mt-2">选择练习模式，开始高效训练</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <FileQuestion className="h-8 w-8 text-primary mb-2" />
            <CardTitle>随课练习</CardTitle>
            <CardDescription>根据当前学习进度，练习对应知识点试题</CardDescription>
          </CardHeader>
        </Card>
        <Card className="hover:shadow-md transition-shadow opacity-60">
          <CardHeader>
            <Target className="h-8 w-8 text-primary mb-2" />
            <CardTitle>考点专练</CardTitle>
            <CardDescription>选择特定考点，集中突破薄弱环节（即将推出）</CardDescription>
          </CardHeader>
        </Card>
        <Card className="hover:shadow-md transition-shadow opacity-60">
          <CardHeader>
            <Clock className="h-8 w-8 text-primary mb-2" />
            <CardTitle>模拟考场</CardTitle>
            <CardDescription>计时计分，模拟真实考试环境（即将推出）</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <h2 className="text-xl font-bold mb-4">选择课程开始练习</h2>
      <div className="space-y-6">
        {textbooks.map((tb) => (
          <div key={tb.id}>
            <h3 className="text-lg font-semibold mb-3">{tb.title}</h3>
            <div className="grid gap-2">
              {tb.units.map((unit) =>
                unit.lessons.map((lesson) => (
                  <Link key={lesson.id} href={`/practice/lesson/${lesson.id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <BookOpen className="h-5 w-5 text-primary" />
                          <span className="group-hover:text-primary transition-colors">
                            第{lesson.lessonNumber}课 {lesson.title}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">开始练习 →</span>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
