import { Metadata } from "next";
import { requireRole } from "@/lib/session";
import { getOrgUsers } from "@/server/services/audit.service";
import { PageHeader } from "@/components/shared/page-header";
import { CreateAuditForm } from "@/components/audits/create-audit-form";

export const metadata: Metadata = { title: "New Audit" };

export default async function NewAuditPage() {
  const session = await requireRole(["ADMIN", "AUDITOR"]);
  const users = await getOrgUsers(session.orgId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Audit"
        description="Create a new audit and assign it to your team."
        breadcrumbs={[
          { label: "Audits", href: "/audits" },
          { label: "New Audit" },
        ]}
      />
      <CreateAuditForm users={users} />
    </div>
  );
}
