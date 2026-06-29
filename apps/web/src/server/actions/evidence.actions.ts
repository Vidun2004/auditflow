"use server";

import { prisma } from "@auditflow/db";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";
import {
  getSignedUploadUrl,
  getSignedDownloadUrl,
  deleteStorageFile,
} from "@/lib/supabase/storage";
import type { ApiResponse } from "@/types";

// ─── Get signed upload URL (called before upload) ────────────────────────────

export async function getUploadUrlAction(
  fileName: string,
  fileType: string,
): Promise<ApiResponse<{ signedUrl: string; path: string; token: string }>> {
  const session = await requireSession();

  const result = await getSignedUploadUrl(session.orgId, fileName, fileType);
  if (!result) {
    return {
      data: null,
      error: "Failed to generate upload URL.",
      success: false,
    };
  }

  return { data: result, error: null, success: true };
}

// ─── Save evidence record after successful upload ─────────────────────────────

export async function saveEvidenceAction(params: {
  name: string;
  fileUrl: string;
  fileType: string;
  fileSizeKb: number;
  auditId?: string;
  findingId?: string;
  actionId?: string;
}): Promise<ApiResponse<{ id: string }>> {
  const session = await requireSession();

  const evidence = await prisma.evidence.create({
    data: {
      orgId: session.orgId,
      name: params.name,
      fileUrl: params.fileUrl,
      fileType: params.fileType,
      fileSizeKb: params.fileSizeKb,
      uploadedById: session.id,
      auditId: params.auditId ?? null,
      findingId: params.findingId ?? null,
      actionId: params.actionId ?? null,
    },
    select: { id: true },
  });

  // Revalidate relevant paths
  if (params.auditId) revalidatePath(`/audits/${params.auditId}`);
  if (params.findingId) revalidatePath(`/findings/${params.findingId}`);
  if (params.actionId) revalidatePath(`/actions/${params.actionId}`);
  revalidatePath("/evidence");

  return { data: { id: evidence.id }, error: null, success: true };
}

// ─── Get signed download URL for a file ──────────────────────────────────────

export async function getDownloadUrlAction(
  evidenceId: string,
): Promise<ApiResponse<{ url: string; name: string }>> {
  const session = await requireSession();

  const evidence = await prisma.evidence.findFirst({
    where: { id: evidenceId, orgId: session.orgId },
    select: { fileUrl: true, name: true },
  });

  if (!evidence) {
    return { data: null, error: "File not found.", success: false };
  }

  const url = await getSignedDownloadUrl(evidence.fileUrl);
  if (!url) {
    return {
      data: null,
      error: "Failed to generate download URL.",
      success: false,
    };
  }

  return { data: { url, name: evidence.name }, error: null, success: true };
}

// ─── Delete evidence ──────────────────────────────────────────────────────────

export async function deleteEvidenceAction(
  evidenceId: string,
): Promise<ApiResponse<null>> {
  const session = await requireSession();

  const evidence = await prisma.evidence.findFirst({
    where: { id: evidenceId, orgId: session.orgId },
    select: {
      fileUrl: true,
      auditId: true,
      findingId: true,
      actionId: true,
    },
  });

  if (!evidence) {
    return { data: null, error: "Evidence not found.", success: false };
  }

  // Delete from storage
  await deleteStorageFile(evidence.fileUrl);

  // Delete DB record
  await prisma.evidence.delete({ where: { id: evidenceId } });

  if (evidence.auditId) revalidatePath(`/audits/${evidence.auditId}`);
  if (evidence.findingId) revalidatePath(`/findings/${evidence.findingId}`);
  if (evidence.actionId) revalidatePath(`/actions/${evidence.actionId}`);
  revalidatePath("/evidence");

  return { data: null, error: null, success: true };
}
