import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireSession } from "@/lib/session";
import {
  getRisks,
  getRiskMatrixData,
  getRiskLevel,
  LIKELIHOOD_LABELS,
  IMPACT_LABELS,
} from "@/server/services/risk.service";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { RiskMatrix } from "@/components/risks/risk-matrix";
import { SkeletonTable } from "@/components/loading";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Risk Register" };

const STATUS_FILTERS = ["", "OPEN", "MITIGATED", "ACCEPTED", "CLOSED"];

interface Props {
  searchParams: Promise<{
    page?: string;
    status?: string;
    view?: string;
  }>;
}

async function RisksContent({ searchParams }: Props) {
  const params = await searchParams;
  const session = await requireSession();
  const page = Number(params.page ?? 1);
  const view = params.view ?? "list";

  const [result, matrixData] = await Promise.all([
    getRisks(session.orgId, {
      page,
      status: params.status as any,
    }),
    getRiskMatrixData(session.orgId),
  ]);

  const canManage = ["ADMIN", "AUDITOR", "MANAGER"].includes(session.role);

  // High risk alert
  const criticalCount = result.items.filter((r) => r.score >= 15).length;
  const highCount = result.items.filter(
    (r) => r.score >= 10 && r.score < 15,
  ).length;

  return (
    <div className="space-y-6">
      {/* High risk alert */}
      {(criticalCount > 0 || highCount > 0) && (
        <div className="border border-red-200 bg-red-50 px-4 py-3 flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-red-700">
            ↑ Risk alert:
          </span>
          {criticalCount > 0 && (
            <span className="text-sm text-red-700">
              {criticalCount} critical risk{criticalCount !== 1 ? "s" : ""}
            </span>
          )}
          {criticalCount > 0 && highCount > 0 && (
            <span className="text-red-300">·</span>
          )}
          {highCount > 0 && (
            <span className="text-sm text-red-600">
              {highCount} high risk{highCount !== 1 ? "s" : ""}
            </span>
          )}
          <span className="text-sm text-red-500">
            require immediate attention.
          </span>
        </div>
      )}

      {/* View toggle + filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((s) => (
            <Link
              key={s}
              href={
                s ? `/risks?status=${s}&view=${view}` : `/risks?view=${view}`
              }
              className={`border px-3 py-1.5 text-xs font-medium transition-colors ${
                (params.status ?? "") === s
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {s === "" ? "All" : s}
            </Link>
          ))}
        </div>

        {/* List / Matrix toggle */}
        <div className="flex border border-gray-200">
          <Link
            href={`/risks?${params.status ? `status=${params.status}&` : ""}view=list`}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              view === "list"
                ? "bg-gray-900 text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            List
          </Link>
          <Link
            href={`/risks?${params.status ? `status=${params.status}&` : ""}view=matrix`}
            className={`border-l border-gray-200 px-3 py-1.5 text-xs font-medium transition-colors ${
              view === "matrix"
                ? "bg-gray-900 text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Matrix
          </Link>
        </div>
      </div>

      {/* Matrix view */}
      {view === "matrix" && (
        <div className="border border-gray-200 bg-white p-5">
          <p className="mb-4 text-xs font-medium uppercase tracking-wider text-gray-400">
            Risk matrix — {matrixData.length} active risk
            {matrixData.length !== 1 ? "s" : ""}
          </p>
          {matrixData.length === 0 ? (
            <EmptyState
              title="No active risks"
              description="Add risks to see them plotted on the matrix."
            />
          ) : (
            <RiskMatrix data={matrixData} />
          )}
        </div>
      )}

      {/* List view */}
      {view === "list" && (
        <>
          {result.items.length === 0 ? (
            <EmptyState
              title="No risks found"
              description="Register risks to track your organization's risk posture."
              actionLabel={canManage ? "Add risk" : undefined}
              actionHref={canManage ? "/risks/new" : undefined}
            />
          ) : (
            <>
              <div className="border border-gray-200 bg-white overflow-x-auto">
                <table className="flat-table min-w-full">
                  <thead>
                    <tr>
                      <th>Risk</th>
                      <th>Score</th>
                      <th>Level</th>
                      <th>Likelihood</th>
                      <th>Impact</th>
                      <th>Status</th>
                      <th>Owner</th>
                      <th>Review</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.items.map((risk) => {
                      const level = getRiskLevel(risk.score);
                      const isOverdueReview =
                        risk.reviewDate &&
                        new Date(risk.reviewDate) < new Date() &&
                        risk.status !== "CLOSED";

                      return (
                        <tr key={risk.id}>
                          <td>
                            <Link
                              href={`/risks/${risk.id}`}
                              className="font-medium text-gray-900 hover:underline"
                            >
                              {risk.name}
                            </Link>
                          </td>
                          <td>
                            <span
                              className={cn(
                                "inline-flex h-7 w-7 items-center justify-center border text-xs font-bold",
                                level.bg,
                                level.border,
                                level.color,
                              )}
                            >
                              {risk.score}
                            </span>
                          </td>
                          <td>
                            <span
                              className={cn(
                                "border px-2 py-0.5 text-xs font-medium",
                                level.bg,
                                level.border,
                                level.color,
                              )}
                            >
                              {level.label}
                            </span>
                          </td>
                          <td className="text-gray-500 text-xs">
                            {LIKELIHOOD_LABELS[risk.likelihood]}
                          </td>
                          <td className="text-gray-500 text-xs">
                            {IMPACT_LABELS[risk.impact]}
                          </td>
                          <td>
                            <span className="border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-600">
                              {risk.status}
                            </span>
                          </td>
                          <td className="text-gray-500">{risk.owner ?? "—"}</td>
                          <td>
                            <span
                              className={
                                isOverdueReview
                                  ? "text-red-600 text-xs font-medium"
                                  : "text-gray-500 text-xs"
                              }
                            >
                              {risk.reviewDate
                                ? new Date(risk.reviewDate).toLocaleDateString(
                                    "en-GB",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    },
                                  )
                                : "—"}
                              {isOverdueReview && " ↑"}
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
        </>
      )}
    </div>
  );
}

export default async function RisksPage({ searchParams }: Props) {
  const session = await requireSession();
  const canManage = ["ADMIN", "AUDITOR", "MANAGER"].includes(session.role);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Risk Register"
        description="Identify, assess, and manage organizational risks."
        actions={
          canManage ? (
            <Link
              href="/risks/new"
              className="bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
            >
              + New risk
            </Link>
          ) : undefined
        }
      />
      <Suspense fallback={<SkeletonTable rows={6} cols={8} />}>
        <RisksContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
