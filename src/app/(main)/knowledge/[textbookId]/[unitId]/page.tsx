import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Lightbulb } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ unitId: string }> }) {
  const { unitId } = await params;
  const unit = await db.unit.findUnique({ where: { id: unitId }, select: { title: true } });
  return { title: unit?.title || "单元详情" };
}

export default async function UnitPage({ params }: { params: Promise<{ textbookId: string; unitId: string }> }) {
  const { textbookId, unitId } = await params;
  const unit = await db.unit.findUnique({
    where: { id: unitId },
    include: {
      textbook: { select: { id: true, title: true } },
      lessons: {
        orderBy: { sortOrder: "asc" },
        include: { _count: { select: { knowledgePoints: true } } },
      },
    },
  });

  if (!unit) notFound();

  const totalKPs = unit.lessons.reduce((s, l) => s + l._count.knowledgePoints, 0);

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="mb-8">
        <Link href={`/knowledge/${textbookId}`}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ChevronLeft className="h-4 w-4 mr-1" />返回{unit.textbook.title}
          </Button>
        </Link>

        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(220 60% 35%)] shadow-lg shadow-[hsl(var(--primary))]/20 shrink-0">
            <span className="text-2xl font-serif font-bold text-white">{unit.unitNumber}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold font-serif text-foreground">
              第{unit.unitNumber}单元 {unit.title}
            </h1>
            {unit.description && (
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{unit.description}</p>
            )}
            <div className="flex items-center gap-2 mt-3">
              <Badge variant="outline" className="text-xs px-2.5 py-1 rounded-lg">
                {unit.lessons.length} 课
              </Badge>
              <Badge variant="outline" className="text-xs px-2.5 py-1 rounded-lg">
                <Lightbulb className="h-3 w-3 mr-1" />
                {totalKPs} 知识点
              </Badge>
            </div>
          </div>
        </div>
        <div className="pattern-divider w-24 mt-4" />
      </div>

      {/* Lesson Cards */}
      <div className="grid gap-3">
        {unit.lessons.map((lesson, index) => (
          <Link
            key={lesson.id}
            href={`/knowledge/${textbookId}/${unitId}/${lesson.id}`}
          >
            <div
              className="knowledge-card rounded-xl p-4 cursor-pointer group transition-all duration-300 hover:scale-[1.01] animate-fade-in-up"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[hsl(var(--muted))] group-hover:bg-[hsl(var(--primary))]/10 transition-colors shrink-0">
                    <span className="text-sm font-serif font-bold text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))] transition-colors">
                      {lesson.lessonNumber}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground group-hover:text-[hsl(var(--primary))] transition-colors">
                      {lesson.title}
                    </h3>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                      第{lesson.lessonNumber}课 · {lesson._count.knowledgePoints} 个知识点
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))] group-hover:translate-x-1 transition-all shrink-0" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
