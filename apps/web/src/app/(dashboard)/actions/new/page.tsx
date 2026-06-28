import { Metadata } from "next";
import { requireRole } from "@/lib/session";
import { getOrgUsers } from "@/server/services/audit.service";
import { prisma } from "@auditflow/db";
import { PageHeader } from "@/components/shared/page-header";
import { CreateActionForm } from "@/components/actions/create-action-form";

export const metadata: Metadata = { title: "New Action" };

interface Props {
  searchParams: Promise<{ findingId?: string }>;
}

export default async function NewActionPage({ searchParams }: Props) {
  const params = await searchParams;
  const session = await requireRole(["ADMIN", "AUDITOR", "MANAGER"]);

  const [users, findings] = await Promise.all([
    getOrgUsers(session.orgId),
    prisma.finding.findMany({
      where: {
        orgId: session.orgId,
        status: { notIn: ["CLOSED"] },
      },
      select: {
        id: true,
        title: true,
        severity: true,
        audit: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Corrective Action"
        description="Create a corrective action to resolve a finding."
        breadcrumbs={[
          { label: "Actions", href: "/actions" },
          { label: "New Action" },
        ]}
      />
      <CreateActionForm
        users={users}
        findings={findings}
        defaultFindingId={params.findingId}
      />
    </div>
  );
}
