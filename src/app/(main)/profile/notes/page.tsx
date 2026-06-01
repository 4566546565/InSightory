import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = { title: "我的笔记" };

function extractText(content: unknown): string {
  if (!content || typeof content !== "object") return "";
  const doc = content as { content?: Array<{ content?: Array<{ text?: string }> }> };
  return doc.content
    ?.map((block) => block.content?.map((inline) => inline.text || "").join("") || "")
    .join(" ")
    .trim() || "";
}

export default async function NotesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const notes = await db.note.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">我的笔记</h1>
      {notes.length === 0 ? (
        <div className="text-center py-20">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">暂无笔记</h2>
          <p className="text-muted-foreground">在知识库学习中选中文本即可添加笔记</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {notes.map((note) => (
            <Card key={note.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{note.targetType}</Badge>
                  <span className="text-xs text-muted-foreground">{formatDate(note.updatedAt)}</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {extractText(note.content)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
