"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { prisma } from "@auditflow/db";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  loginSchema,
  registerSchema,
  inviteAcceptSchema,
} from "@/lib/validations";
import type { ApiResponse } from "@/types";
import { sendOrgApprovalInvite, sendUserInvite } from "@/lib/email/resend";

// ─── Login ────────────────────────────────────────────────────────────────────

export async function loginAction(
  formData: z.infer<typeof loginSchema>,
): Promise<ApiResponse<null>> {
  const parsed = loginSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      data: null,
      error: parsed.error.errors[0].message,
      success: false,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { data: null, error: "Invalid email or password.", success: false };
  }

  // Check user exists in DB and org is active
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return { data: null, error: "Authentication failed.", success: false };

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    include: { organization: { select: { status: true } } },
  });

  if (!dbUser) {
    return { data: null, error: "User account not found.", success: false };
  }

  if (!dbUser.isActive) {
    await supabase.auth.signOut();
    return {
      data: null,
      error: "Your account has been deactivated.",
      success: false,
    };
  }

  if (dbUser.organization?.status === "PENDING") {
    return { data: null, error: "PENDING", success: false };
  }

  if (dbUser.organization?.status === "SUSPENDED") {
    await supabase.auth.signOut();
    return {
      data: null,
      error: "Your organization has been suspended.",
      success: false,
    };
  }

  if (dbUser.organization?.status === "REJECTED") {
    await supabase.auth.signOut();
    return {
      data: null,
      error: "Your organization registration was rejected.",
      success: false,
    };
  }

  // Update last login
  await prisma.user.update({
    where: { id: dbUser.id },
    data: { lastLoginAt: new Date() },
  });

  return { data: null, error: null, success: true };
}

// ─── Register (Org + User) ────────────────────────────────────────────────────

export async function registerAction(
  formData: z.infer<typeof registerSchema>,
): Promise<ApiResponse<{ orgSlug: string }>> {
  const parsed = registerSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      data: null,
      error: parsed.error.errors[0].message,
      success: false,
    };
  }

  const { orgName, email, password } = parsed.data;

  // Check if email already registered
  const existingUser = await prisma.user.findFirst({
    where: { email },
  });
  if (existingUser) {
    return {
      data: null,
      error: "An account with this email already exists.",
      success: false,
    };
  }

  // Generate unique slug
  const baseSlug = orgName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  let slug = baseSlug;
  let slugCount = 0;
  while (await prisma.organization.findUnique({ where: { slug } })) {
    slugCount++;
    slug = `${baseSlug}-${slugCount}`;
  }

  // Create Supabase auth user
  const adminClient = createAdminClient();
  const { data: authData, error: authError } =
    await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // auto-confirm since we're using invite flow
    });

  if (authError || !authData.user) {
    return {
      data: null,
      error: authError?.message ?? "Failed to create account.",
      success: false,
    };
  }

  try {
    // Create org + settings + user in one transaction
    await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: orgName,
          slug,
          status: "PENDING",
          settings: {
            create: {
              displayName: orgName,
              accentColor: "#0f172a",
              timezone: "UTC",
              dateFormat: "DD/MM/YYYY",
            },
          },
        },
      });

      await tx.user.create({
        data: {
          supabaseId: authData.user.id,
          email,
          role: "ADMIN",
          orgId: org.id,
          isActive: true,
        },
      });
    });

    return { data: { orgSlug: slug }, error: null, success: true };
  } catch (err) {
    // Rollback Supabase user if DB fails
    await adminClient.auth.admin.deleteUser(authData.user.id);
    console.error("Register transaction failed:", err);
    return {
      data: null,
      error: "Registration failed. Please try again.",
      success: false,
    };
  }
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

// ─── Accept Invite ────────────────────────────────────────────────────────────

export async function acceptInviteAction(
  token: string,
  formData: z.infer<typeof inviteAcceptSchema>,
): Promise<ApiResponse<null>> {
  const parsed = inviteAcceptSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      data: null,
      error: parsed.error.errors[0].message,
      success: false,
    };
  }

  // Validate token
  const invite = await prisma.orgInvite.findUnique({
    where: { token },
    include: { organization: true },
  });

  if (!invite) {
    return {
      data: null,
      error: "Invalid or expired invite link.",
      success: false,
    };
  }
  if (invite.accepted) {
    return {
      data: null,
      error: "This invite has already been used.",
      success: false,
    };
  }
  if (invite.expiresAt < new Date()) {
    return {
      data: null,
      error: "This invite link has expired.",
      success: false,
    };
  }
  if (invite.organization.status !== "ACTIVE") {
    return {
      data: null,
      error: "This organization is not yet active.",
      success: false,
    };
  }

  const adminClient = createAdminClient();

  // Create Supabase user
  const { data: authData, error: authError } =
    await adminClient.auth.admin.createUser({
      email: invite.email,
      password: parsed.data.password,
      email_confirm: true,
    });

  if (authError || !authData.user) {
    return {
      data: null,
      error: authError?.message ?? "Failed to create account.",
      success: false,
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Create user record
      await tx.user.create({
        data: {
          supabaseId: authData.user.id,
          email: invite.email,
          name: parsed.data.name,
          role: invite.role,
          orgId: invite.orgId,
          isActive: true,
        },
      });

      // Mark invite as accepted
      await tx.orgInvite.update({
        where: { id: invite.id },
        data: { accepted: true },
      });

      // Log activity
      await tx.activityLog.create({
        data: {
          orgId: invite.orgId,
          action: "USER_JOINED",
          entity: "User",
          entityId: authData.user.id,
          meta: { email: invite.email, role: invite.role },
        },
      });
    });

    return { data: null, error: null, success: true };
  } catch (err) {
    await adminClient.auth.admin.deleteUser(authData.user.id);
    console.error("Accept invite failed:", err);
    return {
      data: null,
      error: "Failed to complete registration.",
      success: false,
    };
  }
}

// ─── Invite User (from Settings → Users) ─────────────────────────────────────

export async function inviteUserAction(
  orgId: string,
  email: string,
  role: "ADMIN" | "AUDITOR" | "MANAGER" | "EMPLOYEE",
  sentById: string,
): Promise<ApiResponse<null>> {
  // Check not already a member
  const existing = await prisma.user.findFirst({
    where: { email, orgId },
  });
  if (existing) {
    return {
      data: null,
      error: "This user is already a member of your organization.",
      success: false,
    };
  }

  // Check no pending invite
  const pending = await prisma.orgInvite.findFirst({
    where: { email, orgId, accepted: false, expiresAt: { gt: new Date() } },
  });
  if (pending) {
    return {
      data: null,
      error: "An invite has already been sent to this email.",
      success: false,
    };
  }

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { name: true },
  });
  if (!org)
    return { data: null, error: "Organization not found.", success: false };

  // Create invite record
  const invite = await prisma.orgInvite.create({
    data: {
      orgId,
      email,
      role,
      sentById,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  // Send invite email
  const emailResult = await sendUserInvite({
    to: email,
    orgName: org.name,
    role,
    inviteToken: invite.token,
  });

  if (!emailResult.success) {
    console.error("Failed to send invite email:", emailResult.error);
    // Don't fail the action — invite is created, email can be resent
  }

  revalidatePath("/settings/users");
  return { data: null, error: null, success: true };
}
