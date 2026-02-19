"use client";

import { useState } from "react";
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

// ---------------------------------------------------------------------------
// GenerateReportForm - Form to trigger new PMO report generation
// Validates date range, project selection, and detail level.
// Redirects to run trace page on successful submission.
// ---------------------------------------------------------------------------

const formSchema = z.object({
  periodStart: z.string().min(1, "Start date is required"),
  periodEnd: z.string().min(1, "End date is required"),
  projectIds: z.array(z.string()).min(1, "Select at least one project"),
  detailLevel: z.enum(["BRIEF", "STANDARD", "DETAILED"]),
}).refine(
  (data) => new Date(data.periodStart) < new Date(data.periodEnd),
  {
    message: "Start date must be before end date",
    path: ["periodEnd"],
  }
);

type FormData = z.infer<typeof formSchema>;

export function GenerateReportForm() {
  const router = useRouter();
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());

  const { data: projectsData } = useProjects({ status: "IN_PROGRESS", limit: 100 });
  const generateReport = useGenerateReport();

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
          <Label htmlFor="periodStart">Period Start</Label>
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
          <Label htmlFor="periodEnd">Period End</Label>
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
          <Label>Select Projects</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={toggleAllProjects}
          >
            {selectedProjects.size === activeProjects.length ? "Deselect All" : "Select All"}
          </Button>
        </div>
        <div className="border rounded-md p-4 max-h-64 overflow-y-auto space-y-2">
          {activeProjects.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active projects found</p>
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
        <Label htmlFor="detailLevel">Detail Level</Label>
        <Select
          defaultValue="STANDARD"
          onValueChange={(value) => setValue("detailLevel", value as DetailLevel)}
        >
          <SelectTrigger id="detailLevel">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="BRIEF">Brief</SelectItem>
            <SelectItem value="STANDARD">Standard</SelectItem>
            <SelectItem value="DETAILED">Detailed</SelectItem>
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
          Cancel
        </Button>
        <Button type="submit" disabled={generateReport.isPending}>
          {generateReport.isPending ? "Generating..." : "Generate Report"}
        </Button>
      </div>
    </form>
  );
}
