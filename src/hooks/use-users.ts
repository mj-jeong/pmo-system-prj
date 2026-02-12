"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as userService from "@/lib/services/user.service";
import type { PaginationParams } from "@/types/api";
import { handleApiError, showSuccessToast } from "@/lib/api/error-handler";

export const userKeys = {
  all: ["users"] as const,
  list: (params?: PaginationParams) => [...userKeys.all, "list", params] as const,
};

export function useUsers(params?: PaginationParams) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => userService.getUsers(params),
  });
}

export function useInviteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: userService.InviteUserData) => userService.inviteUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      showSuccessToast("Member invited successfully.");
    },
    onError: handleApiError,
  });
}

export function useChangeRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: userService.ChangeRoleData }) =>
      userService.changeRole(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      showSuccessToast("Role updated successfully.");
    },
    onError: handleApiError,
  });
}

export function useRemoveUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => userService.removeUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      showSuccessToast("Member removed successfully.");
    },
    onError: handleApiError,
  });
}
