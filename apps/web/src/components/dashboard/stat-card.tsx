import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  accent?: boolean;
  className?: string;
}

export function StatCard({
  label,
  value,
  subtext,
  trend,
  trendValue,
  accent,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "border border-gray-200 bg-white p-5 space-y-1",
        accent && "border-l-2 border-l-gray-900",
        className,
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
        {label}
      </p>
      <p className="text-3xl font-semibold tracking-tight text-gray-900">
        {value}
      </p>
      {(subtext || trendValue) && (
        <div className="flex items-center gap-1.5 pt-0.5">
          {trend && trendValue && (
            <span
              className={cn(
                "text-xs font-medium",
                trend === "up" && "text-red-600",
                trend === "down" && "text-green-600",
                trend === "neutral" && "text-gray-500",
              )}
            >
              {trend === "up" ? "↑" : trend === "down" ? "↓" : "–"} {trendValue}
            </span>
          )}
          {subtext && <span className="text-xs text-gray-400">{subtext}</span>}
        </div>
      )}
    </div>
  );
}
