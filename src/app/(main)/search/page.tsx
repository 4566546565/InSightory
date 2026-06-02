"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, FileText, FileQuestion } from "lucide-react";
import Link from "next/link";
import { RichContent } from "@/components/knowledge/rich-content";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState<{ knowledgePoints: Array<unknown>; questions: Array<unknown> } | null>(null);
  const [loading, setLoading] = useState(false);

  const doSearch = useCallback(async (q: string) => {
    if (!q) return;
    setLoading(true);
    const params = new URLSearchParams({ q });
    router.push(`/search?${params}`, { scroll: false });
    const res = await fetch(`/api/search?${params}`);
    const data = await res.json();
    if (data.success) setResults(data.data);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setQuery(q);
      doSearch(q);
    }
  }, [searchParams]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">搜索</h1>
        <form
          onSubmit={(e) => { e.preventDefault(); doSearch(query); }}
          className="flex gap-2"
        >
          <Input
            placeholder="搜索知识点、试题..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="max-w-xl"
          />
          <Button type="submit" disabled={loading}>
            {loading ? "搜索中..." : "搜索"}
          </Button>
        </form>
      </div>

      {loading && (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      )}

      {results && (
        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5" />知识点 ({results.knowledgePoints.length})
            </h2>
            {results.knowledgePoints.length === 0 ? (
              <p className="text-muted-foreground">未找到相关知识点</p>
            ) : (
              <div className="space-y-3">
                {(results.knowledgePoints as Array<{ id: string; title: string; difficulty: number; tags: string[]; lesson: { id: string; title: string; unit: { id: string; textbookId: string } } }>).map((kp) => (
                  <Link key={kp.id} href={`/knowledge/${kp.lesson.unit.textbookId}/${kp.lesson.unit.id}/${kp.lesson.id}/${kp.id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <h3 className="font-medium mb-1">{kp.title}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{kp.lesson.title}</Badge>
                          <Badge variant="secondary" className="text-xs">{"★".repeat(kp.difficulty)}</Badge>
                          {kp.tags?.slice(0, 3).map((t) => (
                            <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <FileQuestion className="h-5 w-5" />试题 ({results.questions.length})
            </h2>
            {results.questions.length === 0 ? (
              <p className="text-muted-foreground">未找到相关试题</p>
            ) : (
              <div className="space-y-3">
                {(results.questions as Array<{ id: string; type: string; difficulty: number; stem: unknown; tags: string[] }>).map((q) => (
                  <Card key={q.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge>{q.type === "MC" ? "单选" : q.type}</Badge>
                        <Badge variant="outline">{"★".repeat(q.difficulty)}</Badge>
                      </div>
                      <RichContent content={q.stem} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
