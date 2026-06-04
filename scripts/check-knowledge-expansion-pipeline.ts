import assert from "node:assert/strict";
import { buildCandidateForKnowledgePoint, classifyGap } from "../src/lib/knowledge-expansion/candidates";
import { chooseExternalSources, normalizeSourceReference } from "../src/lib/knowledge-expansion/external-sources";
import { buildKnowledgeGraphPreview, relationTypeLabels } from "../src/lib/knowledge-expansion/knowledge-graph";
import { getOhmOverlayQuery, openHistoricalMapOverlay } from "../src/lib/knowledge-expansion/ohm";

const samplePoint = {
  id: "kp-new-route",
  title: "新航路开辟的世界影响",
  tags: ["新航路", "世界市场", "殖民扩张"],
  content: null,
  keyConcepts: null,
  commonMisconceptions: null,
  mindMapJson: null,
  questionCount: 1,
};

const gap = classifyGap(samplePoint);
assert.equal(gap.severity, "high");
assert.ok(gap.missing.includes("content"));
assert.ok(gap.missing.includes("questionCoverage"));

const sources = chooseExternalSources(samplePoint);
assert.deepEqual(
  sources.slice(0, 3).map((source) => source.id),
  ["wikidata", "openhistoricalmap", "openstax-world-history"]
);

const candidate = buildCandidateForKnowledgePoint(samplePoint, sources);
assert.equal(candidate.status, "needs_review");
assert.equal(candidate.knowledgePointId, samplePoint.id);
assert.ok(candidate.suggestedContent.length > 80);
assert.ok(candidate.keyConcepts.length >= 3);
assert.ok(candidate.relations.some((relation) => relation.relationType === "CAUSES"));
assert.ok(candidate.mapOverlays.some((overlay) => overlay.provider === "openhistoricalmap"));
assert.ok(candidate.sourceRefs.every((ref) => ref.url.startsWith("https://")));

const ref = normalizeSourceReference("wikidata", "https://www.wikidata.org/wiki/Q123", "CC0");
assert.deepEqual(ref, {
  sourceId: "wikidata",
  title: "Wikidata",
  url: "https://www.wikidata.org/wiki/Q123",
  license: "CC0",
  requiresReview: false,
});

const graph = buildKnowledgeGraphPreview([
  { id: "a", title: "新航路开辟的原因与条件", tags: ["新航路"], lessonTitle: "全球航路的开辟" },
  { id: "b", title: "新航路开辟的世界影响", tags: ["新航路", "世界市场"], lessonTitle: "全球联系的建立" },
  { id: "c", title: "早期殖民扩张", tags: ["殖民扩张"], lessonTitle: "全球联系的建立" },
]);
assert.ok(graph.nodes.length === 3);
assert.ok(graph.edges.some((edge) => edge.relationType === "CAUSES" || edge.relationType === "RELATED"));
assert.equal(relationTypeLabels.CAUSES, "因果");

const ohmQuery = getOhmOverlayQuery(["新航路", "丝绸之路"], 1400, 1800);
assert.ok(ohmQuery.endpoint.includes("openhistoricalmap"));
assert.ok(ohmQuery.query.includes("timeline"));
assert.ok(openHistoricalMapOverlay.attribution.includes("OpenHistoricalMap"));

console.log("knowledge expansion pipeline checks passed");
