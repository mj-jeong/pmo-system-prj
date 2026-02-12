// PMO System - User Service
// Client-side service for user/member API calls.

import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api/client";
import type { ApiResponse, PaginatedResponse, PaginationParams } from "@/types/api";
import type { RoleName } from "@/types";

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: RoleName;
  createdAt: string;
}

export interface InviteUserData {
  email: string;
  name: string;
  password: string;
  role: "ADMIN" | "MEMBER";
}

export interface ChangeRoleData {
  role: RoleName;
}

export async function getUsers(params?: PaginationParams) {
  return apiGet<PaginatedResponse<UserResponse>>("/users", params as any);
}

export async function inviteUser(data: InviteUserData) {
  return apiPost<ApiResponse<UserResponse>>("/users/invite", data);
}

export async function changeRole(userId: string, data: ChangeRoleData) {
  return apiPatch<ApiResponse<UserResponse>>(`/users/${userId}/role`, data);
}

export async function removeUser(userId: string) {
  return apiDelete(`/users/${userId}`);
}
