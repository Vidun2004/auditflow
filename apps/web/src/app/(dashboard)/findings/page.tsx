import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireSession } from "@/lib/session";
import { getFindings } from "@/server/services/finding.service";
import { PageHeader } from "@/components/shared/page-header";
import {
  SeverityBadge,
  FindingStatusBadge,
} from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { SkeletonTable } from "@/components/loading";

export const metadata: Metadata = { title: "Findings" };

interface Props {
  searchParams: Promise<{
    page?: string;
    status?: string;
    severity?: string;
    search?: string;
  }>;
}

const SEVERITY_ORDER = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
const STATUS_FILTERS = [
  "",
  "OPEN",
  "ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
];

async function FindingsListContent({ searchParams }: Props) {
  const params = await searchParams;
  const session = await requireSession();

  const page = Number(params.page ?? 1);
  const result = await getFindings(session.orgId, {
    page,
    status: params.status as any,
    severity: params.severity as any,
    search: params.search,
  });

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-wrap gap-3">
        {/* Status filters */}
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((s) => (
            <Link
              key={s}
              href={s ? `/findings?status=${s}` : "/findings"}
              className={`border px-3 py-1.5 text-xs font-medium transition-colors ${
                (params.status ?? "") === s
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {s === "" ? "All status" : s.replace("_", " ")}
            </Link>
          ))}
        </div>

        {/* Severity filters */}
        <div className="flex flex-wrap gap-1.5 border-l border-gray-200 pl-3">
          {["", ...SEVERITY_ORDER].map((sv) => (
            <Link
              key={sv}
              href={
                sv
                  ? `/findings?${params.status ? `status=${params.status}&` : ""}severity=${sv}`
                  : `/findings${params.status ? `?status=${params.status}` : ""}`
              }
              className={`border px-3 py-1.5 text-xs font-medium transition-colors ${
                (params.severity ?? "") === sv
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {sv === "" ? "All severity" : sv}
            </Link>
          ))}
        </div>
      </div>

      {/* Results count */}
      {result.total > 0 && (
        <p className="text-xs text-gray-400">
          {result.total} finding{result.total !== 1 ? "s" : ""}
        </p>
      )}

      {/* Table */}
      {result.items.length === 0 ? (
        <EmptyState
          title="No findings found"
          description="Findings are created within audits. Start by creating an audit."
          actionLabel="Go to Audits"
          actionHref="/audits"
        />
      ) : (
        <>
          <div className="border border-gray-200 bg-white overflow-x-auto">
            <table className="flat-table min-w-full">
              <thead>
                <tr>
                  <th>Finding</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Audit</th>
                  <th>Department</th>
                  <th>Assignee</th>
                  <th>Actions</th>
                  <th>Due</th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((finding) => {
                  const isOverdue =
                    finding.dueDate &&
                    new Date(finding.dueDate) < new Date() &&
                    finding.status !== "RESOLVED" &&
                    finding.status !== "CLOSED";

                  return (
                    <tr key={finding.id}>
                      <td>
                        <Link
                          href={`/findings/${finding.id}`}
                          className="font-medium text-gray-900 hover:underline"
                        >
                          {finding.title}
                        </Link>
                      </td>
                      <td>
                        <SeverityBadge severity={finding.severity} />
                      </td>
                      <td>
                        <FindingStatusBadge status={finding.status} />
                      </td>
                      <td>
                        <Link
                          href={`/audits/${finding.audit.id}`}
                          className="text-gray-500 hover:text-gray-900 hover:underline text-xs"
                        >
                          {finding.audit.title}
                        </Link>
                      </td>
                      <td className="text-gray-500">
                        {finding.department ?? "—"}
                      </td>
                      <td className="text-gray-500">
                        {finding.assignee?.name ??
                          finding.assignee?.email ??
                          "—"}
                      </td>
                      <td className="text-gray-500">
                        {finding._count.actions}
                      </td>
                      <td>
                        <span
                          className={
                            isOverdue
                              ? "text-red-600 font-medium text-xs"
                              : "text-gray-500 text-xs"
                          }
                        >
                          {finding.dueDate
                            ? new Date(finding.dueDate).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )
                            : "—"}
                          {isOverdue && " ↑"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            total={result.total}
            pageSize={result.pageSize}
          />
        </>
      )}
    </div>
  );
}

export default async function FindingsPage({ searchParams }: Props) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Findings"
        description="Track and resolve all audit findings across your organization."
      />
      <Suspense fallback={<SkeletonTable rows={8} cols={8} />}>
        <FindingsListContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
