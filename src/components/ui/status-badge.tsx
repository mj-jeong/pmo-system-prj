import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import type { ProjectStatus, AttendanceStatus, TimeOffStatus } from "@/types";

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
        IN_PROGRESS:
          "border-transparent bg-primary/15 text-primary",
        DELAYED:
          "border-transparent bg-warning/15 text-warning",
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
  IN_PROGRESS: "In Progress",
  DELAYED: "Delayed",
  COMPLETED: "Completed",
  // Attendance
  CHECKED_IN: "Checked In",
  CHECKED_OUT: "Checked Out",
  ABSENT: "Absent",
  // Time-off
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

type StatusValue = ProjectStatus | AttendanceStatus | TimeOffStatus;

export interface StatusBadgeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children">,
    VariantProps<typeof statusBadgeVariants> {
  /** The status enum value to display */
  status: StatusValue;
  /** Optional custom label override */
  label?: string;
}

function StatusBadge({
  className,
  status,
  label,
  ...props
}: StatusBadgeProps) {
  return (
    <span
      className={cn(statusBadgeVariants({ status }), className)}
      {...props}
    >
      {label ?? STATUS_LABELS[status] ?? status}
    </span>
  );
}

export { StatusBadge, statusBadgeVariants, STATUS_LABELS };
