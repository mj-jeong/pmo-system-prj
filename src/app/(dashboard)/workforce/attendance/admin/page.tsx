"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Download, Edit, Users } from "lucide-react";
import Link from "next/link";

import { updateAttendanceSchema } from "@/lib/validators/attendance";
import type { UpdateAttendanceInput } from "@/types/attendance";
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
} from "@/components/ui/dialog";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useAllAttendance, useUpdateAttendance } from "@/hooks/use-attendance";
import type { AttendanceWithUser } from "@/lib/services/attendance.service";

export default function AdminAttendancePage() {
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editRecord, setEditRecord] = useState<AttendanceWithUser | null>(null);

  const filters = {
    page,
    limit: 20,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    status:
      statusFilter !== "all" ? (statusFilter as any) : undefined,
  };

  const { data, isLoading } = useAllAttendance(filters);

  const columns: DataTableColumn<AttendanceWithUser>[] = [
    {
      key: "user",
      header: "Member",
      cell: (row) => (
        <div>
          <p className="font-medium">{row.user.name}</p>
          <p className="text-xs text-muted-foreground">{row.user.email}</p>
        </div>
      ),
    },
    {
      key: "date",
      header: "Date",
      cell: (row) => format(new Date(row.date), "MMM d, yyyy"),
    },
    {
      header: "Check In",
      cell: (row) =>
        row.checkIn ? format(new Date(row.checkIn), "HH:mm") : "--:--",
    },
    {
      header: "Check Out",
      cell: (row) =>
        row.checkOut ? format(new Date(row.checkOut), "HH:mm") : "--:--",
    },
    {
      header: "Total Hours",
      cell: (row) => {
        if (!row.checkIn || !row.checkOut) return "--";
        const diff =
          new Date(row.checkOut).getTime() - new Date(row.checkIn).getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
      },
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Actions",
      cell: (row) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setEditRecord(row)}
          aria-label="Edit attendance"
        >
          <Edit className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  function handleExportCSV() {
    if (!data?.data) return;

    const headers = [
      "Member",
      "Email",
      "Date",
      "Check In",
      "Check Out",
      "Status",
    ];
    const rows = data.data.map((r) => [
      r.user.name,
      r.user.email,
      r.date,
      r.checkIn ? format(new Date(r.checkIn), "HH:mm:ss") : "",
      r.checkOut ? format(new Date(r.checkOut), "HH:mm:ss") : "",
      r.status,
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <PageContainer>
      <div className="flex items-center gap-3 mb-4">
        <Link href="/workforce/attendance">
          <Button variant="ghost" size="icon" aria-label="Back to attendance">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <PageHeader
          title="Team Attendance"
          description="Monitor and manage team attendance records"
          actions={
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          }
        />
      </div>

      {/* Filters */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="space-y-1">
          <Label className="text-xs">Start Date</Label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
            className="w-[160px]"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">End Date</Label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
            className="w-[160px]"
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
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="CHECKED_IN">Checked In</SelectItem>
            <SelectItem value="CHECKED_OUT">Checked Out</SelectItem>
            <SelectItem value="ABSENT">Absent</SelectItem>
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
            icon={Users}
            title="No attendance records"
            description="Attendance records will appear here as team members check in."
          />
        )}
      </div>

      {/* Edit Dialog */}
      {editRecord && (
        <EditAttendanceDialog
          record={editRecord}
          onClose={() => setEditRecord(null)}
        />
      )}
    </PageContainer>
  );
}

function EditAttendanceDialog({
  record,
  onClose,
}: {
  record: AttendanceWithUser;
  onClose: () => void;
}) {
  const updateAttendance = useUpdateAttendance();

  const {
    register,
    handleSubmit,
    setValue,
  } = useForm<UpdateAttendanceInput>({
    resolver: zodResolver(updateAttendanceSchema),
    defaultValues: {
      checkIn: record.checkIn ?? "",
      checkOut: record.checkOut ?? "",
      status: record.status,
    },
  });

  async function onSubmit(data: UpdateAttendanceInput) {
    // Remove empty strings before sending
    const cleanData: UpdateAttendanceInput = {};
    if (data.checkIn) cleanData.checkIn = data.checkIn;
    if (data.checkOut) cleanData.checkOut = data.checkOut;
    if (data.status) cleanData.status = data.status;

    await updateAttendance.mutateAsync({ id: record.id, data: cleanData });
    onClose();
  }

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Attendance</DialogTitle>
          <DialogDescription>
            Manual correction for {record.user.name} on{" "}
            {format(new Date(record.date), "MMM d, yyyy")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Check In Time</Label>
            <Input type="datetime-local" {...register("checkIn")} />
          </div>
          <div className="space-y-2">
            <Label>Check Out Time</Label>
            <Input type="datetime-local" {...register("checkOut")} />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              defaultValue={record.status}
              onValueChange={(val) => setValue("status", val as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CHECKED_IN">Checked In</SelectItem>
                <SelectItem value="CHECKED_OUT">Checked Out</SelectItem>
                <SelectItem value="ABSENT">Absent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateAttendance.isPending}>
              {updateAttendance.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
