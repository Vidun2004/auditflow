import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { requireSession } from "@/lib/session";
import {
  getFrameworkControls,
  FRAMEWORK_LABELS,
  FRAMEWORK_DESCRIPTIONS,
} from "@/server/services/compliance.service";
import { PageHeader } from "@/components/shared/page-header";
import {
  SeverityBadge,
  FindingStatusBadge,
} from "@/components/shared/status-badge";
import { SkeletonTable } from "@/components/loading";
import { cn } from "@/lib/utils";
import type { Framework } from "@/types";

const VALID_FRAMEWORKS: Framework[] = [
  "ISO_27001",
  "ISO_9001",
  "SOC_2",
  "GDPR",
];

interface Props {
  params: Promise<{ framework: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { framework } = await params;
  const label = FRAMEWORK_LABELS[framework as Framework] ?? framework;
  return { title: label };
}

async function FrameworkContent({ framework }: { framework: Framework }) {
  const session = await requireSession();
  const controls = await getFrameworkControls(session.orgId, framework);

  const categories = [...new Set(controls.map((c) => c.category ?? "General"))];
  const mappedCount = controls.filter(
    (c) => c.controlMappings.length > 0,
  ).length;
  const coverageScore =
    controls.length === 0
      ? 0
      : Math.round((mappedCount / controls.length) * 100);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wider">
            Total controls
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {controls.length}
          </p>
        </div>
        <div className="border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wider">
            Mapped controls
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{mappedCount}</p>
        </div>
        <div className="border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wider">
            Coverage score
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {coverageScore}%
          </p>
          <div className="mt-2 h-1 bg-gray-100">
            <div
              className={cn(
                "h-1 transition-all",
                coverageScore >= 80
                  ? "bg-green-500"
                  : coverageScore >= 50
                    ? "bg-amber-500"
                    : "bg-red-500",
              )}
              style={{ width: `${coverageScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Controls grouped by category */}
      {categories.map((category) => {
        const categoryControls = controls.filter(
          (c) => (c.category ?? "General") === category,
        );

        return (
          <div key={category} className="border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold text-gray-900">
                  {category}
                </p>
                <span className="border border-gray-200 px-2 py-0.5 text-xs text-gray-500">
                  {categoryControls.length} controls
                </span>
              </div>
              <span className="text-xs text-gray-400">
                {
                  categoryControls.filter((c) => c.controlMappings.length > 0)
                    .length
                }
                /{categoryControls.length} mapped
              </span>
            </div>

            <div className="divide-y divide-gray-50">
              {categoryControls.map((control) => {
                const isMapped = control.controlMappings.length > 0;

                return (
                  <div key={control.id} className="px-5 py-4">
                    <div className="flex items-start gap-4">
                      {/* Mapped indicator */}
                      <div
                        className={cn(
                          "mt-0.5 h-4 w-4 shrink-0 flex items-center justify-center border",
                          isMapped
                            ? "border-green-400 bg-green-50"
                            : "border-gray-200 bg-white",
                        )}
                      >
                        {isMapped && (
                          <svg
                            className="h-2.5 w-2.5 text-green-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={3}
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="square"
                              strokeLinejoin="miter"
                              d="m4.5 12.75 6 6 9-13.5"
                            />
                          </svg>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 flex-wrap">
                          <span className="text-xs font-mono font-bold text-gray-500 shrink-0">
                            {control.controlId}
                          </span>
                          <p className="text-sm font-medium text-gray-900">
                            {control.title}
                          </p>
                          {control.description && (
                            <p className="w-full text-xs text-gray-400 mt-0.5">
                              {control.description}
                            </p>
                          )}
                        </div>

                        {/* Mapped findings */}
                        {control.controlMappings.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {control.controlMappings.map((mapping) => (
                              <div
                                key={mapping.id}
                                className="flex items-center gap-2 flex-wrap"
                              >
                                <a
                                  href={`/findings/${mapping.finding.id}`}
                                  className="text-xs text-blue-700 hover:underline"
                                >
                                  {mapping.finding.title}
                                </a>
                                <SeverityBadge
                                  severity={mapping.finding.severity}
                                />
                                <FindingStatusBadge
                                  status={mapping.finding.status}
                                />
                                {mapping.notes && (
                                  <span className="text-xs text-gray-400 italic">
                                    — {mapping.notes}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {!isMapped && (
                          <p className="mt-1 text-xs text-gray-400">
                            No findings mapped to this control yet.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default async function FrameworkPage({ params }: Props) {
  const { framework } = await params;

  if (!VALID_FRAMEWORKS.includes(framework as Framework)) notFound();

  const fw = framework as Framework;

  return (
    <div className="space-y-6">
      <PageHeader
        title={FRAMEWORK_LABELS[fw]}
        description={FRAMEWORK_DESCRIPTIONS[fw]}
        breadcrumbs={[
          { label: "Compliance", href: "/compliance" },
          { label: FRAMEWORK_LABELS[fw] },
        ]}
      />
      <Suspense fallback={<SkeletonTable rows={10} cols={3} />}>
        <FrameworkContent framework={fw} />
      </Suspense>
    </div>
  );
}
