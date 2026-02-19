// PMO System - Agent Orchestrator
// Executes the 5-step PMO report generation pipeline.
// Steps: PLAN -> COLLECT -> ANALYZE -> SUMMARIZE -> DRAFT
// Manages AgentRun lifecycle, AgentStep status, and ToolCall recording.

import { prisma } from "@/lib/db/prisma";
import { agentTools } from "./agent-tools";
import type { CollectionParams, ProjectSnapshot, ProjectUpdateRecord, AttendanceDaySummary, TimeOffSummaryRecord } from "./agent-tools";
import { analyzeAll } from "./agent-analysis";
import type { AnalysisResult } from "./agent-analysis";
import { generateNarrative } from "@/lib/ai/openai-client";
import type { ReportContext } from "@/lib/ai/prompts";
import type { GenerateReportInput } from "@/lib/validators/agent";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type StepName = "PLAN" | "COLLECT" | "ANALYZE" | "SUMMARIZE" | "DRAFT";

interface StepRecord {
  id: string;
  stepName: StepName;
}

interface ExecuteRunResult {
  runId: string;
  reportId: string | null;
  status: "COMPLETED" | "FAILED";
  errorMessage: string | null;
}

interface CollectedData {
  projects: ProjectSnapshot[];
  updates: ProjectUpdateRecord[];
  attendance: AttendanceDaySummary[];
  timeOff: TimeOffSummaryRecord[];
}

// ---------------------------------------------------------------------------
// Step Helpers
// ---------------------------------------------------------------------------

/**
 * Mark a step as RUNNING with a startedAt timestamp.
 */
async function startStep(stepId: string): Promise<void> {
  await prisma.agentStep.update({
    where: { id: stepId },
    data: {
      status: "RUNNING",
      startedAt: new Date(),
    },
  });
}

/**
 * Mark a step as COMPLETED with output data and finishedAt timestamp.
 */
async function completeStep(stepId: string, outputData: unknown): Promise<void> {
  await prisma.agentStep.update({
    where: { id: stepId },
    data: {
      status: "COMPLETED",
      outputData: outputData as any,
      finishedAt: new Date(),
    },
  });
}

/**
 * Mark a step as FAILED with error message and finishedAt timestamp.
 */
async function failStep(stepId: string, errorMessage: string): Promise<void> {
  await prisma.agentStep.update({
    where: { id: stepId },
    data: {
      status: "FAILED",
      errorMessage,
      finishedAt: new Date(),
    },
  });
}

/**
 * Mark remaining steps as SKIPPED when a preceding step fails.
 */
async function skipRemainingSteps(stepIds: string[]): Promise<void> {
  if (stepIds.length === 0) return;
  await prisma.agentStep.updateMany({
    where: { id: { in: stepIds } },
    data: {
      status: "SKIPPED",
      finishedAt: new Date(),
    },
  });
}

/**
 * Record a ToolCall for observability.
 */
async function recordToolCall(
  stepId: string,
  toolName: string,
  requestPayload: unknown,
  responsePayload: unknown,
  latencyMs: number,
  error?: string
): Promise<void> {
  await prisma.toolCall.create({
    data: {
      stepId,
      toolName,
      requestPayload: requestPayload as any,
      responsePayload: responsePayload as any,
      latencyMs,
      error: error || null,
    },
  });
}

// ---------------------------------------------------------------------------
// Main Orchestrator
// ---------------------------------------------------------------------------

/**
 * Execute a full PMO report generation run.
 *
 * 1. PLAN:      Validate input, determine which tools to call
 * 2. COLLECT:   Call 4 agent tools, record ToolCalls
 * 3. ANALYZE:   Run deterministic analysis on collected data
 * 4. SUMMARIZE: Call OpenAI to generate narrative
 * 5. DRAFT:     Create Report record with DRAFT status
 *
 * On failure at any step:
 * - Mark the failed step as FAILED
 * - Mark all remaining steps as SKIPPED
 * - Mark AgentRun as FAILED with error message
 */
