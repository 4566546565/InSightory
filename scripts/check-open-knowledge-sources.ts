import assert from "node:assert/strict";
import {
  getKnowledgeSourcesByUseCase,
  openKnowledgeSources,
} from "../src/data/open-knowledge-sources";

assert.ok(
  openKnowledgeSources.some((source) => source.id === "openhistoricalmap"),
  "OpenHistoricalMap must be registered as a historical map overlay source"
);

const recommended = [...openKnowledgeSources].sort((a, b) => b.priority - a.priority);
assert.deepEqual(
  openKnowledgeSources.map((source) => source.id),
  recommended.map((source) => source.id),
  "knowledge sources should be sorted by descending priority"
);

const mapSources = getKnowledgeSourcesByUseCase("historical-map");
assert.equal(mapSources[0]?.id, "openhistoricalmap");
assert.ok(
  mapSources.every((source) => source.useCases.includes("historical-map")),
  "historical-map filter should only return historical map sources"
);

const pipelineSources = getKnowledgeSourcesByUseCase("ingestion-pipeline");
assert.ok(
  pipelineSources.some((source) => source.id === "ragflow"),
  "RAGFlow should be available for ingestion-pipeline workflows"
);

console.log("open knowledge source checks passed");
