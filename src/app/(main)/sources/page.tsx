import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, Image, MapIcon, BarChart3, Landmark, Database, ArrowRight } from "lucide-react";

export const metadata = { title: "史料实证库" };

const categories = [
  { icon: Database, title: "开放知识源", desc: "登记 Wikidata、OpenHistoricalMap、RAGFlow 等扩充来源", count: "已配置", href: "/sources/knowledge-expansion" },
  { icon: FileText, title: "文献史料", desc: "一手记载片段，文言文配白话译文", count: "即将上线" },
  { icon: Image, title: "图像史料", desc: "历史照片、漫画、宣传画、文物图", count: "即将上线" },
  { icon: MapIcon, title: "地图素材", desc: "疆域变迁、战争路线、贸易路线", count: "即将上线" },
  { icon: BarChart3, title: "数据图表", desc: "人口、经济数据可视化", count: "即将上线" },
  { icon: Landmark, title: "实物史料", desc: "文物与考古发现资料", count: "即将上线" },
];

export default function SourcesPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">史料实证库</h1>
      <p className="text-muted-foreground mb-8">分类建设史料资源，培养"史料实证"核心素养</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <Card key={c.title} className="card-hover">
            <CardHeader>
              <div className="mb-2 flex items-start justify-between gap-3">
                <c.icon className="h-8 w-8 text-primary" />
                <span className="rounded-md bg-muted px-2 py-1 text-[10px] text-muted-foreground">{c.count}</span>
              </div>
              <CardTitle className="text-lg">{c.title}</CardTitle>
              <CardDescription>{c.desc}</CardDescription>
              {c.href && (
                <Link
                  href={c.href}
                  className="mt-3 inline-flex h-9 w-fit items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                >
                    查看方案
                    <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </CardHeader>
          </Card>
        ))}
      </div>
      <p className="text-center text-muted-foreground mt-8">史料实证库正在分阶段建设，开放知识源将作为内容扩充的审核入口。</p>
    </div>
  );
}
