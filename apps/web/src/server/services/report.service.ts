import { prisma } from "@auditflow/db";

export async function getAuditReportData(orgId: string, auditId: string) {
  return prisma.audit.findFirst({
    where: { id: auditId, orgId },
    include: {
      createdBy: { select: { name: true, email: true } },
      assignees: { select: { name: true, email: true, role: true } },
      findings: {
        include: {
          assignee: { select: { name: true, email: true } },
          actions: {
            select: {
              title: true,
              status: true,
              progress: true,
              dueDate: true,
              assignee: { select: { name: true } },
            },
          },
        },
        orderBy: { severity: "desc" },
      },
      evidence: {
        select: {
          name: true,
          fileType: true,
          fileSizeKb: true,
          createdAt: true,
        },
      },
    },
  });
}

export async function getComplianceReportData(orgId: string) {
  const [frameworks, findings, risks] = await Promise.all([
    prisma.control.groupBy({
      by: ["framework"],
      where: { orgId, isEnabled: true },
      _count: { id: true },
    }),
    prisma.finding.groupBy({
      by: ["status"],
      where: { orgId },
      _count: { status: true },
    }),
    prisma.risk.findMany({
      where: { orgId },
      select: {
        name: true,
        score: true,
        status: true,
        likelihood: true,
        impact: true,
      },
      orderBy: { score: "desc" },
      take: 10,
    }),
  ]);

  return { frameworks, findings, risks };
}

export async function getExecutiveReportData(orgId: string) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalAudits,
    completedAudits,
    openFindings,
    criticalFindings,
    overdueActions,
    totalRisks,
    highRisks,
    recentActivity,
  ] = await Promise.all([
    prisma.audit.count({ where: { orgId } }),
    prisma.audit.count({ where: { orgId, status: "COMPLETED" } }),
    prisma.finding.count({
      where: { orgId, status: { in: ["OPEN", "ASSIGNED", "IN_PROGRESS"] } },
    }),
    prisma.finding.count({
      where: { orgId, severity: "CRITICAL", status: { not: "CLOSED" } },
    }),
    prisma.correctiveAction.count({
      where: {
        orgId,
        status: { notIn: ["CLOSED"] },
        dueDate: { lt: now },
      },
    }),
    prisma.risk.count({ where: { orgId, status: { not: "CLOSED" } } }),
    prisma.risk.count({
      where: { orgId, score: { gte: 10 }, status: { not: "CLOSED" } },
    }),
    prisma.activityLog.findMany({
      where: { orgId, createdAt: { gte: thirtyDaysAgo } },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const allFindings = await prisma.finding.findMany({
    where: { orgId },
    select: { status: true },
  });

  const complianceScore =
    allFindings.length === 0
      ? 100
      : Math.round(
          (allFindings.filter(
            (f) => f.status === "RESOLVED" || f.status === "CLOSED",
          ).length /
            allFindings.length) *
            100,
        );

  return {
    totalAudits,
    completedAudits,
    openFindings,
    criticalFindings,
    overdueActions,
    totalRisks,
    highRisks,
    complianceScore,
    recentActivity,
  };
}
