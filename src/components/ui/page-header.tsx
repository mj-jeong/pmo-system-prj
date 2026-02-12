import * as React from "react";

import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// PageHeader - Consistent title + optional actions pattern used at the top
// of every page. Renders a heading row with optional description and an
// actions slot (buttons, filters, etc.) aligned to the right.
// ---------------------------------------------------------------------------

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Page title text */
  title: string;
  /** Optional subtitle / description */
  description?: string;
  /** Action elements rendered on the right side (buttons, filters) */
  actions?: React.ReactNode;
}

function PageHeader({
  className,
  title,
  description,
  actions,
  ...props
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
      {...props}
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 pt-2 sm:pt-0">{actions}</div>
      )}
    </div>
  );
}

export { PageHeader };
