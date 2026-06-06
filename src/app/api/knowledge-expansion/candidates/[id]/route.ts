import { requireRole } from "@/lib/auth-helpers";
import { apiError, apiSuccess } from "@/lib/errors";
import { applyApprovedCandidate, updateCandidateStatus } from "@/lib/knowledge-expansion/persistence";
import type { CandidateStatus } from "@/lib/knowledge-expansion/types";

const allowedStatuses = new Set<CandidateStatus>(["draft", "needs_review", "approved", "rejected", "applied"]);

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole("TEACHER", "ADMIN");
    const { id } = await params;
    const body = await req.json() as { status?: CandidateStatus; action?: "apply" };

    if (body.action === "apply") {
      const candidate = await applyApprovedCandidate(id);
      return apiSuccess(candidate);
    }

    if (!body.status || !allowedStatuses.has(body.status)) {
      return Response.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "候选状态不合法" } },
        { status: 400 }
      );
    }

    const candidate = await updateCandidateStatus(id, body.status);
    return apiSuccess(candidate);
  } catch (error) {
    return apiError(error);
  }
}
