import { createClient } from "@/lib/supabase/server";
import { prisma } from "@auditflow/db";
import type { SessionUser } from "@/types";
import { redirect } from "next/navigation";

export async function getSession(): Promise<SessionUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    include: {
      organization: {
        include: {
          settings: true,
        },
      },
    },
  });

  if (!dbUser || !dbUser.organization || !dbUser.orgId) return null;

  const settings = dbUser.organization.settings;

  return {
    id: dbUser.id,
    supabaseId: dbUser.supabaseId,
    email: dbUser.email,
    name: dbUser.name,
    role: dbUser.role,
    orgId: dbUser.orgId,
    orgSlug: dbUser.organization.slug,
    orgName: dbUser.organization.name,
    orgAccentColor: settings?.accentColor ?? "#0f172a",
    orgLogoUrl: settings?.logoUrl ?? null,
    orgThemeMode: settings?.themeMode ?? "LIGHT",
  };
}

export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireRole(
  allowedRoles: SessionUser["role"][],
): Promise<SessionUser> {
  const session = await requireSession();
  if (!allowedRoles.includes(session.role)) redirect("/dashboard");
  return session;
}
