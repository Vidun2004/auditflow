"use client";

import { useState } from "react";
import { updateRiskStatusAction } from "@/server/actions/risk.actions";
import { Spinner } from "@/components/loading";
import { cn } from "@/lib/utils";

type RiskStatus = "OPEN" | "MITIGATED" | "ACCEPTED" | "CLOSED";

const STATUS_FLOW: Record<
  RiskStatus,
  { next: RiskStatus; label: string; style: string }[]
> = {
  OPEN: [
    {
      next: "MITIGATED",
      label: "Mark Mitigated",
      style: "border-green-200 text-green-700 hover:bg-green-50",
    },
    {
      next: "ACCEPTED",
      label: "Accept Risk",
      style: "border-blue-200 text-blue-700 hover:bg-blue-50",
    },
  ],
  MITIGATED: [
    {
      next: "CLOSED",
      label: "Close Risk",
      style: "border-gray-200 text-gray-600 hover:bg-gray-50",
    },
    {
      next: "OPEN",
      label: "Reopen",
      style: "border-amber-200 text-amber-700 hover:bg-amber-50",
    },
  ],
  ACCEPTED: [
    {
      next: "CLOSED",
      label: "Close Risk",
      style: "border-gray-200 text-gray-600 hover:bg-gray-50",
    },
    {
      next: "OPEN",
      label: "Reopen",
      style: "border-amber-200 text-amber-700 hover:bg-amber-50",
    },
  ],
  CLOSED: [
    {
      next: "OPEN",
      label: "Reopen Risk",
      style: "border-amber-200 text-amber-700 hover:bg-amber-50",
    },
  ],
};

interface Props {
  riskId: string;
  currentStatus: RiskStatus;
}

export function RiskStatusControls({ riskId, currentStatus }: Props) {
  const [loading, setLoading] = useState<RiskStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const transitions = STATUS_FLOW[currentStatus] ?? [];
  if (transitions.length === 0) return null;

  async function handleTransition(next: RiskStatus) {
    setLoading(next);
    setError(null);
    const result = await updateRiskStatusAction(riskId, next);
    if (!result.success) setError(result.error);
    setLoading(null);
  }

  return (
    <div className="border border-gray-200 bg-white p-4 space-y-3">
      <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
        Risk actions
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
