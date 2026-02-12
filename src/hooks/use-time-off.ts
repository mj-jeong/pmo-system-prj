"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as timeOffService from "@/lib/services/time-off.service";
import type { TimeOffFilter } from "@/types";
import type { CreateTimeOffInput, UpdateTimeOffInput } from "@/types/time-off";
import { handleApiError, showSuccessToast } from "@/lib/api/error-handler";

export const timeOffKeys = {
  all: ["time-off"] as const,
  list: (params?: TimeOffFilter) => [...timeOffKeys.all, "list", params] as const,
};

export function useTimeOffs(params?: TimeOffFilter) {
  return useQuery({
    queryKey: timeOffKeys.list(params),
    queryFn: () => timeOffService.getTimeOffs(params),
  });
}

export function useCreateTimeOff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTimeOffInput) => timeOffService.createTimeOff(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timeOffKeys.all });
      showSuccessToast("Time-off request submitted.");
    },
    onError: handleApiError,
  });
}

export function useUpdateTimeOff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTimeOffInput }) =>
      timeOffService.updateTimeOff(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timeOffKeys.all });
      showSuccessToast("Time-off request updated.");
    },
    onError: handleApiError,
  });
}

export function useApproveTimeOff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => timeOffService.approveTimeOff(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timeOffKeys.all });
      showSuccessToast("Time-off request approved.");
    },
    onError: handleApiError,
  });
}

export function useRejectTimeOff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => timeOffService.rejectTimeOff(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timeOffKeys.all });
      showSuccessToast("Time-off request rejected.");
    },
    onError: handleApiError,
  });
}
