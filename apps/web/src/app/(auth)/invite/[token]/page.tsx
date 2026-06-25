import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@auditflow/db";
import { InviteAcceptForm } from "@/components/auth/invite-accept-form";

export const metadata: Metadata = { title: "Accept Invitation" };

interface Props {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: Props) {
  const { token } = await params;

  const invite = await prisma.orgInvite.findUnique({
    where: { token },
    include: { organization: { select: { name: true, status: true } } },
  });

  if (!invite || invite.accepted) {
    notFound();
  }

  const isExpired = invite.expiresAt < new Date();
  const roleLabel = invite.role.charAt(0) + invite.role.slice(1).toLowerCase();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          Accept your invitation
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          You&apos;ve been invited to{" "}
          <strong className="text-gray-700">{invite.organization.name}</strong>{" "}
          as a <strong className="text-gray-700">{roleLabel}</strong>.
        </p>
      </div>

      {isExpired ? (
        <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          This invitation has expired. Please ask your administrator to send a
          new invite.
        </div>
      ) : (
        <InviteAcceptForm
          token={token}
          email={invite.email}
          orgName={invite.organization.name}
        />
      )}
    </div>
  );
}
