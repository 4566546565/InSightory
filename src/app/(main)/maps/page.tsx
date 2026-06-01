import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MapIcon } from "lucide-react";

export const metadata = { title: "历史地图集" };

export default function MapsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">历史地图集</h1>
      <p className="text-muted-foreground mb-8">动态展示疆域变迁、战争路线与贸易网络</p>
      <div className="text-center py-20">
        <MapIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">交互式历史地图即将推出</h2>
        <p className="text-muted-foreground">支持时间滑块查看疆域变化，配合关键事件解说</p>
      </div>
    </div>
  );
}
