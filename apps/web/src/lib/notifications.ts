import { prisma } from "@auditflow/db";
import type { NotificationType } from "@/types";
import { sendDeadlineReminder } from "@/lib/email/resend";

interface CreateNotificationParams {
  orgId: string;
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  linkUrl?: string;
  sendEmail?: boolean;
  userEmail?: string;
  userName?: string;
}

export async function createNotification(params: CreateNotificationParams) {
  const {
    orgId,
    userId,
    type,
    title,
    body,
    linkUrl,
    sendEmail,
    userEmail,
    userName,
  } = params;

  // Create in-app notification
  await prisma.notification.create({
    data: {
      orgId,
      userId,
      type,
      title,
      body: body ?? null,
      linkUrl: linkUrl ?? null,
      isRead: false,
    },
  });

  // Optionally send email
  if (sendEmail && userEmail && linkUrl) {
    const entityType =
      type === "AUDIT_ASSIGNED"
        ? "audit"
        : type === "ACTION_OVERDUE"
          ? "action"
          : "finding";

    await sendDeadlineReminder({
      to: userEmail,
      userName: userName ?? userEmail,
      entityType,
      entityTitle: title,
      dueDate: new Date().toLocaleDateString("en-GB"),
      entityUrl: `${process.env.NEXT_PUBLIC_APP_URL}${linkUrl}`,
    });
  }
}

// ─── Notify all assignees of an audit ─────────────────────────────────────────

export async function notifyAuditAssigned(
  orgId: string,
  auditId: string,
  auditTitle: string,
  assigneeIds: string[],
) {
  if (!assigneeIds.length) return;

  const users = await prisma.user.findMany({
    where: { id: { in: assigneeIds }, orgId },
    select: { id: true, email: true, name: true },
  });

  await Promise.all(
    users.map((user) =>
      createNotification({
        orgId,
        userId: user.id,
        type: "AUDIT_ASSIGNED",
        title: `You've been assigned to audit: ${auditTitle}`,
        body: "Click to view the audit details and your responsibilities.",
        linkUrl: `/audits/${auditId}`,
        sendEmail: true,
        userEmail: user.email,
        userName: user.name ?? user.email,
      }),
    ),
  );
}

// ─── Notify finding assignee ───────────────────────────────────────────────────

export async function notifyFindingCreated(
  orgId: string,
  findingId: string,
  findingTitle: string,
  severity: string,
  assigneeId: string | null | undefined,
) {
  if (!assigneeId) return;

  const user = await prisma.user.findFirst({
    where: { id: assigneeId, orgId },
    select: { id: true, email: true, name: true },
  });
  if (!user) return;

  await createNotification({
    orgId,
    userId: user.id,
    type: "FINDING_CREATED",
    title: `New ${severity} finding assigned: ${findingTitle}`,
    body: "A new finding has been assigned to you. Please review and take action.",
    linkUrl: `/findings/${findingId}`,
    sendEmail: true,
    userEmail: user.email,
    userName: user.name ?? user.email,
  });
}

// ─── Notify action assignee ────────────────────────────────────────────────────

export async function notifyActionAssigned(
  orgId: string,
  actionId: string,
  actionTitle: string,
  assigneeId: string | null | undefined,
) {
  if (!assigneeId) return;

  const user = await prisma.user.findFirst({
    where: { id: assigneeId, orgId },
    select: { id: true, email: true, name: true },
  });
  if (!user) return;

  await createNotification({
    orgId,
    userId: user.id,
    type: "AUDIT_ASSIGNED",
    title: `Corrective action assigned to you: ${actionTitle}`,
    body: "You have been assigned a corrective action. Please review the details.",
    linkUrl: `/actions/${actionId}`,
  });
}

// ─── Notify org admin of approval ─────────────────────────────────────────────

export async function notifyOrgApproved(orgId: string, adminUserId: string) {
  await createNotification({
    orgId,
    userId: adminUserId,
    type: "ORG_APPROVED",
    title: "Your organization has been approved",
    body: "Your AuditFlow workspace is now active. Start by creating your first audit.",
    linkUrl: "/dashboard",
  });
}
