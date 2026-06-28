"use client";

import { useState } from "react";
import { updateFindingSeverityAction } from "@/server/actions/finding.actions";
import { Spinner } from "@/components/loading";
import { cn } from "@/lib/utils";

type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

const SEVERITIES: {
  value: Severity;
  label: string;
  style: string;
  activeStyle: string;
}[] = [
  {
    value: "LOW",
    label: "Low",
    style: "border-gray-200 text-gray-500 hover:border-green-300",
    activeStyle: "border-green-500 bg-green-50 text-green-700 font-semibold",
  },
  {
    value: "MEDIUM",
    label: "Medium",
    style: "border-gray-200 text-gray-500 hover:border-amber-300",
    activeStyle: "border-amber-500 bg-amber-50 text-amber-700 font-semibold",
  },
  {
    value: "HIGH",
    label: "High",
    style: "border-gray-200 text-gray-500 hover:border-orange-300",
    activeStyle: "border-orange-500 bg-orange-50 text-orange-700 font-semibold",
  },
  {
    value: "CRITICAL",
    label: "Critical",
    style: "border-gray-200 text-gray-500 hover:border-red-400",
    activeStyle: "border-red-500 bg-red-50 text-red-700 font-semibold",
  },
];

interface Props {
  findingId: string;
  currentSeverity: Severity;
}

export function FindingSeverityControls({ findingId, currentSeverity }: Props) {
  const [selected, setSelected] = useState<Severity>(currentSeverity);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(severity: Severity) {
    if (severity === selected) return;
    setLoading(true);
    setError(null);
    const result = await updateFindingSeverityAction(findingId, severity);
    if (result.success) {
      setSelected(severity);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }

  return (
    <div className="border border-gray-200 bg-white p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
          Severity
        </p>
        {loading && (
          <Spinner size="sm" className="border-gray-200 border-t-gray-600" />
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="grid grid-cols-2 gap-1.5">
        {SEVERITIES.map((s) => (
          <button
            key={s.value}
            onClick={() => handleChange(s.value)}
            disabled={loading}
            className={cn(
              "border px-2 py-1.5 text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
              selected === s.value ? s.activeStyle : s.style,
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
