import { Metadata } from "next";
import { Suspense } from "react";
import { requireSession } from "@/lib/session";
import { getNotifications } from "@/server/services/notification.service";
import { PageHeader } from "@/components/shared/page-header";
import { NotificationList } from "@/components/notifications/notification-list";
import { SkeletonTable } from "@/components/loading";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = { title: "Notifications" };

interface Props {
  searchParams: Promise<{ page?: string }>;
}

async function NotificationsContent({ searchParams }: Props) {
  const params = await searchParams;
  const session = await requireSession();
  const page = Number(params.page ?? 1);

  const result = await getNotifications(session.orgId, session.id, page);

  return (
    <div className="space-y-4">
      {result.items.length === 0 ? (
        <EmptyState
          title="No notifications"
          description="You're all caught up. Notifications appear here when audits are assigned, findings are created, or actions become overdue."
        />
      ) : (
        <NotificationList
          items={result.items}
          unreadCount={result.unreadCount}
        />
      )}
    </div>
  );
}

export default async function NotificationsPage({ searchParams }: Props) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Stay up to date on audits, findings, and actions."
      />
      <Suspense fallback={<SkeletonTable rows={6} cols={3} />}>
        <NotificationsContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
