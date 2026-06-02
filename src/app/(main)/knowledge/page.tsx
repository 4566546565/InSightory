import { getTextbooks } from "@/lib/cache";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ChevronRight, Layers, BookMarked } from "lucide-react";
import { DbErrorBanner } from "@/components/layout/db-error-banner";

export const metadata = { title: "同步知识库" };
export const revalidate = 3600;

const textbookIcons: Record<string, string> = {
  "纲要（上）": "📜",
  "纲要（下）": "🌍",
  "必修1": "🏛️",
  "必修2": "💰",
  "必修3": "🎭",
};

export default async function KnowledgePage() {
  let textbooks: Array<{ id: string; title: string; subtitle: string | null; volume: string; units: Array<{ _count: { lessons: number } }> }> = [];
  let dbError = false;
  try {
    textbooks = await getTextbooks();
  } catch { dbError = true; }

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(220 60% 35%)] shadow-lg shadow-[hsl(var(--primary))]/20">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-serif">同步知识库</h1>
            <p className="text-[hsl(var(--muted-foreground))] mt-0.5">基于部编版高中历史教材的同步学习资源</p>
          </div>
        </div>
        <div className="pattern-divider w-24" />
      </div>

      {dbError && <DbErrorBanner />}

      {/* Textbook Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {textbooks.map((tb, index) => {
          const totalLessons = tb.units.reduce((s, u) => s + u._count.lessons, 0);
          const icon = Object.entries(textbookIcons).find(([key]) => tb.title.includes(key))?.[1] || "📚";

          return (
            <Link key={tb.id} href={`/knowledge/${tb.id}`} className="group">
              <Card
                className="knowledge-card h-full cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[hsl(var(--muted))] to-[hsl(var(--background))] group-hover:from-[hsl(var(--primary))]/10 group-hover:to-[hsl(var(--primary))]/5 transition-all duration-300">
                        <span className="text-2xl">{icon}</span>
                      </div>
                      <div>
                        <CardTitle className="text-lg font-serif group-hover:text-[hsl(var(--primary))] transition-colors leading-tight">
                          {tb.title}
                        </CardTitle>
                        {tb.subtitle && (
                          <CardDescription className="mt-1 text-xs">{tb.subtitle}</CardDescription>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))] group-hover:translate-x-1 transition-all shrink-0" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-xs px-2.5 py-1 rounded-lg">
                      {tb.volume}
                    </Badge>
                    <Badge variant="outline" className="text-xs px-2.5 py-1 rounded-lg">
                      <Layers className="h-3 w-3 mr-1" />
                      {tb.units.length} 单元
                    </Badge>
                    <Badge variant="outline" className="text-xs px-2.5 py-1 rounded-lg">
                      <BookMarked className="h-3 w-3 mr-1" />
                      {totalLessons} 课
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Stats Summary */}
      {textbooks.length > 0 && (
        <div className="mt-12 p-6 rounded-2xl bg-[hsl(var(--muted))]/30 border border-[hsl(var(--border))]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-[hsl(var(--primary))]">{textbooks.length}</div>
              <div className="text-sm text-[hsl(var(--muted-foreground))] mt-1">本教材</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[hsl(var(--primary))]">
                {textbooks.reduce((s, t) => s + t.units.length, 0)}
              </div>
              <div className="text-sm text-[hsl(var(--muted-foreground))] mt-1">个单元</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[hsl(var(--primary))]">
                {textbooks.reduce((s, t) => s + t.units.reduce((s2, u) => s2 + u._count.lessons, 0), 0)}
              </div>
              <div className="text-sm text-[hsl(var(--muted-foreground))] mt-1">节课程</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[hsl(var(--gold))]">100%</div>
              <div className="text-sm text-[hsl(var(--muted-foreground))] mt-1">思维导图覆盖</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
