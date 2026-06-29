"use client";

import { useState } from "react";
import { getDownloadUrlAction } from "@/server/actions/evidence.actions";
import { Spinner } from "@/components/loading";

interface Props {
  evidenceId: string;
  fileName: string;
}

export function EvidenceDownloadButton({ evidenceId, fileName }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setLoading(true);
    setError(null);

    const result = await getDownloadUrlAction(evidenceId);

    if (!result.success || !result.data) {
      setError(result.error ?? "Download failed.");
      setLoading(false);
      return;
    }

    // Trigger browser download
    const a = document.createElement("a");
    a.href = result.data.url;
    a.download = result.data.name;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setLoading(false);
  }

  return (
    <div>
      <button
        onClick={handleDownload}
        disabled={loading}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-50"
        title={`Download ${fileName}`}
      >
        {loading ? (
          <Spinner size="sm" />
        ) : (
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="square"
              strokeLinejoin="miter"
              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
            />
          </svg>
        )}
        Download
      </button>
      {error && <p className="text-xs text-red-600 mt-0.5">{error}</p>}
    </div>
  );
}
