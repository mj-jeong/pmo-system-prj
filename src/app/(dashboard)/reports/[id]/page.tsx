"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, CheckCircle, ChevronDown, ChevronUp, AlertTriangle, AlertCircle, Info, TrendingUp, TrendingDown, Minus } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { RoleGuard } from "@/components/auth/role-guard";
import { ReportMarkdownViewer } from "@/components/reports/report-markdown-viewer";
import { useReport, usePublishReport } from "@/hooks/use-reports";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Severity helpers
// ---------------------------------------------------------------------------

const SEVERITY_CONFIG = {
  CRITICAL: {
    icon: AlertCircle,
    className: "text-red-600 dark:text-red-400",
    badgeClass: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    label: "CRITICAL",
  },
  WARNING: {
    icon: AlertTriangle,
    className: "text-yellow-600 dark:text-yellow-400",
    badgeClass: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    label: "WARNING",
  },
  INFO: {
    icon: Info,
    className: "text-blue-600 dark:text-blue-400",
    badgeClass: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    label: "INFO",
  },
} as const;

function DeltaBadge({ value, unit = "" }: { value: number; unit?: string }) {
  if (value === 0) return <span className="flex items-center gap-1 text-muted-foreground"><Minus className="h-3 w-3" />변화 없음</span>;
  const positive = value > 0;
  const Icon = positive ? TrendingUp : TrendingDown;
  return (
    <span className={cn("flex items-center gap-1 font-medium", positive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
      <Icon className="h-3 w-3" />
      {positive ? "+" : ""}{value}{unit}
    </span>
  );
}

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.id as string;

  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [analysisOpen, setAnalysisOpen] = useState(false);

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
        {/* Fallback Warning Banner */}
        {report.isFallback && (
          <div className="mb-4 flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 dark:border-amber-700 dark:bg-amber-950/30">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div className="text-sm">
              <p className="font-medium text-amber-800 dark:text-amber-300">
                This report was automatically generated using a template due to an AI service failure.
              </p>
              {report.fallbackReason && (
                <p className="mt-1 text-amber-700 dark:text-amber-400">
                  {report.fallbackReason}
                </p>
              )}
            </div>
          </div>
        )}

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

        {/* Analysis Details Accordion (Phase 2) */}
        {report.reasoningTrace && (
          <Card className="mt-6">
            <CardHeader
              className="cursor-pointer select-none"
              onClick={() => setAnalysisOpen((o) => !o)}
            >
              <CardTitle className="flex items-center justify-between text-base">
                <span>분석 상세 (AI 판단 근거)</span>
                {analysisOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CardTitle>
            </CardHeader>

            {analysisOpen && (
              <CardContent className="space-y-4">
                {/* Input Summary */}
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><span className="font-medium text-foreground">분석 기간:</span>{" "}
                    {format(new Date(report.reasoningTrace.inputSummary.period.start), "MM/dd")} ~{" "}
                    {format(new Date(report.reasoningTrace.inputSummary.period.end), "MM/dd")}
                  </p>
                  <p><span className="font-medium text-foreground">대상 프로젝트:</span>{" "}
                    {report.reasoningTrace.inputSummary.projectCount}개
                  </p>
                  <p><span className="font-medium text-foreground">업데이트 수:</span>{" "}
                    {report.reasoningTrace.inputSummary.updateCount}건
                  </p>
                </div>

                {/* Risk Score */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">종합 리스크 스코어</span>
                    <span className={cn("text-sm font-bold",
                      report.reasoningTrace.riskScore >= 70 ? "text-red-600" :
                      report.reasoningTrace.riskScore >= 40 ? "text-yellow-600" : "text-green-600"
                    )}>
                      {report.reasoningTrace.riskScore} / 100
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={cn("h-2 rounded-full transition-all",
                        report.reasoningTrace.riskScore >= 70 ? "bg-red-500" :
                        report.reasoningTrace.riskScore >= 40 ? "bg-yellow-500" : "bg-green-500"
                      )}
                      style={{ width: `${report.reasoningTrace.riskScore}%` }}
                    />
                  </div>
                </div>

                {/* Applied Rules */}
                <div>
                  <p className="text-sm font-medium mb-2">적용된 분석 룰</p>
                  <div className="space-y-2">
                    {report.reasoningTrace.appliedRules.map((rule) => {
                      const config = SEVERITY_CONFIG[rule.severity];
                      const SeverityIcon = config.icon;
                      return (
                        <div
                          key={rule.ruleId}
                          className={cn(
                            "flex items-start gap-3 rounded-md border p-3 text-sm",
                            rule.triggered ? "border-border bg-muted/30" : "border-border/50 opacity-60"
                          )}
                        >
                          <SeverityIcon className={cn("h-4 w-4 mt-0.5 shrink-0", config.className)} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium">{rule.name}</span>
                              <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", config.badgeClass)}>
                                {config.label}
                              </span>
                              {!rule.triggered && (
                                <span className="text-xs text-muted-foreground">미발동</span>
                              )}
                            </div>
                            <p className="mt-1 text-muted-foreground">{rule.reason}</p>
                          </div>
                          <span className="shrink-0 text-xs text-muted-foreground">{rule.score}점</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Comparison Data */}
                {report.comparisonData && (
                  <div>
                    <p className="text-sm font-medium mb-2">
                      전주 대비 변화
                      <span className="text-xs text-muted-foreground ml-2">
                        ({format(new Date(report.comparisonData.previousPeriod.start), "MM/dd")} ~{" "}
                        {format(new Date(report.comparisonData.previousPeriod.end), "MM/dd")} 기준)
                      </span>
                    </p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {[
                        { label: "프로젝트 수", value: report.comparisonData.deltas.projectCount, unit: "개" },
                        { label: "BLOCKED", value: report.comparisonData.deltas.blockedCount, unit: "개" },
                        { label: "평균 진척도", value: report.comparisonData.deltas.avgProgress, unit: "%" },
                        { label: "리스크 스코어", value: report.comparisonData.deltas.riskScore, unit: "점" },
                      ].map((item) => (
                        <div key={item.label} className="rounded-md border p-3 text-sm">
                          <p className="text-muted-foreground text-xs">{item.label}</p>
                          <DeltaBadge value={item.value} unit={item.unit} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        )}

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
