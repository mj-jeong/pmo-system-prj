// PMO System - LLM Smoke Test Fixtures
// Minimal ReportContext fixtures for testing LLM providers.
// 3 scenarios: normal, data-poor, and high-risk projects.

import type { ReportContext } from "@/lib/ai/prompts";

// ---------------------------------------------------------------------------
// Fixture 1: Normal Project (2 projects, on-track, sufficient updates)
// ---------------------------------------------------------------------------

export const normalProjectFixture: ReportContext = {
  periodStart: "2026-02-10",
  periodEnd: "2026-02-16",
  organizationName: "Acme Corp (Test)",
  detailLevel: "STANDARD",
  projects: [
    {
      id: "proj-1",
      name: "Project Alpha",
      description: "Main product development",
      status: "IN_PROGRESS",
      progress: 65,
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-03-31"),
      updatedAt: new Date("2026-02-15"),
    },
    {
      id: "proj-2",
      name: "Project Beta",
      description: "Internal tooling upgrade",
      status: "IN_PROGRESS",
      progress: 40,
      startDate: new Date("2026-02-01"),
      endDate: new Date("2026-04-30"),
      updatedAt: new Date("2026-02-14"),
    },
  ],
  updates: [
    {
      id: "upd-1",
      content: "Completed sprint 5. All features on track for March delivery.",
      projectId: "proj-1",
      projectName: "Project Alpha",
      authorName: "Alice",
      createdAt: new Date("2026-02-13"),
    },
    {
      id: "upd-2",
      content: "Database migration complete. Starting API integration.",
      projectId: "proj-2",
      projectName: "Project Beta",
      authorName: "Bob",
      createdAt: new Date("2026-02-12"),
    },
  ],
  attendance: [
    { date: new Date("2026-02-10"), totalMembers: 10, present: 9, absent: 1, rate: 90 },
    { date: new Date("2026-02-11"), totalMembers: 10, present: 10, absent: 0, rate: 100 },
    { date: new Date("2026-02-12"), totalMembers: 10, present: 8, absent: 2, rate: 80 },
    { date: new Date("2026-02-13"), totalMembers: 10, present: 9, absent: 1, rate: 90 },
    { date: new Date("2026-02-14"), totalMembers: 10, present: 10, absent: 0, rate: 100 },
  ],
  timeOff: [
    {
      userId: "user-1",
      userName: "Charlie",
      type: "ANNUAL",
      status: "APPROVED",
      startDate: new Date("2026-02-10"),
      endDate: new Date("2026-02-10"),
      days: 1,
    },
  ],
  analysis: {
    delayedProjects: [],
    updateGaps: [],
    attendanceAnomalies: [],
    workforceImpact: {
      totalLeaveRequests: 1,
      totalLeaveDays: 1,
      approvedLeaveDays: 1,
      pendingLeaveDays: 0,
      peakLeaveDates: [],
      leaveByType: { ANNUAL: 1 },
      concentrationWarning: false,
    },
    ruleResults: [],
    riskScore: 0,
    generatedAt: "2026-02-16T00:00:00.000Z",
  },
};

// ---------------------------------------------------------------------------
// Fixture 2: Data-Poor Project (1 project, minimal updates, sparse data)
// ---------------------------------------------------------------------------

export const dataPoorProjectFixture: ReportContext = {
  periodStart: "2026-02-10",
  periodEnd: "2026-02-16",
  organizationName: "Small Startup (Test)",
  detailLevel: "BRIEF",
  projects: [
    {
      id: "proj-3",
      name: "MVP Launch",
      description: "Minimal viable product",
      status: "IN_PROGRESS",
      progress: 20,
      startDate: new Date("2026-02-01"),
      endDate: new Date("2026-06-30"),
      updatedAt: new Date("2026-02-05"),
    },
  ],
  updates: [],
  attendance: [
    { date: new Date("2026-02-12"), totalMembers: 3, present: 3, absent: 0, rate: 100 },
  ],
  timeOff: [],
  analysis: {
    delayedProjects: [],
    updateGaps: [
      {
        projectId: "proj-3",
        projectName: "MVP Launch",
        lastUpdateAt: null,
        daysSinceUpdate: null,
        hasNoUpdates: true,
      },
    ],
    attendanceAnomalies: [],
    workforceImpact: {
      totalLeaveRequests: 0,
      totalLeaveDays: 0,
      approvedLeaveDays: 0,
      pendingLeaveDays: 0,
      peakLeaveDates: [],
      leaveByType: {},
      concentrationWarning: false,
    },
    ruleResults: [],
    riskScore: 0,
    generatedAt: "2026-02-16T00:00:00.000Z",
  },
};

