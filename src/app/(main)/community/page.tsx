import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MessageSquare, HelpCircle, Share2 } from "lucide-react";

export const metadata = { title: "学习社区" };

export default function CommunityPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">学习社区</h1>
      <p className="text-muted-foreground mb-8">师生交流、专题讨论、资源分享</p>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { icon: HelpCircle, title: "问答区", desc: "知识点和试题下方均可提问" },
          { icon: MessageSquare, title: "专题讨论", desc: "如\"秦始皇功过\"\"洋务运动评价\"" },
          { icon: Share2, title: "资源分享", desc: "上传笔记、思维导图（审核后发布）" },
        ].map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <item.icon className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">{item.title}</CardTitle>
              <CardDescription>{item.desc}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
      <p className="text-center text-muted-foreground mt-8">学习社区将在后续版本推出</p>
    </div>
  );
}
