// PMO System - Time-Off Type Definitions

import type { TimeOffType, TimeOffStatus } from "./index";

/**
 * Time-off request creation input.
 */
export interface CreateTimeOffInput {
  startDate: string;
  endDate: string;
  type: TimeOffType;
  reason?: string;
}

/**
 * Time-off request update input.
 */
export interface UpdateTimeOffInput {
  startDate?: string;
  endDate?: string;
  type?: TimeOffType;
  reason?: string;
}

/**
 * Time-off response shape (from API).
 */
export interface TimeOffResponse {
  id: string;
  userId: string;
  startDate: string;
  endDate: string;
  type: TimeOffType;
  status: TimeOffStatus;
  reason: string | null;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}
