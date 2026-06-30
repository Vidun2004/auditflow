import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireSession } from "@/lib/session";
import {
  getFrameworkSummary,
  FRAMEWORK_LABELS,
} from "@/server/services/compliance.service";
import { PageHeader } from "@/components/shared/page-header";
import { SkeletonTable } from "@/components/loading";
import { cn } from "@/lib/utils";
import type { Framework } from "@/types";

export const metadata: Metadata = { title: "Compliance" };

const FRAMEWORK_COLORS: Record<
  Framework,
  { bg: string; border: string; text: string }
> = {
  ISO_27001: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
  },
  ISO_9001: {
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
  },
  SOC_2: {
    bg: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-700",
  },
  GDPR: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-700",
  },
};

async function ComplianceContent() {
  const session = await requireSession();
  const summaries = await getFrameworkSummary(session.orgId);

  const overallScore =
    summaries.length === 0
      ? 0
      : Math.round(
          summaries.reduce((sum, s) => sum + s.coverageScore, 0) /
            summaries.length,
        );

  return (
    <div className="space-y-6">
      {/* Overall score */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-gray-200 bg-white p-5 col-span-2 lg:col-span-1">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
            Overall coverage
          </p>
          <p className="mt-1 text-4xl font-bold text-gray-900">
            {overallScore}%
          </p>
          <div className="mt-2 h-1.5 bg-gray-100">
            <div
              className={cn(
                "h-1.5 transition-all",
                overallScore >= 80
                  ? "bg-green-500"
                  : overallScore >= 50
                    ? "bg-amber-500"
                    : "bg-red-500",
              )}
              style={{ width: `${overallScore}%` }}
            />
          </div>
        </div>

        {summaries.slice(0, 3).map((s) => {
          const colors = FRAMEWORK_COLORS[s.framework as Framework];
          return (
            <div
              key={s.framework}
              className="border border-gray-200 bg-white p-5"
            >
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                {s.label}
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {s.coverageScore}%
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {s.mappedControls}/{s.totalControls} controls
              </p>
              <div className="mt-2 h-1 bg-gray-100">
                <div
                  className={cn(
                    "h-1",
                    colors.bg.replace("bg-", "bg-").replace("50", "400"),
                  )}
                  style={{ width: `${s.coverageScore}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Framework cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {summaries.map((s) => {
          const colors = FRAMEWORK_COLORS[s.framework as Framework];
          return (
            <Link
              key={s.framework}
              href={`/compliance/${s.framework}`}
              className="border border-gray-200 bg-white p-5 hover:border-gray-300 transition-colors group"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span
                    className={cn(
                      "inline-block border px-2 py-0.5 text-xs font-medium mb-2",
                      colors.bg,
                      colors.border,
                      colors.text,
                    )}
                  >
                    {s.label}
                  </span>
                  <p className="text-sm text-gray-500">{s.description}</p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="text-3xl font-bold text-gray-900">
                    {s.coverageScore}%
                  </p>
                  <p className="text-xs text-gray-400">coverage</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 bg-gray-100 mb-3">
                <div
                  className={cn(
                    "h-1.5 transition-all group-hover:opacity-80",
                    s.coverageScore >= 80
                      ? "bg-green-500"
                      : s.coverageScore >= 50
                        ? "bg-amber-500"
                        : "bg-red-500",
                  )}
                  style={{ width: `${s.coverageScore}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-gray-400">
                <span>
                  {s.mappedControls} of {s.totalControls} controls mapped
                </span>
                <span className="group-hover:text-gray-700 transition-colors">
                  View controls →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default async function CompliancePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Compliance"
        description="Track your compliance posture across frameworks."
      />
      <Suspense fallback={<SkeletonTable rows={4} cols={4} />}>
        <ComplianceContent />
      </Suspense>
    </div>
  );
}
