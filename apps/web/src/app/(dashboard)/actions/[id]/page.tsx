import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { requireSession } from "@/lib/session";
import { getActionById } from "@/server/services/action.service";
import { getOrgUsers } from "@/server/services/audit.service";
import { PageHeader } from "@/components/shared/page-header";
import {
  ActionStatusBadge,
  SeverityBadge,
} from "@/components/shared/status-badge";
import { ActionStatusControls } from "@/components/actions/action-status-controls";
import { ActionProgressControl } from "@/components/actions/action-progress-control";
import { FileUploader } from "@/components/evidence/file-uploader";
import { EvidenceList } from "@/components/evidence/evidence-list";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `Action ${id}` };
}

export default async function ActionDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await requireSession();

  const [action, users] = await Promise.all([
    getActionById(session.orgId, id),
    getOrgUsers(session.orgId),
  ]);

  if (!action) notFound();

  const canManage = ["ADMIN", "AUDITOR", "MANAGER"].includes(session.role);
  const canUpdate = ["ADMIN", "AUDITOR", "MANAGER", "EMPLOYEE"].includes(
    session.role,
  );

  const isOverdue =
    action.dueDate &&
    new Date(action.dueDate) < new Date() &&
    action.status !== "CLOSED";

  const daysUntilDue = action.dueDate
    ? Math.ceil(
        (new Date(action.dueDate).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={action.title}
        breadcrumbs={[
          { label: "Actions", href: "/actions" },
          { label: action.title },
        ]}
        actions={
          canManage ? (
            <Link
              href={`/actions/${action.id}/edit`}
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
            ↑ This action is overdue.
          </span>
          <span className="text-sm text-red-600">
            Was due{" "}
            {new Date(action.dueDate!).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
      )}

      {/* Approaching deadline (3 days) */}
      {!isOverdue &&
        daysUntilDue !== null &&
        daysUntilDue <= 3 &&
        daysUntilDue >= 0 &&
        action.status !== "CLOSED" && (
          <div className="border border-amber-200 bg-amber-50 px-4 py-3">
            <span className="text-sm font-medium text-amber-700">
              ⚠ Due in{" "}
              {daysUntilDue === 0
                ? "today"
                : `${daysUntilDue} day${daysUntilDue !== 1 ? "s" : ""}`}
              .
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
                Action details
              </p>
            </div>
            <div className="p-5 grid grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Status</p>
                <ActionStatusBadge status={action.status} />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Assignee</p>
                <p className="text-sm font-medium text-gray-700">
                  {action.assignee?.name ??
                    action.assignee?.email ??
                    "Unassigned"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Due date</p>
                <p
                  className={`text-sm font-medium ${
                    isOverdue ? "text-red-600" : "text-gray-700"
                  }`}
                >
                  {action.dueDate
                    ? new Date(action.dueDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Closed at</p>
                <p className="text-sm text-gray-700">
                  {action.closedAt
                    ? new Date(action.closedAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Created by</p>
                <p className="text-sm text-gray-700">
                  {action.createdBy?.name ?? action.createdBy?.email ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Created</p>
                <p className="text-sm text-gray-700">
                  {new Date(action.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>

              {action.description && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-400 mb-1">Description</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {action.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Progress */}
          <div className="border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-5 py-4">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                Progress
              </p>
            </div>
            <div className="p-5">
              <ActionProgressControl
                actionId={action.id}
                initialProgress={action.progress}
                disabled={!canUpdate || action.status === "CLOSED"}
              />
            </div>
          </div>

          {/* Linked finding */}
          <div className="border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-5 py-4">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                Linked finding
              </p>
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <Link
                    href={`/findings/${action.finding.id}`}
                    className="text-sm font-medium text-gray-900 hover:underline"
                  >
                    {action.finding.title}
                  </Link>
                  <p className="text-xs text-gray-400">
                    <Link
                      href={`/audits/${action.finding.audit.id}`}
                      className="hover:text-gray-700"
                    >
                      {action.finding.audit.title}
                    </Link>
                  </p>
                </div>
                <SeverityBadge severity={action.finding.severity} />
              </div>
            </div>
          </div>

          {/* Evidence */}
          <div className="border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-5 py-4">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                Evidence ({action.evidence.length})
              </p>
            </div>
            <div className="p-5 space-y-4">
              {canUpdate && <FileUploader actionId={action.id} />}
              <EvidenceList
                items={action.evidence.map((e) => ({
                  id: e.id,
                  name: e.name,
                  fileType: e.fileType,
                  fileSizeKb: e.fileSizeKb,
                  createdAt: e.createdAt,
                }))}
                canDelete={canManage}
              />
            </div>
          </div>
        </div>

        {/* Right: sidebar */}
        <div className="space-y-4">
          {/* Status controls */}
          {canUpdate && (
            <ActionStatusControls
              actionId={action.id}
              currentStatus={action.status}
              userRole={session.role}
            />
          )}

          {/* Summary card */}
          <div className="border border-gray-200 bg-white p-4 space-y-3">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Summary
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Progress</span>
                <span className="font-semibold text-gray-900">
                  {action.progress}%
                </span>
              </div>
              <div className="h-1.5 bg-gray-100">
                <div
                  className="h-1.5 bg-gray-900 transition-all"
                  style={{ width: `${action.progress}%` }}
                />
              </div>
              <div className="flex justify-between text-sm pt-1">
                <span className="text-gray-500">Evidence files</span>
                <span className="font-medium text-gray-900">
                  {action.evidence.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
