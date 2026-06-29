import { Metadata } from "next";
import { Suspense } from "react";
import { requireSession } from "@/lib/session";
import { getEvidence } from "@/server/services/evidence.service";
import { PageHeader } from "@/components/shared/page-header";
import { EvidenceList } from "@/components/evidence/evidence-list";
import { FileUploader } from "@/components/evidence/file-uploader";
import { Pagination } from "@/components/shared/pagination";
import { SkeletonTable } from "@/components/loading";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = { title: "Evidence" };

interface Props {
  searchParams: Promise<{ page?: string; search?: string }>;
}

async function EvidenceContent({ searchParams }: Props) {
  const params = await searchParams;
  const session = await requireSession();
  const page = Number(params.page ?? 1);

  const result = await getEvidence(session.orgId, {
    page,
    search: params.search,
  });

  const canDelete = ["ADMIN", "AUDITOR"].includes(session.role);

  return (
    <div className="space-y-6">
      {/* Upload zone */}
      <div className="border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-5 py-4">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
            Upload evidence
          </p>
          <p className="mt-0.5 text-xs text-gray-400">
            Files uploaded here are stored in your org library. Attach them to
            specific audits, findings, or actions from their detail pages.
          </p>
        </div>
        <div className="p-5">
          <FileUploader />
        </div>
      </div>

      {/* Library */}
      <div className="border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Evidence library
            </p>
            <p className="mt-0.5 text-xs text-gray-400">
              {result.total} file{result.total !== 1 ? "s" : ""} total
            </p>
          </div>
        </div>

        {result.items.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No evidence files"
              description="Upload files above to build your evidence library."
            />
          </div>
        ) : (
          <>
            <div className="px-5">
              <EvidenceList
                items={result.items.map((e) => ({
                  id: e.id,
                  name: e.name,
                  fileType: e.fileType,
                  fileSizeKb: e.fileSizeKb,
                  createdAt: e.createdAt,
                }))}
                canDelete={canDelete}
              />
            </div>

            {/* Context tags per file */}
            <div className="border-t border-gray-100 divide-y divide-gray-100">
              {result.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 px-5 py-2 bg-gray-50"
                >
                  <span className="text-xs text-gray-400 truncate max-w-48">
                    {item.name}
                  </span>
                  <span className="text-gray-200 text-xs">→</span>
                  <div className="flex gap-2 flex-wrap">
                    {item.audit && (
                      <span className="border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                        Audit: {item.audit.title}
                      </span>
                    )}
                    {item.finding && (
                      <span className="border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
                        Finding: {item.finding.title}
                      </span>
                    )}
                    {item.action && (
                      <span className="border border-purple-200 bg-purple-50 px-2 py-0.5 text-xs text-purple-700">
                        Action: {item.action.title}
                      </span>
                    )}
                    {!item.audit && !item.finding && !item.action && (
                      <span className="border border-gray-200 bg-white px-2 py-0.5 text-xs text-gray-400">
                        Unattached
                      </span>
                    )}
                  </div>
                </div>
              ))}
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
    </div>
  );
}

export default async function EvidencePage({ searchParams }: Props) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Evidence"
        description="Upload and manage evidence files across audits, findings, and actions."
      />
      <Suspense fallback={<SkeletonTable rows={6} cols={4} />}>
        <EvidenceContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