// ---------------------------------------------------------------------------
// Fixture 3: High-Risk Project (2 projects, delays, attendance anomalies)
// ---------------------------------------------------------------------------

export const highRiskProjectFixture: ReportContext = {
  periodStart: "2026-02-10",
  periodEnd: "2026-02-16",
  organizationName: "Enterprise Inc (Test)",
  detailLevel: "DETAILED",
  projects: [
    {
      id: "proj-4",
      name: "Platform Migration",
      description: "Legacy system migration to cloud",
      status: "BLOCKED",
      progress: 30,
      startDate: new Date("2025-10-01"),
      endDate: new Date("2026-02-28"),
      updatedAt: new Date("2026-02-10"),
    },
    {
      id: "proj-5",
      name: "Security Audit",
      description: "Annual security compliance audit",
      status: "IN_PROGRESS",
      progress: 15,
      startDate: new Date("2026-01-15"),
      endDate: new Date("2026-02-28"),
      updatedAt: new Date("2026-02-08"),
    },
  ],
  updates: [
    {
      id: "upd-3",
      content: "Migration blocked by vendor delay. Revised timeline pending approval.",
      projectId: "proj-4",
      projectName: "Platform Migration",
      authorName: "Dave",
      createdAt: new Date("2026-02-10"),
    },
  ],
  attendance: [
    { date: new Date("2026-02-10"), totalMembers: 20, present: 12, absent: 8, rate: 60 },
    { date: new Date("2026-02-11"), totalMembers: 20, present: 14, absent: 6, rate: 70 },
    { date: new Date("2026-02-12"), totalMembers: 20, present: 8, absent: 12, rate: 40 },
    { date: new Date("2026-02-13"), totalMembers: 20, present: 16, absent: 4, rate: 80 },
    { date: new Date("2026-02-14"), totalMembers: 20, present: 18, absent: 2, rate: 90 },
  ],
  timeOff: [
    {
      userId: "user-2",
      userName: "Eve",
      type: "SICK",
      status: "APPROVED",
      startDate: new Date("2026-02-10"),
      endDate: new Date("2026-02-12"),
      days: 3,
    },
    {
      userId: "user-3",
      userName: "Frank",
      type: "ANNUAL",
      status: "APPROVED",
      startDate: new Date("2026-02-10"),
      endDate: new Date("2026-02-14"),
      days: 5,
    },
    {
      userId: "user-4",
      userName: "Grace",
      type: "ANNUAL",
      status: "PENDING",
      startDate: new Date("2026-02-17"),
      endDate: new Date("2026-02-21"),
      days: 5,
    },
  ],
  analysis: {
    delayedProjects: [
      {
        projectId: "proj-4",
        projectName: "Platform Migration",
        status: "BLOCKED",
        progress: 30,
        expectedProgress: null,
        reason: "STATUS_BLOCKED",
      },
      {
        projectId: "proj-5",
        projectName: "Security Audit",
        status: "IN_PROGRESS",
        progress: 15,
        expectedProgress: 65,
        reason: "BEHIND_SCHEDULE",
      },
    ],
    updateGaps: [
      {
        projectId: "proj-5",
        projectName: "Security Audit",
        lastUpdateAt: null,
        daysSinceUpdate: null,
        hasNoUpdates: true,
      },
    ],
    attendanceAnomalies: [
      { date: new Date("2026-02-10"), rate: 60, present: 12, totalMembers: 20, severity: "WARNING" },
      { date: new Date("2026-02-12"), rate: 40, present: 8, totalMembers: 20, severity: "CRITICAL" },
    ],
    workforceImpact: {
      totalLeaveRequests: 3,
      totalLeaveDays: 13,
      approvedLeaveDays: 8,
      pendingLeaveDays: 5,
      peakLeaveDates: [
        { date: "2026-02-10", count: 2 },
        { date: "2026-02-11", count: 2 },
        { date: "2026-02-12", count: 2 },
      ],
      leaveByType: { SICK: 3, ANNUAL: 10 },
      concentrationWarning: true,
    },
    ruleResults: [],
    riskScore: 0,
    generatedAt: "2026-02-16T00:00:00.000Z",
  },
};
