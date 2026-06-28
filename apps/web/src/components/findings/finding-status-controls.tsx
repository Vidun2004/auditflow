"use client";

import { useState } from "react";
import { updateFindingStatusAction } from "@/server/actions/finding.actions";
import { Spinner } from "@/components/loading";
import { cn } from "@/lib/utils";

type FindingStatus =
  | "OPEN"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED";

const STATUS_FLOW: Record<
  FindingStatus,
  { next: FindingStatus; label: string; style: string }[]
> = {
  OPEN: [
    {
      next: "ASSIGNED",
      label: "Mark Assigned",
      style: "border-blue-200 text-blue-700 hover:bg-blue-50",
    },
    {
      next: "IN_PROGRESS",
      label: "Start Progress",
      style: "border-gray-900 bg-gray-900 text-white hover:bg-gray-800",
    },
  ],
  ASSIGNED: [
    {
      next: "IN_PROGRESS",
      label: "Start Progress",
      style: "border-gray-900 bg-gray-900 text-white hover:bg-gray-800",
    },
  ],
  IN_PROGRESS: [
    {
      next: "RESOLVED",
      label: "Mark Resolved",
      style: "border-green-200 text-green-700 hover:bg-green-50",
    },
  ],
  RESOLVED: [
    {
      next: "CLOSED",
      label: "Close Finding",
      style: "border-gray-200 text-gray-600 hover:bg-gray-50",
    },
    {
      next: "IN_PROGRESS",
      label: "Reopen",
      style: "border-amber-200 text-amber-700 hover:bg-amber-50",
    },
  ],
  CLOSED: [
    {
      next: "OPEN",
      label: "Reopen Finding",
      style: "border-amber-200 text-amber-700 hover:bg-amber-50",
    },
  ],
};

interface Props {
  findingId: string;
  currentStatus: FindingStatus;
}

export function FindingStatusControls({ findingId, currentStatus }: Props) {
  const [loading, setLoading] = useState<FindingStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const transitions = STATUS_FLOW[currentStatus] ?? [];
  if (transitions.length === 0) return null;

  async function handleTransition(next: FindingStatus) {
    setLoading(next);
    setError(null);
    const result = await updateFindingStatusAction(findingId, next);
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
            className={cn(
              "flex w-full items-center justify-center gap-2 border px-3 py-2 text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
              t.style,
            )}
          >
            {loading === t.next && (
              <Spinner
                size="sm"
                className="border-gray-300 border-t-gray-600"
              />
            )}
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
