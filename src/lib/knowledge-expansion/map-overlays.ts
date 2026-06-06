import { db } from "@/lib/db";
import type { CandidateMapOverlay } from "./types";

export async function upsertCandidateMapOverlays(title: string, overlays: CandidateMapOverlay[]) {
  const ohmOverlays = overlays.filter((overlay) => overlay.provider === "openhistoricalmap");
  if (ohmOverlays.length === 0) return null;

  const mapTitle = "OpenHistoricalMap 候选覆盖层";
  const existing = await db.historicalMap.findUnique({
    where: { id: "ohm-candidate-overlays" },
    select: { overlayJson: true },
  });
  const existingOverlayJson = existing?.overlayJson as { overlays?: CandidateMapOverlay[] } | null;
  const merged = [...(existingOverlayJson?.overlays ?? []), ...ohmOverlays].reduce<CandidateMapOverlay[]>((acc, overlay) => {
    if (!acc.some((item) => item.title === overlay.title)) acc.push(overlay);
    return acc;
  }, []);

  return db.historicalMap.upsert({
    where: { id: "ohm-candidate-overlays" },
    update: {
      overlayJson: {
        provider: "openhistoricalmap",
        source: "knowledge-expansion-candidates",
        updatedFrom: title,
        overlays: merged,
      },
      annotations: {
        reviewRequired: true,
        attribution: "Historical overlay candidates from OpenHistoricalMap contributors.",
      },
    },
    create: {
      id: "ohm-candidate-overlays",
      title: mapTitle,
      description: "由知识点扩充候选生成的 OpenHistoricalMap 覆盖层，需人工校对后用于学生端。",
      era: "开放资料候选",
      startYear: -300,
      endYear: 2024,
      centerLat: 35,
      centerLng: 105,
      defaultZoom: 4,
      overlayJson: {
        provider: "openhistoricalmap",
        source: "knowledge-expansion-candidates",
        updatedFrom: title,
        overlays: merged,
      },
      annotations: {
        reviewRequired: true,
        attribution: "Historical overlay candidates from OpenHistoricalMap contributors.",
      },
    },
  });
}