export async function executeRun(
  organizationId: string,
  userId: string,
  input: GenerateReportInput
): Promise<ExecuteRunResult> {
  // -------------------------------------------------------------------------
  // Create AgentRun + 5 AgentStep records
  // -------------------------------------------------------------------------
  const agentRun = await prisma.agentRun.create({
    data: {
      organizationId,
      createdById: userId,
      status: "RUNNING",
      startedAt: new Date(),
      inputParams: {
        periodStart: input.periodStart.toISOString(),
        periodEnd: input.periodEnd.toISOString(),
        projectIds: input.projectIds,
        detailLevel: input.detailLevel,
      },
    },
  });

  const stepNames: StepName[] = ["PLAN", "COLLECT", "ANALYZE", "SUMMARIZE", "DRAFT"];

  const steps: StepRecord[] = [];
  for (const stepName of stepNames) {
    const step = await prisma.agentStep.create({
      data: {
        runId: agentRun.id,
        stepName,
        status: "PENDING",
      },
    });
    steps.push({ id: step.id, stepName });
  }

  let reportId: string | null = null;
  let collectedData: CollectedData | null = null;
  let analysisResult: AnalysisResult | null = null;
  let narrativeResult: { executiveSummary: string; projectNarrative: string; workforceNarrative: string; markdown: string } | null = null;

  try {
    // -----------------------------------------------------------------------
    // Step 1: PLAN - Validate input and determine tools
    // -----------------------------------------------------------------------
    const planStep = steps[0];
    await startStep(planStep.id);

    try {
      // Validate that projects exist and belong to this org
      const existingProjects = await prisma.project.findMany({
        where: {
          organizationId,
          id: { in: input.projectIds },
          deletedAt: null,
        },
        select: { id: true },
      });

      const existingIds = new Set(existingProjects.map((p) => p.id));
      const missingIds = input.projectIds.filter((id) => !existingIds.has(id));

      if (missingIds.length > 0) {
        throw new Error(`Projects not found in organization: ${missingIds.join(", ")}`);
      }

      // Get organization name for the report
      const org = await prisma.organization.findFirst({
        where: { id: organizationId },
        select: { name: true },
      });

      const planOutput = {
        validatedProjectIds: input.projectIds,
        periodStart: input.periodStart.toISOString(),
        periodEnd: input.periodEnd.toISOString(),
        detailLevel: input.detailLevel,
        organizationName: org?.name || "Unknown Organization",
        toolsToCall: [
          "getProjectsSnapshot",
          "getProjectUpdates",
          "getAttendanceSummary",
          "getTimeOffSummary",
        ],
      };

      await completeStep(planStep.id, planOutput);

      // -------------------------------------------------------------------
      // Step 2: COLLECT - Call 4 agent tools in parallel
      // -------------------------------------------------------------------
      const collectStep = steps[1];
      await startStep(collectStep.id);

      try {
        const collectionParams: CollectionParams = {
          periodStart: input.periodStart,
          periodEnd: input.periodEnd,
          projectIds: input.projectIds,
        };

        // Execute all 4 tools in parallel with timing
        const [projectsResult, updatesResult, attendanceResult, timeOffResult] =
          await Promise.all([
            timedToolCall(
              collectStep.id,
              "getProjectsSnapshot",
              collectionParams,
              () => agentTools.getProjectsSnapshot(organizationId, collectionParams)
            ),
            timedToolCall(
              collectStep.id,
              "getProjectUpdates",
              collectionParams,
              () => agentTools.getProjectUpdates(organizationId, collectionParams)
            ),
            timedToolCall(
              collectStep.id,
              "getAttendanceSummary",
              collectionParams,
              () => agentTools.getAttendanceSummary(organizationId, collectionParams)
            ),
            timedToolCall(
              collectStep.id,
              "getTimeOffSummary",
              collectionParams,
              () => agentTools.getTimeOffSummary(organizationId, collectionParams)
            ),
          ]);

        collectedData = {
          projects: projectsResult,
          updates: updatesResult,
          attendance: attendanceResult,
          timeOff: timeOffResult,
        };

        await completeStep(collectStep.id, {
          projectCount: projectsResult.length,
          updateCount: updatesResult.length,
          attendanceDays: attendanceResult.length,
          timeOffCount: timeOffResult.length,
        });

        // -----------------------------------------------------------------
        // Step 3: ANALYZE - Deterministic analysis
        // -----------------------------------------------------------------
        const analyzeStep = steps[2];
        await startStep(analyzeStep.id);

        try {
          analysisResult = analyzeAll(collectedData);

          await completeStep(analyzeStep.id, {
            delayedProjectsCount: analysisResult.delayedProjects.length,
            updateGapsCount: analysisResult.updateGaps.length,
            attendanceAnomaliesCount: analysisResult.attendanceAnomalies.length,
            concentrationWarning: analysisResult.workforceImpact.concentrationWarning,
          });

          // ---------------------------------------------------------------
          // Step 4: SUMMARIZE - Call OpenAI
          // ---------------------------------------------------------------
          const summarizeStep = steps[3];
          await startStep(summarizeStep.id);

          try {
            const reportContext: ReportContext = {
              periodStart: input.periodStart.toISOString(),
              periodEnd: input.periodEnd.toISOString(),
              organizationName: planOutput.organizationName,
              projects: collectedData.projects,
              updates: collectedData.updates,
              attendance: collectedData.attendance,
              timeOff: collectedData.timeOff,
              analysis: analysisResult,
              detailLevel: input.detailLevel,
            };

            narrativeResult = await generateNarrative(reportContext);

            await completeStep(summarizeStep.id, {
              executiveSummaryLength: narrativeResult.executiveSummary.length,
              projectNarrativeLength: narrativeResult.projectNarrative.length,
              workforceNarrativeLength: narrativeResult.workforceNarrative.length,
              markdownLength: narrativeResult.markdown.length,
            });

            // -------------------------------------------------------------
            // Step 5: DRAFT - Create Report record
            // -------------------------------------------------------------
            const draftStep = steps[4];
            await startStep(draftStep.id);

            try {
              const report = await prisma.report.create({
                data: {
                  organizationId,
                  periodStart: input.periodStart,
                  periodEnd: input.periodEnd,
                  projectIds: input.projectIds,
                  detailLevel: input.detailLevel,
                  status: "DRAFT",
                  draftMarkdown: narrativeResult.markdown,
                  structuredData: JSON.parse(JSON.stringify({
                    executiveSummary: narrativeResult.executiveSummary,
                    projectNarrative: narrativeResult.projectNarrative,
                    workforceNarrative: narrativeResult.workforceNarrative,
                    analysis: analysisResult,
                  })),
                  createdById: userId,
                },
              });

              reportId = report.id;

              await completeStep(draftStep.id, { reportId: report.id });

              // All steps succeeded - mark run as COMPLETED
              await prisma.agentRun.update({
                where: { id: agentRun.id },
                data: {
                  status: "COMPLETED",
                  reportId: report.id,
                  finishedAt: new Date(),
                  outputSummary: {
                    reportId: report.id,
                    projectCount: collectedData.projects.length,
                    delayedProjectsCount: analysisResult.delayedProjects.length,
                    updateGapsCount: analysisResult.updateGaps.length,
                    attendanceAnomaliesCount: analysisResult.attendanceAnomalies.length,
                  },
                },
              });

              return {
                runId: agentRun.id,
                reportId: report.id,
                status: "COMPLETED",
                errorMessage: null,
              };
            } catch (error) {
              await handleStepFailure(agentRun.id, draftStep.id, [], error);
              return buildFailedResult(agentRun.id, error);
            }
          } catch (error) {
            const remainingStepIds = [steps[4].id];
            await handleStepFailure(agentRun.id, summarizeStep.id, remainingStepIds, error);
            return buildFailedResult(agentRun.id, error);
          }
        } catch (error) {
          const remainingStepIds = [steps[3].id, steps[4].id];
          await handleStepFailure(agentRun.id, analyzeStep.id, remainingStepIds, error);
          return buildFailedResult(agentRun.id, error);
        }
      } catch (error) {
        const remainingStepIds = [steps[2].id, steps[3].id, steps[4].id];
        await handleStepFailure(agentRun.id, collectStep.id, remainingStepIds, error);
        return buildFailedResult(agentRun.id, error);
      }
    } catch (error) {
      const remainingStepIds = [steps[1].id, steps[2].id, steps[3].id, steps[4].id];
      await handleStepFailure(agentRun.id, planStep.id, remainingStepIds, error);
      return buildFailedResult(agentRun.id, error);
    }
  } catch (error) {
    // Catch-all: if something went wrong during setup
    await prisma.agentRun.update({
      where: { id: agentRun.id },
      data: {
        status: "FAILED",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        finishedAt: new Date(),
      },
    });

    return {
      runId: agentRun.id,
      reportId: null,
      status: "FAILED",
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ---------------------------------------------------------------------------
// Internal Helpers
// ---------------------------------------------------------------------------

/**
 * Execute a tool call with timing and recording.
 */
async function timedToolCall<T>(
  stepId: string,
  toolName: string,
  requestPayload: unknown,
  fn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  try {
    const result = await fn();
    const latencyMs = Date.now() - startTime;
    await recordToolCall(stepId, toolName, requestPayload, { recordCount: Array.isArray(result) ? result.length : 1 }, latencyMs);
    return result;
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    await recordToolCall(stepId, toolName, requestPayload, null, latencyMs, errorMessage);
    throw error;
  }
}

/**
 * Handle step failure: fail the step, skip remaining, update run.
 */
async function handleStepFailure(
  runId: string,
  failedStepId: string,
  remainingStepIds: string[],
  error: unknown
): Promise<void> {
  const errorMessage = error instanceof Error ? error.message : "Unknown error";

  await failStep(failedStepId, errorMessage);
  await skipRemainingSteps(remainingStepIds);

  await prisma.agentRun.update({
    where: { id: runId },
    data: {
      status: "FAILED",
      errorMessage,
      finishedAt: new Date(),
    },
  });
}

/**
 * Build a failed result from an error.
 */
function buildFailedResult(runId: string, error: unknown): ExecuteRunResult {
  return {
    runId,
    reportId: null,
    status: "FAILED",
    errorMessage: error instanceof Error ? error.message : "Unknown error",
  };
}
