"use client";

import { useState } from "react";
import { Shield, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuditLogs } from "@/hooks/use-organization";

// ---------------------------------------------------------------------------
// Audit action labels for display
// ---------------------------------------------------------------------------

const ACTION_LABELS: Record<string, string> = {
  PROJECT_CREATED: "Project Created",
  PROJECT_UPDATED: "Project Updated",
  PROJECT_DELETED: "Project Deleted",
  PROJECT_STATUS_CHANGED: "Status Changed",
  REPORT_GENERATED: "Report Generated",
  REPORT_PUBLISHED: "Report Published",
  MEMBER_INVITED: "Member Invited",
  MEMBER_APPROVED: "Member Approved",
  MEMBER_REJECTED: "Member Rejected",
  MEMBER_REMOVED: "Member Removed",
  TIME_OFF_APPROVED: "Time Off Approved",
  TIME_OFF_REJECTED: "Time Off Rejected",
  ORG_SETTINGS_UPDATED: "Settings Updated",
};

const ACTION_COLORS: Record<string, string> = {
  PROJECT_CREATED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  PROJECT_DELETED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  PROJECT_STATUS_CHANGED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  REPORT_PUBLISHED: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  MEMBER_REMOVED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  TIME_OFF_REJECTED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  DEFAULT: "bg-secondary/50 text-secondary-foreground",
};

function getActionColor(action: string): string {
  return ACTION_COLORS[action] ?? ACTION_COLORS.DEFAULT;
}

const ALL_ACTIONS = [
  "PROJECT_CREATED",
  "PROJECT_UPDATED",
  "PROJECT_DELETED",
  "PROJECT_STATUS_CHANGED",
  "REPORT_GENERATED",
  "REPORT_PUBLISHED",
  "MEMBER_INVITED",
  "MEMBER_APPROVED",
  "MEMBER_REJECTED",
  "MEMBER_REMOVED",
  "TIME_OFF_APPROVED",
  "TIME_OFF_REJECTED",
  "ORG_SETTINGS_UPDATED",
];

const ENTITY_TYPES = ["Project", "Report", "User", "TimeOff", "Organization"];

// ---------------------------------------------------------------------------
// AuditLogsPage
// ---------------------------------------------------------------------------

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>("all");

  const { data, isLoading } = useAuditLogs({
    page,
    limit: 20,
    action: actionFilter !== "all" ? actionFilter : undefined,
    entityType: entityTypeFilter !== "all" ? entityTypeFilter : undefined,
  });

  const totalPages = data?.pagination.totalPages ?? 1;

  return (
    <PageContainer>
      <PageHeader
        title="Audit Logs"
        description="Track all significant actions taken within your organization."
      />

      {/* Filters */}
      <div className="mt-4 flex flex-wrap gap-3">
        <Select
          value={actionFilter}
          onValueChange={(val) => {
            setActionFilter(val);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {ALL_ACTIONS.map((a) => (
              <SelectItem key={a} value={a}>
                {ACTION_LABELS[a] ?? a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={entityTypeFilter}
          onValueChange={(val) => {
            setEntityTypeFilter(val);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by entity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Entities</SelectItem>
            {ENTITY_TYPES.map((e) => (
              <SelectItem key={e} value={e}>
                {e}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Log Table */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4" />
            Activity Log
            {data && (
              <span className="ml-auto text-sm font-normal text-muted-foreground">
                {data.pagination.total} records
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6">
              <LoadingSkeleton variant="text" count={8} />
            </div>
          ) : data && data.data.length > 0 ? (
            <div className="divide-y">
              {data.data.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-4 px-6 py-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getActionColor(entry.action)}`}
                      >
                        {ACTION_LABELS[entry.action] ?? entry.action}
                      </span>
                      <span className="text-sm font-medium">{entry.actor.name}</span>
                      <span className="text-xs text-muted-foreground">
                        on {entry.entityType}
                      </span>
                    </div>
                    {entry.meta && Object.keys(entry.meta).length > 0 && (
                      <p className="mt-1 text-xs text-muted-foreground truncate">
                        {JSON.stringify(entry.meta)}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(entry.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6">
              <EmptyState
                icon={Shield}
                title="No audit logs"
                description="Actions taken by your team will appear here."
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
