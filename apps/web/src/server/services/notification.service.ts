import { prisma } from "@auditflow/db";
import type { NotificationType } from "@/types";

export async function createNotification(params: {
  orgId: string;
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  linkUrl?: string;
}) {
  return prisma.notification.create({ data: params });
}

export async function getNotifications(
  orgId: string,
  userId: string,
  page = 1,
  pageSize = 30,
) {
  const [items, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { orgId, userId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.notification.count({ where: { orgId, userId } }),
    prisma.notification.count({ where: { orgId, userId, isRead: false } }),
  ]);

  return {
    items,
    total,
    unreadCount,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function markNotificationRead(
  notificationId: string,
  userId: string,
) {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true },
  });
}

export async function markAllNotificationsRead(orgId: string, userId: string) {
  return prisma.notification.updateMany({
    where: { orgId, userId, isRead: false },
    data: { isRead: true },
  });
}
