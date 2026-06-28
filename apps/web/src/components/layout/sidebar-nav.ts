import type { UserRole } from "@/types";

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  roles: UserRole[];
  badge?: string;
}

export interface NavGroup {
  group: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    group: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: "grid",
        roles: ["ADMIN", "AUDITOR", "MANAGER", "EMPLOYEE"],
      },
      {
        label: "Notifications",
        href: "/notifications",
        icon: "bell",
        roles: ["ADMIN", "AUDITOR", "MANAGER", "EMPLOYEE"],
      },
    ],
  },
  {
    group: "Audit",
    items: [
      {
        label: "Audits",
        href: "/audits",
        icon: "clipboard",
        roles: ["ADMIN", "AUDITOR", "MANAGER", "EMPLOYEE"],
      },
      {
        label: "Findings",
        href: "/findings",
        icon: "alert-triangle",
        roles: ["ADMIN", "AUDITOR", "MANAGER", "EMPLOYEE"],
      },
      {
        label: "Actions",
        href: "/actions",
        icon: "check-square",
        roles: ["ADMIN", "AUDITOR", "MANAGER", "EMPLOYEE"],
      },
      {
        label: "Evidence",
        href: "/evidence",
        icon: "paperclip",
        roles: ["ADMIN", "AUDITOR", "MANAGER", "EMPLOYEE"],
      },
    ],
  },
  {
    group: "Risk & Compliance",
    items: [
      {
        label: "Risk Register",
        href: "/risks",
        icon: "shield",
        roles: ["ADMIN", "AUDITOR", "MANAGER"],
      },
      {
        label: "Compliance",
        href: "/compliance",
        icon: "check-circle",
        roles: ["ADMIN", "AUDITOR", "MANAGER"],
      },
    ],
  },
  {
    group: "Reporting",
    items: [
      {
        label: "Reports",
        href: "/reports",
        icon: "bar-chart",
        roles: ["ADMIN", "AUDITOR", "MANAGER"],
      },
    ],
  },
  {
    group: "Administration",
    items: [
      {
        label: "Settings",
        href: "/settings",
        icon: "settings",
        roles: ["ADMIN"],
      },
    ],
  },
];
