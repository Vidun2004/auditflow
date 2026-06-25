import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

interface EmailResult {
  success: boolean;
  error?: string;
}

// ─── Org approval invite (sent by Super-Admin on approval) ────────────────────

export async function sendOrgApprovalInvite(params: {
  to: string;
  orgName: string;
  inviteToken: string;
}): Promise<EmailResult> {
  const inviteUrl = `${APP_URL}/invite/${params.inviteToken}`;

  try {
    await resend.emails.send({
      from: FROM,
      to: params.to,
      subject: `Your AuditFlow workspace is ready — ${params.orgName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8"></head>
          <body style="font-family: system-ui, sans-serif; color: #111827; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
            <div style="border-bottom: 2px solid #111827; padding-bottom: 20px; margin-bottom: 32px;">
              <strong style="font-size: 18px; letter-spacing: -0.02em;">AuditFlow</strong>
            </div>

            <h1 style="font-size: 22px; font-weight: 600; margin: 0 0 8px;">Your workspace has been approved</h1>
            <p style="color: #6b7280; margin: 0 0 24px; font-size: 15px;">
              <strong>${params.orgName}</strong> has been approved on AuditFlow.
              Click below to set up your Admin account and get started.
            </p>

            <a href="${inviteUrl}"
               style="display: inline-block; background: #111827; color: #ffffff; padding: 12px 24px; text-decoration: none; font-size: 14px; font-weight: 500; letter-spacing: 0.01em;">
              Set up my account →
            </a>

            <p style="color: #9ca3af; font-size: 12px; margin-top: 32px;">
              This link expires in 7 days. If you didn't register for AuditFlow, ignore this email.
            </p>

            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 40px;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">AuditFlow — Enterprise Compliance Platform</p>
            </div>
          </body>
        </html>
      `,
    });
    return { success: true };
  } catch (err) {
    console.error("sendOrgApprovalInvite error:", err);
    return { success: false, error: String(err) };
  }
}

// ─── User invite (sent by Org Admin) ─────────────────────────────────────────

export async function sendUserInvite(params: {
  to: string;
  orgName: string;
  role: string;
  inviteToken: string;
}): Promise<EmailResult> {
  const inviteUrl = `${APP_URL}/invite/${params.inviteToken}`;
  const roleLabel = params.role.charAt(0) + params.role.slice(1).toLowerCase();

  try {
    await resend.emails.send({
      from: FROM,
      to: params.to,
      subject: `You've been invited to ${params.orgName} on AuditFlow`,
      html: `
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8"></head>
          <body style="font-family: system-ui, sans-serif; color: #111827; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
            <div style="border-bottom: 2px solid #111827; padding-bottom: 20px; margin-bottom: 32px;">
              <strong style="font-size: 18px; letter-spacing: -0.02em;">AuditFlow</strong>
            </div>

            <h1 style="font-size: 22px; font-weight: 600; margin: 0 0 8px;">You've been invited</h1>
            <p style="color: #6b7280; margin: 0 0 8px; font-size: 15px;">
              You've been invited to join <strong>${params.orgName}</strong> as a <strong>${roleLabel}</strong>.
            </p>
            <p style="color: #6b7280; margin: 0 0 24px; font-size: 15px;">
              Click below to create your account and accept the invitation.
            </p>

            <a href="${inviteUrl}"
               style="display: inline-block; background: #111827; color: #ffffff; padding: 12px 24px; text-decoration: none; font-size: 14px; font-weight: 500; letter-spacing: 0.01em;">
              Accept invitation →
            </a>

            <p style="color: #9ca3af; font-size: 12px; margin-top: 32px;">
              This link expires in 7 days. If you weren't expecting this invitation, ignore this email.
            </p>

            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 40px;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">AuditFlow — Enterprise Compliance Platform</p>
            </div>
          </body>
        </html>
      `,
    });
    return { success: true };
  } catch (err) {
    console.error("sendUserInvite error:", err);
    return { success: false, error: String(err) };
  }
}

// ─── Deadline reminder ────────────────────────────────────────────────────────

export async function sendDeadlineReminder(params: {
  to: string;
  userName: string;
  entityType: "audit" | "action" | "finding";
  entityTitle: string;
  dueDate: string;
  entityUrl: string;
}): Promise<EmailResult> {
  const label =
    params.entityType === "audit"
      ? "Audit"
      : params.entityType === "action"
        ? "Corrective Action"
        : "Finding";

  try {
    await resend.emails.send({
      from: FROM,
      to: params.to,
      subject: `Deadline reminder: ${params.entityTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8"></head>
          <body style="font-family: system-ui, sans-serif; color: #111827; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
            <div style="border-bottom: 2px solid #111827; padding-bottom: 20px; margin-bottom: 32px;">
              <strong style="font-size: 18px; letter-spacing: -0.02em;">AuditFlow</strong>
            </div>

            <h1 style="font-size: 22px; font-weight: 600; margin: 0 0 8px;">Upcoming deadline</h1>
            <p style="color: #6b7280; margin: 0 0 8px; font-size: 15px;">Hi ${params.userName},</p>
            <p style="color: #6b7280; margin: 0 0 24px; font-size: 15px;">
              The following <strong>${label}</strong> is due on <strong>${params.dueDate}</strong>:
            </p>

            <div style="border: 1px solid #e5e7eb; padding: 16px; margin-bottom: 24px;">
              <p style="margin: 0; font-weight: 500;">${params.entityTitle}</p>
              <p style="margin: 4px 0 0; color: #6b7280; font-size: 13px;">Due: ${params.dueDate}</p>
            </div>

            <a href="${params.entityUrl}"
               style="display: inline-block; background: #111827; color: #ffffff; padding: 12px 24px; text-decoration: none; font-size: 14px; font-weight: 500;">
              View ${label} →
            </a>

            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 40px;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">AuditFlow — Enterprise Compliance Platform</p>
            </div>
          </body>
        </html>
      `,
    });
    return { success: true };
  } catch (err) {
    console.error("sendDeadlineReminder error:", err);
    return { success: false, error: String(err) };
  }
}
