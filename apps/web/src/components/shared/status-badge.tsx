import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  label: string;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "neutral";
  className?: string;
}

const VARIANTS = {
  default: "border-gray-200 bg-gray-50 text-gray-600",
  success: "border-green-200 bg-green-50 text-green-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  danger: "border-red-200 bg-red-50 text-red-700",
  info: "border-blue-200 bg-blue-50 text-blue-700",
  neutral: "border-gray-200 bg-white text-gray-500",
};

export function StatusBadge({
  label,
  variant = "default",
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center border px-2 py-0.5 text-xs font-medium",
        VARIANTS[variant],
        className,
      )}
    >
      {label}
    </span>
  );
}

// ─── Audit status ─────────────────────────────────────────────────────────────

export function AuditStatusBadge({ status }: { status: string }) {
  const map: Record<
    string,
    { label: string; variant: StatusBadgeProps["variant"] }
  > = {
    DRAFT: { label: "Draft", variant: "neutral" },
    SCHEDULED: { label: "Scheduled", variant: "info" },
    IN_PROGRESS: { label: "In Progress", variant: "warning" },
    COMPLETED: { label: "Completed", variant: "success" },
    CANCELLED: { label: "Cancelled", variant: "danger" },
  };
  const cfg = map[status] ?? { label: status, variant: "default" };
  return <StatusBadge label={cfg.label} variant={cfg.variant} />;
}

// ─── Finding status ───────────────────────────────────────────────────────────

export function FindingStatusBadge({ status }: { status: string }) {
  const map: Record<
    string,
    { label: string; variant: StatusBadgeProps["variant"] }
  > = {
    OPEN: { label: "Open", variant: "danger" },
    ASSIGNED: { label: "Assigned", variant: "info" },
    IN_PROGRESS: { label: "In Progress", variant: "warning" },
    RESOLVED: { label: "Resolved", variant: "success" },
    CLOSED: { label: "Closed", variant: "neutral" },
  };
  const cfg = map[status] ?? { label: status, variant: "default" };
  return <StatusBadge label={cfg.label} variant={cfg.variant} />;
}

// ─── Finding severity ─────────────────────────────────────────────────────────

export function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<
    string,
    { label: string; variant: StatusBadgeProps["variant"] }
  > = {
    LOW: { label: "Low", variant: "success" },
    MEDIUM: { label: "Medium", variant: "warning" },
    HIGH: { label: "High", variant: "danger" },
    CRITICAL: { label: "Critical", variant: "danger" },
  };
  const cfg = map[severity] ?? { label: severity, variant: "default" };
  return (
    <StatusBadge
      label={cfg.label}
      variant={cfg.variant}
      className={
        severity === "CRITICAL"
          ? "border-red-400 bg-red-100 text-red-800 font-semibold"
          : ""
      }
    />
  );
}

// ─── Action status ────────────────────────────────────────────────────────────

export function ActionStatusBadge({ status }: { status: string }) {
  const map: Record<
    string,
    { label: string; variant: StatusBadgeProps["variant"] }
  > = {
    OPEN: { label: "Open", variant: "danger" },
    ASSIGNED: { label: "Assigned", variant: "info" },
    IN_PROGRESS: { label: "In Progress", variant: "warning" },
    PENDING_REVIEW: { label: "Pending Review", variant: "neutral" },
    CLOSED: { label: "Closed", variant: "success" },
  };
  const cfg = map[status] ?? { label: status, variant: "default" };
  return <StatusBadge label={cfg.label} variant={cfg.variant} />;
}
