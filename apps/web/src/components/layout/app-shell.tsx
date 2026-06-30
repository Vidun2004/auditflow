"use client";

import { useUIStore } from "@/store/ui.store";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import type { SessionUser } from "@/types";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  session: SessionUser;
  unreadCount?: number;
}

export function AppShell({
  children,
  session,
  unreadCount = 0,
}: AppShellProps) {
  const { sidebarOpen } = useUIStore();

  return (
    <div
      className="flex h-screen bg-gray-50 overflow-hidden"
      style={{ "--org-accent": session.orgAccentColor } as React.CSSProperties}
    >
      <Sidebar session={session} />

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/20 md:hidden"
          onClick={() => useUIStore.getState().setSidebarOpen(false)}
        />
      )}

      <div
        className={cn(
          "flex flex-1 flex-col min-w-0 transition-all duration-200",
        )}
      >
        <Topbar session={session} unreadCount={unreadCount} />
        <main className="flex-1 overflow-y-auto">
          <div className="page-container">{children}</div>
        </main>
      </div>
    </div>
  );
}
