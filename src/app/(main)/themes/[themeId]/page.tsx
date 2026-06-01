import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ArrowLeft, Clock, BookOpen, ChevronDown, ChevronUp } from "lucide-react";

interface SectionContent {
  points?: string[];
  keyTerms?: string[];
}

export async function generateMetadata({ params }: { params: Promise<{ themeId: string }> }) {
  const { themeId } = await params;
  const theme = await db.theme.findUnique({ where: { id: themeId }, select: { title: true } });
  return { title: theme?.title || "专题详情" };
}

export default async function ThemeDetailPage({
  params,
}: {
  params: Promise<{ themeId: string }>;
}) {
  const { themeId } = await params;

  const theme = await db.theme.findUnique({
    where: { id: themeId },
    include: {
      sections: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!theme) notFound();

  const categoryLabels: Record<string, string> = {
    CHINESE: "中国史专题",
    WORLD: "世界史专题",
    COMPARISON: "中外对比专题",
  };

  const categoryColors: Record<string, string> = {
    CHINESE: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    WORLD: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    COMPARISON: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  };

  const categoryBorders: Record<string, string> = {
    CHINESE: "border-red-200 dark:border-red-800",
    WORLD: "border-blue-200 dark:border-blue-800",
    COMPARISON: "border-purple-200 dark:border-purple-800",
  };

  return (
    <div className="animate-fade-in-up">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/themes" className="hover:text-primary transition-colors">专题史贯通</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-medium">{theme.title}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <Badge className={`text-xs ${categoryColors[theme.category] || ""}`}>
            {categoryLabels[theme.category] || theme.category}
          </Badge>
          {theme.eraStart && theme.eraEnd && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {theme.eraStart} — {theme.eraEnd}
            </span>
          )}
        </div>
        <h1 className="text-3xl font-bold font-serif text-foreground mb-3">
          {theme.title}
        </h1>
        {theme.description && (
          <p className="text-muted-foreground leading-relaxed max-w-3xl">
            {theme.description}
          </p>
        )}
        <div className="pattern-divider w-16 mt-4" />
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {theme.sections.map((section, idx) => {
          const content = section.content as SectionContent | null;
          const points = content?.points || [];
          const keyTerms = content?.keyTerms || [];

          return (
            <Card
              key={section.id}
              className={`border ${categoryBorders[theme.category] || "border-border"} overflow-hidden`}
            >
              <div className={`h-1 bg-gradient-to-r ${
                theme.category === "CHINESE" ? "from-red-500/60 via-red-400/40 to-transparent" :
                theme.category === "WORLD" ? "from-blue-500/60 via-blue-400/40 to-transparent" :
                "from-purple-500/60 via-purple-400/40 to-transparent"
              }`} />
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                    theme.category === "CHINESE" ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400" :
                    theme.category === "WORLD" ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400" :
                    "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400"
                  }`}>
                    {idx + 1}
                  </div>
                  <h2 className="text-lg font-serif font-bold text-foreground">
                    {section.title}
                  </h2>
                </div>

                {/* Knowledge Points */}
                {points.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {points.map((point, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-sm">
                        <span className="text-primary font-mono text-xs mt-0.5 shrink-0 w-5 text-right">
                          {i + 1}.
                        </span>
                        <span className="text-foreground/80 leading-relaxed">{point}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Key Terms */}
                {keyTerms.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-border/50">
                    {keyTerms.map((term) => (
                      <Badge key={term} variant="secondary" className="text-[10px] px-2 py-0.5">
                        {term}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Back button */}
      <div className="mt-10 pt-6 border-t">
        <Link href="/themes">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            返回专题列表
          </Button>
        </Link>
      </div>
    </div>
  );
}
