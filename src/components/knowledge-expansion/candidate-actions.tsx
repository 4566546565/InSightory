"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Database, Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CandidateStatus } from "@/lib/knowledge-expansion/types";

async function patchCandidate(id: string, body: unknown) {
  const response = await fetch(`/api/knowledge-expansion/candidates/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error?.message ?? "操作失败");
  }
}

export function CandidateActions({ id, status }: { id: string; status: CandidateStatus | string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  const run = async (label: string, body: unknown) => {
    setBusy(label);
    try {
      await patchCandidate(id, body);
      router.refresh();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        variant="outline"
        className="h-8 gap-1.5"
        disabled={!!busy || status === "approved" || status === "applied"}
        onClick={() => run("approve", { status: "approved" satisfies CandidateStatus })}
      >
        <Check className="h-3.5 w-3.5" />
        通过
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="h-8 gap-1.5"
        disabled={!!busy || status === "rejected" || status === "applied"}
        onClick={() => run("reject", { status: "rejected" satisfies CandidateStatus })}
      >
        <X className="h-3.5 w-3.5" />
        驳回
      </Button>
      <Button
        size="sm"
        className="h-8 gap-1.5"
        disabled={!!busy || status !== "approved"}
        onClick={() => run("apply", { action: "apply" })}
      >
        <Play className="h-3.5 w-3.5" />
        应用
      </Button>
    </div>
  );
}

export function PersistCandidatesButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const persist = async () => {
    setBusy(true);
    try {
      const response = await fetch("/api/knowledge-expansion/scan?limit=32&persist=true");
      if (!response.ok) throw new Error("保存候选失败");
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button className="h-10 gap-2" onClick={persist} disabled={busy}>
      <Database className="h-4 w-4" />
      {busy ? "保存中..." : "保存本轮候选"}
    </Button>
  );
}
