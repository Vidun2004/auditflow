"use server";

import { prisma } from "@auditflow/db";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/session";
import {
  mapFindingToControl,
  unmapFindingFromControl,
} from "@/server/services/compliance.service";
import type { ApiResponse, Framework } from "@/types";

export async function mapFindingToControlAction(
  findingId: string,
  controlId: string,
  notes?: string,
): Promise<ApiResponse<null>> {
  const session = await requireRole(["ADMIN", "AUDITOR"]);

  const [finding, control] = await Promise.all([
    prisma.finding.findFirst({
      where: { id: findingId, orgId: session.orgId },
      select: { id: true },
    }),
    prisma.control.findFirst({
      where: { id: controlId, orgId: session.orgId },
      select: { id: true },
    }),
  ]);

  if (!finding)
    return { data: null, error: "Finding not found.", success: false };
  if (!control)
    return { data: null, error: "Control not found.", success: false };

  await mapFindingToControl(session.orgId, findingId, controlId, notes);

  revalidatePath(`/findings/${findingId}`);
  revalidatePath("/compliance");
  return { data: null, error: null, success: true };
}

export async function unmapFindingFromControlAction(
  findingId: string,
  controlId: string,
): Promise<ApiResponse<null>> {
  const session = await requireRole(["ADMIN", "AUDITOR"]);

  await unmapFindingFromControl(controlId, findingId);

  revalidatePath(`/findings/${findingId}`);
  revalidatePath("/compliance");
  return { data: null, error: null, success: true };
}

export async function toggleControlAction(
  controlId: string,
  enabled: boolean,
): Promise<ApiResponse<null>> {
  const session = await requireRole(["ADMIN"]);

  await prisma.control.updateMany({
    where: { id: controlId, orgId: session.orgId },
    data: { isEnabled: enabled },
  });

  revalidatePath("/compliance");
  return { data: null, error: null, success: true };
}

export async function toggleOrgFrameworkAction(
  framework: Framework,
  enabled: boolean,
): Promise<ApiResponse<null>> {
  const session = await requireRole(["ADMIN"]);

  await prisma.orgFramework.upsert({
    where: { orgId_framework: { orgId: session.orgId, framework } },
    update: { enabled },
    create: { orgId: session.orgId, framework, enabled },
  });

  revalidatePath("/compliance");
  revalidatePath("/settings/frameworks");
  return { data: null, error: null, success: true };
}
