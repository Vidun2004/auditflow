"use client";

import { useState } from "react";
import { Spinner } from "@/components/loading";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  url: string;
  filename: string;
  variant?: "filled" | "outline";
  size?: "sm" | "md";
}

export function ReportDownloadButton({
  label,
  url,
  filename,
  variant = "filled",
  size = "md",
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to generate report.");

      const blob = await res.blob();
      const objUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objUrl);
    } catch (err) {
      setError("Download failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleDownload}
        disabled={loading}
        className={cn(
          "flex items-center gap-2 border font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
          size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm",
          variant === "filled"
            ? "border-gray-900 bg-gray-900 text-white hover:bg-gray-800"
            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50",
        )}
      >
        {loading ? (
          <Spinner
            size="sm"
            className={
              variant === "filled"
                ? "border-white border-t-gray-400"
                : "border-gray-300 border-t-gray-600"
            }
          />
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
        {loading ? "Generating..." : label}
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
