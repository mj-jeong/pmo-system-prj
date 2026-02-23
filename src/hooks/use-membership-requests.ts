"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";

export interface MembershipRequestItem {
  id: string;
  email: string;
  name: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  message: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

export function useMembershipRequests() {
  return useQuery({
    queryKey: ["membership-requests"],
    queryFn: () =>
      apiGet<ApiResponse<MembershipRequestItem[]>>(
        "/settings/membership-requests"
      ).then((res) => res.data),
    staleTime: 30_000,
  });
}
