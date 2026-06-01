import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, ArrowLeft, ArrowRight, Eye, Calendar } from "lucide-react";
import { RichContent } from "@/components/knowledge/rich-content";

export async function generateMetadata({ params }: { params: Promise<{ guideId: string }> }) {
  const { guideId } = await params;
  const guide = await db.studyGuide.findUnique({ where: { id: guideId }, select: { title: true } });
  return { title: guide?.title || "学法指导" };
}

export default async function GuideDetailPage({
  params,
}: {
  params: Promise<{ guideId: string }>;
}) {
  const { guideId } = await params;

  const guide = await db.studyGuide.findUnique({
    where: { id: guideId },
  });

  if (!guide) notFound();

  // Increment view count
  await db.studyGuide.update({
    where: { id: guideId },
    data: { viewCount: { increment: 1 } },
  });

  // Get sibling guides in same category for navigation
  const siblings = await db.studyGuide.findMany({
    where: { category: guide.category },
    orderBy: { createdAt: "asc" },
    select: { id: true, title: true },
  });

  const currentIndex = siblings.findIndex(s => s.id === guideId);
  const prevGuide = currentIndex > 0 ? siblings[currentIndex - 1] : null;
  const nextGuide = currentIndex < siblings.length - 1 ? siblings[currentIndex + 1] : null;

  const categoryColors: Record<string, string> = {
    "答题模板": "from-primary via-primary/70 to-gold",
    "考试策略": "from-gold via-primary/60 to-primary/30",
    "记忆方法": "from-emerald-500/60 via-emerald-400/30 to-transparent",
    "复习计划": "from-blue-500/60 via-blue-400/30 to-transparent",
  };

  const gradientClass = categoryColors[guide.category] || "from-primary via-primary/70 to-gold";

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="mb-8">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link href="/guides" className="hover:text-primary transition-colors">学法指导</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">{guide.title}</span>
        </nav>

        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold font-serif text-foreground leading-tight">
              {guide.title}
            </h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <Badge variant="secondary" className="text-xs">{guide.category}</Badge>
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {guide.viewCount} 次查看
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {guide.createdAt.toLocaleDateString("zh-CN")}
              </span>
            </div>
            <div className="pattern-divider w-16 mt-3" />
          </div>
        </div>

        {/* Tags */}
        {guide.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {guide.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs px-2.5 py-1">{tag}</Badge>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <Card className="border-0 shadow-card overflow-hidden">
        <div className={`h-1 bg-gradient-to-r ${gradientClass}`} />
        <CardContent className="pt-6 pb-8 px-8">
          <RichContent content={guide.content} />
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="mt-6 pt-6 border-t flex items-center justify-between gap-4">
        <Link href="/guides">
          <Button variant="outline" size="sm" className="gap-2 rounded-xl group">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            返回列表
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          {prevGuide && (
            <Link href={`/guides/${prevGuide.id}`}>
              <Button variant="outline" size="sm" className="gap-1 rounded-xl group">
                <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
                <span className="hidden sm:inline max-w-[120px] truncate">{prevGuide.title}</span>
                <span className="sm:hidden">上一个</span>
              </Button>
            </Link>
          )}
          {nextGuide && (
            <Link href={`/guides/${nextGuide.id}`}>
              <Button variant="outline" size="sm" className="gap-1 rounded-xl group">
                <span className="hidden sm:inline max-w-[120px] truncate">{nextGuide.title}</span>
                <span className="sm:hidden">下一个</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
