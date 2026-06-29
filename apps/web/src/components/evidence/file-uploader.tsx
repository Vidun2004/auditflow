"use client";

import { useState, useRef } from "react";
import {
  getUploadUrlAction,
  saveEvidenceAction,
} from "@/server/actions/evidence.actions";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/loading";

interface UploadedFile {
  id: string;
  name: string;
  fileType: string;
  fileSizeKb: number;
}

interface Props {
  auditId?: string;
  findingId?: string;
  actionId?: string;
  onUploadComplete?: (file: UploadedFile) => void;
  className?: string;
}

interface FileUploadState {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "saving" | "done" | "error";
  error?: string;
}

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/csv",
];

const MAX_FILE_SIZE_MB = 50;

function formatBytes(kb: number): string {
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function getFileIcon(type: string): string {
  if (type.includes("pdf")) return "PDF";
  if (type.includes("image")) return "IMG";
  if (type.includes("sheet") || type.includes("excel") || type.includes("csv"))
    return "XLS";
  if (type.includes("word")) return "DOC";
  return "FILE";
}

export function FileUploader({
  auditId,
  findingId,
  actionId,
  onUploadComplete,
  className,
}: Props) {
  const [uploads, setUploads] = useState<FileUploadState[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function updateUpload(index: number, patch: Partial<FileUploadState>) {
    setUploads((prev) =>
      prev.map((u, i) => (i === index ? { ...u, ...patch } : u)),
    );
  }

  async function uploadFile(file: File, index: number) {
    // Validate type
    if (!ALLOWED_TYPES.includes(file.type)) {
      updateUpload(index, {
        status: "error",
        error: "File type not allowed.",
      });
      return;
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      updateUpload(index, {
        status: "error",
        error: `File exceeds ${MAX_FILE_SIZE_MB}MB limit.`,
      });
      return;
    }

    updateUpload(index, { status: "uploading", progress: 0 });

    // 1. Get signed upload URL from server
    const urlResult = await getUploadUrlAction(file.name, file.type);
    if (!urlResult.success || !urlResult.data) {
      updateUpload(index, {
        status: "error",
        error: urlResult.error ?? "Upload failed.",
      });
      return;
    }

    const { signedUrl, path } = urlResult.data;

    // 2. Upload directly to Supabase Storage via XHR (for progress tracking)
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          updateUpload(index, { progress: pct });
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      };

      xhr.onerror = () => reject(new Error("Network error during upload."));

      xhr.open("PUT", signedUrl);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.send(file);
    }).catch((err) => {
      updateUpload(index, { status: "error", error: err.message });
      return;
    });

    // Check if we bailed
    const current = uploads[index];
    if (current?.status === "error") return;

    // 3. Save evidence record in DB
    updateUpload(index, { status: "saving", progress: 100 });

    const fileSizeKb = Math.round(file.size / 1024);
    const saveResult = await saveEvidenceAction({
      name: file.name,
      fileUrl: path,
      fileType: file.type,
      fileSizeKb,
      auditId,
      findingId,
      actionId,
    });

    if (!saveResult.success || !saveResult.data) {
      updateUpload(index, {
        status: "error",
        error: saveResult.error ?? "Failed to save file record.",
      });
      return;
    }

    updateUpload(index, { status: "done", progress: 100 });

    onUploadComplete?.({
      id: saveResult.data.id,
      name: file.name,
      fileType: file.type,
      fileSizeKb,
    });
  }

  async function handleFiles(files: FileList | File[]) {
    const fileArray = Array.from(files);
    const startIndex = uploads.length;

    // Add all files to state first
    setUploads((prev) => [
      ...prev,
      ...fileArray.map((file) => ({
        file,
        progress: 0,
        status: "pending" as const,
      })),
    ]);

    // Upload concurrently (max 3 at a time)
    const chunks = [];
    for (let i = 0; i < fileArray.length; i += 3) {
      chunks.push(
        fileArray
          .slice(i, i + 3)
          .map((f, j) => ({ f, idx: startIndex + i + j })),
      );
    }

    for (const chunk of chunks) {
      await Promise.all(chunk.map(({ f, idx }) => uploadFile(f, idx)));
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function removeUpload(index: number) {
    setUploads((prev) => prev.filter((_, i) => i !== index));
  }

  const pendingCount = uploads.filter(
    (u) => u.status === "uploading" || u.status === "saving",
  ).length;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex flex-col items-center justify-center border-2 border-dashed px-6 py-10 cursor-pointer transition-colors",
          isDragging
            ? "border-gray-900 bg-gray-50"
            : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ALLOWED_TYPES.join(",")}
          className="sr-only"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />

        <div className="flex h-10 w-10 items-center justify-center border border-gray-200 bg-white mb-3">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="square"
              strokeLinejoin="miter"
              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
            />
          </svg>
        </div>

        <p className="text-sm font-medium text-gray-700">
          {isDragging ? "Drop files here" : "Click or drag files to upload"}
        </p>
        <p className="mt-1 text-xs text-gray-400">
          PDF, images, Excel, Word, CSV — up to {MAX_FILE_SIZE_MB}MB each
        </p>

        {pendingCount > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <Spinner size="sm" />
            <span className="text-xs text-gray-500">
              Uploading {pendingCount} file{pendingCount !== 1 ? "s" : ""}...
            </span>
          </div>
        )}
      </div>

      {/* Upload list */}
      {uploads.length > 0 && (
        <div className="border border-gray-200 divide-y divide-gray-100">
          {uploads.map((upload, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              {/* File type icon */}
              <div className="flex h-8 w-8 items-center justify-center border border-gray-200 bg-gray-50 shrink-0">
                <span className="text-xs font-bold text-gray-500">
                  {getFileIcon(upload.file.type)}
                </span>
              </div>

              {/* File info + progress */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {upload.file.name}
                  </p>
                  <span className="text-xs text-gray-400 shrink-0">
                    {formatBytes(Math.round(upload.file.size / 1024))}
                  </span>
                </div>

                {/* Progress bar */}
                {(upload.status === "uploading" ||
                  upload.status === "saving") && (
                  <div className="space-y-0.5">
                    <div className="h-1 bg-gray-100">
                      <div
                        className="h-1 bg-gray-900 transition-all duration-200"
                        style={{ width: `${upload.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400">
                      {upload.status === "saving"
                        ? "Saving..."
                        : `${upload.progress}%`}
                    </p>
                  </div>
                )}

                {upload.status === "done" && (
                  <p className="text-xs text-green-600 font-medium">
                    ✓ Uploaded
                  </p>
                )}

                {upload.status === "error" && (
                  <p className="text-xs text-red-600">{upload.error}</p>
                )}
              </div>

              {/* Remove button */}
              {(upload.status === "done" || upload.status === "error") && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeUpload(i);
                  }}
                  className="shrink-0 text-gray-300 hover:text-gray-600 transition-colors"
                  aria-label="Remove"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="square"
                      strokeLinejoin="miter"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
