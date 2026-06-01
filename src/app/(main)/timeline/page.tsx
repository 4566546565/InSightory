import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin } from "lucide-react";

export const metadata = { title: "时空轴" };

export default async function TimelinePage() {
  let events: Array<{
    id: string; title: string; description: string | null; startDate: string;
    endDate: string | null; category: string; dynasty: string | null; importance: number; tags: string[];
  }> = [];
  try {
    // 获取所有事件，然后在内存中按数字排序
    const allEvents = await db.timelineEvent.findMany({ take: 500 });
    events = allEvents.sort((a, b) => {
      const aNum = parseInt(a.startDate);
      const bNum = parseInt(b.startDate);
      return aNum - bNum;
    });
  } catch {
    events = [];
  }

  const chinaEvents = events.filter((e) => e.category === "CHINA");
  const worldEvents = events.filter((e) => e.category === "WORLD");

  function fmtDate(d: string) {
    if (d.startsWith("-")) {
      const n = parseInt(d.slice(1));
      if (n >= 10000) return `约${Math.round(n / 10000)}万年前`;
      return `公元前${d.slice(1)}年`;
    }
    return `${d}年`;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-serif">时空轴</h1>
        <div className="pattern-divider w-20 mt-3 mb-2" />
        <p className="text-muted-foreground">中外对照大事年表，纵横比较理解历史脉络</p>
      </div>

      <div className="grid gap-0 md:grid-cols-2 md:gap-8">
        {/* China Column */}
        <div>
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm pb-3 mb-4 border-b">
            <h2 className="text-xl font-serif font-bold flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
              中国
            </h2>
            <p className="text-xs text-muted-foreground">{chinaEvents.length} 条事件</p>
          </div>
          <div className="relative pl-6 border-l-2 border-red-200 dark:border-red-900 space-y-4">
            {chinaEvents.map((e, i) => (
              <div key={e.id} className="relative pb-4 group">
                <div className="absolute -left-[25px] top-1 w-3 h-3 rounded-full border-2 border-red-500 bg-background group-hover:scale-125 transition-transform" />
                <Card className="card-hover border-0 shadow-card overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="default" className="text-xs bg-red-500 hover:bg-red-600">{e.importance >= 5 ? "重大" : "重要"}</Badge>
                      <span className="text-xs text-muted-foreground font-mono">{fmtDate(e.startDate)}{e.endDate ? ` ~ ${e.endDate}年` : ""}</span>
                    </div>
                    <h3 className="font-semibold font-serif">{e.title}</h3>
                    {e.description && <p className="text-sm text-muted-foreground mt-1">{e.description}</p>}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* World Column */}
        <div>
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm pb-3 mb-4 border-b">
            <h2 className="text-xl font-serif font-bold flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
              世界
            </h2>
            <p className="text-xs text-muted-foreground">{worldEvents.length} 条事件</p>
          </div>
          <div className="relative pl-6 border-l-2 border-blue-200 dark:border-blue-900 space-y-4">
            {worldEvents.map((e) => (
              <div key={e.id} className="relative pb-4 group">
                <div className="absolute -left-[25px] top-1 w-3 h-3 rounded-full border-2 border-blue-500 bg-background group-hover:scale-125 transition-transform" />
                <Card className="card-hover border-0 shadow-card overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs bg-blue-500 hover:bg-blue-600 text-white">{e.importance >= 5 ? "重大" : "重要"}</Badge>
                      <span className="text-xs text-muted-foreground font-mono">{fmtDate(e.startDate)}{e.endDate ? ` ~ ${e.endDate}年` : ""}</span>
                    </div>
                    <h3 className="font-semibold font-serif">{e.title}</h3>
                    {e.description && <p className="text-sm text-muted-foreground mt-1">{e.description}</p>}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
