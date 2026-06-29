import { createAdminClient } from "@/lib/supabase/admin";

const EVIDENCE_BUCKET = "evidence-files";

// ─── Generate signed upload URL (server → client gets this URL) ───────────────

export async function getSignedUploadUrl(
  orgId: string,
  fileName: string,
  fileType: string,
): Promise<{ signedUrl: string; path: string; token: string } | null> {
  const supabase = createAdminClient();

  // Sanitize filename
  const sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, "_").toLowerCase();

  const path = `${orgId}/${Date.now()}_${sanitized}`;

  const { data, error } = await supabase.storage
    .from(EVIDENCE_BUCKET)
    .createSignedUploadUrl(path);

  if (error || !data) {
    console.error("getSignedUploadUrl error:", error);
    return null;
  }

  return { signedUrl: data.signedUrl, path, token: data.token };
}

// ─── Generate signed download URL ─────────────────────────────────────────────

export async function getSignedDownloadUrl(
  path: string,
  expiresIn = 3600,
): Promise<string | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase.storage
    .from(EVIDENCE_BUCKET)
    .createSignedUrl(path, expiresIn);

  if (error || !data) {
    console.error("getSignedDownloadUrl error:", error);
    return null;
  }

  return data.signedUrl;
}

// ─── Delete file ──────────────────────────────────────────────────────────────

export async function deleteStorageFile(path: string): Promise<boolean> {
  const supabase = createAdminClient();

  const { error } = await supabase.storage.from(EVIDENCE_BUCKET).remove([path]);

  if (error) {
    console.error("deleteStorageFile error:", error);
    return false;
  }

  return true;
}

// ─── Extract storage path from URL ───────────────────────────────────────────

export function extractStoragePath(fileUrl: string): string {
  // fileUrl is stored as the path, not the full URL
  return fileUrl;
}
