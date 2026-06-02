import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Clock, FileText, BookMarked, Target } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = { title: "个人中心" };

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [noteCount, bookmarkCount, errorCount, totalStudyTime] = await Promise.all([
    db.note.count({ where: { userId: user.id } }),
    db.bookmark.count({ where: { userId: user.id } }),
    db.errorBookEntry.count({ where: { userId: user.id, isMastered: false } }),
    db.learningProgress.aggregate({ where: { userId: user.id }, _sum: { timeSpent: true } }),
  ]);

  const initials = user.name?.charAt(0) || "U";

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-xl">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
          <Badge className="ml-auto">
            {user.role === "STUDENT" ? "学生" : user.role === "TEACHER" ? "老师" : "管理员"}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">笔记</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{noteCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">收藏</CardTitle>
            <BookMarked className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookmarkCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">待复习错题</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{errorCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">学习时长</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor((totalStudyTime._sum.timeSpent || 0) / 60)} 分钟
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="shortcuts">
        <TabsList>
          <TabsTrigger value="shortcuts">快捷入口</TabsTrigger>
        </TabsList>
        <TabsContent value="shortcuts" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Link href="/profile/notes">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="flex items-center gap-4 p-4">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-semibold">我的笔记</h3>
                    <p className="text-sm text-muted-foreground">{noteCount} 条笔记</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/profile/errors">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="flex items-center gap-4 p-4">
                  <Target className="h-8 w-8 text-destructive" />
                  <div>
                    <h3 className="font-semibold">错题本</h3>
                    <p className="text-sm text-muted-foreground">{errorCount} 题待复习</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
