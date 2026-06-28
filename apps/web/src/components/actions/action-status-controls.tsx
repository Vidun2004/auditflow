"use client";

import { useState } from "react";
import { updateActionStatusAction } from "@/server/actions/action.actions";
import { Spinner } from "@/components/loading";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

type ActionStatus =
  | "OPEN"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "PENDING_REVIEW"
  | "CLOSED";

interface Transition {
  next: ActionStatus;
  label: string;
  style: string;
  minRole: UserRole[];
}

const STATUS_FLOW: Record<ActionStatus, Transition[]> = {
  OPEN: [
    {
      next: "ASSIGNED",
      label: "Assign",
      style: "border-blue-200 text-blue-700 hover:bg-blue-50",
      minRole: ["ADMIN", "AUDITOR", "MANAGER"],
    },
    {
      next: "IN_PROGRESS",
      label: "Start",
      style: "border-gray-900 bg-gray-900 text-white hover:bg-gray-800",
      minRole: ["ADMIN", "AUDITOR", "MANAGER", "EMPLOYEE"],
    },
  ],
  ASSIGNED: [
    {
      next: "IN_PROGRESS",
      label: "Start Progress",
      style: "border-gray-900 bg-gray-900 text-white hover:bg-gray-800",
      minRole: ["ADMIN", "AUDITOR", "MANAGER", "EMPLOYEE"],
    },
  ],
  IN_PROGRESS: [
    {
      next: "PENDING_REVIEW",
      label: "Submit for Review",
      style: "border-purple-200 text-purple-700 hover:bg-purple-50",
      minRole: ["ADMIN", "AUDITOR", "MANAGER", "EMPLOYEE"],
    },
  ],
  PENDING_REVIEW: [
    {
      next: "CLOSED",
      label: "Approve & Close",
      style: "border-green-200 text-green-700 hover:bg-green-50",
      minRole: ["ADMIN", "AUDITOR", "MANAGER"],
    },
    {
      next: "IN_PROGRESS",
      label: "Send Back",
      style: "border-amber-200 text-amber-700 hover:bg-amber-50",
      minRole: ["ADMIN", "AUDITOR", "MANAGER"],
    },
  ],
  CLOSED: [
    {
      next: "OPEN",
      label: "Reopen",
      style: "border-gray-200 text-gray-600 hover:bg-gray-50",
      minRole: ["ADMIN"],
    },
  ],
};

interface Props {
  actionId: string;
  currentStatus: ActionStatus;
  userRole: UserRole;
}

export function ActionStatusControls({
  actionId,
  currentStatus,
  userRole,
}: Props) {
  const [loading, setLoading] = useState<ActionStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const transitions = (STATUS_FLOW[currentStatus] ?? []).filter((t) =>
    t.minRole.includes(userRole),
  );

  if (transitions.length === 0) return null;

  async function handleTransition(next: ActionStatus) {
    setLoading(next);
    setError(null);
    const result = await updateActionStatusAction(actionId, next);
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
