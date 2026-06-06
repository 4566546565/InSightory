import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import { buildCandidateForKnowledgePoint } from "../src/lib/knowledge-expansion/candidates";
import {
  applyApprovedCandidate,
  persistCandidate,
  updateCandidateStatus,
} from "../src/lib/knowledge-expansion/persistence";

const db = new PrismaClient();

async function main() {
  const point = await db.knowledgePoint.findFirst({
    include: { _count: { select: { questionLinks: true } } },
  });
  assert.ok(point, "test needs at least one knowledge point");

  const originalPoint = {
    content: point.content,
    keyConcepts: point.keyConcepts,
    commonMisconceptions: point.commonMisconceptions,
  };
  const originalRelationIds = new Set(
    (
      await db.knowledgePointRelation.findMany({
        where: { sourceKpId: point.id },
        select: { id: true },
      })
    ).map((relation) => relation.id)
  );

  const candidate = buildCandidateForKnowledgePoint({
    id: point.id,
    title: point.title,
    tags: point.tags,
    content: point.content,
    keyConcepts: point.keyConcepts,
    commonMisconceptions: point.commonMisconceptions,
    mindMapJson: point.mindMapJson,
    questionCount: point._count.questionLinks,
  });

  try {
    const persisted = await persistCandidate(candidate);
    assert.equal(persisted.knowledgePointId, point.id);
    assert.equal(persisted.status, "needs_review");

    const approved = await updateCandidateStatus(persisted.id, "approved");
    assert.equal(approved.status, "approved");

    const applied = await applyApprovedCandidate(persisted.id);
    assert.equal(applied.status, "applied");
  } finally {
    const currentRelations = await db.knowledgePointRelation.findMany({
      where: { sourceKpId: point.id },
      select: { id: true },
    });
    const createdRelationIds = currentRelations
      .map((relation) => relation.id)
      .filter((id) => !originalRelationIds.has(id));

    if (createdRelationIds.length > 0) {
      await db.knowledgePointRelation.deleteMany({
        where: { id: { in: createdRelationIds } },
      });
    }

    await db.knowledgePoint.update({
      where: { id: point.id },
      data: originalPoint,
    });
    await db.knowledgeExpansionCandidate.deleteMany({ where: { id: candidate.id } });
  }
}

main()
  .then(async () => {
    await db.$disconnect();
    console.log("knowledge expansion persistence checks passed");
  })
  .catch(async (error) => {
    await db.$disconnect();
    console.error(error);
    process.exit(1);
  });
