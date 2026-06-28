"use server";

import { prisma } from "@auditflow/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { findingSchema, type FindingInput } from "@/lib/validations";
import { requireSession, requireRole } from "@/lib/session";
import type { ApiResponse } from "@/types";

// ─── Create finding ───────────────────────────────────────────────────────────

export async function createFindingAction(
  input: FindingInput,
): Promise<ApiResponse<{ id: string }>> {
  const session = await requireRole(["ADMIN", "AUDITOR"]);

  const parsed = findingSchema.safeParse(input);
  if (!parsed.success) {
    return {
      data: null,
      error: parsed.error.errors[0].message,
      success: false,
    };
  }

  const { dueDate, ...rest } = parsed.data;

  // Verify audit belongs to org
  const audit = await prisma.audit.findFirst({
    where: { id: rest.auditId, orgId: session.orgId },
    select: { id: true },
  });
  if (!audit) {
    return { data: null, error: "Audit not found.", success: false };
  }

  const finding = await prisma.finding.create({
    data: {
      ...rest,
      orgId: session.orgId,
      createdById: session.id,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    },
    select: { id: true },
  });

  await prisma.activityLog.create({
    data: {
      orgId: session.orgId,
      userId: session.id,
      action: "FINDING_CREATED",
      findingId: finding.id,
      auditId: rest.auditId,
      meta: { title: rest.title, severity: rest.severity },
    },
  });

  revalidatePath("/findings");
  revalidatePath(`/audits/${rest.auditId}`);
  revalidatePath("/dashboard");
  return { data: { id: finding.id }, error: null, success: true };
}

// ─── Update finding ───────────────────────────────────────────────────────────

export async function updateFindingAction(
  findingId: string,
  input: FindingInput,
): Promise<ApiResponse<null>> {
  const session = await requireRole(["ADMIN", "AUDITOR"]);

  const parsed = findingSchema.safeParse(input);
  if (!parsed.success) {
    return {
      data: null,
      error: parsed.error.errors[0].message,
      success: false,
    };
  }

  const existing = await prisma.finding.findFirst({
    where: { id: findingId, orgId: session.orgId },
  });
  if (!existing) {
    return { data: null, error: "Finding not found.", success: false };
  }

  const { dueDate, ...rest } = parsed.data;

  await prisma.finding.update({
    where: { id: findingId },
    data: {
      ...rest,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  });

  await prisma.activityLog.create({
    data: {
      orgId: session.orgId,
      userId: session.id,
      action: "FINDING_UPDATED",
      findingId,
      meta: { title: rest.title },
    },
  });

  revalidatePath(`/findings/${findingId}`);
  revalidatePath("/findings");
  return { data: null, error: null, success: true };
}

// ─── Update finding status ────────────────────────────────────────────────────

export async function updateFindingStatusAction(
  findingId: string,
  status: "OPEN" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED" | "CLOSED",
): Promise<ApiResponse<null>> {
  const session = await requireRole(["ADMIN", "AUDITOR", "MANAGER"]);

  const existing = await prisma.finding.findFirst({
    where: { id: findingId, orgId: session.orgId },
  });
  if (!existing) {
    return { data: null, error: "Finding not found.", success: false };
  }

  const resolvedAt =
    status === "RESOLVED" || status === "CLOSED" ? new Date() : null;

  await prisma.finding.update({
    where: { id: findingId },
    data: {
      status,
      ...(resolvedAt !== undefined && { resolvedAt }),
    },
  });

  await prisma.activityLog.create({
    data: {
      orgId: session.orgId,
      userId: session.id,
      action: "FINDING_STATUS_CHANGED",
      findingId,
      meta: { from: existing.status, to: status },
    },
  });

  revalidatePath(`/findings/${findingId}`);
  revalidatePath("/findings");
  revalidatePath("/dashboard");
  return { data: null, error: null, success: true };
}

// ─── Update finding severity ──────────────────────────────────────────────────

export async function updateFindingSeverityAction(
  findingId: string,
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
): Promise<ApiResponse<null>> {
  const session = await requireRole(["ADMIN", "AUDITOR"]);

  const existing = await prisma.finding.findFirst({
    where: { id: findingId, orgId: session.orgId },
  });
  if (!existing) {
    return { data: null, error: "Finding not found.", success: false };
  }

  await prisma.finding.update({
    where: { id: findingId },
    data: { severity },
  });

  await prisma.activityLog.create({
    data: {
      orgId: session.orgId,
      userId: session.id,
      action: "FINDING_SEVERITY_CHANGED",
      findingId,
      meta: { from: existing.severity, to: severity },
    },
  });

  revalidatePath(`/findings/${findingId}`);
  revalidatePath("/findings");
  return { data: null, error: null, success: true };
}

// ─── Delete finding ───────────────────────────────────────────────────────────

export async function deleteFindingAction(
  findingId: string,
): Promise<ApiResponse<null>> {
  const session = await requireRole(["ADMIN"]);

  const existing = await prisma.finding.findFirst({
    where: { id: findingId, orgId: session.orgId },
    select: { auditId: true },
  });
  if (!existing) {
    return { data: null, error: "Finding not found.", success: false };
  }

  await prisma.finding.delete({ where: { id: findingId } });

  revalidatePath("/findings");
  revalidatePath(`/audits/${existing.auditId}`);
  revalidatePath("/dashboard");
  redirect("/findings");
}
