import * as React from "react";

import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// PageContainer - Max-width wrapper with consistent padding used inside the
// main content area of the app shell. Provides responsive horizontal
// padding and constrains content to a readable width.
// ---------------------------------------------------------------------------

export interface PageContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

function PageContainer({ className, children, ...props }: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { PageContainer };
