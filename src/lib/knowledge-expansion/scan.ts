import { db } from "@/lib/db";
import { buildCandidateForKnowledgePoint, classifyGap, summarizeCandidates } from "./candidates";
import { chooseExternalSources } from "./external-sources";
import { buildKnowledgeGraphPreview } from "./knowledge-graph";
import type { KnowledgePointLike } from "./types";

export async function scanKnowledgeExpansion(limit = 24) {
  const points = await db.knowledgePoint.findMany({
    orderBy: [{ difficulty: "desc" }, { sortOrder: "asc" }],
    take: limit,
    include: {
      lesson: { select: { title: true } },
      _count: { select: { questionLinks: true } },
    },
  });

  const normalized: Array<KnowledgePointLike & { lessonTitle: string; sources: ReturnType<typeof chooseExternalSources> }> =
    points.map((point) => ({
      id: point.id,
      title: point.title,
      tags: point.tags,
      content: point.content,
      keyConcepts: point.keyConcepts,
      commonMisconceptions: point.commonMisconceptions,
      mindMapJson: point.mindMapJson,
      questionCount: point._count.questionLinks,
      lessonTitle: point.lesson.title,
      sources: chooseExternalSources(point),
    }));

  const gaps = normalized.map((point) => ({
    id: point.id,
    title: point.title,
    lessonTitle: point.lessonTitle,
    questionCount: point.questionCount,
    sources: point.sources.map((source) => source.shortName),
    ...classifyGap(point),
  }));

  const candidates = normalized
    .filter((point) => classifyGap(point).severity !== "low")
    .slice(0, 8)
    .map((point) => buildCandidateForKnowledgePoint(point, point.sources));

  const graph = buildKnowledgeGraphPreview(
    normalized.slice(0, 16).map((point) => ({
      id: point.id,
      title: point.title,
      tags: point.tags,
      lessonTitle: point.lessonTitle,
    }))
  );

  return {
    generatedAt: new Date().toISOString(),
    scanned: normalized.length,
    gaps,
    candidates,
    candidateSummary: summarizeCandidates(candidates),
    graph,
  };
}
