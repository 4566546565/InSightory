import Link from "next/link";
import { ArrowRight, BrainCircuit, FileCheck2, GitBranch, Map, ShieldAlert, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CandidateActions, PersistCandidatesButton } from "@/components/knowledge-expansion/candidate-actions";
import { db } from "@/lib/db";
import { scanKnowledgeExpansion } from "@/lib/knowledge-expansion/scan";
import { relationTypeLabels } from "@/lib/knowledge-expansion/knowledge-graph";

export const metadata = { title: "知识点扩充工作台" };

const gapLabels: Record<string, string> = {
  content: "正文",
  keyConcepts: "核心概念",
  commonMisconceptions: "易错点",
  mindMap: "思维导图",
  questionCoverage: "题目覆盖",
  sourceRefs: "来源引用",
  mapOverlay: "地图覆盖",
};

const severityStyles: Record<string, string> = {
  high: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  low: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
};

export default async function KnowledgeExpansionWorkbenchPage() {
  const scan = await scanKnowledgeExpansion(32);
  const persistedCandidates = await db.knowledgeExpansionCandidate.findMany({
    orderBy: { updatedAt: "desc" },
    take: 12,
  });
  const topGaps = scan.gaps.slice(0, 10);
  const topCandidates = scan.candidates.slice(0, 4);
  const topEdges = scan.graph.edges.slice(0, 8);

  return (
    <div className="animate-fade-in-up space-y-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-lg border bg-[hsl(var(--muted))]/40 px-3 py-1 text-xs text-[hsl(var(--muted-foreground))]">
            <Sparkles className="h-3.5 w-3.5" />
            V2-V5 工作台
          </div>
          <h1 className="text-3xl font-bold font-serif">知识点扩充工作台</h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
            从真实知识点扫描缺口，生成待审核候选内容，并预览外部来源、知识图谱关系和 OpenHistoricalMap 覆盖层。
          </p>
          <div className="pattern-divider mt-4 w-20" />
        </div>
        <Link
          href="/sources/knowledge-expansion"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium hover:bg-[hsl(var(--muted))]"
        >
          返回来源目录
          <ArrowRight className="h-4 w-4" />
        </Link>
        <PersistCandidatesButton />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <BrainCircuit className="h-8 w-8 text-primary" />
            <div><div className="text-2xl font-bold">{scan.scanned}</div><div className="text-xs text-muted-foreground">扫描知识点</div></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <ShieldAlert className="h-8 w-8 text-red-600" />
            <div><div className="text-2xl font-bold">{scan.candidateSummary.high}</div><div className="text-xs text-muted-foreground">高优先候选</div></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <GitBranch className="h-8 w-8 text-primary" />
            <div><div className="text-2xl font-bold">{scan.graph.edges.length}</div><div className="text-xs text-muted-foreground">关系候选</div></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Map className="h-8 w-8 text-teal-700" />
            <div><div className="text-2xl font-bold">{scan.candidateSummary.mapOverlay}</div><div className="text-xs text-muted-foreground">OHM 覆盖候选</div></div>
          </CardContent>
        </Card>
      </div>

      <section>
        <h2 className="mb-4 text-xl font-bold font-serif">V2 缺口扫描</h2>
        <div className="grid gap-3">
          {topGaps.map((gap) => (
            <Card key={gap.id}>
              <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{gap.title}</h3>
                    <Badge className={`text-[10px] ${severityStyles[gap.severity]}`}>{gap.severity}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{gap.lessonTitle} · 已关联题目 {gap.questionCount}</p>
                </div>
                <div className="flex max-w-2xl flex-wrap gap-1.5">
                  {gap.missing.map((item) => (
                    <Badge key={item} variant="outline" className="text-[10px]">{gapLabels[item] ?? item}</Badge>
                  ))}
                  {gap.sources.map((item) => (
                    <Badge key={item} variant="secondary" className="text-[10px]">{item}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold font-serif">V3 候选内容与来源引用</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {topCandidates.map((candidate) => (
            <Card key={candidate.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-base font-serif">{candidate.title}</CardTitle>
                  <Badge variant="secondary" className="text-[10px]">{candidate.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{candidate.suggestedContent}</p>
                <div className="flex flex-wrap gap-1.5">
                  {candidate.sourceRefs.slice(0, 4).map((ref) => (
                    <Badge key={`${candidate.id}-${ref.sourceId}`} variant="outline" className="text-[10px]">
                      {ref.title}{ref.requiresReview ? " · 审核" : ""}
                    </Badge>
                  ))}
                </div>
                <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
                  核心概念 {candidate.keyConcepts.length} 个 · 易错点 {candidate.commonMisconceptions.length} 个 · 关系 {candidate.relations.length} 条
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold font-serif">审核队列</h2>
        <div className="grid gap-3">
          {persistedCandidates.length === 0 && (
            <Card>
              <CardContent className="p-5 text-sm text-muted-foreground">
                还没有持久化候选。点击“保存本轮候选”后，可以在这里执行通过、驳回和应用。
              </CardContent>
            </Card>
          )}
          {persistedCandidates.map((candidate) => (
            <Card key={candidate.id}>
              <CardContent className="flex flex-col gap-4 p-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{candidate.title}</h3>
                    <Badge variant="secondary" className="text-[10px]">{candidate.status}</Badge>
                    <Badge className={`text-[10px] ${severityStyles[candidate.gapSeverity] ?? ""}`}>{candidate.gapSeverity}</Badge>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {candidate.suggestedContent}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {candidate.missing.map((item) => (
                      <Badge key={`${candidate.id}-${item}`} variant="outline" className="text-[10px]">
                        {gapLabels[item] ?? item}
                      </Badge>
                    ))}
                  </div>
                </div>
                <CandidateActions id={candidate.id} status={candidate.status} />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-serif">
              <GitBranch className="h-5 w-5 text-primary" />
              V4 知识图谱关系预览
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topEdges.map((edge) => {
              const source = scan.graph.nodes.find((node) => node.id === edge.sourceId);
              const target = scan.graph.nodes.find((node) => node.id === edge.targetId);
              return (
                <div key={`${edge.sourceId}-${edge.targetId}`} className="rounded-lg border p-3 text-sm">
                  <div className="font-medium">{source?.title} → {target?.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {relationTypeLabels[edge.relationType]} · 权重 {edge.weight} · {edge.reason}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-serif">
              <FileCheck2 className="h-5 w-5 text-primary" />
              V5 地图增强接入状态
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>历史地图集已增加 OHM 图层开关，天地图仍作为底图。</p>
            <p>候选内容会生成 OpenHistoricalMap Overpass 查询，审核后可写入 HistoricalMap.overlayJson。</p>
            <Link href="/atlas" className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
              打开历史地图集
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
