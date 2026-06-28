"use client";

import { useRouter } from "next/navigation";

type AuditRowProps = {
  children: React.ReactNode;
  auditId: string;
};

export function AuditRow({ children, auditId }: AuditRowProps) {
  const router = useRouter();

  return (
    <tr
      onClick={() => router.push(`/audits/${auditId}`)}
      className="cursor-pointer hover:bg-gray-50 transition-colors"
    >
      {children}
    </tr>
  );
}
