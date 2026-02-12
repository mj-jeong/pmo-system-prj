"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  CalendarCheck,
  CalendarOff,
  Settings,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { RoleName } from "@/types";

// ---------------------------------------------------------------------------
// Sidebar - Left-hand navigation panel. Renders nav items conditionally
// based on the user's role. Active state is determined by the current
// pathname. Uses semantic nav element for accessibility.
// ---------------------------------------------------------------------------

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  /** Minimum role required to see this item */
  minRole?: RoleName;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Attendance", href: "/workforce/attendance", icon: CalendarCheck },
  { label: "Time Off", href: "/workforce/time-off", icon: CalendarOff },
  { label: "Members", href: "/settings/members", icon: Users, minRole: "ADMIN" },
  { label: "Settings", href: "/settings", icon: Settings, minRole: "OWNER" },
];

// Role hierarchy for comparison
const ROLE_LEVEL: Record<RoleName, number> = {
  MEMBER: 1,
  ADMIN: 2,
  OWNER: 3,
};

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  /** The current user's role for filtering nav items */
  currentRole?: RoleName;
}

function Sidebar({ className, currentRole = "MEMBER", ...props }: SidebarProps) {
  const pathname = usePathname();

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!item.minRole) return true;
    return ROLE_LEVEL[currentRole] >= ROLE_LEVEL[item.minRole];
  });

  return (
    <aside
      className={cn(
        "flex h-full w-sidebar flex-col border-r bg-sidebar",
        className,
      )}
      {...props}
    >
      <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Main navigation">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          // Determine if this nav item is currently active
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export { Sidebar, NAV_ITEMS };
