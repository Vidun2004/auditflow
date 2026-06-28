import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireSession } from "@/lib/session";
import { getActions } from "@/server/services/action.service";
import { PageHeader } from "@/components/shared/page-header";
import {
  ActionStatusBadge,
  SeverityBadge,
} from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { SkeletonTable } from "@/components/loading";

export const metadata: Metadata = { title: "Corrective Actions" };

const STATUS_FILTERS = [
  "",
  "OPEN",
  "ASSIGNED",
  "IN_PROGRESS",
  "PENDING_REVIEW",
  "CLOSED",
];

interface Props {
  searchParams: Promise<{
    page?: string;
    status?: string;
    overdue?: string;
  }>;
}

async function ActionsListContent({ searchParams }: Props) {
  const params = await searchParams;
  const session = await requireSession();
  const page = Number(params.page ?? 1);

  const result = await getActions(session.orgId, {
    page,
    status: params.status as any,
    overdue: params.overdue === "1",
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {STATUS_FILTERS.map((s) => (
          <Link
            key={s}
            href={s ? `/actions?status=${s}` : "/actions"}
            className={`border px-3 py-1.5 text-xs font-medium transition-colors ${
              (params.status ?? "") === s && !params.overdue
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            {s === "" ? "All" : s.replace("_", " ")}
          </Link>
        ))}
        <div className="border-l border-gray-200 pl-2 ml-1">
          <Link
            href="/actions?overdue=1"
            className={`border px-3 py-1.5 text-xs font-medium transition-colors ${
              params.overdue === "1"
                ? "border-red-600 bg-red-600 text-white"
                : "border-red-200 text-red-600 hover:bg-red-50"
            }`}
          >
            Overdue only
          </Link>
        </div>
      </div>

      {/* Results */}
      {result.total > 0 && (
        <p className="text-xs text-gray-400">
          {result.total} action{result.total !== 1 ? "s" : ""}
        </p>
      )}

      {result.items.length === 0 ? (
        <EmptyState
          title="No corrective actions found"
          description="Actions are created from findings. Open a finding and add an action to get started."
          actionLabel="View findings"
          actionHref="/findings"
        />
      ) : (
        <>
          <div className="border border-gray-200 bg-white overflow-x-auto">
            <table className="flat-table min-w-full">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>Finding</th>
                  <th>Severity</th>
                  <th>Assignee</th>
                  <th>Due</th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((action) => {
                  const isOverdue =
                    action.dueDate &&
                    new Date(action.dueDate) < new Date() &&
                    action.status !== "CLOSED";

                  return (
                    <tr key={action.id}>
                      <td>
                        <Link
                          href={`/actions/${action.id}`}
                          className="font-medium text-gray-900 hover:underline"
                        >
                          {action.title}
                        </Link>
                        <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">
                          {action.finding.audit.title}
                        </p>
                      </td>
                      <td>
                        <ActionStatusBadge status={action.status} />
                      </td>
                      <td>
                        <div className="flex items-center gap-2 min-w-24">
                          <div className="flex-1 h-1.5 bg-gray-100">
                            <div
                              className="h-1.5 bg-gray-900 transition-all"
                              style={{ width: `${action.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 shrink-0 w-8 text-right">
                            {action.progress}%
                          </span>
                        </div>
                      </td>
                      <td>
                        <Link
                          href={`/findings/${action.finding.id}`}
                          className="text-xs text-gray-500 hover:text-gray-900 hover:underline"
                        >
                          {action.finding.title}
                        </Link>
                      </td>
                      <td>
                        <SeverityBadge severity={action.finding.severity} />
                      </td>
                      <td className="text-gray-500">
                        {action.assignee?.name ?? action.assignee?.email ?? "—"}
                      </td>
                      <td>
                        <span
                          className={`text-xs ${
                            isOverdue
                              ? "text-red-600 font-medium"
                              : "text-gray-500"
                          }`}
                        >
                          {action.dueDate
                            ? new Date(action.dueDate).toLocaleDateString(
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

export default async function ActionsPage({ searchParams }: Props) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Corrective Actions"
        description="Track and resolve all corrective actions linked to findings."
      />
      <Suspense fallback={<SkeletonTable rows={8} cols={7} />}>
        <ActionsListContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
