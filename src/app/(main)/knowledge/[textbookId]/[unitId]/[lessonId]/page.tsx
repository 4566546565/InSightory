import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Lightbulb, ArrowLeft, ArrowRight, Target, Bookmark } from "lucide-react";
import { LessonTabs } from "@/components/knowledge/lesson-tabs";

export async function generateMetadata({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const lesson = await db.lesson.findUnique({ where: { id: lessonId }, select: { title: true } });
  return { title: lesson?.title || "课程详情" };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ textbookId: string; unitId: string; lessonId: string }>;
}) {
  const { textbookId, unitId, lessonId } = await params;

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: {
      unit: {
        include: {
          textbook: { select: { id: true, title: true } },
          lessons: {
            orderBy: { sortOrder: "asc" },
            select: { id: true, title: true, lessonNumber: true },
          },
        },
      },
      knowledgePoints: {
        orderBy: { sortOrder: "asc" },
        select: { id: true, title: true, difficulty: true, tags: true, mindMapJson: true },
      },
    },
  });

  if (!lesson) notFound();
  if (lesson.unitId !== unitId || lesson.unit.textbookId !== textbookId) notFound();

  const backHref = `/knowledge/${textbookId}/${unitId}`;
  const textbookHref = `/knowledge/${textbookId}`;

  // Find prev/next lesson within the unit
  const lessons = lesson.unit.lessons;
  const currentIdx = lessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIdx > 0 ? lessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < lessons.length - 1 ? lessons[currentIdx + 1] : null;

  // Get the KP that contains the mindMapJson for the lesson-level mind map
  const rawMindMap = lesson.knowledgePoints.find(kp => kp.mindMapJson)?.mindMapJson ?? null;
  // Ensure mindMapData is a proper object (Prisma Json type may serialize as string)
  let mindMapData = rawMindMap;
  if (typeof rawMindMap === "string") {
    try { mindMapData = JSON.parse(rawMindMap); } catch { mindMapData = null; }
  }

  const objectives = lesson.learningObjectives
    ? lesson.learningObjectives.split(/[,，]/).map(s => s.trim()).filter(Boolean)
    : [];
  const terms = lesson.keyTerms
    ? lesson.keyTerms.split(/[,，]/).map(s => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="animate-fade-in-up">
      {/* ── Header ── */}
      <div className="mb-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link href="/knowledge" className="hover:text-primary transition-colors">知识库</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href={textbookHref} className="hover:text-primary transition-colors">{lesson.unit.textbook.title}</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href={backHref} className="hover:text-primary transition-colors">第{lesson.unit.unitNumber}单元</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">第{lesson.lessonNumber}课</span>
        </nav>

        {/* Title block */}
        <div className="flex items-start gap-4">
          <div className="date-stamp mt-1">
            <span className="date-stamp-month">第</span>
            <span className="date-stamp-day">{lesson.lessonNumber}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold font-serif text-foreground leading-tight">
              {lesson.title}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {lesson.unit.textbook.title} · 第{lesson.unit.unitNumber}单元
            </p>
            <div className="pattern-divider w-16 mt-3" />
          </div>
        </div>

        {/* Learning objectives */}
        {objectives.length > 0 && (
          <Card className="mt-5 border-0 shadow-card overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-primary/60 via-primary/40 to-transparent" />
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">学习目标</span>
              </div>
              <ul className="space-y-1.5">
                {objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary font-mono text-xs mt-0.5 shrink-0">{i + 1}.</span>
                    <span className="leading-relaxed">{obj}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Key terms strip */}
        {terms.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {terms.map((term) => (
              <Badge key={term} variant="secondary" className="text-xs px-2.5 py-1 gap-1">
                <Bookmark className="h-3 w-3" />
                {term}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* ── Tabs ── */}
      <LessonTabs
        content={lesson.content}
        summary={lesson.summary}
        terms={terms}
        mindMapData={mindMapData}
        knowledgePoints={lesson.knowledgePoints}
        textbookId={textbookId}
        unitId={unitId}
        lessonId={lessonId}
        lessonNumber={lesson.lessonNumber}
      />

      {/* ── Prev / Next Navigation ── */}
      <div className="flex items-center justify-between mt-10 pt-6 border-t">
        {prevLesson ? (
          <Link href={`/knowledge/${textbookId}/${unitId}/${prevLesson.id}`}>
            <Button variant="outline" size="sm" className="gap-2 h-auto py-3 px-4 rounded-xl group">
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
              <div className="text-left">
                <span className="text-[10px] text-muted-foreground block">上一课</span>
                <span className="text-sm font-medium">{prevLesson.title}</span>
              </div>
            </Button>
          </Link>
        ) : (
          <div />
        )}
        {nextLesson ? (
          <Link href={`/knowledge/${textbookId}/${unitId}/${nextLesson.id}`}>
            <Button variant="outline" size="sm" className="gap-2 h-auto py-3 px-4 rounded-xl group">
              <div className="text-right">
                <span className="text-[10px] text-muted-foreground block">下一课</span>
                <span className="text-sm font-medium">{nextLesson.title}</span>
              </div>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
