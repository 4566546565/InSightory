import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import { KnowledgePointTabs } from "@/components/knowledge/knowledge-point-tabs";

export async function generateMetadata({ params }: { params: Promise<{ kpId: string }> }) {
  const { kpId } = await params;
  const kp = await db.knowledgePoint.findUnique({ where: { id: kpId }, select: { title: true } });
  return { title: kp?.title || "知识点详情" };
}

export default async function KnowledgePointPage({
  params,
}: {
  params: Promise<{ textbookId: string; unitId: string; lessonId: string; kpId: string }>;
}) {
  const { textbookId, unitId, lessonId, kpId } = await params;

  const kp = await db.knowledgePoint.findUnique({
    where: { id: kpId },
    include: {
      lesson: {
        select: { id: true, title: true, lessonNumber: true, unit: { select: { id: true, unitNumber: true, textbookId: true } } },
      },
    },
  });

  if (!kp) notFound();

  const backHref = `/knowledge/${textbookId}/${unitId}/${lessonId}`;
  const keyConcepts = kp.keyConcepts as Array<{ term: string; definition: string }> | null;
  const misconceptions = kp.commonMisconceptions as Array<{ statement: string; correction: string }> | null;

  return (
    <div className="animate-fade-in-up">
      {/* ── Header ── */}
      <div className="mb-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link href="/knowledge" className="hover:text-primary transition-colors">知识库</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href={`/knowledge/${textbookId}`} className="hover:text-primary transition-colors">教材</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href={backHref} className="hover:text-primary transition-colors">第{kp.lesson.lessonNumber}课</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">{kp.title}</span>
        </nav>

        <div className="flex items-start gap-4">
          <div className="date-stamp mt-1">
            <span className="date-stamp-month">KP</span>
            <span className="date-stamp-day text-lg">{kp.difficulty}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold font-serif text-foreground leading-tight">{kp.title}</h1>
              <Badge variant="secondary" className="shrink-0">{"★".repeat(kp.difficulty)}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {kp.lesson.unit.textbookId ? "教材" : ""} · 第{kp.lesson.unit.unitNumber}单元 · 第{kp.lesson.lessonNumber}课 · {kp.lesson.title}
            </p>
            <div className="pattern-divider w-16 mt-3" />
          </div>
        </div>

        {/* Tags */}
        {kp.tags && kp.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {kp.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs px-2.5 py-1">{tag}</Badge>
            ))}
          </div>
        )}
      </div>

      {/* ── Tabs ── */}
      <KnowledgePointTabs
        content={kp.content}
        keyConcepts={keyConcepts}
        misconceptions={misconceptions}
        examRequirements={kp.examRequirements}
      />

      {/* ── Back to lesson ── */}
      <div className="mt-10 pt-6 border-t">
        <Link href={backHref}>
          <Button variant="outline" size="sm" className="gap-2 rounded-xl group">
            <ChevronRight className="h-4 w-4 rotate-180 group-hover:-translate-x-0.5 transition-transform" />
            返回第{kp.lesson.lessonNumber}课 · {kp.lesson.title}
          </Button>
        </Link>
      </div>
    </div>
  );
}
