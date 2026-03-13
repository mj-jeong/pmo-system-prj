"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, subDays } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useProjects } from "@/hooks/use-projects";
import { useGenerateReport } from "@/hooks/use-reports";
import type { DetailLevel } from "@/lib/services/agent.service";
import { useLanguage } from "@/lib/i18n/language-context";

// ---------------------------------------------------------------------------
// GenerateReportForm - Form to trigger new PMO report generation
// Validates date range, project selection, and detail level.
// Redirects to run trace page on successful submission.
// ---------------------------------------------------------------------------

export function GenerateReportForm() {
  const { t } = useLanguage();
  const router = useRouter();
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());

  const { data: projectsData } = useProjects({ status: "IN_PROGRESS", limit: 100 });
  const generateReport = useGenerateReport();

  const formSchema = useMemo(
    () =>
      z
        .object({
          periodStart: z.string().min(1, t("reports.startRequired")),
          periodEnd: z.string().min(1, t("reports.endRequired")),
          projectIds: z.array(z.string()).min(1, t("reports.selectOneProject")),
          detailLevel: z.enum(["BRIEF", "STANDARD", "DETAILED"]),
        })
        .refine(
          (data) => new Date(data.periodStart) < new Date(data.periodEnd),
          {
            message: t("reports.startBeforeEnd"),
            path: ["periodEnd"],
          }
        ),
    [t]
  );

  type FormData = z.infer<typeof formSchema>;

  // Default values: last 7 days, STANDARD detail
  const today = new Date();
  const sevenDaysAgo = subDays(today, 7);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      periodStart: format(sevenDaysAgo, "yyyy-MM-dd"),
      periodEnd: format(today, "yyyy-MM-dd"),
      projectIds: [],
      detailLevel: "STANDARD",
    },
  });

  const activeProjects = projectsData?.data || [];

  function toggleProject(projectId: string, checked: boolean) {
    const updated = new Set(selectedProjects);
    if (checked) {
      updated.add(projectId);
    } else {
      updated.delete(projectId);
    }
    setSelectedProjects(updated);
    setValue("projectIds", Array.from(updated));
  }

  function toggleAllProjects() {
    if (selectedProjects.size === activeProjects.length) {
      setSelectedProjects(new Set());
      setValue("projectIds", []);
    } else {
      const allIds = new Set(activeProjects.map((p) => p.id));
      setSelectedProjects(allIds);
      setValue("projectIds", Array.from(allIds));
    }
  }

  async function onSubmit(data: FormData) {
    const result = await generateReport.mutateAsync({
      periodStart: new Date(data.periodStart).toISOString(),
      periodEnd: new Date(data.periodEnd).toISOString(),
      projectIds: data.projectIds,
      detailLevel: data.detailLevel as DetailLevel,
    });

    // Redirect to run trace page
    router.push(`/reports/runs/${result.data.runId}`);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Date Range */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="periodStart">{t("reports.periodStart")}</Label>
          <Input
            id="periodStart"
            type="date"
            {...register("periodStart")}
          />
          {errors.periodStart && (
            <p className="text-sm text-destructive">{errors.periodStart.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="periodEnd">{t("reports.periodEnd")}</Label>
          <Input
            id="periodEnd"
            type="date"
            {...register("periodEnd")}
          />
          {errors.periodEnd && (
            <p className="text-sm text-destructive">{errors.periodEnd.message}</p>
          )}
        </div>
      </div>

      {/* Project Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>{t("reports.selectProjects")}</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={toggleAllProjects}
          >
            {selectedProjects.size === activeProjects.length ? t("reports.deselectAll") : t("reports.selectAll")}
          </Button>
        </div>
        <div className="border rounded-md p-4 max-h-64 overflow-y-auto space-y-2">
          {activeProjects.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("reports.noActiveProjects")}</p>
          ) : (
            activeProjects.map((project) => (
              <div key={project.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`project-${project.id}`}
                  checked={selectedProjects.has(project.id)}
                  onCheckedChange={(checked) => toggleProject(project.id, checked as boolean)}
                />
                <Label
                  htmlFor={`project-${project.id}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {project.name}
                </Label>
              </div>
            ))
          )}
        </div>
        {errors.projectIds && (
          <p className="text-sm text-destructive">{errors.projectIds.message}</p>
        )}
      </div>

      {/* Detail Level */}
      <div className="space-y-2">
        <Label htmlFor="detailLevel">{t("reports.detailLevel")}</Label>
        <Select
          defaultValue="STANDARD"
          onValueChange={(value) => setValue("detailLevel", value as DetailLevel)}
        >
          <SelectTrigger id="detailLevel">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="BRIEF">{t("reports.brief")}</SelectItem>
            <SelectItem value="STANDARD">{t("reports.standard")}</SelectItem>
            <SelectItem value="DETAILED">{t("reports.detailed")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/reports")}
        >
          {t("common.cancel")}
        </Button>
        <Button type="submit" disabled={generateReport.isPending}>
          {generateReport.isPending ? t("reports.generating") : t("reports.generate")}
        </Button>
      </div>
    </form>
  );
}
