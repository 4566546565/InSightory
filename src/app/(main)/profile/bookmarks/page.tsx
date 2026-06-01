import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookMarked } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = { title: "我的收藏" };

export default async function BookmarksPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const bookmarks = await db.bookmark.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const kpIds = bookmarks.filter((b) => b.targetType === "KNOWLEDGE_POINT").map((b) => b.targetId);
  const questionIds = bookmarks.filter((b) => b.targetType === "QUESTION").map((b) => b.targetId);

  const [kps, questions] = await Promise.all([
    kpIds.length > 0
      ? db.knowledgePoint.findMany({
          where: { id: { in: kpIds } },
          select: {
            id: true, title: true,
            lesson: { select: { id: true, unit: { select: { id: true, textbookId: true } } } },
          },
        })
      : [],
    questionIds.length > 0
      ? db.question.findMany({ where: { id: { in: questionIds } }, select: { id: true, stem: true } })
      : [],
  ]);

  const kpMap = new Map(kps.map((kp) => [kp.id, kp]));
  const qMap = new Map(questions.map((q) => [q.id, q]));

  function getBookmarkTitle(bm: { targetType: string; targetId: string }): string {
    if (bm.targetType === "KNOWLEDGE_POINT") {
      return kpMap.get(bm.targetId)?.title || bm.targetId;
    }
    if (bm.targetType === "QUESTION") {
      const stem = qMap.get(bm.targetId)?.stem as { content?: Array<{ content?: Array<{ text?: string }> }> } | undefined;
      return stem?.content?.[0]?.content?.[0]?.text || "试题";
    }
    return bm.targetId;
  }

  function getBookmarkHref(bm: { targetType: string; targetId: string }): string | null {
    if (bm.targetType === "KNOWLEDGE_POINT") {
      const kp = kpMap.get(bm.targetId);
      if (kp) return `/knowledge/${kp.lesson.unit.textbookId}/${kp.lesson.unit.id}/${kp.lesson.id}/${kp.id}`;
    }
    return null;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">我的收藏</h1>
      {bookmarks.length === 0 ? (
        <div className="text-center py-20">
          <BookMarked className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">暂无收藏</h2>
          <p className="text-muted-foreground">浏览内容时可以收藏知识点和试题</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {bookmarks.map((bm) => {
            const href = getBookmarkHref(bm);
            const title = getBookmarkTitle(bm);
            const card = (
              <Card key={bm.id} className={href ? "hover:shadow-md transition-shadow cursor-pointer" : ""}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{bm.targetType === "KNOWLEDGE_POINT" ? "知识点" : bm.targetType === "QUESTION" ? "试题" : bm.targetType}</Badge>
                    <span className="text-xs text-muted-foreground">{formatDate(bm.createdAt)}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">{title}</p>
                </CardContent>
              </Card>
            );
            return href ? <Link key={bm.id} href={href}>{card}</Link> : card;
          })}
        </div>
      )}
    </div>
  );
}
