import { requireAuth } from "@/lib/auth-helpers";
import { apiError, apiSuccess } from "@/lib/errors";
import { scanKnowledgeExpansion } from "@/lib/knowledge-expansion/scan";
import { persistCandidates } from "@/lib/knowledge-expansion/persistence";

export async function GET(req: Request) {
  try {
    await requireAuth();
    const url = new URL(req.url);
    const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") || "24", 10) || 24, 1), 80);
    const persist = url.searchParams.get("persist") === "true";
    const result = await scanKnowledgeExpansion(limit);
    const persisted = persist ? await persistCandidates(result.candidates) : [];
    return apiSuccess({ ...result, persisted: persisted.length });
  } catch (error) {
    return apiError(error);
  }
}
