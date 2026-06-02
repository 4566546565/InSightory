import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Headphones } from "lucide-react";

export const metadata = { title: "微课资源" };

export default function LecturesPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">微课资源</h1>
      <p className="text-muted-foreground mb-8">5-15分钟重难点讲解，视频+音频，随时随地学习</p>
      <div className="text-center py-20">
        <Headphones className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">微课资源即将上线</h2>
        <p className="text-muted-foreground">支持视频微课与音频讲解，上下学路上也能学</p>
      </div>
    </div>
  );
}
