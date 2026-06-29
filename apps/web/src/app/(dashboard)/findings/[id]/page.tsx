import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { requireSession } from "@/lib/session";
import { getFindingById } from "@/server/services/finding.service";
import { getOrgUsers } from "@/server/services/audit.service";
import { PageHeader } from "@/components/shared/page-header";
import {
  SeverityBadge,
  FindingStatusBadge,
  ActionStatusBadge,
} from "@/components/shared/status-badge";
import { FindingStatusControls } from "@/components/findings/finding-status-controls";
import { FindingSeverityControls } from "@/components/findings/finding-severity-controls";
import { EmptyState } from "@/components/shared/empty-state";
import { FileUploader } from "@/components/evidence/file-uploader";
import { EvidenceList } from "@/components/evidence/evidence-list";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `Finding ${id}` };
}

export default async function FindingDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await requireSession();

  const [finding, users] = await Promise.all([
    getFindingById(session.orgId, id),
    getOrgUsers(session.orgId),
  ]);

  if (!finding) notFound();

  const canEdit = ["ADMIN", "AUDITOR"].includes(session.role);
  const canManage = ["ADMIN", "AUDITOR", "MANAGER"].includes(session.role);

  const isOverdue =
    finding.dueDate &&
    new Date(finding.dueDate) < new Date() &&
    finding.status !== "RESOLVED" &&
    finding.status !== "CLOSED";

  return (
    <div className="space-y-6">
      <PageHeader
        title={finding.title}
        breadcrumbs={[
          { label: "Findings", href: "/findings" },
          { label: finding.title },
        ]}
        actions={
          canEdit ? (
            <Link
              href={`/findings/${finding.id}/edit`}
              className="border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:border-gray-300 hover:text-gray-900 transition-colors"
            >
              Edit
            </Link>
          ) : undefined
        }
      />

      {/* Overdue banner */}
      {isOverdue && (
        <div className="border border-red-200 bg-red-50 px-4 py-3 flex items-center gap-2">
          <span className="text-sm font-medium text-red-700">
            ↑ This finding is overdue.
          </span>
          <span className="text-sm text-red-600">
            Due{" "}
            {new Date(finding.dueDate!).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Details */}
          <div className="border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-5 py-4">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                Finding details
              </p>
            </div>
            <div className="p-5 grid grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Severity</p>
                <SeverityBadge severity={finding.severity} />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Status</p>
                <FindingStatusBadge status={finding.status} />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Audit</p>
                <Link
                  href={`/audits/${finding.audit.id}`}
                  className="text-sm text-gray-700 hover:underline font-medium"
                >
                  {finding.audit.title}
                </Link>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Department</p>
                <p className="text-sm text-gray-700">
                  {finding.department ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Assignee</p>
                <p className="text-sm text-gray-700">
                  {finding.assignee?.name ??
                    finding.assignee?.email ??
                    "Unassigned"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Created by</p>
                <p className="text-sm text-gray-700">
                  {finding.createdBy?.name ?? finding.createdBy?.email ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Due date</p>
                <p
                  className={`text-sm font-medium ${
                    isOverdue ? "text-red-600" : "text-gray-700"
                  }`}
                >
                  {finding.dueDate
                    ? new Date(finding.dueDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Resolved at</p>
                <p className="text-sm text-gray-700">
                  {finding.resolvedAt
                    ? new Date(finding.resolvedAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                    : "—"}
                </p>
              </div>
              {finding.description && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-400 mb-1">Description</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {finding.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Corrective Actions */}
          <div className="border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                Corrective actions ({finding._count.actions})
              </p>
              {canManage && (
                <Link
                  href={`/actions/new?findingId=${finding.id}`}
                  className="text-xs text-gray-900 underline underline-offset-2 hover:text-gray-600"
                >
                  + Add action
                </Link>
              )}
            </div>

            {finding.actions.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  title="No corrective actions"
                  description="Add corrective actions to track how this finding will be resolved."
                  actionLabel={canManage ? "Add action" : undefined}
                  actionHref={
                    canManage
                      ? `/actions/new?findingId=${finding.id}`
                      : undefined
                  }
                />
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {finding.actions.map((action) => (
                  <div
                    key={action.id}
                    className="flex items-center gap-4 px-5 py-3"
                  >
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/actions/${action.id}`}
                        className="text-sm font-medium text-gray-900 hover:underline truncate block"
                      >
                        {action.title}
                      </Link>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {action.assignee?.name ??
                          action.assignee?.email ??
                          "Unassigned"}
                        {action.dueDate &&
                          ` · Due ${new Date(action.dueDate).toLocaleDateString(
                            "en-GB",
                            { day: "2-digit", month: "short" },
                          )}`}
                      </p>
                    </div>

                    {/* Progress bar */}
                    <div className="w-24 shrink-0">
                      <div className="flex items-center gap-1.5">
                        <div className="flex-1 h-1 bg-gray-100">
                          <div
                            className="h-1 bg-gray-900 transition-all"
                            style={{ width: `${action.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 shrink-0">
                          {action.progress}%
                        </span>
                      </div>
                    </div>

                    <ActionStatusBadge status={action.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Control mappings */}
          {finding.controlMappings.length > 0 && (
            <div className="border border-gray-200 bg-white">
              <div className="border-b border-gray-200 px-5 py-4">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                  Compliance control mappings
                </p>
              </div>
              <div className="divide-y divide-gray-100">
                {finding.controlMappings.map((mapping) => (
                  <div key={mapping.id} className="px-5 py-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-xs font-medium text-gray-500 uppercase">
                          {mapping.control.framework.replace("_", " ")} ·{" "}
                          {mapping.control.controlId}
                        </span>
                        <p className="text-sm font-medium text-gray-900 mt-0.5">
                          {mapping.control.title}
                        </p>
                        {mapping.notes && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {mapping.notes}
                          </p>
                        )}
                      </div>
                      {mapping.control.category && (
                        <span className="border border-gray-200 px-2 py-0.5 text-xs text-gray-500 shrink-0">
                          {mapping.control.category}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evidence */}
          <div className="border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-5 py-4">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                Evidence ({finding._count.evidence})
              </p>
            </div>
            <div className="p-5 space-y-4">
              {canEdit && <FileUploader findingId={finding.id} />}
              <EvidenceList
                items={finding.evidence.map((e) => ({
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
          {canManage && (
            <FindingStatusControls
              findingId={finding.id}
              currentStatus={finding.status}
            />
          )}

          {/* Severity controls */}
          {canEdit && (
            <FindingSeverityControls
              findingId={finding.id}
              currentSeverity={finding.severity}
            />
          )}

          {/* Summary */}
          <div className="border border-gray-200 bg-white p-4 space-y-3">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Summary
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Actions</span>
                <span className="font-medium text-gray-900">
                  {finding._count.actions}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Evidence</span>
                <span className="font-medium text-gray-900">
                  {finding._count.evidence}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Created</span>
                <span className="text-gray-700">
                  {new Date(finding.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
