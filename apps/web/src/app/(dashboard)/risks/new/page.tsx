import { Metadata } from "next";
import { requireRole } from "@/lib/session";
import { PageHeader } from "@/components/shared/page-header";
import { CreateRiskForm } from "@/components/risks/create-risk-form";

export const metadata: Metadata = { title: "New Risk" };

export default async function NewRiskPage() {
  await requireRole(["ADMIN", "AUDITOR", "MANAGER"]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Risk"
        description="Register a new risk and assess its likelihood and impact."
        breadcrumbs={[
          { label: "Risk Register", href: "/risks" },
          { label: "New Risk" },
        ]}
      />
      <CreateRiskForm />
    </div>
  );
}
