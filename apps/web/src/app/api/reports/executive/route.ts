import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@auditflow/db";
import { getExecutiveReportData } from "@/server/services/report.service";
import { generatePdfFromHtml, buildReportHtml } from "@/lib/pdf/generate-pdf";

export async function GET(request: NextRequest) {
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

  const orgName = dbUser.organization?.name ?? "Organization";
  const data = await getExecutiveReportData(dbUser.orgId);
  const generatedAt = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const sections = [
    {
      heading: "Executive Summary",
      content: `
        <div class="stat-grid">
          <div class="stat-box"><div class="label">Compliance Score</div><div class="value">${data.complianceScore}%</div></div>
          <div class="stat-box"><div class="label">Total Audits</div><div class="value">${data.totalAudits}</div></div>
          <div class="stat-box"><div class="label">Open Findings</div><div class="value">${data.openFindings}</div></div>
          <div class="stat-box"><div class="label">Overdue Actions</div><div class="value">${data.overdueActions}</div></div>
        </div>
        <div class="stat-grid">
          <div class="stat-box"><div class="label">Critical Findings</div><div class="value">${data.criticalFindings}</div></div>
          <div class="stat-box"><div class="label">Completed Audits</div><div class="value">${data.completedAudits}</div></div>
          <div class="stat-box"><div class="label">Total Risks</div><div class="value">${data.totalRisks}</div></div>
          <div class="stat-box"><div class="label">High/Critical Risks</div><div class="value">${data.highRisks}</div></div>
        </div>
      `,
    },
    {
      heading: "Recent Activity (Last 30 Days)",
      content:
        data.recentActivity.length === 0
          ? "<p>No recent activity.</p>"
          : `<table>
              <thead><tr><th>Action</th><th>User</th><th>Date</th></tr></thead>
              <tbody>
                ${data.recentActivity
                  .map(
                    (a) => `<tr>
                      <td>${a.action.replace(/_/g, " ")}</td>
                      <td>${a.user?.name ?? a.user?.email ?? "System"}</td>
                      <td>${new Date(a.createdAt).toLocaleDateString("en-GB")}</td>
                    </tr>`,
                  )
                  .join("")}
              </tbody>
            </table>`,
    },
  ];

  const html = buildReportHtml({
    title: "Executive Compliance Report",
    orgName,
    generatedAt,
    sections,
  });

  const pdf = await generatePdfFromHtml(html);

  return new NextResponse(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="executive-report.pdf"`,
    },
  });
}
