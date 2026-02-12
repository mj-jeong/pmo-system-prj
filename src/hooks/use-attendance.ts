"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as attendanceService from "@/lib/services/attendance.service";
import type { AttendanceQueryInput, UpdateAttendanceInput } from "@/types/attendance";
import { handleApiError, showSuccessToast } from "@/lib/api/error-handler";

export const attendanceKeys = {
  all: ["attendance"] as const,
  today: () => [...attendanceKeys.all, "today"] as const,
  list: (filters?: AttendanceQueryInput) =>
    [...attendanceKeys.all, "list", filters] as const,
};

/**
 * Query for today's attendance status.
 * Polls every 30 seconds for near-real-time updates.
 */
export function useTodayAttendance() {
  return useQuery({
    queryKey: attendanceKeys.today(),
    queryFn: () => attendanceService.getTodayAttendance(),
    select: (res) => res.data,
    refetchInterval: 30 * 1000,
  });
}

/**
 * Mutation for check-in button.
 */
export function useCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => attendanceService.checkIn(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
      showSuccessToast("Checked in successfully.");
    },
    onError: handleApiError,
  });
}

/**
 * Mutation for check-out button.
 */
export function useCheckOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => attendanceService.checkOut(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
      showSuccessToast("Checked out successfully.");
    },
    onError: handleApiError,
  });
}

/**
 * Query for admin attendance monitoring (requires ADMIN or OWNER role).
 * Polls every 30 seconds.
 */
export function useAllAttendance(filters?: AttendanceQueryInput) {
  return useQuery({
    queryKey: attendanceKeys.list(filters),
    queryFn: () => attendanceService.getAllAttendance(filters),
    refetchInterval: 30 * 1000,
  });
}

/**
 * Mutation for manual attendance correction (admin only).
 */
export function useUpdateAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAttendanceInput }) =>
      attendanceService.updateAttendance(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
      showSuccessToast("Attendance record updated.");
    },
    onError: handleApiError,
  });
}
