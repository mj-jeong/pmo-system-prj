"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, RefreshCw } from "lucide-react";
import { format } from "date-fns";

import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { RoleGuard } from "@/components/auth/role-guard";
import { AgentRunTimeline } from "@/components/reports/agent-run-timeline";
import { useAgentRun } from "@/hooks/use-reports";

export default function AgentRunTracePage() {
  const params = useParams();
  const runId = params.id as string;

  const { data: run, isLoading, refetch } = useAgentRun(runId);

  if (isLoading) {
    return (
      <RoleGuard role="ADMIN">
        <PageContainer>
          <LoadingSkeleton variant="detail" />
        </PageContainer>
      </RoleGuard>
    );
  }

  if (!run) {
    return (
      <RoleGuard role="ADMIN">
        <PageContainer>
          <div className="text-center py-12">
            <p className="text-muted-foreground">Agent run not found</p>
            <Link href="/reports">
              <Button variant="outline" className="mt-4">
                Back to Reports
              </Button>
            </Link>
          </div>
        </PageContainer>
      </RoleGuard>
    );
  }

  const isRunning = run.status === "RUNNING";
  const isCompleted = run.status === "COMPLETED";
  const isFailed = run.status === "FAILED";

  return (
    <RoleGuard role="ADMIN">
      <PageContainer>
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Link href="/reports">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Agent Run Trace</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Run ID: {run.id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge
              status={run.status}
              variant={
                isCompleted ? "success" :
                isFailed ? "error" :
                isRunning ? "info" : "default"
              }
            />
            {isRunning && (
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            )}
          </div>
        </div>

        {/* Auto-refresh indicator */}
        {isRunning && (
          <div className="mt-4 p-3 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-sm flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Auto-refreshing every 3 seconds...
          </div>
        )}

        {/* Metadata */}
        <div className="mt-6 p-4 border rounded-lg bg-muted/50">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Created By</p>
              <p className="font-medium">{run.createdBy.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Started At</p>
              <p className="font-medium">
                {run.startedAt
                  ? format(new Date(run.startedAt), "MMM d, yyyy h:mm a")
                  : "Not started"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Finished At</p>
              <p className="font-medium">
                {run.finishedAt
                  ? format(new Date(run.finishedAt), "MMM d, yyyy h:mm a")
                  : isRunning ? "In progress..." : "Not finished"}
              </p>
            </div>
          </div>

          {/* Input parameters */}
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm font-medium mb-2">Input Parameters</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Period</p>
                <p className="font-medium">
                  {format(new Date(run.inputParams.periodStart), "MMM d, yyyy")} -{" "}
                  {format(new Date(run.inputParams.periodEnd), "MMM d, yyyy")}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Detail Level</p>
                <p className="font-medium capitalize">
                  {run.inputParams.detailLevel.toLowerCase()}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground">Projects</p>
                <p className="font-medium">
                  {run.inputParams.projectIds.length} selected
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error message */}
        {isFailed && run.errorMessage && (
          <div className="mt-6 p-4 rounded-md bg-destructive/10 text-destructive">
            <p className="font-semibold">Error:</p>
            <p className="mt-1 text-sm">{run.errorMessage}</p>
          </div>
        )}

        {/* Success message with report link */}
        {isCompleted && run.reportId && (
          <div className="mt-6 p-4 rounded-md bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Report generated successfully!</p>
                <p className="text-sm mt-1">
                  The report is ready to review and publish.
                </p>
              </div>
              <Link href={`/reports/${run.reportId}`}>
                <Button>
                  <FileText className="mr-2 h-4 w-4" />
                  View Report
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Pipeline Steps</h2>
          <AgentRunTimeline steps={run.steps} />
        </div>
      </PageContainer>
    </RoleGuard>
  );
}
