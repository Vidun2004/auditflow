import Link from "next/link";
import { cn } from "@/lib/utils";
import type { DashboardData } from "@/server/services/dashboard.service";

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "border-gray-200 bg-gray-50 text-gray-600",
  SCHEDULED: "border-blue-200 bg-blue-50 text-blue-700",
  IN_PROGRESS: "border-amber-200 bg-amber-50 text-amber-700",
  COMPLETED: "border-green-200 bg-green-50 text-green-700",
  CANCELLED: "border-red-200 bg-red-50 text-red-700",
};

const TYPE_LABEL: Record<string, string> = {
  INTERNAL: "Internal",
  EXTERNAL: "External",
  SECURITY: "Security",
  VENDOR: "Vendor",
};

interface Props {
  audits: DashboardData["recentAudits"];
}

export function RecentAuditsTable({ audits }: Props) {
  return (
    <div className="border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
        <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
          Recent audits
        </p>
        <Link
          href="/audits"
          className="text-xs text-gray-500 underline underline-offset-2 hover:text-gray-900 transition-colors"
        >
          View all
        </Link>
      </div>

      {audits.length === 0 ? (
        <div className="flex h-40 items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-gray-400">No audits yet</p>
            <Link
              href="/audits/new"
              className="mt-2 inline-block text-xs text-gray-900 underline underline-offset-2"
            >
              Create your first audit
            </Link>
          </div>
        </div>
      ) : (
        <table className="flat-table">
          <thead>
            <tr>
              <th>Audit</th>
              <th>Type</th>
              <th>Status</th>
              <th>Assignee</th>
              <th>Due</th>
            </tr>
          </thead>
          <tbody>
            {audits.map((audit) => (
              <tr key={audit.id}>
                <td>
                  <Link
                    href={`/audits/${audit.id}`}
                    className="font-medium text-gray-900 hover:underline"
                  >
                    {audit.title}
                  </Link>
                  {audit.department && (
                    <span className="ml-2 text-xs text-gray-400">
                      {audit.department}
                    </span>
                  )}
                </td>
                <td className="text-gray-500">
                  {TYPE_LABEL[audit.type] ?? audit.type}
                </td>
                <td>
                  <span
                    className={cn(
                      "border px-2 py-0.5 text-xs font-medium",
                      STATUS_STYLES[audit.status] ??
                        "border-gray-200 bg-gray-50 text-gray-600",
                    )}
                  >
                    {audit.status.replace("_", " ")}
                  </span>
                </td>
                <td className="text-gray-500">
                  {audit.assignees[0]?.name ?? audit.assignees[0]?.email ?? "—"}
                </td>
                <td className="text-gray-500">
                  {audit.endDate
                    ? new Date(audit.endDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
