"use client";

import { FolderKanban, AlertTriangle, CheckCircle, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  useDashboardSummary,
  useWorkforceSummary,
  useRecentUpdates,
} from "@/hooks/use-dashboard";
import { useLanguage } from "@/lib/i18n/language-context";

export default function DashboardPage() {
  const { t } = useLanguage();
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();
  const { data: workforce, isLoading: workforceLoading } =
    useWorkforceSummary();
  const { data: recentUpdates, isLoading: updatesLoading } =
    useRecentUpdates(10);

  return (
    <PageContainer>
      <PageHeader
        title={t("pages.dashboard.title")}
        description={t("pages.dashboard.description")}
      />

      {/* Summary Metrics Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryLoading ? (
          <LoadingSkeleton variant="card" count={4} />
        ) : (
          <>
            <MetricCard
              title="Total Projects"
              value={summary?.totalProjects ?? 0}
              icon={FolderKanban}
            />
            <MetricCard
              title="In Progress"
              value={summary?.inProgressProjects ?? 0}
              icon={FolderKanban}
              className="text-primary"
            />
            <MetricCard
              title="Blocked"
              value={summary?.blockedProjects ?? 0}
              icon={AlertTriangle}
              className="text-destructive"
            />
            <MetricCard
              title="Completed"
              value={summary?.completedProjects ?? 0}
              icon={CheckCircle}
              className="text-success"
            />
          </>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Workforce Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" />
              Workforce Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            {workforceLoading ? (
              <LoadingSkeleton variant="text" count={4} />
            ) : workforce ? (
              <div className="space-y-3">
                <WorkforceRow
                  label="Total Members"
                  value={workforce.totalMembers}
                />
                <WorkforceRow
                  label="Present"
                  value={workforce.presentToday}
                  colorClass="text-success"
                />
                <WorkforceRow
                  label="Absent"
                  value={workforce.absentToday}
                  colorClass="text-destructive"
                />
                <WorkforceRow
                  label="On Leave"
                  value={workforce.onLeaveToday}
                  colorClass="text-warning"
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No workforce data available.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Updates Feed */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Recent Updates</CardTitle>
          </CardHeader>
          <CardContent>
            {updatesLoading ? (
              <LoadingSkeleton variant="text" count={5} />
            ) : recentUpdates && recentUpdates.length > 0 ? (
              <div className="space-y-4">
                {recentUpdates.map((update) => (
                  <div
                    key={update.id}
                    className="flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">
                          {update.author.name}
                        </span>
                        <span className="text-muted-foreground">
                          on{" "}
                          <span className="font-medium">
                            {update.project.name}
                          </span>
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {update.content}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(update.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No recent updates"
                description="Project updates will appear here as team members add them."
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Blocked Projects Alert */}
      {summary && summary.blockedProjects > 0 && (
        <Card className="mt-6 border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-destructive">
              <AlertTriangle className="h-4 w-4" />
              Blocked Projects ({summary.blockedProjects})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {summary.blockedProjects} project
              {summary.blockedProjects > 1 ? "s are" : " is"} currently blocked.
              Review the projects page for details.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Average Progress */}
      {summary && (
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Average Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1 rounded-full bg-muted h-3">
                  <div
                    className="h-3 rounded-full bg-primary transition-all"
                    style={{
                      width: `${Math.min(summary.averageProgress, 100)}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-medium">
                  {Math.round(summary.averageProgress)}%
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </PageContainer>
  );
}

function MetricCard({
  title,
  value,
  icon: Icon,
  className,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  className?: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <Icon className={`h-4 w-4 text-muted-foreground ${className ?? ""}`} />
        </div>
        <p className="mt-2 text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

function WorkforceRow({
  label,
  value,
  colorClass,
}: {
  label: string;
  value: number;
  colorClass?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-semibold ${colorClass ?? ""}`}>
        {value}
      </span>
    </div>
  );
}
