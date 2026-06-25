import { z } from "zod";

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z
  .object({
    orgName: z
      .string()
      .min(2, "Organization name must be at least 2 characters")
      .max(100),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const inviteAcceptSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ─── Audit ────────────────────────────────────────────────────────────────────

export const auditSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().optional(),
  type: z.enum(["INTERNAL", "EXTERNAL", "SECURITY", "VENDOR"]),
  scope: z.string().optional(),
  department: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  assigneeIds: z.array(z.string()).optional(),
});

// ─── Finding ──────────────────────────────────────────────────────────────────

export const findingSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().optional(),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  department: z.string().optional(),
  assigneeId: z.string().optional(),
  dueDate: z.string().optional(),
  auditId: z.string(),
});

// ─── Corrective Action ────────────────────────────────────────────────────────

export const actionSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().optional(),
  findingId: z.string(),
  assigneeId: z.string().optional(),
  dueDate: z.string().optional(),
  progress: z.number().min(0).max(100).optional(),
});

// ─── Risk ─────────────────────────────────────────────────────────────────────

export const riskSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().optional(),
  likelihood: z.enum([
    "RARE",
    "UNLIKELY",
    "POSSIBLE",
    "LIKELY",
    "ALMOST_CERTAIN",
  ]),
  impact: z.enum([
    "INSIGNIFICANT",
    "MINOR",
    "MODERATE",
    "MAJOR",
    "CATASTROPHIC",
  ]),
  mitigationPlan: z.string().optional(),
  owner: z.string().optional(),
  reviewDate: z.string().optional(),
});

// ─── User Invite ──────────────────────────────────────────────────────────────

export const inviteUserSchema = z.object({
  email: z.string().email(),
  role: z.enum(["ADMIN", "AUDITOR", "MANAGER", "EMPLOYEE"]),
});

// ─── Org Settings ─────────────────────────────────────────────────────────────

export const orgSettingsSchema = z.object({
  displayName: z.string().min(2).max(100).optional(),
  accentColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color"),
  timezone: z.string(),
  dateFormat: z.string(),
  fiscalYearStartMonth: z.number().min(1).max(12),
  emailNotifications: z.boolean(),
  deadlineLeadDays: z.number().min(1).max(30),
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type InviteAcceptInput = z.infer<typeof inviteAcceptSchema>;
export type AuditInput = z.infer<typeof auditSchema>;
export type FindingInput = z.infer<typeof findingSchema>;
export type ActionInput = z.infer<typeof actionSchema>;
export type RiskInput = z.infer<typeof riskSchema>;
export type InviteUserInput = z.infer<typeof inviteUserSchema>;
export type OrgSettingsInput = z.infer<typeof orgSettingsSchema>;
