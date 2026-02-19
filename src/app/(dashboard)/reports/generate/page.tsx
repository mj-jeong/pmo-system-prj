"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { RoleGuard } from "@/components/auth/role-guard";
import { GenerateReportForm } from "@/components/reports/generate-report-form";

export default function GenerateReportPage() {
  return (
    <RoleGuard role="ADMIN">
      <PageContainer>
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/reports">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Generate PMO Report</h1>
            <p className="text-sm text-muted-foreground mt-1">
              AI will analyze project data and generate a comprehensive report
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-2xl">
          <GenerateReportForm />
        </div>
      </PageContainer>
    </RoleGuard>
  );
}
