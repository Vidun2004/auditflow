import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { AppShell } from "@/components/layout/app-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();

  if (session.role === "SUPER_ADMIN") {
    redirect(process.env.NEXT_PUBLIC_ADMIN_URL ?? "http://localhost:3001");
  }

  return <AppShell session={session}>{children}</AppShell>;
}
