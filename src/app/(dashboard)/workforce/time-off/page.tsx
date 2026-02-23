"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, CalendarOff, Check, X } from "lucide-react";

import {
  createTimeOffSchema,
  type CreateTimeOffInput,
} from "@/lib/validators/time-off";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { RoleGuard } from "@/components/auth/role-guard";
import {
  useTimeOffs,
  useCreateTimeOff,
  useApproveTimeOff,
  useRejectTimeOff,
} from "@/hooks/use-time-off";
import type { TimeOffWithUser } from "@/lib/services/time-off.service";
import type { TimeOffStatus } from "@/types";
import { useLanguage } from "@/lib/i18n/language-context";

export default function TimeOffPage() {
  const { t } = useLanguage();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const params = {
    page,
    limit: 20,
    status:
      statusFilter !== "all"
        ? (statusFilter as TimeOffStatus)
        : undefined,
  };

  const { data, isLoading } = useTimeOffs(params);
  const approveTimeOff = useApproveTimeOff();
  const rejectTimeOff = useRejectTimeOff();

  const columns: DataTableColumn<TimeOffWithUser>[] = [
    {
      header: "Requester",
      cell: (row) => (
        <span className="font-medium">{row.user.name}</span>
      ),
    },
    {
      header: "Type",
      cell: (row) => (
        <span className="text-sm capitalize">
          {row.type.toLowerCase()}
        </span>
      ),
    },
    {
      key: "startDate",
      header: "Start Date",
      cell: (row) => format(new Date(row.startDate), "MMM d, yyyy"),
    },
    {
      key: "endDate",
      header: "End Date",
      cell: (row) => format(new Date(row.endDate), "MMM d, yyyy"),
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Reason",
      cell: (row) => (
        <span className="text-sm text-muted-foreground line-clamp-1">
          {row.reason ?? "--"}
        </span>
      ),
    },
    {
      header: "Actions",
      cell: (row) => {
        if (row.status !== "PENDING") return null;

        return (
          <RoleGuard role="ADMIN">
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-success hover:text-success"
                onClick={() => approveTimeOff.mutate(row.id)}
                disabled={approveTimeOff.isPending}
                aria-label="Approve"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => rejectTimeOff.mutate(row.id)}
                disabled={rejectTimeOff.isPending}
                aria-label="Reject"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </RoleGuard>
        );
      },
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title={t("pages.timeOff.title")}
        description={t("pages.timeOff.description")}
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Request Time Off
              </Button>
            </DialogTrigger>
            <CreateTimeOffDialog onClose={() => setDialogOpen(false)} />
          </Dialog>
        }
      />

      {/* Filters */}
      <div className="mt-4 flex items-center gap-3">
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
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
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
            icon={CalendarOff}
            title="No time-off requests"
            description={
              statusFilter !== "all"
                ? "No requests match the selected filter."
                : "Submit a time-off request when you need leave."
            }
            action={
              statusFilter === "all" && (
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Request Time Off
                </Button>
              )
            }
          />
        )}
      </div>
    </PageContainer>
  );
}

function CreateTimeOffDialog({ onClose }: { onClose: () => void }) {
  const createTimeOff = useCreateTimeOff();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createTimeOffSchema),
    defaultValues: {
      startDate: "",
      endDate: "",
      type: undefined as any,
      reason: "",
    },
  });

  async function onSubmit(data: any) {
    const payload: CreateTimeOffInput = {
      startDate: data.startDate,
      endDate: data.endDate,
      type: data.type,
      ...(data.reason ? { reason: data.reason } : {}),
    };
    await createTimeOff.mutateAsync(payload as any);
    reset();
    onClose();
  }

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Request Time Off</DialogTitle>
        <DialogDescription>
          Submit a new time-off request for review.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select onValueChange={(val) => setValue("type", val as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="VACATION">Vacation</SelectItem>
              <SelectItem value="SICK">Sick Leave</SelectItem>
              <SelectItem value="PERSONAL">Personal</SelectItem>
            </SelectContent>
          </Select>
          {errors.type && (
            <p className="text-sm text-destructive">{errors.type.message}</p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="to-start">Start Date</Label>
            <Input id="to-start" type="date" {...register("startDate")} />
            {errors.startDate && (
              <p className="text-sm text-destructive">
                {errors.startDate.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="to-end">End Date</Label>
            <Input id="to-end" type="date" {...register("endDate")} />
            {errors.endDate && (
              <p className="text-sm text-destructive">
                {errors.endDate.message}
              </p>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="to-reason">Reason (optional)</Label>
          <Textarea
            id="to-reason"
            placeholder="Provide a reason for the request"
            {...register("reason")}
          />
          {errors.reason && (
            <p className="text-sm text-destructive">{errors.reason.message}</p>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={createTimeOff.isPending}>
            {createTimeOff.isPending ? "Submitting..." : "Submit Request"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
