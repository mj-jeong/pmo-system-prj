"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import type { RoleName } from "@/types";

// ---------------------------------------------------------------------------
// AppShell - Root layout component that composes the Header, Sidebar, and
// main content area. The sidebar is persistent on desktop (lg+) and slides
// in via a Sheet on mobile.
// ---------------------------------------------------------------------------

export interface AppShellProps {
  children: React.ReactNode;
  /** Organization name shown in the header */
  orgName?: string;
  /** Current user's display name */
  userName?: string;
  /** Current user's email */
  userEmail?: string;
  /** Current user's role for sidebar nav filtering */
  currentRole?: RoleName;
  /** Logout callback */
  onLogout?: () => void;
}

function AppShell({
  children,
  orgName,
  userName,
  userEmail,
  currentRole = "MEMBER",
  onLogout,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar (visible on lg+) */}
      <Sidebar
        currentRole={currentRole}
        className="hidden lg:flex"
      />

      {/* Mobile sidebar sheet */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-sidebar p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <Sidebar
            currentRole={currentRole}
            className="flex"
            onClick={() => setSidebarOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          orgName={orgName}
          userName={userName}
          userEmail={userEmail}
          onToggleSidebar={() => setSidebarOpen(true)}
          onLogout={onLogout}
        />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export { AppShell };
