import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = await db.extendedReading.findUnique({ where: { id } });
  if (!r) return { title: "未找到" };
  return { title: r.title };
}

export default async function ReadingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = await db.extendedReading.findUnique({ where: { id } });
  if (!r) notFound();

  const content = r.content as {
    intro?: string;
    sections?: { title: string; body: string }[];
    questions?: string[];
    refs?: string[];
  } | null;

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/readings" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        返回拓展阅读
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <Badge variant="secondary" className="gap-1">
            <BookOpen className="h-3 w-3" />
            {r.readingTime} 分钟阅读
          </Badge>
        </div>
        <h1 className="text-3xl font-bold font-serif leading-tight mb-3">{r.title}</h1>
        <p className="text-sm text-muted-foreground">{r.source}</p>
        {r.author && <p className="text-sm text-muted-foreground">作者：{r.author}</p>}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {(r.knowledgePointIds ?? []).map((t) => (
            <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
          ))}
        </div>
      </div>

      {/* Intro */}
      {content?.intro && (
        <p className="text-lg leading-relaxed text-foreground/85 mb-8 p-5 rounded-xl bg-[hsl(var(--muted))]/50 border border-[hsl(var(--border))]/50">
          {content.intro}
        </p>
      )}

      {/* Sections */}
      {content?.sections?.map((s, i) => (
        <div key={i} className="mb-8">
          <h2 className="text-xl font-bold font-serif mb-3">{s.title}</h2>
          <p className="text-[15px] leading-relaxed text-foreground/80">{s.body}</p>
        </div>
      ))}

      {/* Questions */}
      {content?.questions && content.questions.length > 0 && (
        <Card className="mt-10 border-[hsl(var(--primary))]/20 bg-[hsl(var(--primary))]/[0.02]">
          <CardContent className="pt-6">
            <h3 className="text-lg font-bold font-serif mb-4">延伸思考</h3>
            <ol className="space-y-3 list-decimal list-inside">
              {content.questions.map((q, i) => (
                <li key={i} className="text-sm leading-relaxed text-foreground/75">{q}</li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {/* References */}
      {content?.refs && content.refs.length > 0 && (
        <div className="mt-8 pt-6 border-t">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">参考资料</h3>
          <ul className="space-y-1.5">
            {content.refs.map((ref, i) => (
              <li key={i} className="text-xs text-muted-foreground">{ref}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
