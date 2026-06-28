import { prisma } from "@auditflow/db";

export async function getDashboardStats(orgId: string) {
  const [
    totalAudits,
    openFindings,
    overdueActions,
    allFindings,
    recentAudits,
    findingsBySeverity,
    actionsByStatus,
    monthlyFindings,
    departmentStats,
  ] = await Promise.all([
    // Total audits
    prisma.audit.count({ where: { orgId } }),

    // Open findings
    prisma.finding.count({
      where: { orgId, status: { in: ["OPEN", "ASSIGNED", "IN_PROGRESS"] } },
    }),

    // Overdue actions
    prisma.correctiveAction.count({
      where: {
        orgId,
        status: { in: ["OPEN", "ASSIGNED", "IN_PROGRESS"] },
        dueDate: { lt: new Date() },
      },
    }),

    // All findings for compliance score
    prisma.finding.findMany({
      where: { orgId },
      select: { status: true },
    }),

    // Recent audits (table)
    prisma.audit.findMany({
      where: { orgId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        type: true,
        status: true,
        department: true,
        endDate: true,
        assignees: { select: { name: true, email: true }, take: 1 },
      },
    }),

    // Findings by severity (pie/bar)
    prisma.finding.groupBy({
      by: ["severity"],
      where: { orgId },
      _count: { severity: true },
    }),

    // Actions by status
    prisma.correctiveAction.groupBy({
      by: ["status"],
      where: { orgId },
      _count: { status: true },
    }),

    // Monthly findings trend (last 6 months)
    prisma.$queryRaw<{ month: string; count: bigint }[]>`
      SELECT
        TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon') AS month,
        COUNT(*) AS count
      FROM "Finding"
      WHERE "orgId" = ${orgId}
        AND "createdAt" >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', "createdAt"), TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon')
      ORDER BY DATE_TRUNC('month', "createdAt") ASC
    `,

    // Department compliance breakdown
    prisma.finding.groupBy({
      by: ["department"],
      where: { orgId, department: { not: null } },
      _count: { department: true },
    }),
  ]);

  // Compliance score: % of findings resolved or closed
  const resolvedCount = allFindings.filter(
    (f) => f.status === "RESOLVED" || f.status === "CLOSED",
  ).length;
  const complianceScore =
    allFindings.length === 0
      ? 100
      : Math.round((resolvedCount / allFindings.length) * 100);

  // Risk summary from severity
  const riskSummary = {
    low:
      findingsBySeverity.find((f) => f.severity === "LOW")?._count.severity ??
      0,
    medium:
      findingsBySeverity.find((f) => f.severity === "MEDIUM")?._count
        .severity ?? 0,
    high:
      findingsBySeverity.find((f) => f.severity === "HIGH")?._count.severity ??
      0,
    critical:
      findingsBySeverity.find((f) => f.severity === "CRITICAL")?._count
        .severity ?? 0,
  };

  return {
    stats: {
      totalAudits,
      openFindings,
      overdueActions,
      complianceScore,
    },
    riskSummary,
    recentAudits,
    findingsBySeverity: findingsBySeverity.map((f) => ({
      name: f.severity,
      value: f._count.severity,
    })),
    actionsByStatus: actionsByStatus.map((a) => ({
      name: a.status.replace("_", " "),
      value: a._count.status,
    })),
    monthlyFindings: monthlyFindings.map((m) => ({
      month: m.month,
      findings: Number(m.count),
    })),
    departmentStats: departmentStats
      .filter((d) => d.department)
      .map((d) => ({
        department: d.department!,
        findings: d._count.department,
      }))
      .slice(0, 6),
  };
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardStats>>;
