// PMO System - API Client
// Fetch wrapper with auth headers, error handling, and base URL configuration.
// All service layer calls go through this client.

export interface ApiError {
  code: string;
  message: string;
  details?: Array<{ field: string; message: string }>;
}

export class ApiClientError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: Array<{ field: string; message: string }>;

  constructor(status: number, error: ApiError) {
    super(error.message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = error.code;
    this.details = error.details;
  }
}

const BASE_URL = "/api/v1";

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  const json = await response.json();

  if (!response.ok || json.success === false) {
    throw new ApiClientError(response.status, {
      code: json.error?.code ?? "UNKNOWN_ERROR",
      message: json.error?.message ?? "An unexpected error occurred",
      details: json.error?.details,
    });
  }

  return json as T;
}

export async function apiGet<T>(
  path: string,
  params?: Record<string, string | number | undefined>
): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`, window.location.origin);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  return handleResponse<T>(response);
}

export async function apiPost<T>(
  path: string,
  body?: unknown
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(body ?? {}),
  });

  return handleResponse<T>(response);
}

export async function apiPatch<T>(
  path: string,
  body?: unknown
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(body ?? {}),
  });

  return handleResponse<T>(response);
}

export async function apiDelete<T = void>(path: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  return handleResponse<T>(response);
}
