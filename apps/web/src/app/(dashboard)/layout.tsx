import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { AppShell } from "@/components/layout/app-shell";
import { prisma } from "@auditflow/db";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();

  if (session.role === "SUPER_ADMIN") {
    redirect(process.env.NEXT_PUBLIC_ADMIN_URL ?? "http://localhost:3001");
  }

  const unreadCount = await prisma.notification.count({
    where: { orgId: session.orgId, userId: session.id, isRead: false },
  });

  return (
    <AppShell session={session} unreadCount={unreadCount}>
      {children}
    </AppShell>
  );
}
