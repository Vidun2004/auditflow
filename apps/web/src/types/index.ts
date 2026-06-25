import type {
  Organization,
  User,
  Audit,
  Finding,
  CorrectiveAction,
  Evidence,
  Risk,
  Notification,
  OrgSettings,
  UserRole,
  OrgStatus,
  AuditType,
  AuditStatus,
  FindingSeverity,
  FindingStatus,
  ActionStatus,
  RiskLikelihood,
  RiskImpact,
  RiskStatus,
  Framework,
} from "@auditflow/db";

// Re-export prisma types
export type {
  Organization,
  User,
  Audit,
  Finding,
  CorrectiveAction,
  Evidence,
  Risk,
  Notification,
  OrgSettings,
  UserRole,
  OrgStatus,
  AuditType,
  AuditStatus,
  FindingSeverity,
  FindingStatus,
  ActionStatus,
  RiskLikelihood,
  RiskImpact,
  RiskStatus,
  Framework,
};

// ─── Auth session user (what we carry in context) ─────────────────────────────
export interface SessionUser {
  id: string; // Prisma User.id
  supabaseId: string; // Supabase auth UID
  email: string;
  name: string | null;
  role: UserRole;
  orgId: string;
  orgSlug: string;
  orgName: string;
  orgAccentColor: string;
  orgLogoUrl: string | null;
  orgThemeMode: "LIGHT" | "DARK";
}

// ─── API response wrapper ─────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

// ─── Paginated response ───────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── Dashboard stats ──────────────────────────────────────────────────────────
export interface DashboardStats {
  totalAudits: number;
  openFindings: number;
  overdueActions: number;
  complianceScore: number;
  riskSummary: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
}

// ─── Severity display helpers ─────────────────────────────────────────────────
export const SEVERITY_COLORS: Record<FindingSeverity, string> = {
  LOW: "text-green-700 bg-green-50 border-green-200",
  MEDIUM: "text-amber-700 bg-amber-50 border-amber-200",
  HIGH: "text-orange-700 bg-orange-50 border-orange-200",
  CRITICAL: "text-red-700 bg-red-50 border-red-200",
} as const;

export const STATUS_COLORS: Record<FindingStatus, string> = {
  OPEN: "text-red-700 bg-red-50 border-red-200",
  ASSIGNED: "text-blue-700 bg-blue-50 border-blue-200",
  IN_PROGRESS: "text-amber-700 bg-amber-50 border-amber-200",
  RESOLVED: "text-green-700 bg-green-50 border-green-200",
  CLOSED: "text-gray-600 bg-gray-50 border-gray-200",
} as const;

export const ACTION_STATUS_COLORS: Record<ActionStatus, string> = {
  OPEN: "text-red-700 bg-red-50 border-red-200",
  ASSIGNED: "text-blue-700 bg-blue-50 border-blue-200",
  IN_PROGRESS: "text-amber-700 bg-amber-50 border-amber-200",
  PENDING_REVIEW: "text-purple-700 bg-purple-50 border-purple-200",
  CLOSED: "text-gray-600 bg-gray-50 border-gray-200",
} as const;
