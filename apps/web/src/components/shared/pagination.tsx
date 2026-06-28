"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
}

export function Pagination({
  page,
  totalPages,
  total,
  pageSize,
}: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function goTo(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`${pathname}?${params.toString()}`);
  }

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3">
      <p className="text-xs text-gray-500">
        Showing <span className="font-medium">{start}</span>–
        <span className="font-medium">{end}</span> of{" "}
        <span className="font-medium">{total}</span> results
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => goTo(page - 1)}
          disabled={page === 1}
          className={cn(
            "border border-gray-200 px-3 py-1.5 text-xs transition-colors",
            page === 1
              ? "cursor-not-allowed text-gray-300"
              : "text-gray-600 hover:border-gray-300 hover:text-gray-900",
          )}
        >
          Previous
        </button>

        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          const pageNum = i + 1;
          return (
            <button
              key={pageNum}
              onClick={() => goTo(pageNum)}
              className={cn(
                "border px-3 py-1.5 text-xs transition-colors",
                pageNum === page
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900",
              )}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          onClick={() => goTo(page + 1)}
          disabled={page === totalPages}
          className={cn(
            "border border-gray-200 px-3 py-1.5 text-xs transition-colors",
            page === totalPages
              ? "cursor-not-allowed text-gray-300"
              : "text-gray-600 hover:border-gray-300 hover:text-gray-900",
          )}
        >
          Next
        </button>
      </div>
    </div>
  );
}
