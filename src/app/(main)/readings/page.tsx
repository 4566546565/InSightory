import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookMarked } from "lucide-react";

export const metadata = { title: "拓展阅读" };

export default function ReadingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">拓展阅读</h1>
      <p className="text-muted-foreground mb-8">与课本相关的历史细节、学界观点、推荐书单</p>
      <div className="text-center py-20">
        <BookMarked className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">拓展阅读即将上线</h2>
        <p className="text-muted-foreground">提供深度阅读材料，拓展历史视野</p>
      </div>
    </div>
  );
}
