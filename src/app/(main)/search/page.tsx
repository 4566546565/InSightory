"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, FileText, FileQuestion, BookOpen } from "lucide-react";
import Link from "next/link";
import { RichContent } from "@/components/knowledge/rich-content";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState<{ lessons: Array<{ id: string; title: string; lessonNumber: number; unit: { id: string; title: string; textbook: { id: string; title: string } } }>; knowledgePoints: Array<{ id: string; title: string; difficulty: number; tags: string[]; lesson: { id: string; title: string; unit: { id: string; textbookId: string } } }>; questions: Array<{ id: string; type: string; difficulty: number; stem: unknown; tags: string[] }> } | null>(null);
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
            placeholder="搜索知识点、试题、课程..."
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
          <Skeleton className="h-24 w-full" />
        </div>
      )}

      {results && (
        <div className="space-y-8">
          {/* 课程 */}
          {results.lessons.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <BookOpen className="h-5 w-5" />课程 ({results.lessons.length})
              </h2>
              <div className="space-y-3">
                {results.lessons.map((lesson) => (
                  <Link key={lesson.id} href={`/knowledge/${lesson.unit.textbook.id}/${lesson.unit.id}/${lesson.id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <h3 className="font-medium mb-1">{lesson.title}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{lesson.unit.textbook.title}</Badge>
                          <Badge variant="secondary" className="text-xs">{lesson.unit.title}</Badge>
                          <Badge variant="outline" className="text-xs">第{lesson.lessonNumber}课</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 知识点 */}
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5" />知识点 ({results.knowledgePoints.length})
            </h2>
            {results.knowledgePoints.length === 0 ? (
              <p className="text-muted-foreground">未找到相关知识点</p>
            ) : (
              <div className="space-y-3">
                {results.knowledgePoints.map((kp) => (
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

          {/* 试题 */}
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <FileQuestion className="h-5 w-5" />试题 ({results.questions.length})
            </h2>
            {results.questions.length === 0 ? (
              <p className="text-muted-foreground">未找到相关试题</p>
            ) : (
              <div className="space-y-3">
                {results.questions.map((q) => (
                  <Link key={q.id} href="/practice">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge>{q.type === "MC" ? "单选" : q.type}</Badge>
                          <Badge variant="outline">{"★".repeat(q.difficulty)}</Badge>
                          {q.tags?.slice(0, 3).map((t) => (
                            <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                          ))}
                        </div>
                        <RichContent content={q.stem} />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
