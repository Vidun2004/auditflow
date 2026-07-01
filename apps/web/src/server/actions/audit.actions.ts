"use server";

import { prisma } from "@auditflow/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auditSchema, type AuditInput } from "@/lib/validations";
import { requireSession, requireRole } from "@/lib/session";
import { notifyAuditAssigned } from "@/lib/notifications";
import type { ApiResponse } from "@/types";

// ─── Create audit ─────────────────────────────────────────────────────────────

export async function createAuditAction(
  input: AuditInput,
): Promise<ApiResponse<{ id: string }>> {
  const session = await requireRole(["ADMIN", "AUDITOR"]);

  const parsed = auditSchema.safeParse(input);
  if (!parsed.success) {
    return {
      data: null,
      error: parsed.error.errors[0].message,
      success: false,
    };
  }

  const { assigneeIds, startDate, endDate, ...rest } = parsed.data;

  const audit = await prisma.audit.create({
    data: {
      ...rest,
      orgId: session.orgId,
      createdById: session.id,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      assignees: assigneeIds?.length
        ? { connect: assigneeIds.map((id) => ({ id })) }
        : undefined,
    },
    select: { id: true },
  });

  await prisma.activityLog.create({
    data: {
      orgId: session.orgId,
      userId: session.id,
      action: "AUDIT_CREATED",
      auditId: audit.id,
      meta: { title: rest.title, type: rest.type },
    },
  });

  // Notify assignees (skip creator)
  if (assigneeIds?.length) {
    const othersToNotify = assigneeIds.filter((id) => id !== session.id);
    if (othersToNotify.length) {
      await notifyAuditAssigned(
        session.orgId,
        audit.id,
        rest.title,
        othersToNotify,
      );
    }
  }

  revalidatePath("/audits");
  return { data: { id: audit.id }, error: null, success: true };
}

// ─── Update audit ─────────────────────────────────────────────────────────────

export async function updateAuditAction(
  auditId: string,
  input: AuditInput,
): Promise<ApiResponse<null>> {
  const session = await requireRole(["ADMIN", "AUDITOR"]);

  const parsed = auditSchema.safeParse(input);
  if (!parsed.success) {
    return {
      data: null,
      error: parsed.error.errors[0].message,
      success: false,
    };
  }

  const existing = await prisma.audit.findFirst({
    where: { id: auditId, orgId: session.orgId },
    include: { assignees: { select: { id: true } } },
  });
  if (!existing) {
    return { data: null, error: "Audit not found.", success: false };
  }

  const { assigneeIds, startDate, endDate, ...rest } = parsed.data;

  await prisma.audit.update({
    where: { id: auditId },
    data: {
      ...rest,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      assignees: { set: assigneeIds?.map((id) => ({ id })) ?? [] },
    },
  });

  await prisma.activityLog.create({
    data: {
      orgId: session.orgId,
      userId: session.id,
      action: "AUDIT_UPDATED",
      auditId,
      meta: { title: rest.title },
    },
  });

  // Notify newly added assignees only
  if (assigneeIds?.length) {
    const existingIds = existing.assignees.map((a) => a.id);
    const newlyAdded = assigneeIds.filter(
      (id) => !existingIds.includes(id) && id !== session.id,
    );
    if (newlyAdded.length) {
      await notifyAuditAssigned(session.orgId, auditId, rest.title, newlyAdded);
    }
  }

  revalidatePath(`/audits/${auditId}`);
  revalidatePath("/audits");
  return { data: null, error: null, success: true };
}

// ─── Update audit status ──────────────────────────────────────────────────────

export async function updateAuditStatusAction(
  auditId: string,
  status: "DRAFT" | "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED",
): Promise<ApiResponse<null>> {
  const session = await requireRole(["ADMIN", "AUDITOR"]);

  const existing = await prisma.audit.findFirst({
    where: { id: auditId, orgId: session.orgId },
  });
  if (!existing) {
    return { data: null, error: "Audit not found.", success: false };
  }

  await prisma.audit.update({
    where: { id: auditId },
    data: { status },
  });

  await prisma.activityLog.create({
    data: {
      orgId: session.orgId,
      userId: session.id,
      action: "AUDIT_STATUS_CHANGED",
      auditId,
      meta: { from: existing.status, to: status },
    },
  });

  revalidatePath(`/audits/${auditId}`);
  revalidatePath("/audits");
  revalidatePath("/dashboard");
  return { data: null, error: null, success: true };
}

// ─── Delete audit ─────────────────────────────────────────────────────────────

export async function deleteAuditAction(
  auditId: string,
): Promise<ApiResponse<null>> {
  const session = await requireRole(["ADMIN"]);

  const existing = await prisma.audit.findFirst({
    where: { id: auditId, orgId: session.orgId },
  });
  if (!existing) {
    return { data: null, error: "Audit not found.", success: false };
  }

  await prisma.audit.delete({ where: { id: auditId } });

  revalidatePath("/audits");
  revalidatePath("/dashboard");
  redirect("/audits");
}
