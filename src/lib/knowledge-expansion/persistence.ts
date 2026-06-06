import { db } from "@/lib/db";
import { upsertCandidateMapOverlays } from "./map-overlays";
import type { CandidateStatus, KnowledgeExpansionCandidate } from "./types";

function doc(text: string) {
  return {
    type: "doc",
    content: [{ type: "paragraph", content: [{ type: "text", text }] }],
  };
}

export function toPersistedCandidate(candidate: KnowledgeExpansionCandidate) {
  return {
    id: candidate.id,
    knowledgePointId: candidate.knowledgePointId,
    title: candidate.title,
    status: candidate.status,
    gapSeverity: candidate.gapSeverity,
    missing: candidate.missing,
    suggestedContent: candidate.suggestedContent,
    keyConcepts: candidate.keyConcepts,
    misconceptions: candidate.commonMisconceptions,
    relations: candidate.relations,
    mapOverlays: candidate.mapOverlays,
    sourceRefs: candidate.sourceRefs,
  };
}

export async function persistCandidate(candidate: KnowledgeExpansionCandidate) {
  const data = toPersistedCandidate(candidate);
  return db.knowledgeExpansionCandidate.upsert({
    where: { id: candidate.id },
    update: data,
    create: data,
  });
}

export async function persistCandidates(candidates: KnowledgeExpansionCandidate[]) {
  const rows = [];
  for (const candidate of candidates) {
    rows.push(await persistCandidate(candidate));
  }
  return rows;
}

export async function updateCandidateStatus(id: string, status: CandidateStatus) {
  return db.knowledgeExpansionCandidate.update({
    where: { id },
    data: { status },
  });
}

export async function applyApprovedCandidate(id: string) {
  const candidate = await db.knowledgeExpansionCandidate.findUnique({ where: { id } });
  if (!candidate) throw new Error(`Candidate not found: ${id}`);
  if (candidate.status !== "approved") {
    throw new Error(`Candidate must be approved before applying: ${candidate.status}`);
  }

  await db.knowledgePoint.update({
    where: { id: candidate.knowledgePointId },
    data: {
      content: doc(candidate.suggestedContent),
      keyConcepts: candidate.keyConcepts ?? undefined,
      commonMisconceptions: candidate.misconceptions ?? undefined,
    },
  });

  const relations = Array.isArray(candidate.relations) ? candidate.relations : [];
  for (const relation of relations as Array<{ targetTitle?: string; relationType?: string }>) {
    if (!relation.targetTitle) continue;
    const target = await db.knowledgePoint.findFirst({
      where: { title: { contains: relation.targetTitle } },
      select: { id: true },
    });
    if (!target || target.id === candidate.knowledgePointId) continue;
    await db.knowledgePointRelation.upsert({
      where: {
        sourceKpId_targetKpId: {
          sourceKpId: candidate.knowledgePointId,
          targetKpId: target.id,
        },
      },
      update: { relationType: relation.relationType ?? "RELATED" },
      create: {
        sourceKpId: candidate.knowledgePointId,
        targetKpId: target.id,
        relationType: relation.relationType ?? "RELATED",
      },
    });
  }

  const mapOverlays = Array.isArray(candidate.mapOverlays) ? candidate.mapOverlays : [];
  await upsertCandidateMapOverlays(candidate.title, mapOverlays as Parameters<typeof upsertCandidateMapOverlays>[1]);

  return db.knowledgeExpansionCandidate.update({
    where: { id },
    data: { status: "applied", appliedAt: new Date() },
  });
}
