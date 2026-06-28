"use client";

import { useUIStore } from "@/store/ui.store";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import type { SessionUser } from "@/types";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  session: SessionUser;
}

export function AppShell({ children, session }: AppShellProps) {
  const { sidebarOpen } = useUIStore();

  return (
    <div
      className="flex h-screen bg-gray-50 overflow-hidden"
      style={{ "--org-accent": session.orgAccentColor } as React.CSSProperties}
    >
      {/* Sidebar */}
      <Sidebar session={session} />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/20 md:hidden"
          onClick={() => useUIStore.getState().setSidebarOpen(false)}
        />
      )}

      {/* Main content area */}
      <div
        className={cn(
          "flex flex-1 flex-col min-w-0 transition-all duration-200",
          sidebarOpen ? "md:ml-0" : "md:ml-0",
        )}
      >
        <Topbar session={session} />
        <main className="flex-1 overflow-y-auto">
          <div className="page-container">{children}</div>
        </main>
      </div>
    </div>
  );
}
