import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireSession } from "@/lib/session";
import { getAudits } from "@/server/services/audit.service";
import { PageHeader } from "@/components/shared/page-header";
import { AuditStatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { SkeletonTable } from "@/components/loading";
import { AuditRow } from "@/hooks/AuditRow";

export const metadata: Metadata = { title: "Audits" };

const TYPE_LABEL: Record<string, string> = {
  INTERNAL: "Internal",
  EXTERNAL: "External",
  SECURITY: "Security",
  VENDOR: "Vendor",
};

interface Props {
  searchParams: Promise<{
    page?: string;
    status?: string;
    type?: string;
    search?: string;
  }>;
}

async function AuditListContent({ searchParams }: Props) {
  const params = await searchParams;
  const session = await requireSession();

  const page = Number(params.page ?? 1);
  const result = await getAudits(session.orgId, {
    page,
    status: params.status as any,
    type: params.type as any,
    search: params.search,
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          "",
          "DRAFT",
          "SCHEDULED",
          "IN_PROGRESS",
          "COMPLETED",
          "CANCELLED",
        ].map((s) => (
          <Link
            key={s}
            href={s ? `/audits?status=${s}` : "/audits"}
            className={`border px-3 py-1.5 text-xs font-medium transition-colors ${
              (params.status ?? "") === s
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            {s === "" ? "All" : s.replace("_", " ")}
          </Link>
        ))}
      </div>

      {/* Table */}
      {result.items.length === 0 ? (
        <EmptyState
          title="No audits found"
          description="Create your first audit to get started tracking compliance."
          actionLabel="Create audit"
          actionHref="/audits/new"
        />
      ) : (
        <>
          <div className="border border-gray-200 bg-white overflow-x-auto">
            <table className="flat-table min-w-full">
              <thead>
                <tr>
                  <th>Audit</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Department</th>
                  <th>Assignees</th>
                  <th>Findings</th>
                  <th>Due</th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((audit) => (
                  <AuditRow key={audit.id} auditId={audit.id}>
                    <td className="font-medium text-gray-900 hover:underline">
                      {audit.title}
                    </td>
                    <td className="text-gray-500">
                      {TYPE_LABEL[audit.type] ?? audit.type}
                    </td>
                    <td>
                      <AuditStatusBadge status={audit.status} />
                    </td>
                    <td className="text-gray-500">{audit.department ?? "—"}</td>
                    <td className="text-gray-500">
                      {audit.assignees.length === 0
                        ? "—"
                        : audit.assignees
                            .slice(0, 2)
                            .map((a) => a.name ?? a.email)
                            .join(", ") +
                          (audit.assignees.length > 2
                            ? ` +${audit.assignees.length - 2}`
                            : "")}
                    </td>
                    <td className="text-gray-500">{audit._count.findings}</td>
                    <td className="text-gray-500">
                      {audit.endDate
                        ? new Date(audit.endDate).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                  </AuditRow>
                ))}
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

export default async function AuditsPage({ searchParams }: Props) {
  const session = await requireSession();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audits"
        description="Manage and track all audits across your organization."
        actions={
          ["ADMIN", "AUDITOR"].includes(session.role) ? (
            <Link
              href="/audits/new"
              className="bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
            >
              + New audit
            </Link>
          ) : undefined
        }
      />
      <Suspense fallback={<SkeletonTable rows={6} cols={7} />}>
        <AuditListContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
