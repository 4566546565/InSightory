import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Layers, BookMarked } from "lucide-react";
import { DbErrorBanner } from "@/components/layout/db-error-banner";

export async function generateMetadata({ params }: { params: Promise<{ textbookId: string }> }) {
  const { textbookId } = await params;
  try {
    const tb = await db.textbook.findUnique({ where: { id: textbookId }, select: { title: true } });
    return { title: tb?.title || "教材详情" };
  } catch {
    return { title: "教材详情" };
  }
}

const textbookIcons: Record<string, string> = {
  "纲要（上）": "📜",
  "纲要（下）": "🌍",
  "必修1": "🏛️",
  "必修2": "💰",
  "必修3": "🎭",
};

export default async function TextbookPage({ params }: { params: Promise<{ textbookId: string }> }) {
  const { textbookId } = await params;
  let textbook = null as Record<string, unknown> | null;
  let dbError = false;

  try {
    textbook = await db.textbook.findUnique({
      where: { id: textbookId },
      include: {
        units: {
          orderBy: { sortOrder: "asc" },
          include: { lessons: { orderBy: { sortOrder: "asc" }, select: { id: true, title: true, lessonNumber: true } } },
        },
      },
    });
  } catch {
    dbError = true;
  }

  if (!dbError && !textbook) notFound();

  if (dbError || !textbook) {
    return (
      <div className="animate-fade-in-up">
        <Link href="/knowledge">
          <Button variant="ghost" size="sm" className="mb-4">
            <ChevronLeft className="h-4 w-4 mr-1" />返回知识库
          </Button>
        </Link>
        {dbError && <DbErrorBanner />}
      </div>
    );
  }

  const tb = textbook as { id: string; title: string; subtitle: string | null; volume: string; units: Array<{ id: string; title: string; unitNumber: number; description: string | null; lessons: Array<{ id: string; title: string; lessonNumber: number }> }> };
  const totalLessons = tb.units.reduce((s, u) => s + u.lessons.length, 0);
  const icon = Object.entries(textbookIcons).find(([key]) => tb.title.includes(key))?.[1] || "📚";

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="mb-8">
        <Link href="/knowledge">
          <Button variant="ghost" size="sm" className="mb-4">
            <ChevronLeft className="h-4 w-4 mr-1" />返回知识库
          </Button>
        </Link>

        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(220 60% 35%)] shadow-lg shadow-[hsl(var(--primary))]/20 shrink-0">
            <span className="text-3xl">{icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold font-serif text-foreground">{tb.title}</h1>
            {tb.subtitle && <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{tb.subtitle}</p>}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <Badge variant="secondary" className="text-xs px-2.5 py-1 rounded-lg">{tb.volume}</Badge>
              <Badge variant="outline" className="text-xs px-2.5 py-1 rounded-lg">
                <Layers className="h-3 w-3 mr-1" />
                {tb.units.length} 单元
              </Badge>
              <Badge variant="outline" className="text-xs px-2.5 py-1 rounded-lg">
                <BookMarked className="h-3 w-3 mr-1" />
                {totalLessons} 课
              </Badge>
            </div>
          </div>
        </div>
        <div className="pattern-divider w-24 mt-4" />
      </div>

      {/* Units */}
      <div className="space-y-4">
        {tb.units.map((unit, index) => (
          <div
            key={unit.id}
            className="knowledge-card rounded-xl overflow-hidden animate-fade-in-up"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <div className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] font-serif font-bold text-lg">
                  {unit.unitNumber}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold font-serif text-foreground">{unit.title}</h2>
                  {unit.description && (
                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5 line-clamp-1">{unit.description}</p>
                  )}
                </div>
                <Badge variant="outline" className="text-xs shrink-0">
                  {unit.lessons.length} 课
                </Badge>
              </div>

              <div className="grid gap-1.5">
                {unit.lessons.map((lesson) => (
                  <Link
                    key={lesson.id}
                    href={`/knowledge/${tb.id}/${unit.id}/${lesson.id}`}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors group"
                  >
                    <span className="text-xs text-[hsl(var(--muted-foreground))] font-mono w-14 shrink-0">
                      第{lesson.lessonNumber}课
                    </span>
                    <span className="text-sm font-medium text-foreground group-hover:text-[hsl(var(--primary))] transition-colors flex-1 truncate">
                      {lesson.title}
                    </span>
                    <ChevronRight className="h-4 w-4 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))] group-hover:translate-x-0.5 transition-all shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
