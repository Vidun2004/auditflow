"use client";

import { useUIStore } from "@/store/ui.store";
import { NavIcon } from "./nav-icon";
import type { SessionUser } from "@/types";
import { usePathname } from "next/navigation";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/audits": "Audits",
  "/findings": "Findings",
  "/actions": "Corrective Actions",
  "/evidence": "Evidence",
  "/risks": "Risk Register",
  "/compliance": "Compliance",
  "/reports": "Reports",
  "/notifications": "Notifications",
  "/settings": "Settings",
  "/profile": "Profile",
};

interface TopbarProps {
  session: SessionUser;
}

export function Topbar({ session }: TopbarProps) {
  const { toggleSidebar } = useUIStore();
  const pathname = usePathname();

  const title =
    Object.entries(PAGE_TITLES).find(([key]) =>
      key === "/dashboard" ? pathname === key : pathname.startsWith(key),
    )?.[1] ?? "AuditFlow";

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4">
      {/* Left: hamburger + breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors"
          aria-label="Toggle sidebar"
        >
          <NavIcon name="menu" className="h-5 w-5" />
        </button>
        <h1 className="text-sm font-semibold text-gray-900">{title}</h1>
      </div>

      {/* Right: search + user pill */}
      <div className="flex items-center gap-2">
        {/* Search trigger (command palette later) */}
        <button
          className="flex items-center gap-2 border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-400 hover:border-gray-300 hover:text-gray-600 transition-colors"
          aria-label="Search"
        >
          <NavIcon name="search" className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Search...</span>
          <kbd className="hidden sm:inline ml-1 font-mono text-gray-300">
            ⌘K
          </kbd>
        </button>

        {/* User avatar */}
        <div
          className="flex h-7 w-7 items-center justify-center text-xs font-semibold text-white"
          style={{ backgroundColor: session.orgAccentColor }}
          data-avatar
          title={session.name ?? session.email}
        >
          {(session.name ?? session.email).charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
