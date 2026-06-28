"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/ui.store";
import { NAV_GROUPS } from "./sidebar-nav";
import { NavIcon } from "./nav-icon";
import { logoutAction } from "@/server/actions/auth.actions";
import type { SessionUser } from "@/types";

interface SidebarProps {
  session: SessionUser;
}

export function Sidebar({ session }: SidebarProps) {
  const pathname = usePathname();
  const { sidebarOpen } = useUIStore();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 flex w-56 flex-col bg-white border-r border-gray-200 transition-transform duration-200 md:relative md:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      {/* Logo / Org header */}
      <div className="flex h-14 items-center gap-3 border-b border-gray-200 px-4 shrink-0">
        {session.orgLogoUrl ? (
          <img
            src={session.orgLogoUrl}
            alt={session.orgName}
            className="h-6 w-6 object-contain"
            data-avatar
          />
        ) : (
          <div
            className="flex h-6 w-6 items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ backgroundColor: session.orgAccentColor }}
          >
            {session.orgName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900 leading-tight">
            {session.orgName}
          </p>
          <p className="text-xs text-gray-400 capitalize">
            {session.role.toLowerCase()}
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAV_GROUPS.map((group) => {
          const visibleItems = group.items.filter((item) =>
            item.roles.includes(session.role),
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.group}>
              <p className="mb-1 px-2 text-xs font-medium uppercase tracking-widest text-gray-400">
                {group.group}
              </p>
              <ul className="space-y-0.5">
                {visibleItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2.5 px-2 py-2 text-sm transition-colors",
                        isActive(item.href)
                          ? "bg-gray-900 text-white"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                      )}
                    >
                      <NavIcon
                        name={item.icon}
                        className={cn(
                          "h-4 w-4 shrink-0",
                          isActive(item.href) ? "text-white" : "text-gray-400",
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-gray-200 p-3 shrink-0">
        <div className="mb-1">
          <Link
            href="/profile"
            className="flex items-center gap-2.5 px-2 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <NavIcon name="user" className="h-4 w-4 shrink-0 text-gray-400" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-700">
                {session.name ?? session.email}
              </p>
              <p className="truncate text-xs text-gray-400">{session.email}</p>
            </div>
          </Link>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 px-2 py-2 text-sm text-red-500 hover:bg-red-50 hover:text-gray-900 transition-colors"
          >
            <NavIcon name="logout" className="h-4 w-4 shrink-0 text-gray-400" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
