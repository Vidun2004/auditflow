"use server";

import { prisma } from "@auditflow/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { riskSchema, type RiskInput } from "@/lib/validations";
import { requireRole } from "@/lib/session";
import { calculateRiskScore } from "@/server/services/risk.service";
import type { ApiResponse } from "@/types";

// ─── Create risk ──────────────────────────────────────────────────────────────

export async function createRiskAction(
  input: RiskInput,
): Promise<ApiResponse<{ id: string }>> {
  const session = await requireRole(["ADMIN", "AUDITOR", "MANAGER"]);

  const parsed = riskSchema.safeParse(input);
  if (!parsed.success) {
    return {
      data: null,
      error: parsed.error.errors[0].message,
      success: false,
    };
  }

  const { reviewDate, ...rest } = parsed.data;
  const score = calculateRiskScore(rest.likelihood, rest.impact);

  const risk = await prisma.risk.create({
    data: {
      ...rest,
      orgId: session.orgId,
      score,
      reviewDate: reviewDate ? new Date(reviewDate) : undefined,
    },
    select: { id: true },
  });

  await prisma.activityLog.create({
    data: {
      orgId: session.orgId,
      userId: session.id,
      action: "RISK_CREATED",
      riskId: risk.id,
      meta: { name: rest.name, score },
    },
  });

  revalidatePath("/risks");
  revalidatePath("/dashboard");
  return { data: { id: risk.id }, error: null, success: true };
}

// ─── Update risk ──────────────────────────────────────────────────────────────

export async function updateRiskAction(
  riskId: string,
  input: RiskInput,
): Promise<ApiResponse<null>> {
  const session = await requireRole(["ADMIN", "AUDITOR", "MANAGER"]);

  const parsed = riskSchema.safeParse(input);
  if (!parsed.success) {
    return {
      data: null,
      error: parsed.error.errors[0].message,
      success: false,
    };
  }

  const existing = await prisma.risk.findFirst({
    where: { id: riskId, orgId: session.orgId },
  });
  if (!existing) {
    return { data: null, error: "Risk not found.", success: false };
  }

  const { reviewDate, ...rest } = parsed.data;
  const score = calculateRiskScore(rest.likelihood, rest.impact);

  await prisma.risk.update({
    where: { id: riskId },
    data: {
      ...rest,
      score,
      reviewDate: reviewDate ? new Date(reviewDate) : null,
    },
  });

  await prisma.activityLog.create({
    data: {
      orgId: session.orgId,
      userId: session.id,
      action: "RISK_UPDATED",
      riskId,
      meta: { name: rest.name, score },
    },
  });

  revalidatePath(`/risks/${riskId}`);
  revalidatePath("/risks");
  revalidatePath("/dashboard");
  return { data: null, error: null, success: true };
}

// ─── Update risk status ───────────────────────────────────────────────────────

export async function updateRiskStatusAction(
  riskId: string,
  status: "OPEN" | "MITIGATED" | "ACCEPTED" | "CLOSED",
): Promise<ApiResponse<null>> {
  const session = await requireRole(["ADMIN", "AUDITOR", "MANAGER"]);

  const existing = await prisma.risk.findFirst({
    where: { id: riskId, orgId: session.orgId },
  });
  if (!existing) {
    return { data: null, error: "Risk not found.", success: false };
  }

  await prisma.risk.update({
    where: { id: riskId },
    data: { status },
  });

  await prisma.activityLog.create({
    data: {
      orgId: session.orgId,
      userId: session.id,
      action: "RISK_STATUS_CHANGED",
      riskId,
      meta: { from: existing.status, to: status },
    },
  });

  revalidatePath(`/risks/${riskId}`);
  revalidatePath("/risks");
  revalidatePath("/dashboard");
  return { data: null, error: null, success: true };
}

// ─── Delete risk ──────────────────────────────────────────────────────────────

export async function deleteRiskAction(
  riskId: string,
): Promise<ApiResponse<null>> {
  const session = await requireRole(["ADMIN"]);

  const existing = await prisma.risk.findFirst({
    where: { id: riskId, orgId: session.orgId },
  });
  if (!existing) {
    return { data: null, error: "Risk not found.", success: false };
  }

  await prisma.risk.delete({ where: { id: riskId } });

  revalidatePath("/risks");
  revalidatePath("/dashboard");
  redirect("/risks");
}
