"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, FileText, ExternalLink, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

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
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { RoleGuard } from "@/components/auth/role-guard";
import { useReports } from "@/hooks/use-reports";
import type { ReportListItem, ReportStatus } from "@/lib/services/agent.service";
import { useLanguage } from "@/lib/i18n/language-context";

export default function ReportsPage() {
  const { t } = useLanguage();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filterParams = {
    page,
    limit: 20,
    status: statusFilter !== "all" ? (statusFilter as ReportStatus) : undefined,
  };

  const { data, isLoading } = useReports(filterParams);

  const columns: DataTableColumn<ReportListItem>[] = [
    {
      key: "period",
      header: "Period",
      cell: (row) => {
        const start = format(new Date(row.periodStart), "MMM d, yyyy");
        const end = format(new Date(row.periodEnd), "MMM d, yyyy");
        return (
          <div className="text-sm">
            <div className="font-medium">{start}</div>
            <div className="text-muted-foreground">to {end}</div>
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => {
        const variant = row.status === "PUBLISHED" ? "success" : "warning";
        return (
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge
              status={row.status}
              variant={variant}
              label={row.status === "PUBLISHED" ? "Published" : "Draft"}
            />
            {row.isFallback && (
              <Badge
                variant="outline"
                className="border-amber-400 text-amber-700 dark:text-amber-400 gap-1"
              >
                <AlertTriangle className="h-3 w-3" />
                Template-based
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      key: "detailLevel",
      header: "Detail",
      cell: (row) => (
        <span className="text-sm capitalize">{row.detailLevel.toLowerCase()}</span>
      ),
    },
    {
      key: "createdBy",
      header: "Created By",
      cell: (row) => (
        <span className="text-sm">{row.createdBy.name}</span>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      cell: (row) =>
        format(new Date(row.createdAt), "MMM d, yyyy h:mm a"),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Link href={`/reports/${row.id}`}>
            <Button variant="outline" size="sm">
              View
            </Button>
          </Link>
          {row.agentRun && (
            <Link href={`/reports/runs/${row.agentRun.id}`}>
              <Button variant="ghost" size="sm">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      ),
    },
  ];

  return (
    <RoleGuard role="ADMIN">
      <PageContainer>
        <PageHeader
          title={t("pages.reports.title")}
          description={t("pages.reports.description")}
          actions={
            <Link href="/reports/generate">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
            </Link>
          }
        />

        {/* Filters */}
        <div className="mt-4">
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="mt-4">
          {isLoading ? (
            <LoadingSkeleton variant="table" count={5} />
          ) : data && data.data.length > 0 ? (
            <DataTable
              columns={columns}
              data={data.data}
              pagination={data.pagination}
              onPageChange={setPage}
              getRowKey={(row) => row.id}
            />
          ) : (
            <EmptyState
              icon={FileText}
              title="No reports found"
              description={
                statusFilter !== "all"
                  ? "Try adjusting your filter criteria."
                  : "Get started by generating your first report."
              }
              action={
                statusFilter === "all" && (
                  <Link href="/reports/generate">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Generate Report
                    </Button>
                  </Link>
                )
              }
            />
          )}
        </div>
      </PageContainer>
    </RoleGuard>
  );
}
