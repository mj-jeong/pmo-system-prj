"use client";

import * as React from "react";
import { LogOut, Menu } from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

// ---------------------------------------------------------------------------
// Header - Top navigation bar displaying the organization name on the left
// and user avatar with a dropdown menu (profile info + logout) on the right.
// Includes a mobile sidebar toggle button.
// ---------------------------------------------------------------------------

export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  /** Organization name to display */
  orgName?: string;
  /** Current user's display name */
  userName?: string;
  /** Current user's email */
  userEmail?: string;
  /** Callback to toggle the mobile sidebar */
  onToggleSidebar?: () => void;
  /** Callback when user clicks logout */
  onLogout?: () => void;
}

/** Generate avatar initials from a user name */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function Header({
  className,
  orgName = "Organization",
  userName = "User",
  userEmail,
  onToggleSidebar,
  onLogout,
  ...props
}: HeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6",
        className,
      )}
      {...props}
    >
      {/* Mobile sidebar toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 lg:hidden"
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Organization name */}
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold tracking-tight">{orgName}</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* User dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-8 w-8 rounded-full"
            aria-label="User menu"
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {getInitials(userName)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{userName}</p>
              {userEmail && (
                <p className="text-xs leading-none text-muted-foreground">
                  {userEmail}
                </p>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onLogout} className="cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

export { Header, getInitials };
