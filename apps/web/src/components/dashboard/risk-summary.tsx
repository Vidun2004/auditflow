import { cn } from "@/lib/utils";
import type { DashboardData } from "@/server/services/dashboard.service";

interface Props {
  riskSummary: DashboardData["riskSummary"];
}

const LEVELS = [
  {
    key: "critical" as const,
    label: "Critical",
    color: "bg-red-600",
    text: "text-red-700",
  },
  {
    key: "high" as const,
    label: "High",
    color: "bg-orange-500",
    text: "text-orange-700",
  },
  {
    key: "medium" as const,
    label: "Medium",
    color: "bg-amber-400",
    text: "text-amber-700",
  },
  {
    key: "low" as const,
    label: "Low",
    color: "bg-green-500",
    text: "text-green-700",
  },
];

export function RiskSummary({ riskSummary }: Props) {
  const total = Object.values(riskSummary).reduce((a, b) => a + b, 0);

  return (
    <div className="border border-gray-200 bg-white p-5">
      <p className="mb-4 text-xs font-medium uppercase tracking-wider text-gray-400">
        Risk level summary
      </p>

      {total === 0 ? (
        <p className="text-sm text-gray-400">No findings to assess risk.</p>
      ) : (
        <div className="space-y-3">
          {/* Bar */}
          <div className="flex h-2 w-full overflow-hidden">
            {LEVELS.map((level) => {
              const pct =
                total > 0 ? (riskSummary[level.key] / total) * 100 : 0;
              return pct > 0 ? (
                <div
                  key={level.key}
                  className={level.color}
                  style={{ width: `${pct}%` }}
                  title={`${level.label}: ${riskSummary[level.key]}`}
                />
              ) : null;
            })}
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2">
            {LEVELS.map((level) => (
              <div
                key={level.key}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-1.5">
                  <div className={cn("h-2 w-2 shrink-0", level.color)} />
                  <span className="text-xs text-gray-500">{level.label}</span>
                </div>
                <span className={cn("text-xs font-semibold", level.text)}>
                  {riskSummary[level.key]}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-2 flex justify-between">
            <span className="text-xs text-gray-400">Total findings</span>
            <span className="text-xs font-semibold text-gray-700">{total}</span>
          </div>
        </div>
      )}
    </div>
  );
}
