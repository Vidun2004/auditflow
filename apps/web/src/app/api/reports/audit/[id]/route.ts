import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@auditflow/db";
import { getAuditReportData } from "@/server/services/report.service";
import { generatePdfFromHtml, buildReportHtml } from "@/lib/pdf/generate-pdf";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    include: { organization: { select: { name: true } } },
  });
  if (!dbUser?.orgId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const audit = await getAuditReportData(dbUser.orgId, id);
  if (!audit) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const orgName = dbUser.organization?.name ?? "Organization";
  const generatedAt = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const findingsRows = audit.findings
    .map(
      (f) => `<tr>
        <td>${f.title}</td>
        <td><span class="badge badge-${f.severity.toLowerCase()}">${f.severity}</span></td>
        <td><span class="badge badge-${f.status.toLowerCase().replace("_", "-")}">${f.status.replace("_", " ")}</span></td>
        <td>${f.assignee?.name ?? "—"}</td>
        <td>${f.dueDate ? new Date(f.dueDate).toLocaleDateString("en-GB") : "—"}</td>
        <td>${f.actions.length}</td>
      </tr>`,
    )
    .join("");

  const sections = [
    {
      heading: "Audit Overview",
      content: `
        <div class="stat-grid">
          <div class="stat-box"><div class="label">Type</div><div class="value" style="font-size:16px">${audit.type}</div></div>
          <div class="stat-box"><div class="label">Status</div><div class="value" style="font-size:16px">${audit.status}</div></div>
          <div class="stat-box"><div class="label">Findings</div><div class="value">${audit.findings.length}</div></div>
          <div class="stat-box"><div class="label">Evidence</div><div class="value">${audit.evidence.length}</div></div>
        </div>
        <p><strong>Department:</strong> ${audit.department ?? "—"}</p>
        <p><strong>Start:</strong> ${audit.startDate ? new Date(audit.startDate).toLocaleDateString("en-GB") : "—"} &nbsp;&nbsp; <strong>End:</strong> ${audit.endDate ? new Date(audit.endDate).toLocaleDateString("en-GB") : "—"}</p>
        ${audit.description ? `<p><strong>Description:</strong> ${audit.description}</p>` : ""}
        ${audit.scope ? `<p><strong>Scope:</strong> ${audit.scope}</p>` : ""}
      `,
    },
    {
      heading: `Findings (${audit.findings.length})`,
      content:
        audit.findings.length === 0
          ? "<p>No findings recorded for this audit.</p>"
          : `<table><thead><tr><th>Title</th><th>Severity</th><th>Status</th><th>Assignee</th><th>Due</th><th>Actions</th></tr></thead><tbody>${findingsRows}</tbody></table>`,
    },
    {
      heading: "Assignees",
      content: `<p>${
        audit.assignees.length === 0
          ? "No assignees."
          : audit.assignees
              .map((a) => `${a.name ?? a.email} (${a.role})`)
              .join(", ")
      }</p>`,
    },
  ];

  const html = buildReportHtml({
    title: `Audit Report — ${audit.title}`,
    orgName,
    generatedAt,
    sections,
  });

  const pdf = await generatePdfFromHtml(html);

  return new NextResponse(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="audit-report-${id}.pdf"`,
    },
  });
}
