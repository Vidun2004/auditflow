"use client";

import { useState } from "react";
import Link from "next/link";
import {
  markReadAction,
  markAllReadAction,
} from "@/server/actions/notification.actions";
import { cn } from "@/lib/utils";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string | null;
  isRead: boolean;
  linkUrl: string | null;
  createdAt: Date;
}

interface Props {
  items: NotificationItem[];
  unreadCount: number;
}

const TYPE_ICONS: Record<string, string> = {
  AUDIT_ASSIGNED: "📋",
  FINDING_CREATED: "⚠️",
  ACTION_OVERDUE: "🔴",
  DEADLINE_APPROACHING: "⏰",
  ORG_APPROVED: "✅",
  ORG_REJECTED: "❌",
  USER_INVITED: "👤",
};

export function NotificationList({ items, unreadCount }: Props) {
  const [localItems, setLocalItems] = useState(items);
  const [localUnread, setLocalUnread] = useState(unreadCount);
  const [markingAll, setMarkingAll] = useState(false);

  async function handleMarkRead(id: string) {
    await markReadAction(id);
    setLocalItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRead: true } : item)),
    );
    setLocalUnread((prev) => Math.max(0, prev - 1));
  }

  async function handleMarkAllRead() {
    setMarkingAll(true);
    await markAllReadAction();
    setLocalItems((prev) => prev.map((item) => ({ ...item, isRead: true })));
    setLocalUnread(0);
    setMarkingAll(false);
  }

  return (
    <div className="border border-gray-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
        <div className="flex items-center gap-2">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
            Notifications
          </p>
          {localUnread > 0 && (
            <span className="border border-gray-900 bg-gray-900 px-1.5 py-0.5 text-xs font-medium text-white">
              {localUnread} unread
            </span>
          )}
        </div>
        {localUnread > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={markingAll}
            className="text-xs text-gray-500 underline underline-offset-2 hover:text-gray-900 disabled:opacity-50"
          >
            {markingAll ? "Marking..." : "Mark all read"}
          </button>
        )}
      </div>

      {/* List */}
      <div className="divide-y divide-gray-100">
        {localItems.map((item) => (
          <div
            key={item.id}
            className={cn(
              "flex items-start gap-3 px-5 py-4 transition-colors",
              !item.isRead ? "bg-blue-50/40" : "bg-white",
            )}
          >
            {/* Unread dot */}
            <div className="mt-1 shrink-0">
              {!item.isRead ? (
                <div className="h-2 w-2 bg-blue-500" />
              ) : (
                <div className="h-2 w-2" />
              )}
            </div>

            {/* Icon */}
            <span className="text-base shrink-0 mt-0.5">
              {TYPE_ICONS[item.type] ?? "🔔"}
            </span>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {item.linkUrl ? (
                <Link
                  href={item.linkUrl}
                  onClick={() => !item.isRead && handleMarkRead(item.id)}
                  className="text-sm font-medium text-gray-900 hover:underline"
                >
                  {item.title}
                </Link>
              ) : (
                <p className="text-sm font-medium text-gray-900">
                  {item.title}
                </p>
              )}
              {item.body && (
                <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">
                  {item.body}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-400">
                {new Date(item.createdAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}{" "}
                ·{" "}
                {new Date(item.createdAt).toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            {/* Mark read */}
            {!item.isRead && (
              <button
                onClick={() => handleMarkRead(item.id)}
                className="shrink-0 text-xs text-gray-400 hover:text-gray-700 transition-colors whitespace-nowrap"
              >
                Mark read
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
