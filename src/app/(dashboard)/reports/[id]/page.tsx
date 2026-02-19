"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, CheckCircle } from "lucide-react";
import { format } from "date-fns";

import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { RoleGuard } from "@/components/auth/role-guard";
import { ReportMarkdownViewer } from "@/components/reports/report-markdown-viewer";
import { useReport, usePublishReport } from "@/hooks/use-reports";

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.id as string;

  const [publishDialogOpen, setPublishDialogOpen] = useState(false);

  const { data: report, isLoading } = useReport(reportId);
  const publishReport = usePublishReport();

  async function handlePublish() {
    await publishReport.mutateAsync(reportId);
    setPublishDialogOpen(false);
  }

  if (isLoading) {
    return (
      <RoleGuard role="ADMIN">
        <PageContainer>
          <LoadingSkeleton variant="detail" />
        </PageContainer>
      </RoleGuard>
    );
  }

  if (!report) {
    return (
      <RoleGuard role="ADMIN">
        <PageContainer>
          <div className="text-center py-12">
            <p className="text-muted-foreground">Report not found</p>
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

  const isDraft = report.status === "DRAFT";
  const markdown = report.status === "PUBLISHED" && report.publishedMarkdown
    ? report.publishedMarkdown
    : report.draftMarkdown;

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
              <h1 className="text-2xl font-bold">
                PMO Report
              </h1>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                <span>
                  {format(new Date(report.periodStart), "MMM d, yyyy")} -{" "}
                  {format(new Date(report.periodEnd), "MMM d, yyyy")}
                </span>
                <span>•</span>
                <span className="capitalize">{report.detailLevel.toLowerCase()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge
              status={report.status}
              variant={report.status === "PUBLISHED" ? "success" : "warning"}
              label={report.status === "PUBLISHED" ? "Published" : "Draft"}
            />
            {isDraft && (
              <Button onClick={() => setPublishDialogOpen(true)}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Publish
              </Button>
            )}
            {report.agentRun && (
              <Link href={`/reports/runs/${report.agentRun.id}`}>
                <Button variant="outline">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Run Trace
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="mt-6 p-4 border rounded-lg bg-muted/50">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Created By</p>
              <p className="font-medium">{report.createdBy.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Created At</p>
              <p className="font-medium">
                {format(new Date(report.createdAt), "MMM d, yyyy h:mm a")}
              </p>
            </div>
            {report.status === "PUBLISHED" && report.publishedAt && (
              <>
                <div>
                  <p className="text-muted-foreground">Published By</p>
                  <p className="font-medium">{report.publishedBy?.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Published At</p>
                  <p className="font-medium">
                    {format(new Date(report.publishedAt), "MMM d, yyyy h:mm a")}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Markdown Content */}
        <div className="mt-6">
          <ReportMarkdownViewer markdown={markdown} />
        </div>

        {/* Publish Confirmation Dialog */}
        <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Publish Report</DialogTitle>
              <DialogDescription>
                Are you sure you want to publish this report? Once published, the report
                content will be frozen and cannot be edited.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setPublishDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handlePublish} disabled={publishReport.isPending}>
                {publishReport.isPending ? "Publishing..." : "Publish"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageContainer>
    </RoleGuard>
  );
}
