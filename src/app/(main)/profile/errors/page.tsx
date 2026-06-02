import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

export const metadata = { title: "错题本" };

export default async function ErrorBookPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const errors = await db.errorBookEntry.findMany({
    where: { userId: user.id },
    orderBy: { lastWrongAt: "desc" },
    include: {
      question: { select: { id: true, type: true, stem: true, difficulty: true, tags: true, solution: true } },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">错题本</h1>
        {errors.length > 0 && (
          <Link href="/practice">
            <Button size="sm">智能练习</Button>
          </Link>
        )}
      </div>

      {errors.length === 0 ? (
        <div className="text-center py-20">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">错题本为空</h2>
          <p className="text-muted-foreground">答题中的错题会自动收录到这里</p>
        </div>
      ) : (
        <div className="space-y-4">
          {errors.map((entry) => {
            const stem = entry.question.stem as { content?: Array<{ content?: Array<{ text?: string }> }> };
            const text = stem?.content?.[0]?.content?.[0]?.text || "查看详情";

            return (
              <Card key={entry.id} className={entry.isMastered ? "opacity-60" : ""}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={entry.isMastered ? "secondary" : "destructive"}>
                        {entry.isMastered ? "已掌握" : `错${entry.wrongCount}次`}
                      </Badge>
                      <Badge variant="outline">{entry.question.type}</Badge>
                      <Badge variant="outline">{"★".repeat(entry.question.difficulty)}</Badge>
                    </div>
                  </div>
                  <CardTitle className="text-base mt-2">{text}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {entry.question.tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
