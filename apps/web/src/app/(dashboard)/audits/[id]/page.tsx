import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { requireSession } from "@/lib/session";
import { getAuditById } from "@/server/services/audit.service";
import { PageHeader } from "@/components/shared/page-header";
import {
  AuditStatusBadge,
  SeverityBadge,
  FindingStatusBadge,
} from "@/components/shared/status-badge";
import { AuditStatusControls } from "@/components/audits/audit-status-controls";
import { EmptyState } from "@/components/shared/empty-state";
import { FileUploader } from "@/components/evidence/file-uploader";
import { EvidenceList } from "@/components/evidence/evidence-list";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `Audit ${id}` };
}

export default async function AuditDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await requireSession();
  const audit = await getAuditById(session.orgId, id);

  if (!audit) notFound();

  const canEdit = ["ADMIN", "AUDITOR"].includes(session.role);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={audit.title}
        breadcrumbs={[
          { label: "Audits", href: "/audits" },
          { label: audit.title },
        ]}
        actions={
          canEdit ? (
            <Link
              href={`/audits/${audit.id}/edit`}
              className="border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:border-gray-300 hover:text-gray-900 transition-colors"
            >
              Edit
            </Link>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Details card */}
          <div className="border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-5 py-4">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                Audit details
              </p>
            </div>
            <div className="p-5 grid grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Status</p>
                <AuditStatusBadge status={audit.status} />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Type</p>
                <p className="text-sm font-medium text-gray-700">
                  {audit.type.charAt(0) + audit.type.slice(1).toLowerCase()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Department</p>
                <p className="text-sm text-gray-700">
                  {audit.department ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Created by</p>
                <p className="text-sm text-gray-700">
                  {audit.createdBy?.name ?? audit.createdBy?.email ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Start date</p>
                <p className="text-sm text-gray-700">
                  {audit.startDate
                    ? new Date(audit.startDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">End date</p>
                <p className="text-sm text-gray-700">
                  {audit.endDate
                    ? new Date(audit.endDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </p>
              </div>
              {audit.scope && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-400 mb-1">Scope</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {audit.scope}
                  </p>
                </div>
              )}
              {audit.description && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-400 mb-1">Description</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {audit.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Findings */}
          <div className="border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                Findings ({audit._count.findings})
              </p>
              {canEdit && (
                <Link
                  href={`/findings/new?auditId=${audit.id}`}
                  className="text-xs text-gray-900 underline underline-offset-2 hover:text-gray-600"
                >
                  + Add finding
                </Link>
              )}
            </div>

            {audit.findings.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  title="No findings yet"
                  description="Add findings to this audit as you identify issues."
                  actionLabel={canEdit ? "Add finding" : undefined}
                  actionHref={
                    canEdit ? `/findings/new?auditId=${audit.id}` : undefined
                  }
                />
              </div>
            ) : (
              <table className="flat-table">
                <thead>
                  <tr>
                    <th>Finding</th>
                    <th>Severity</th>
                    <th>Status</th>
                    <th>Assignee</th>
                    <th>Due</th>
                  </tr>
                </thead>
                <tbody>
                  {audit.findings.map((f) => (
                    <tr key={f.id}>
                      <td>
                        <Link
                          href={`/findings/${f.id}`}
                          className="font-medium text-gray-900 hover:underline"
                        >
                          {f.title}
                        </Link>
                      </td>
                      <td>
                        <SeverityBadge severity={f.severity} />
                      </td>
                      <td>
                        <FindingStatusBadge status={f.status} />
                      </td>
                      <td className="text-gray-500">
                        {f.assignee?.name ?? f.assignee?.email ?? "—"}
                      </td>
                      <td className="text-gray-500">
                        {f.dueDate
                          ? new Date(f.dueDate).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                            })
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Evidence */}
          <div className="border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                Evidence ({audit._count.evidence})
              </p>
            </div>
            <div className="p-5 space-y-4">
              {canEdit && <FileUploader auditId={audit.id} />}
              <EvidenceList
                items={audit.evidence.map((e) => ({
                  id: e.id,
                  name: e.name,
                  fileType: e.fileType,
                  fileSizeKb: e.fileSizeKb,
                  createdAt: e.createdAt,
                }))}
                canDelete={canEdit}
              />
            </div>
          </div>
        </div>

        {/* Right: sidebar */}
        <div className="space-y-4">
          {/* Status controls */}
          {canEdit && (
            <AuditStatusControls
              auditId={audit.id}
              currentStatus={audit.status}
            />
          )}

          {/* Assignees */}
          <div className="border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                Assignees
              </p>
            </div>
            <div className="p-4">
              {audit.assignees.length === 0 ? (
                <p className="text-sm text-gray-400">No assignees</p>
              ) : (
                <ul className="space-y-2">
                  {audit.assignees.map((a) => (
                    <li key={a.id} className="flex items-center gap-2">
                      <div
                        className="flex h-6 w-6 items-center justify-center bg-gray-200 text-xs font-medium text-gray-600 shrink-0"
                        data-avatar
                      >
                        {(a.name ?? a.email).charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-700 truncate">
                          {a.name ?? a.email}
                        </p>
                        <p className="text-xs text-gray-400 capitalize">
                          {a.role.toLowerCase()}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="border border-gray-200 bg-white p-4 space-y-3">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Summary
            </p>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total findings</span>
              <span className="font-medium text-gray-900">
                {audit._count.findings}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Evidence files</span>
              <span className="font-medium text-gray-900">
                {audit._count.evidence}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
