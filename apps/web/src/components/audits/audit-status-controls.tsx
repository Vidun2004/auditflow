"use client";

import { useState } from "react";
import { updateAuditStatusAction } from "@/server/actions/audit.actions";
import { Spinner } from "@/components/loading";

type AuditStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

const STATUS_FLOW: Record<AuditStatus, { next: AuditStatus; label: string }[]> =
  {
    DRAFT: [
      { next: "SCHEDULED", label: "Mark as Scheduled" },
      { next: "CANCELLED", label: "Cancel Audit" },
    ],
    SCHEDULED: [
      { next: "IN_PROGRESS", label: "Start Audit" },
      { next: "CANCELLED", label: "Cancel Audit" },
    ],
    IN_PROGRESS: [
      { next: "COMPLETED", label: "Complete Audit" },
      { next: "CANCELLED", label: "Cancel Audit" },
    ],
    COMPLETED: [],
    CANCELLED: [{ next: "DRAFT", label: "Reopen as Draft" }],
  };

interface Props {
  auditId: string;
  currentStatus: AuditStatus;
}

export function AuditStatusControls({ auditId, currentStatus }: Props) {
  const [loading, setLoading] = useState<AuditStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const transitions = STATUS_FLOW[currentStatus] ?? [];

  if (transitions.length === 0) return null;

  async function handleTransition(next: AuditStatus) {
    setLoading(next);
    setError(null);
    const result = await updateAuditStatusAction(auditId, next);
    if (!result.success) setError(result.error);
    setLoading(null);
  }

  return (
    <div className="border border-gray-200 bg-white p-4 space-y-3">
      <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
        Status actions
      </p>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="space-y-2">
        {transitions.map((t) => (
          <button
            key={t.next}
            onClick={() => handleTransition(t.next)}
            disabled={loading !== null}
            className={`flex w-full items-center justify-center gap-2 border px-3 py-2 text-xs font-medium transition-colors ${
              t.next === "CANCELLED"
                ? "border-red-200 text-red-600 hover:bg-red-50"
                : t.next === "COMPLETED"
                  ? "border-green-200 text-green-700 hover:bg-green-50"
                  : "border-gray-900 bg-gray-900 text-white hover:bg-gray-800"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading === t.next ? (
              <Spinner
                size="sm"
                className={
                  t.next === "CANCELLED" || t.next === "COMPLETED"
                    ? "border-gray-300 border-t-gray-600"
                    : "border-white border-t-gray-400"
                }
              />
            ) : null}
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
