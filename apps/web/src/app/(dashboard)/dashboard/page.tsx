import { Metadata } from "next";
import { requireSession } from "@/lib/session";
import { getDashboardStats } from "@/server/services/dashboard.service";
import { StatCard } from "@/components/dashboard/stat-card";
import { RecentAuditsTable } from "@/components/dashboard/recent-audits-table";
import { RiskSummary } from "@/components/dashboard/risk-summary";
import {
  FindingsTrendChart,
  FindingsBySeverityChart,
  ActionsByStatusChart,
  DepartmentBreakdownChart,
} from "@/components/dashboard/dashboard-charts";
import { SkeletonDashboard } from "@/components/loading";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Dashboard" };

async function DashboardContent() {
  const session = await requireSession();
  const data = await getDashboardStats(session.orgId);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-header">Executive Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Overview of {session.orgName}&apos;s compliance and audit status.
          </p>
        </div>
        <div className="text-xs text-gray-400">
          {new Date().toLocaleDateString("en-GB", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Audits"
          value={data.stats.totalAudits}
          subtext="all time"
          accent
        />
        <StatCard
          label="Open Findings"
          value={data.stats.openFindings}
          subtext="need attention"
          trend={data.stats.openFindings > 10 ? "up" : "neutral"}
          trendValue={data.stats.openFindings > 10 ? "High" : undefined}
        />
        <StatCard
          label="Overdue Actions"
          value={data.stats.overdueActions}
          subtext="past due date"
          trend={data.stats.overdueActions > 0 ? "up" : "neutral"}
          trendValue={
            data.stats.overdueActions > 0 ? "Action needed" : undefined
          }
        />
        <StatCard
          label="Compliance Score"
          value={`${data.stats.complianceScore}%`}
          subtext="findings resolved"
          trend={
            data.stats.complianceScore >= 80
              ? "down"
              : data.stats.complianceScore >= 60
                ? "neutral"
                : "up"
          }
          trendValue={
            data.stats.complianceScore >= 80
              ? "Good"
              : data.stats.complianceScore >= 60
                ? "Fair"
                : "Needs work"
          }
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FindingsTrendChart data={data} />
        <FindingsBySeverityChart data={data} />
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ActionsByStatusChart data={data} />
        <RiskSummary riskSummary={data.riskSummary} />
      </div>

      {/* Department breakdown */}
      {data.departmentStats.length > 0 && (
        <DepartmentBreakdownChart data={data} />
      )}

      {/* Recent audits table */}
      <RecentAuditsTable audits={data.recentAudits} />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<SkeletonDashboard />}>
      <DashboardContent />
    </Suspense>
  );
}
