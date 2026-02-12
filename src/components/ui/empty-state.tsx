import * as React from "react";
import { InboxIcon, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// EmptyState - Placeholder component shown when a list or table has no data.
// Supports an optional icon, title, description, and action slot (e.g. a
// "Create" button).
// ---------------------------------------------------------------------------

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Lucide icon component to display */
  icon?: LucideIcon;
  /** Primary message */
  title: string;
  /** Secondary explanatory text */
  description?: string;
  /** Action element (e.g. a Button to create the first item) */
  action?: React.ReactNode;
}

function EmptyState({
  className,
  icon: Icon = InboxIcon,
  title,
  description,
  action,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center",
        className,
      )}
      {...props}
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export { EmptyState };
