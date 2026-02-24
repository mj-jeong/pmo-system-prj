"use client";

import { useState } from "react";
import { BarChart3, DollarSign, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
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
import { apiGet } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";

// ============================================================================
// Types
// ============================================================================

interface UsageStats {
  year: number;
  month: number;
  totalTokens: number;
  estimatedCostUsd: number;
  reportCount: number;
}

// ============================================================================
// Helpers
// ============================================================================

/** Build a list of the last 6 months as { value, label } pairs. */
function getRecentMonths(): { value: string; label: string }[] {
  const result: { value: string; label: string }[] = [];
  const now = new Date();

  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth() + 1; // 1-indexed
    const value = `${year}-${String(month).padStart(2, "0")}`;
    const label = d.toLocaleString("default", { month: "long", year: "numeric" });
    result.push({ value, label });
  }

  return result;
}

function formatCostUsd(cost: number): string {
  // Show at least 6 significant decimal places for small amounts
  if (cost === 0) return "$0.00";
  if (cost < 0.01) return `$${cost.toFixed(6)}`;
  return `$${cost.toFixed(4)}`;
}

// ============================================================================
// Hook
// ============================================================================

function useUsageStats(year: number, month: number) {
  return useQuery({
    queryKey: ["settings", "usage", year, month],
    queryFn: () =>
      apiGet<ApiResponse<UsageStats>>("/settings/usage", {
        year,
        month,
      }),
    select: (res) => res.data,
  });
}

// ============================================================================
// Stat Card
// ============================================================================

interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: string;
  description?: string;
}

function StatCard({ icon: Icon, title, value, description }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Page
// ============================================================================

export default function UsagePage() {
  const months = getRecentMonths();
  const [selectedMonth, setSelectedMonth] = useState<string>(months[0].value);

  const [year, month] = selectedMonth.split("-").map(Number) as [number, number];
  const { data: stats, isLoading } = useUsageStats(year, month);

  return (
    <PageContainer>
      <PageHeader
        title="LLM Usage"
        description="Monitor AI token consumption and estimated costs per month."
      />

      {/* Month Selector */}
      <div className="mt-4">
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="mt-6">
        {isLoading ? (
          <LoadingSkeleton variant="card" count={3} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              icon={BarChart3}
              title="Total Tokens"
              value={stats?.totalTokens?.toLocaleString() ?? "0"}
              description="Input + output tokens consumed this month"
            />
            <StatCard
              icon={DollarSign}
              title="Estimated Cost"
              value={formatCostUsd(stats?.estimatedCostUsd ?? 0)}
              description="Based on current model pricing"
            />
            <StatCard
              icon={FileText}
              title="Reports Generated"
              value={String(stats?.reportCount ?? 0)}
              description="PMO reports created this month"
            />
          </div>
        )}
      </div>
    </PageContainer>
  );
}
