import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@auditflow/db";
import ExcelJS from "exceljs";

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

  const orgId = dbUser.orgId;
  const orgName = dbUser.organization?.name ?? "Organization";

  const [audits, findings, actions, risks] = await Promise.all([
    prisma.audit.findMany({
      where: { orgId },
      select: {
        title: true,
        type: true,
        status: true,
        department: true,
        startDate: true,
        endDate: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.finding.findMany({
      where: { orgId },
      select: {
        title: true,
        severity: true,
        status: true,
        department: true,
        dueDate: true,
        createdAt: true,
        audit: { select: { title: true } },
        assignee: { select: { name: true, email: true } },
      },
      orderBy: { severity: "desc" },
    }),
    prisma.correctiveAction.findMany({
      where: { orgId },
      select: {
        title: true,
        status: true,
        progress: true,
        dueDate: true,
        finding: { select: { title: true } },
        assignee: { select: { name: true } },
      },
      orderBy: { dueDate: "asc" },
    }),
    prisma.risk.findMany({
      where: { orgId },
      select: {
        name: true,
        likelihood: true,
        impact: true,
        score: true,
        status: true,
        owner: true,
        reviewDate: true,
      },
      orderBy: { score: "desc" },
    }),
  ]);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "AuditFlow";
  workbook.created = new Date();

  const headerStyle: Partial<ExcelJS.Style> = {
    font: { bold: true, color: { argb: "FFFFFFFF" } },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF111827" } },
    border: {
      bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
    },
  };

  // ─── Audits sheet ──────────────────────────────────────────────────────────
  const auditSheet = workbook.addWorksheet("Audits");
  auditSheet.columns = [
    { header: "Title", key: "title", width: 40 },
    { header: "Type", key: "type", width: 12 },
    { header: "Status", key: "status", width: 16 },
    { header: "Department", key: "department", width: 20 },
    { header: "Start Date", key: "startDate", width: 14 },
    { header: "End Date", key: "endDate", width: 14 },
    { header: "Created", key: "createdAt", width: 14 },
  ];
  auditSheet
    .getRow(1)
    .eachCell((cell) => Object.assign(cell, { style: headerStyle }));
  audits.forEach((a) =>
    auditSheet.addRow({
      ...a,
      startDate: a.startDate
        ? new Date(a.startDate).toLocaleDateString("en-GB")
        : "",
      endDate: a.endDate ? new Date(a.endDate).toLocaleDateString("en-GB") : "",
      createdAt: new Date(a.createdAt).toLocaleDateString("en-GB"),
    }),
  );

  // ─── Findings sheet ────────────────────────────────────────────────────────
  const findingSheet = workbook.addWorksheet("Findings");
  findingSheet.columns = [
    { header: "Title", key: "title", width: 40 },
    { header: "Severity", key: "severity", width: 12 },
    { header: "Status", key: "status", width: 16 },
    { header: "Audit", key: "audit", width: 30 },
    { header: "Department", key: "department", width: 20 },
    { header: "Assignee", key: "assignee", width: 20 },
    { header: "Due Date", key: "dueDate", width: 14 },
    { header: "Created", key: "createdAt", width: 14 },
  ];
  findingSheet
    .getRow(1)
    .eachCell((cell) => Object.assign(cell, { style: headerStyle }));
  findings.forEach((f) =>
    findingSheet.addRow({
      title: f.title,
      severity: f.severity,
      status: f.status,
      audit: f.audit.title,
      department: f.department ?? "",
      assignee: f.assignee?.name ?? f.assignee?.email ?? "",
      dueDate: f.dueDate ? new Date(f.dueDate).toLocaleDateString("en-GB") : "",
      createdAt: new Date(f.createdAt).toLocaleDateString("en-GB"),
    }),
  );

  // ─── Actions sheet ─────────────────────────────────────────────────────────
  const actionSheet = workbook.addWorksheet("Corrective Actions");
  actionSheet.columns = [
    { header: "Title", key: "title", width: 40 },
    { header: "Status", key: "status", width: 16 },
    { header: "Progress %", key: "progress", width: 14 },
    { header: "Finding", key: "finding", width: 40 },
    { header: "Assignee", key: "assignee", width: 20 },
    { header: "Due Date", key: "dueDate", width: 14 },
  ];
  actionSheet
    .getRow(1)
    .eachCell((cell) => Object.assign(cell, { style: headerStyle }));
  actions.forEach((a) =>
    actionSheet.addRow({
      title: a.title,
      status: a.status,
      progress: a.progress,
      finding: a.finding.title,
      assignee: a.assignee?.name ?? "",
      dueDate: a.dueDate ? new Date(a.dueDate).toLocaleDateString("en-GB") : "",
    }),
  );

  // ─── Risks sheet ───────────────────────────────────────────────────────────
  const riskSheet = workbook.addWorksheet("Risk Register");
  riskSheet.columns = [
    { header: "Risk Name", key: "name", width: 40 },
    { header: "Likelihood", key: "likelihood", width: 18 },
    { header: "Impact", key: "impact", width: 16 },
    { header: "Score", key: "score", width: 10 },
    { header: "Status", key: "status", width: 14 },
    { header: "Owner", key: "owner", width: 20 },
    { header: "Review Date", key: "reviewDate", width: 14 },
  ];
  riskSheet
    .getRow(1)
    .eachCell((cell) => Object.assign(cell, { style: headerStyle }));
  risks.forEach((r) =>
    riskSheet.addRow({
      ...r,
      owner: r.owner ?? "",
      reviewDate: r.reviewDate
        ? new Date(r.reviewDate).toLocaleDateString("en-GB")
        : "",
    }),
  );

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${orgName.replace(/\s/g, "-")}-compliance-report.xlsx"`,
    },
  });
}
