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
import { useLanguage } from "@/lib/i18n/language-context";

export default function AdminAttendancePage() {
  const { t } = useLanguage();
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
      header: t("attendanceAdmin.memberHeader"),
      cell: (row) => (
        <div>
          <p className="font-medium">{row.user.name}</p>
          <p className="text-xs text-muted-foreground">{row.user.email}</p>
        </div>
      ),
    },
    {
      key: "date",
      header: t("attendance.date"),
      cell: (row) => format(new Date(row.date), "yyyy.MM.dd"),
    },
    {
      header: t("attendance.checkInLabel"),
      cell: (row) =>
        row.checkIn ? format(new Date(row.checkIn), "HH:mm") : "--:--",
    },
    {
      header: t("attendance.checkOutLabel"),
      cell: (row) =>
        row.checkOut ? format(new Date(row.checkOut), "HH:mm") : "--:--",
    },
    {
      header: t("attendanceAdmin.totalHoursHeader"),
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
      header: t("projects.statusHeader"),
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: t("attendanceAdmin.actionsHeader"),
      cell: (row) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setEditRecord(row)}
          aria-label={t("attendanceAdmin.editAttendance")}
        >
          <Edit className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  function handleExportCSV() {
    if (!data?.data) return;

    const headers = [
      t("attendanceAdmin.memberHeader"),
      "Email",
      t("attendance.date"),
      t("attendance.checkInLabel"),
      t("attendance.checkOutLabel"),
      t("projects.statusHeader"),
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
          <Button variant="ghost" size="icon" aria-label={t("common.back")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <PageHeader
          title={t("attendance.teamAttendance")}
          description={t("attendanceAdmin.teamDescription")}
          actions={
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" />
              {t("attendanceAdmin.exportCsv")}
            </Button>
          }
        />
      </div>

      {/* Filters */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="space-y-1">
          <Label className="text-xs">{t("attendanceAdmin.startDate")}</Label>
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
          <Label className="text-xs">{t("attendanceAdmin.endDate")}</Label>
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
            <SelectValue placeholder={t("attendanceAdmin.filterByStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("attendanceAdmin.allStatuses")}</SelectItem>
            <SelectItem value="CHECKED_IN">{t("attendanceAdmin.checkedIn")}</SelectItem>
            <SelectItem value="CHECKED_OUT">{t("attendanceAdmin.checkedOut")}</SelectItem>
            <SelectItem value="ABSENT">{t("attendanceAdmin.absent")}</SelectItem>
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
            title={t("attendanceAdmin.noRecords")}
            description={t("attendanceAdmin.recordsWillAppear")}
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
  const { t } = useLanguage();
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
          <DialogTitle>{t("attendanceAdmin.editAttendance")}</DialogTitle>
          <DialogDescription>
            {t("attendanceAdmin.manualCorrectionFor")} {record.user.name} ({format(new Date(record.date), "yyyy.MM.dd")})
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>{t("attendanceAdmin.checkInTime")}</Label>
            <Input type="datetime-local" {...register("checkIn")} />
          </div>
          <div className="space-y-2">
            <Label>{t("attendanceAdmin.checkOutTime")}</Label>
            <Input type="datetime-local" {...register("checkOut")} />
          </div>
          <div className="space-y-2">
            <Label>{t("projects.statusHeader")}</Label>
            <Select
              defaultValue={record.status}
              onValueChange={(val) => setValue("status", val as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CHECKED_IN">{t("attendanceAdmin.checkedIn")}</SelectItem>
                <SelectItem value="CHECKED_OUT">{t("attendanceAdmin.checkedOut")}</SelectItem>
                <SelectItem value="ABSENT">{t("attendanceAdmin.absent")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={updateAttendance.isPending}>
              {updateAttendance.isPending ? t("attendanceAdmin.saving") : t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
