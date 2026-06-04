import { openKnowledgeSources } from "@/data/open-knowledge-sources";
import type { KnowledgePointLike, SourceReference } from "./types";

const byId = new Map(openKnowledgeSources.map((source) => [source.id, source]));

export function normalizeSourceReference(sourceId: string, url: string, license?: string): SourceReference {
  const source = byId.get(sourceId);
  if (!source) throw new Error(`Unknown knowledge source: ${sourceId}`);
  return {
    sourceId,
    title: source.name,
    url,
    license: license ?? source.license,
    requiresReview: source.status !== "ready",
  };
}

export function chooseExternalSources(point: Pick<KnowledgePointLike, "title" | "tags">) {
  const text = `${point.title} ${point.tags.join(" ")}`;
  const sourceIds = new Set<string>(["wikidata"]);

  if (/地图|疆域|路线|航路|丝绸之路|新航路|战争|殖民|边疆|地理/.test(text)) {
    sourceIds.add("openhistoricalmap");
  }

  if (/世界|文明|欧洲|美洲|殖民|工业革命|新航路|罗马|希腊|法国|英国|美国|苏联/.test(text)) {
    sourceIds.add("openstax-world-history");
  }

  if (/史料|文献|图像|材料|实证|阅读/.test(text)) {
    sourceIds.add("oer-commons");
  }

  if (/制度|文化|思想|法律|政治|概念|关系/.test(text)) {
    sourceIds.add("openkg-openconcepts");
  }

  sourceIds.add("ragflow");

  return openKnowledgeSources.filter((source) => sourceIds.has(source.id));
}

export type WikidataEntityCandidate = {
  id: string;
  label: string;
  description?: string;
  url: string;
};

export async function searchWikidataEntities(query: string, limit = 5): Promise<WikidataEntityCandidate[]> {
  const url = new URL("https://www.wikidata.org/w/api.php");
  url.searchParams.set("action", "wbsearchentities");
  url.searchParams.set("format", "json");
  url.searchParams.set("language", "zh");
  url.searchParams.set("uselang", "zh");
  url.searchParams.set("search", query);
  url.searchParams.set("limit", String(limit));

  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Wikidata search failed: ${response.status}`);
  const data = await response.json() as {
    search?: Array<{ id: string; label: string; description?: string; concepturi?: string }>;
  };

  return (data.search ?? []).map((item) => ({
    id: item.id,
    label: item.label,
    description: item.description,
    url: item.concepturi ?? `https://www.wikidata.org/wiki/${item.id}`,
  }));
}

export function buildCandidateSourceRefs(point: Pick<KnowledgePointLike, "title" | "tags">): SourceReference[] {
  return chooseExternalSources(point).map((source) => {
    if (source.id === "wikidata") {
      return normalizeSourceReference(source.id, `https://www.wikidata.org/w/index.php?search=${encodeURIComponent(point.title)}`);
    }
    if (source.id === "openhistoricalmap") {
      return normalizeSourceReference(source.id, "https://www.openhistoricalmap.org/");
    }
    if (source.id === "openstax-world-history") {
      return normalizeSourceReference(source.id, "https://openstax.org/subjects/humanities");
    }
    if (source.id === "oer-commons") {
      return normalizeSourceReference(source.id, `https://www.oercommons.org/search?f.search=${encodeURIComponent(point.title)}`);
    }
    if (source.id === "openkg-openconcepts") {
      return normalizeSourceReference(source.id, "https://github.com/OpenKG-ORG/OpenConcepts");
    }
    return normalizeSourceReference(source.id, source.url);
  });
}
