// PMO System - API Type Definitions
// Standard types for API request/response consistency

/**
 * Standard success response wrapper.
 */
export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

/**
 * Paginated list response.
 */
export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Standard pagination query parameters.
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * Create a standard success response.
 */
export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Create a paginated success response.
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  return {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
