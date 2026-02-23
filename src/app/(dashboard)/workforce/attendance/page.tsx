"use client";

import { format } from "date-fns";
import { Clock, LogIn, LogOut, CalendarCheck } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { RoleGuard } from "@/components/auth/role-guard";
import {
  useTodayAttendance,
  useCheckIn,
  useCheckOut,
} from "@/hooks/use-attendance";
import Link from "next/link";
import type { AttendanceResponse } from "@/types/attendance";
import { useLanguage } from "@/lib/i18n/language-context";

export default function AttendancePage() {
  const { t } = useLanguage();
  const { data: todayRecord, isLoading } = useTodayAttendance();
  const checkIn = useCheckIn();
  const checkOut = useCheckOut();

  const isCheckedIn = todayRecord?.status === "CHECKED_IN";
  const isCheckedOut = todayRecord?.status === "CHECKED_OUT";
  const hasNotCheckedIn = !todayRecord;

  // Button state logic:
  // Check-in: enabled only when NOT checked in today
  // Check-out: enabled only when checked in but NOT checked out
  const canCheckIn = hasNotCheckedIn;
  const canCheckOut = isCheckedIn && !isCheckedOut;

  function getStatusMessage(): string {
    if (!todayRecord) return "Not checked in today";
    if (isCheckedIn && todayRecord.checkIn) {
      return `Checked in at ${format(new Date(todayRecord.checkIn), "HH:mm")}`;
    }
    if (isCheckedOut && todayRecord.checkOut) {
      return `Checked out at ${format(new Date(todayRecord.checkOut), "HH:mm")}`;
    }
    return todayRecord.status;
  }

  function getTotalHours(): string | null {
    if (!todayRecord?.checkIn || !todayRecord?.checkOut) return null;
    const diff =
      new Date(todayRecord.checkOut).getTime() -
      new Date(todayRecord.checkIn).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }

  return (
    <PageContainer>
      <PageHeader
        title={t("pages.attendance.title")}
        description={t("pages.attendance.description")}
        actions={
          <RoleGuard role="ADMIN">
            <Link href="/workforce/attendance/admin">
              <Button variant="outline">Team Attendance</Button>
            </Link>
          </RoleGuard>
        }
      />

      {isLoading ? (
        <div className="mt-6">
          <LoadingSkeleton variant="card" count={2} />
        </div>
      ) : (
        <>
          {/* Current Status */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4" />
                Today&apos;s Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                {/* Status display */}
                <div className="text-center">
                  {todayRecord && (
                    <div className="mb-2">
                      <StatusBadge status={todayRecord.status} />
                    </div>
                  )}
                  <p className="text-lg font-medium">{getStatusMessage()}</p>
                  {getTotalHours() && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Total: {getTotalHours()}
                    </p>
                  )}
                </div>

                {/* Check-in / Check-out Buttons */}
                <div className="flex gap-4">
                  <Button
                    size="lg"
                    className="min-w-[140px] bg-success hover:bg-success/90 text-success-foreground"
                    disabled={
                      !canCheckIn ||
                      checkIn.isPending
                    }
                    onClick={() => checkIn.mutate()}
                  >
                    <LogIn className="mr-2 h-5 w-5" />
                    {checkIn.isPending ? "Checking in..." : "Check In"}
                  </Button>
                  <Button
                    size="lg"
                    className="min-w-[140px]"
                    disabled={
                      !canCheckOut ||
                      checkOut.isPending
                    }
                    onClick={() => checkOut.mutate()}
                  >
                    <LogOut className="mr-2 h-5 w-5" />
                    {checkOut.isPending ? "Checking out..." : "Check Out"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Today's Summary Card */}
          {todayRecord && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-base">
                  Today&apos;s Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="text-sm font-medium">
                      {format(new Date(todayRecord.date), "MMMM d, yyyy")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Check In</p>
                    <p className="text-sm font-medium">
                      {todayRecord.checkIn
                        ? format(new Date(todayRecord.checkIn), "HH:mm:ss")
                        : "--:--"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Check Out</p>
                    <p className="text-sm font-medium">
                      {todayRecord.checkOut
                        ? format(new Date(todayRecord.checkOut), "HH:mm:ss")
                        : "--:--"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {!todayRecord && (
            <Card className="mt-4">
              <CardContent className="p-6">
                <EmptyState
                  icon={CalendarCheck}
                  title="No attendance record"
                  description="Click the Check In button to start tracking your attendance for today."
                />
              </CardContent>
            </Card>
          )}
        </>
      )}
    </PageContainer>
  );
}
