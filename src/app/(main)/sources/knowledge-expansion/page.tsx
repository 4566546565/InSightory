import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Database, ExternalLink, FileWarning, Map, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  knowledgeSourcePhases,
  openKnowledgeSources,
  statusLabels,
  useCaseLabels,
  type KnowledgeSourceStatus,
} from "@/data/open-knowledge-sources";

export const metadata = { title: "知识点扩充源" };

const statusStyles: Record<KnowledgeSourceStatus, string> = {
  ready: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  review: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  pipeline: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
};

const summaryCards = [
  { label: "开放来源", value: openKnowledgeSources.length, icon: Database },
  { label: "地图覆盖源", value: openKnowledgeSources.filter((s) => s.useCases.includes("historical-map")).length, icon: Map },
  { label: "需审核来源", value: openKnowledgeSources.filter((s) => s.status === "review").length, icon: FileWarning },
  { label: "工具链来源", value: openKnowledgeSources.filter((s) => s.status === "pipeline").length, icon: ShieldCheck },
];

export default function KnowledgeExpansionSourcesPage() {
  return (
    <div className="animate-fade-in-up space-y-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-lg border bg-[hsl(var(--muted))]/40 px-3 py-1 text-xs text-[hsl(var(--muted-foreground))]">
            <ShieldCheck className="h-3.5 w-3.5" />
            知识库扩充前置目录
          </div>
          <h1 className="text-3xl font-bold font-serif text-foreground">开放知识源与导入方案</h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
            这里登记可用于扩充高中历史知识库的开放资料源和工具链。第一阶段只做来源、用途、授权与接入方式管理，外部内容需要经过审核后再写入知识点、史料、地图和关系表。
          </p>
          <div className="pattern-divider mt-4 w-20" />
        </div>
        <Link
          href="/sources/knowledge-expansion/workbench"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors hover:bg-[hsl(var(--muted))]"
        >
          进入扩充工作台
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((item) => (
          <Card key={item.label} className="border bg-card">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10">
                <item.icon className="h-5 w-5 text-[hsl(var(--primary))]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{item.value}</div>
                <div className="text-xs text-[hsl(var(--muted-foreground))]">{item.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="rounded-lg border bg-[hsl(var(--muted))]/25 p-5">
        <div className="mb-4 flex items-center gap-2">
          <Map className="h-5 w-5 text-[hsl(var(--primary))]" />
          <h2 className="text-lg font-bold font-serif">和天地图的分工</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="mb-1 text-sm font-semibold">天地图</h3>
            <p className="text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
              继续作为现代中文底图，提供道路、地形、行政区和当前地理参照。
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <h3 className="mb-1 text-sm font-semibold">OpenHistoricalMap</h3>
            <p className="text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
              作为可开关的历史覆盖层，用于历史边界、路线、地点和时间属性。
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <h3 className="mb-1 text-sm font-semibold">项目自有数据</h3>
            <p className="text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
              保留教材口径，负责知识点、事件讲解、题目关联和人工校对后的地图注释。
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold font-serif">推荐来源目录</h2>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">按当前项目适配优先级排序。</p>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {openKnowledgeSources.map((source) => (
            <Card key={source.id} className="card-hover border bg-card">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10">
                      <source.icon className="h-5 w-5 text-[hsl(var(--primary))]" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-serif">{source.name}</CardTitle>
                      <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{source.bestFor}</p>
                    </div>
                  </div>
                  <Badge className={`shrink-0 text-[10px] ${statusStyles[source.status]}`}>
                    {statusLabels[source.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <p className="text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">{source.summary}</p>

                <div className="flex flex-wrap gap-1.5">
                  {source.useCases.map((useCase) => (
                    <Badge key={useCase} variant="outline" className="text-[10px]">
                      {useCaseLabels[useCase]}
                    </Badge>
                  ))}
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <div className="mb-1 text-xs font-semibold text-foreground">优势</div>
                    <ul className="space-y-1 text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">
                      {source.strengths.map((item) => (
                        <li key={item} className="flex gap-1.5">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="mb-1 text-xs font-semibold text-foreground">注意</div>
                    <ul className="space-y-1 text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">
                      {source.cautions.map((item) => (
                        <li key={item} className="flex gap-1.5">
                          <FileWarning className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="rounded-lg bg-[hsl(var(--muted))]/35 p-3 text-xs leading-relaxed">
                  <span className="font-semibold text-foreground">接入方式：</span>
                  <span className="text-[hsl(var(--muted-foreground))]">{source.integration}</span>
                </div>

                <div className="flex items-center justify-between gap-3 border-t pt-3 text-xs">
                  <span className="text-[hsl(var(--muted-foreground))]">授权：{source.license}</span>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-[hsl(var(--primary))] hover:underline"
                  >
                    查看来源
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold font-serif">推荐导入流程</h2>
        <div className="grid gap-3 md:grid-cols-4">
          {knowledgeSourcePhases.map((phase, index) => (
            <div key={phase.title} className="rounded-lg border bg-card p-4">
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--primary))] text-sm font-bold text-white">
                {index + 1}
              </div>
              <h3 className="mb-1 text-sm font-semibold">{phase.title}</h3>
              <p className="text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">{phase.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
