import { Metadata } from "next";
import { requireSession } from "@/lib/session";
import { PageHeader } from "@/components/shared/page-header";
import { prisma } from "@auditflow/db";
import { ReportDownloadButton } from "@/components/reports/report-download-button";

export const metadata: Metadata = { title: "Reports" };

export default async function ReportsPage() {
  const session = await requireSession();

  const audits = await prisma.audit.findMany({
    where: { orgId: session.orgId },
    select: { id: true, title: true, status: true, type: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Generate and download compliance and audit reports."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Executive report */}
        <div className="border border-gray-200 bg-white p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Executive Report
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              High-level compliance summary — audit counts, finding stats, risk
              overview, and 30-day activity. PDF format.
            </p>
          </div>
          <div className="flex gap-2">
            <ReportDownloadButton
              label="Download PDF"
              url="/api/reports/executive"
              filename="executive-report.pdf"
            />
          </div>
        </div>

        {/* Excel full export */}
        <div className="border border-gray-200 bg-white p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Full Data Export
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              All audits, findings, corrective actions, and risks exported as a
              multi-sheet Excel workbook.
            </p>
          </div>
          <div className="flex gap-2">
            <ReportDownloadButton
              label="Download Excel"
              url="/api/reports/excel"
              filename="compliance-export.xlsx"
              variant="outline"
            />
          </div>
        </div>

        {/* Per-audit reports */}
        <div className="border border-gray-200 bg-white p-5 space-y-4 md:col-span-2">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Audit Reports
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Generate a detailed PDF report for a specific audit including all
              findings, assignees, and corrective actions.
            </p>
          </div>

          {audits.length === 0 ? (
            <p className="text-sm text-gray-400">No audits yet.</p>
          ) : (
            <div className="border border-gray-200 divide-y divide-gray-100">
              {audits.map((audit) => (
                <div
                  key={audit.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {audit.title}
                    </p>
                    <p className="text-xs text-gray-400">
                      {audit.type} · {audit.status}
                    </p>
                  </div>
                  <ReportDownloadButton
                    label="PDF"
                    url={`/api/reports/audit/${audit.id}`}
                    filename={`audit-${audit.id}.pdf`}
                    variant="outline"
                    size="sm"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
