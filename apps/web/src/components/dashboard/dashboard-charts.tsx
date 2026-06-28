"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import type { DashboardData } from "@/server/services/dashboard.service";

const SEVERITY_COLORS: Record<string, string> = {
  LOW: "#16a34a",
  MEDIUM: "#d97706",
  HIGH: "#ea580c",
  CRITICAL: "#dc2626",
};

const ACTION_COLORS: Record<string, string> = {
  OPEN: "#dc2626",
  ASSIGNED: "#2563eb",
  "IN PROGRESS": "#d97706",
  "PENDING REVIEW": "#7c3aed",
  CLOSED: "#6b7280",
};

interface Props {
  data: DashboardData;
}

export function FindingsTrendChart({ data }: Props) {
  return (
    <div className="border border-gray-200 bg-white p-5">
      <p className="mb-4 text-xs font-medium uppercase tracking-wider text-gray-400">
        Findings trend — last 6 months
      </p>
      {data.monthlyFindings.length === 0 ? (
        <div className="flex h-48 items-center justify-center">
          <p className="text-sm text-gray-400">No findings data yet</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart
            data={data.monthlyFindings}
            margin={{ top: 4, right: 8, bottom: 0, left: -20 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f0f0f0"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                border: "1px solid #e5e7eb",
                borderRadius: 0,
                fontSize: 12,
                boxShadow: "none",
              }}
            />
            <Line
              type="monotone"
              dataKey="findings"
              stroke="#111827"
              strokeWidth={2}
              dot={{ r: 3, fill: "#111827", strokeWidth: 0 }}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export function FindingsBySeverityChart({ data }: Props) {
  return (
    <div className="border border-gray-200 bg-white p-5">
      <p className="mb-4 text-xs font-medium uppercase tracking-wider text-gray-400">
        Findings by severity
      </p>
      {data.findingsBySeverity.length === 0 ? (
        <div className="flex h-48 items-center justify-center">
          <p className="text-sm text-gray-400">No findings yet</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data.findingsBySeverity}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {data.findingsBySeverity.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={SEVERITY_COLORS[entry.name] ?? "#6b7280"}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                border: "1px solid #e5e7eb",
                borderRadius: 0,
                fontSize: 12,
                boxShadow: "none",
              }}
            />
            <Legend
              iconType="square"
              iconSize={8}
              wrapperStyle={{ fontSize: 11, color: "#6b7280" }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export function ActionsByStatusChart({ data }: Props) {
  return (
    <div className="border border-gray-200 bg-white p-5">
      <p className="mb-4 text-xs font-medium uppercase tracking-wider text-gray-400">
        Actions by status
      </p>
      {data.actionsByStatus.length === 0 ? (
        <div className="flex h-48 items-center justify-center">
          <p className="text-sm text-gray-400">No actions yet</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={data.actionsByStatus}
            margin={{ top: 4, right: 8, bottom: 0, left: -20 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f0f0f0"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                border: "1px solid #e5e7eb",
                borderRadius: 0,
                fontSize: 12,
                boxShadow: "none",
              }}
            />
            <Bar dataKey="value" radius={0}>
              {data.actionsByStatus.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={ACTION_COLORS[entry.name] ?? "#111827"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export function DepartmentBreakdownChart({ data }: Props) {
  return (
    <div className="border border-gray-200 bg-white p-5">
      <p className="mb-4 text-xs font-medium uppercase tracking-wider text-gray-400">
        Findings by department
      </p>
      {data.departmentStats.length === 0 ? (
        <div className="flex h-48 items-center justify-center">
          <p className="text-sm text-gray-400">No department data yet</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            layout="vertical"
            data={data.departmentStats}
            margin={{ top: 4, right: 8, bottom: 0, left: 8 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f0f0f0"
              horizontal={false}
            />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="department"
              tick={{ fontSize: 11, fill: "#6b7280" }}
              axisLine={false}
              tickLine={false}
              width={80}
            />
            <Tooltip
              contentStyle={{
                border: "1px solid #e5e7eb",
                borderRadius: 0,
                fontSize: 12,
                boxShadow: "none",
              }}
            />
            <Bar dataKey="findings" fill="#111827" radius={0} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
