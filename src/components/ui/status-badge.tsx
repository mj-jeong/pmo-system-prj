import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import type { ProjectStatus, AttendanceStatus, TimeOffStatus } from "@/types";
import type { ReportStatus, AgentRunStatus } from "@/lib/services/agent.service";

// ---------------------------------------------------------------------------
// Status Badge - Displays project, attendance, or time-off status with
// semantic colors matching the domain enums.
// ---------------------------------------------------------------------------

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      status: {
        // Project statuses
        PLANNED:
          "border-transparent bg-secondary/15 text-secondary-foreground",
        IN_PROGRESS:
          "border-transparent bg-primary/15 text-primary",
        BLOCKED:
          "border-transparent bg-destructive/15 text-destructive",
        COMPLETED:
          "border-transparent bg-success/15 text-success",

        // Attendance statuses
        CHECKED_IN:
          "border-transparent bg-success/15 text-success",
        CHECKED_OUT:
          "border-transparent bg-primary/15 text-primary",
        ABSENT:
          "border-transparent bg-destructive/15 text-destructive",

        // Time-off statuses
        PENDING:
          "border-transparent bg-warning/15 text-warning",
        APPROVED:
          "border-transparent bg-success/15 text-success",
        REJECTED:
          "border-transparent bg-destructive/15 text-destructive",

        // Report statuses
        DRAFT:
          "border-transparent bg-warning/15 text-warning",
        PUBLISHED:
          "border-transparent bg-success/15 text-success",

        // Agent run statuses
        RUNNING:
          "border-transparent bg-primary/15 text-primary",
        FAILED:
          "border-transparent bg-destructive/15 text-destructive",
      },
    },
    defaultVariants: {
      status: "IN_PROGRESS",
    },
  },
);

// Human-readable labels for each status value
const STATUS_LABELS: Record<string, string> = {
  // Project
  PLANNED: "Planned",
  IN_PROGRESS: "In Progress",
  BLOCKED: "Blocked",
  COMPLETED: "Completed",
  // Attendance
  CHECKED_IN: "Checked In",
  CHECKED_OUT: "Checked Out",
  ABSENT: "Absent",
  // Time-off
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  // Report
  DRAFT: "Draft",
  PUBLISHED: "Published",
  // Agent run
  RUNNING: "Running",
  FAILED: "Failed",
};

type StatusValue = ProjectStatus | AttendanceStatus | TimeOffStatus | ReportStatus | AgentRunStatus;

export interface StatusBadgeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children">,
    VariantProps<typeof statusBadgeVariants> {
  /** The status enum value to display */
  status: StatusValue;
  /** Optional custom label override */
  label?: string;
  /** Optional variant override for custom styling */
  variant?: "default" | "success" | "warning" | "error" | "info";
}

const VARIANT_CLASSES: Record<string, string> = {
  success: "border-transparent bg-success/15 text-success",
  warning: "border-transparent bg-warning/15 text-warning",
  error: "border-transparent bg-destructive/15 text-destructive",
  info: "border-transparent bg-primary/15 text-primary",
  default: "border-transparent bg-muted text-muted-foreground",
};

function StatusBadge({
  className,
  status,
  label,
  variant,
  ...props
}: StatusBadgeProps) {
  const variantClass = variant ? VARIANT_CLASSES[variant] : undefined;
  return (
    <span
      className={cn(
        variantClass || statusBadgeVariants({ status }),
        className
      )}
      {...props}
    >
      {label ?? STATUS_LABELS[status] ?? status}
    </span>
  );
}

export { StatusBadge, statusBadgeVariants, STATUS_LABELS };
