"use client";

import { useState } from "react";
import { EvidenceDownloadButton } from "./evidence-download-button";
import { EvidenceDeleteButton } from "./evidence-delete-button";
import { cn } from "@/lib/utils";

interface EvidenceItem {
  id: string;
  name: string;
  fileType: string;
  fileSizeKb: number | null;
  createdAt: Date;
}

interface Props {
  items: EvidenceItem[];
  canDelete?: boolean;
  className?: string;
}

function formatBytes(kb: number | null): string {
  if (!kb) return "";
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function getFileIcon(type: string): {
  label: string;
  bg: string;
  text: string;
} {
  if (type.includes("pdf"))
    return { label: "PDF", bg: "bg-red-50", text: "text-red-700" };
  if (type.includes("image"))
    return { label: "IMG", bg: "bg-blue-50", text: "text-blue-700" };
  if (type.includes("sheet") || type.includes("excel") || type.includes("csv"))
    return { label: "XLS", bg: "bg-green-50", text: "text-green-700" };
  if (type.includes("word"))
    return { label: "DOC", bg: "bg-indigo-50", text: "text-indigo-700" };
  return { label: "FILE", bg: "bg-gray-50", text: "text-gray-600" };
}

export function EvidenceList({ items, canDelete, className }: Props) {
  const [localItems, setLocalItems] = useState(items);

  function handleDeleted(id: string) {
    setLocalItems((prev) => prev.filter((item) => item.id !== id));
  }

  if (localItems.length === 0) {
    return (
      <div className={cn("py-8 text-center", className)}>
        <p className="text-sm text-gray-400">No evidence files yet.</p>
      </div>
    );
  }

  return (
    <div className={cn("divide-y divide-gray-100", className)}>
      {localItems.map((item) => {
        const icon = getFileIcon(item.fileType);
        return (
          <div key={item.id} className="flex items-center gap-3 py-3 px-1">
            {/* Icon */}
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center border border-gray-100 shrink-0",
                icon.bg,
              )}
            >
              <span className={cn("text-xs font-bold", icon.text)}>
                {icon.label}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {item.name}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {formatBytes(item.fileSizeKb)}
                {item.fileSizeKb ? " · " : ""}
                {new Date(item.createdAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 shrink-0">
              <EvidenceDownloadButton
                evidenceId={item.id}
                fileName={item.name}
              />
              {canDelete && (
                <EvidenceDeleteButton
                  evidenceId={item.id}
                  fileName={item.name}
                  onDeleted={() => handleDeleted(item.id)}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
