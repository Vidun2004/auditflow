"use server";

import { prisma } from "@auditflow/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { actionSchema, type ActionInput } from "@/lib/validations";
import { requireSession, requireRole } from "@/lib/session";
import { notifyActionAssigned } from "@/lib/notifications";
import type { ApiResponse } from "@/types";

// ─── Create action ────────────────────────────────────────────────────────────

export async function createActionAction(
  input: ActionInput,
): Promise<ApiResponse<{ id: string }>> {
  const session = await requireRole(["ADMIN", "AUDITOR", "MANAGER"]);

  const parsed = actionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      data: null,
      error: parsed.error.errors[0].message,
      success: false,
    };
  }

  const { dueDate, ...rest } = parsed.data;

  const finding = await prisma.finding.findFirst({
    where: { id: rest.findingId, orgId: session.orgId },
    select: { id: true },
  });
  if (!finding) {
    return { data: null, error: "Finding not found.", success: false };
  }

  const action = await prisma.correctiveAction.create({
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
      action: "ACTION_CREATED",
      actionId: action.id,
      findingId: rest.findingId,
      meta: { title: rest.title },
    },
  });

  // Notify assignee if different from creator
  if (rest.assigneeId && rest.assigneeId !== session.id) {
    await notifyActionAssigned(
      session.orgId,
      action.id,
      rest.title,
      rest.assigneeId,
    );
  }

  revalidatePath("/actions");
  revalidatePath(`/findings/${rest.findingId}`);
  revalidatePath("/dashboard");
  return { data: { id: action.id }, error: null, success: true };
}

// ─── Update action ────────────────────────────────────────────────────────────

export async function updateActionAction(
  actionId: string,
  input: ActionInput,
): Promise<ApiResponse<null>> {
  const session = await requireRole(["ADMIN", "AUDITOR", "MANAGER"]);

  const parsed = actionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      data: null,
      error: parsed.error.errors[0].message,
      success: false,
    };
  }

  const existing = await prisma.correctiveAction.findFirst({
    where: { id: actionId, orgId: session.orgId },
  });
  if (!existing) {
    return { data: null, error: "Action not found.", success: false };
  }

  const { dueDate, ...rest } = parsed.data;

  await prisma.correctiveAction.update({
    where: { id: actionId },
    data: { ...rest, dueDate: dueDate ? new Date(dueDate) : null },
  });

  // Notify if assignee changed
  if (
    rest.assigneeId &&
    rest.assigneeId !== existing.assigneeId &&
    rest.assigneeId !== session.id
  ) {
    await notifyActionAssigned(
      session.orgId,
      actionId,
      rest.title,
      rest.assigneeId,
    );
  }

  await prisma.activityLog.create({
    data: {
      orgId: session.orgId,
      userId: session.id,
      action: "ACTION_UPDATED",
      actionId,
      meta: { title: rest.title },
    },
  });

  revalidatePath(`/actions/${actionId}`);
  revalidatePath("/actions");
  return { data: null, error: null, success: true };
}

// ─── Update status ────────────────────────────────────────────────────────────

export async function updateActionStatusAction(
  actionId: string,
  status: "OPEN" | "ASSIGNED" | "IN_PROGRESS" | "PENDING_REVIEW" | "CLOSED",
): Promise<ApiResponse<null>> {
  const session = await requireRole([
    "ADMIN",
    "AUDITOR",
    "MANAGER",
    "EMPLOYEE",
  ]);

  const existing = await prisma.correctiveAction.findFirst({
    where: { id: actionId, orgId: session.orgId },
  });
  if (!existing) {
    return { data: null, error: "Action not found.", success: false };
  }

  const closedAt = status === "CLOSED" ? new Date() : null;

  await prisma.correctiveAction.update({
    where: { id: actionId },
    data: {
      status,
      ...(closedAt !== undefined && { closedAt }),
      ...(status === "CLOSED" && { progress: 100 }),
    },
  });

  await prisma.activityLog.create({
    data: {
      orgId: session.orgId,
      userId: session.id,
      action: "ACTION_STATUS_CHANGED",
      actionId,
      meta: { from: existing.status, to: status },
    },
  });

  revalidatePath(`/actions/${actionId}`);
  revalidatePath("/actions");
  revalidatePath("/dashboard");
  return { data: null, error: null, success: true };
}

// ─── Update progress ──────────────────────────────────────────────────────────

export async function updateActionProgressAction(
  actionId: string,
  progress: number,
): Promise<ApiResponse<null>> {
  const session = await requireRole([
    "ADMIN",
    "AUDITOR",
    "MANAGER",
    "EMPLOYEE",
  ]);

  if (progress < 0 || progress > 100) {
    return {
      data: null,
      error: "Progress must be between 0 and 100.",
      success: false,
    };
  }

  const existing = await prisma.correctiveAction.findFirst({
    where: { id: actionId, orgId: session.orgId },
  });
  if (!existing) {
    return { data: null, error: "Action not found.", success: false };
  }

  await prisma.correctiveAction.update({
    where: { id: actionId },
    data: { progress },
  });

  revalidatePath(`/actions/${actionId}`);
  revalidatePath(`/findings/${existing.findingId}`);
  return { data: null, error: null, success: true };
}

// ─── Delete action ────────────────────────────────────────────────────────────

export async function deleteActionAction(
  actionId: string,
): Promise<ApiResponse<null>> {
  const session = await requireRole(["ADMIN"]);

  const existing = await prisma.correctiveAction.findFirst({
    where: { id: actionId, orgId: session.orgId },
    select: { findingId: true },
  });
  if (!existing) {
    return { data: null, error: "Action not found.", success: false };
  }

  await prisma.correctiveAction.delete({ where: { id: actionId } });

  revalidatePath("/actions");
  revalidatePath(`/findings/${existing.findingId}`);
  revalidatePath("/dashboard");
  redirect("/actions");
}
