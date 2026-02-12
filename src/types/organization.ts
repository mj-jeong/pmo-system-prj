// PMO System - Organization Type Definitions

/**
 * Organization creation input.
 */
export interface CreateOrganizationInput {
  name: string;
  slug: string;
}

/**
 * Organization update input.
 */
export interface UpdateOrganizationInput {
  name?: string;
  slug?: string;
}

/**
 * Organization response shape (from API).
 */
export interface OrganizationResponse {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}
