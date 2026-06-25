import type { Metadata } from "next";
import Link from "next/link";
import { BookOpenCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Authentication",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <BookOpenCheck className="h-6 w-6 text-gray-900" />
          <span className="text-sm font-semibold tracking-tight text-gray-900">
            AuditFlow
          </span>
        </Link>
      </div>

      {/* Content */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">{children}</div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 px-6 py-4">
        <p className="text-center text-xs text-gray-400">
          © {new Date().getFullYear()} AuditFlow. Enterprise Compliance
          Platform.
        </p>
      </div>
    </div>
  );
}
