// PMO System - Organization Service
// Client-side service for organization API calls.

import { apiGet, apiPatch, apiDelete } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";
import type { OrganizationResponse, UpdateOrganizationInput } from "@/types/organization";

export async function getCurrentOrg() {
  return apiGet<ApiResponse<OrganizationResponse>>("/organizations/current");
}

export async function updateOrg(data: UpdateOrganizationInput) {
  return apiPatch<ApiResponse<OrganizationResponse>>(
    "/organizations/current",
    data
  );
}

export async function deleteOrg() {
  return apiDelete("/organizations/current");
}
