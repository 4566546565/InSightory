import { db } from "@/lib/db";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, ChevronRight } from "lucide-react";

export const metadata = { title: "拓展阅读" };

export default async function ReadingsPage() {
  const readings = await db.extendedReading.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">拓展阅读</h1>
      <p className="text-muted-foreground mb-8">深度历史短文，拓展你的历史视野</p>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {readings.map((r) => {
          const content = r.content as { intro?: string; sections?: { title: string; body: string }[] } | null;
          const intro = content?.intro ?? "";
          const tags = r.knowledgePointIds ?? [];
          const tagColors = ["default", "secondary", "outline"] as const;

          return (
            <Link key={r.id} href={`/readings/${r.id}`} className="group">
              <Card className="h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-[hsl(var(--border))]/60 overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--gold))]" />
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                      <BookOpen className="h-3 w-3 mr-1" />
                      {r.readingTime} 分钟
                    </Badge>
                  </div>
                  <CardTitle className="text-base leading-snug group-hover:text-[hsl(var(--primary))] transition-colors line-clamp-2">
                    {r.title}
                  </CardTitle>
                  <CardDescription className="text-xs mt-1.5 line-clamp-2">
                    {r.source}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                    {intro}
                  </p>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {tags.slice(0, 3).map((t, i) => (
                        <Badge key={t} variant={tagColors[i % 3]} className="text-[10px] px-1.5 py-0 h-5">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-1 mt-3 text-xs text-[hsl(var(--primary))] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    开始阅读 <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
