export const openHistoricalMapOverlay = {
  id: "openhistoricalmap",
  name: "OpenHistoricalMap 历史覆盖层",
  endpoint: "https://overpass-api.openhistoricalmap.org/api/interpreter",
  attribution: "Historical overlay data from OpenHistoricalMap contributors.",
  fields: ["name", "start_date", "end_date", "source", "license"],
};

function keywordPattern(keywords: string[]) {
  const clean = keywords
    .map((keyword) => keyword.trim())
    .filter(Boolean)
    .slice(0, 6);
  return clean.length > 0 ? clean.join("|") : "history|route|dynasty|empire";
}

export function getOhmOverlayQuery(keywords: string[], startYear?: number, endYear?: number) {
  const pattern = keywordPattern(keywords);
  const yearFilter = startYear && endYear
    ? `  // timeline ${startYear}..${endYear}`
    : "  // timeline any";

  const query = `[out:json][timeout:25];
(
  node["name"~"${pattern}",i];
  way["name"~"${pattern}",i];
  relation["name"~"${pattern}",i];
);
${yearFilter}
out tags center 50;`;

  return {
    endpoint: openHistoricalMapOverlay.endpoint,
    query,
  };
}

export type OhmElement = {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

export type OhmOverlayFeature = {
  id: string;
  title: string;
  coords?: [number, number];
  startDate?: string;
  endDate?: string;
  source?: string;
  license?: string;
};

export function normalizeOhmElements(elements: OhmElement[]): OhmOverlayFeature[] {
  return elements
    .map((element) => {
      const tags = element.tags ?? {};
      const lat = element.lat ?? element.center?.lat;
      const lon = element.lon ?? element.center?.lon;
      return {
        id: `${element.type}/${element.id}`,
        title: tags.name ?? tags["name:zh"] ?? `${element.type} ${element.id}`,
        coords: lat !== undefined && lon !== undefined ? [lon, lat] as [number, number] : undefined,
        startDate: tags.start_date,
        endDate: tags.end_date,
        source: tags.source,
        license: tags.license,
      };
    })
    .filter((feature) => feature.title.trim().length > 0);
}

export async function fetchOhmOverlayCandidates(keywords: string[], startYear?: number, endYear?: number) {
  const { endpoint, query } = getOhmOverlayQuery(keywords, startYear, endYear);
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ data: query }),
  });
  if (!response.ok) throw new Error(`OpenHistoricalMap query failed: ${response.status}`);
  const data = await response.json() as { elements?: OhmElement[] };
  return normalizeOhmElements(data.elements ?? []);
}
