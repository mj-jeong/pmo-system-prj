"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, FolderKanban } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { createProjectSchema, type CreateProjectInput } from "@/lib/validators/project";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Textarea } from "@/components/ui/textarea";
import { RoleGuard } from "@/components/auth/role-guard";
import { useProjects, useCreateProject } from "@/hooks/use-projects";
import type { ProjectResponse } from "@/types/project";
import type { ProjectStatus } from "@/types";
import { useLanguage } from "@/lib/i18n/language-context";

export default function ProjectsPage() {
  const { t } = useLanguage();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [dialogOpen, setDialogOpen] = useState(false);

  const filterParams = {
    page,
    limit: 20,
    search: search || undefined,
    status: statusFilter !== "all" ? (statusFilter as ProjectStatus) : undefined,
    sortBy,
    sortOrder,
  };

  const { data, isLoading } = useProjects(filterParams);

  const columns: DataTableColumn<ProjectResponse>[] = [
    {
      key: "name",
      header: t("projects.nameHeader"),
      cell: (row) => (
        <Link
          href={`/projects/${row.id}`}
          className="font-medium text-primary hover:underline"
        >
          {row.name}
        </Link>
      ),
    },
    {
      key: "status",
      header: t("projects.statusHeader"),
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "progress",
      header: t("projects.progressHeader"),
      cell: (row) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 rounded-full bg-muted h-2 w-20">
            <div
              className="h-2 rounded-full bg-primary"
              style={{ width: `${Math.min(row.progress, 100)}%` }}
            />
          </div>
          <span className="text-sm text-muted-foreground">{row.progress}%</span>
        </div>
      ),
    },
    {
      key: "createdAt",
      header: t("projects.createdHeader"),
      cell: (row) =>
        new Date(row.createdAt).toLocaleDateString("ko-KR", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
    },
  ];

  function handleSort(key: string) {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
    setPage(1);
  }

  return (
    <PageContainer>
      <PageHeader
        title={t("pages.projects.title")}
        description={t("pages.projects.description")}
        actions={
          <RoleGuard role="ADMIN">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("projects.newProject")}
                </Button>
              </DialogTrigger>
              <CreateProjectDialog onClose={() => setDialogOpen(false)} />
            </Dialog>
          </RoleGuard>
        }
      />

      {/* Filters */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("projects.searchPlaceholder")}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(val) => {
            setStatusFilter(val);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("projects.filterByStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("projects.allStatuses")}</SelectItem>
            <SelectItem value="PLANNED">{t("projects.planned")}</SelectItem>
            <SelectItem value="IN_PROGRESS">{t("projects.inProgress")}</SelectItem>
            <SelectItem value="BLOCKED">{t("projects.blocked")}</SelectItem>
            <SelectItem value="COMPLETED">{t("projects.completed")}</SelectItem>
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
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            onPageChange={setPage}
            getRowKey={(row) => row.id}
          />
        ) : (
          <EmptyState
            icon={FolderKanban}
            title={t("projects.noProjectsFound")}
            description={
              search || statusFilter !== "all"
                ? t("projects.adjustSearchFilter")
                : t("projects.createFirstProject")
            }
            action={
              !search &&
              statusFilter === "all" && (
                <RoleGuard role="ADMIN">
                  <Button onClick={() => setDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t("projects.createProject")}
                  </Button>
                </RoleGuard>
              )
            }
          />
        )}
      </div>
    </PageContainer>
  );
}

function CreateProjectDialog({ onClose }: { onClose: () => void }) {
  const { t } = useLanguage();
  const createProject = useCreateProject();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "IN_PROGRESS" as const,
      progress: 0,
      startDate: "",
      endDate: "",
    },
  });

  async function onSubmit(data: any) {
    // Filter empty strings for optional date fields
    const payload: CreateProjectInput = {
      name: data.name,
      ...(data.description ? { description: data.description } : {}),
      ...(data.status ? { status: data.status } : {}),
      ...(data.startDate ? { startDate: data.startDate } : {}),
      ...(data.endDate ? { endDate: data.endDate } : {}),
      ...(data.progress !== undefined ? { progress: data.progress } : {}),
    };
    await createProject.mutateAsync(payload as any);
    reset();
    onClose();
  }

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{t("projects.createProject")}</DialogTitle>
        <DialogDescription>
          {t("projects.addNewProject")}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="project-name">{t("projects.projectName")}</Label>
          <Input
            id="project-name"
            placeholder={t("projects.enterProjectName")}
            {...register("name")}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="project-desc">{t("projects.description")}</Label>
          <Textarea
            id="project-desc"
            placeholder={t("projects.optionalDescription")}
            {...register("description")}
          />
          {errors.description && (
            <p className="text-sm text-destructive">
              {errors.description.message}
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start-date">{t("projects.startDate")}</Label>
            <Input
              id="start-date"
              type="datetime-local"
              {...register("startDate")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end-date">{t("projects.endDate")}</Label>
            <Input
              id="end-date"
              type="datetime-local"
              {...register("endDate")}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            {t("common.cancel")}
          </Button>
          <Button type="submit" disabled={createProject.isPending}>
            {createProject.isPending ? t("projects.creating") : t("common.create")}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
