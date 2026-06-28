import { Metadata } from "next";
import { requireRole } from "@/lib/session";
import { getOrgUsers } from "@/server/services/audit.service";
import { prisma } from "@auditflow/db";
import { PageHeader } from "@/components/shared/page-header";
import { CreateFindingForm } from "@/components/findings/create-finding-form";

export const metadata: Metadata = { title: "New Finding" };

interface Props {
  searchParams: Promise<{ auditId?: string }>;
}

export default async function NewFindingPage({ searchParams }: Props) {
  const params = await searchParams;
  const session = await requireRole(["ADMIN", "AUDITOR"]);

  const [users, audits] = await Promise.all([
    getOrgUsers(session.orgId),
    prisma.audit.findMany({
      where: {
        orgId: session.orgId,
        status: { in: ["SCHEDULED", "IN_PROGRESS"] },
      },
      select: { id: true, title: true, type: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Finding"
        description="Log a new finding discovered during an audit."
        breadcrumbs={[
          { label: "Findings", href: "/findings" },
          { label: "New Finding" },
        ]}
      />
      <CreateFindingForm
        users={users}
        audits={audits}
        defaultAuditId={params.auditId}
      />
    </div>
  );
}
