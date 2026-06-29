import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { requireSession } from "@/lib/session";
import {
  getRiskById,
  getRiskLevel,
  LIKELIHOOD_LABELS,
  IMPACT_LABELS,
} from "@/server/services/risk.service";
import { PageHeader } from "@/components/shared/page-header";
import { RiskStatusControls } from "@/components/risks/risk-status-controls";
import { cn } from "@/lib/utils";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `Risk ${id}` };
}

export default async function RiskDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await requireSession();
  const risk = await getRiskById(session.orgId, id);

  if (!risk) notFound();

  const level = getRiskLevel(risk.score);
  const canManage = ["ADMIN", "AUDITOR", "MANAGER"].includes(session.role);

  const isOverdueReview =
    risk.reviewDate &&
    new Date(risk.reviewDate) < new Date() &&
    risk.status !== "CLOSED";

  return (
    <div className="space-y-6">
      <PageHeader
        title={risk.name}
        breadcrumbs={[
          { label: "Risk Register", href: "/risks" },
          { label: risk.name },
        ]}
        actions={
          canManage ? (
            <Link
              href={`/risks/${risk.id}/edit`}
              className="border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:border-gray-300 hover:text-gray-900 transition-colors"
            >
              Edit
            </Link>
          ) : undefined
        }
      />

      {/* Overdue review banner */}
      {isOverdueReview && (
        <div className="border border-amber-200 bg-amber-50 px-4 py-3">
          <span className="text-sm font-medium text-amber-700">
            ⚠ Review overdue.
          </span>
          <span className="text-sm text-amber-600 ml-2">
            This risk was due for review on{" "}
            {new Date(risk.reviewDate!).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
            .
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Score card */}
          <div
            className={cn(
              "border p-6 flex items-center gap-8",
              level.bg,
              level.border,
            )}
          >
            <div className="text-center">
              <p
                className={cn(
                  "text-6xl font-bold tabular-nums leading-none",
                  level.color,
                )}
              >
                {risk.score}
              </p>
              <p
                className={cn(
                  "mt-1 text-sm font-semibold uppercase tracking-wide",
                  level.color,
                )}
              >
                {level.label} Risk
              </p>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Likelihood</p>
                <p className="text-sm font-semibold text-gray-900">
                  {LIKELIHOOD_LABELS[risk.likelihood]}
                </p>
                <div className="mt-1 flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => {
                    const lMap = {
                      RARE: 1,
                      UNLIKELY: 2,
                      POSSIBLE: 3,
                      LIKELY: 4,
                      ALMOST_CERTAIN: 5,
                    };
                    const val = lMap[risk.likelihood];
                    return (
                      <div
                        key={n}
                        className={cn(
                          "h-1.5 w-6",
                          n <= val ? "bg-gray-700" : "bg-gray-200",
                        )}
                      />
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Impact</p>
                <p className="text-sm font-semibold text-gray-900">
                  {IMPACT_LABELS[risk.impact]}
                </p>
                <div className="mt-1 flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => {
                    const iMap = {
                      INSIGNIFICANT: 1,
                      MINOR: 2,
                      MODERATE: 3,
                      MAJOR: 4,
                      CATASTROPHIC: 5,
                    };
                    const val = iMap[risk.impact];
                    return (
                      <div
                        key={n}
                        className={cn(
                          "h-1.5 w-6",
                          n <= val ? "bg-gray-700" : "bg-gray-200",
                        )}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-5 py-4">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                Risk details
              </p>
            </div>
            <div className="p-5 space-y-4">
              {risk.description && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Description</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {risk.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Status</p>
                  <span className="border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-600">
                    {risk.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Owner</p>
                  <p className="text-sm text-gray-700">{risk.owner ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Review date</p>
                  <p
                    className={cn(
                      "text-sm font-medium",
                      isOverdueReview ? "text-amber-600" : "text-gray-700",
                    )}
                  >
                    {risk.reviewDate
                      ? new Date(risk.reviewDate).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Created</p>
                  <p className="text-sm text-gray-700">
                    {new Date(risk.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {risk.mitigationPlan && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Mitigation plan</p>
                  <div className="border border-gray-200 bg-gray-50 p-3">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {risk.mitigationPlan}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: sidebar */}
        <div className="space-y-4">
          {canManage && (
            <RiskStatusControls riskId={risk.id} currentStatus={risk.status} />
          )}

          {/* Score breakdown */}
          <div className="border border-gray-200 bg-white p-4 space-y-3">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Score breakdown
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Likelihood</span>
                <span className="font-medium text-gray-900">
                  {
                    {
                      RARE: 1,
                      UNLIKELY: 2,
                      POSSIBLE: 3,
                      LIKELY: 4,
                      ALMOST_CERTAIN: 5,
                    }[risk.likelihood]
                  }{" "}
                  / 5
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Impact</span>
                <span className="font-medium text-gray-900">
                  {
                    {
                      INSIGNIFICANT: 1,
                      MINOR: 2,
                      MODERATE: 3,
                      MAJOR: 4,
                      CATASTROPHIC: 5,
                    }[risk.impact]
                  }{" "}
                  / 5
                </span>
              </div>
              <div className="border-t border-gray-100 pt-2 flex justify-between">
                <span className="text-gray-500">Total score</span>
                <span className={cn("text-lg font-bold", level.color)}>
                  {risk.score} / 25
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
