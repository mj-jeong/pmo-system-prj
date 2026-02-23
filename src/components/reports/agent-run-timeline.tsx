"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Loader2, Circle, Minus, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { AgentStep, AgentStepStatus, AgentStepName } from "@/lib/services/agent.service";

// ---------------------------------------------------------------------------
// AgentRunTimeline - Vertical timeline showing 5 agent pipeline steps
// Displays status indicators, durations, and expandable tool call details.
// ---------------------------------------------------------------------------

export interface AgentRunTimelineProps {
  steps: AgentStep[];
}

const STEP_ORDER: AgentStepName[] = ["PLAN", "COLLECT", "ANALYZE", "SUMMARIZE", "DRAFT", "REVIEW", "ACTION"];

const STEP_LABELS: Record<AgentStepName, string> = {
  PLAN: "Planning",
  COLLECT: "Data Collection",
  ANALYZE: "Analysis",
  SUMMARIZE: "Summarization",
  DRAFT: "Draft Generation",
  REVIEW: "Admin Review",
  ACTION: "Post-publish Actions",
};

export function AgentRunTimeline({ steps }: AgentRunTimelineProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  // Sort steps by pipeline order
  const sortedSteps = [...steps].sort(
    (a, b) => STEP_ORDER.indexOf(a.stepName) - STEP_ORDER.indexOf(b.stepName)
  );

  function toggleStep(stepId: string) {
    const updated = new Set(expandedSteps);
    if (updated.has(stepId)) {
      updated.delete(stepId);
    } else {
      updated.add(stepId);
    }
    setExpandedSteps(updated);
  }

  function calculateDuration(startedAt: string | null, finishedAt: string | null): string | null {
    if (!startedAt || !finishedAt) return null;
    const durationMs = new Date(finishedAt).getTime() - new Date(startedAt).getTime();
    const seconds = Math.floor(durationMs / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }

  return (
    <div className="space-y-4">
      {sortedSteps.map((step, index) => {
        const isExpanded = expandedSteps.has(step.id);
        const duration = calculateDuration(step.startedAt, step.finishedAt);
        const isLast = index === sortedSteps.length - 1;

        return (
          <div key={step.id} className="relative">
            {/* Vertical line connector */}
            {!isLast && (
              <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-border" />
            )}

            {/* Step card */}
            <div className="flex gap-4">
              {/* Status indicator */}
              <div className="relative flex-shrink-0">
                <StatusIcon status={step.status} />
              </div>

              {/* Step content */}
              <div className="flex-1 pb-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-base">
                      {STEP_LABELS[step.stepName]}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span className="capitalize">{step.status.toLowerCase()}</span>
                      {duration && <span>• {duration}</span>}
                      {step.toolCalls.length > 0 && (
                        <span>• {step.toolCalls.length} tool calls</span>
                      )}
                    </div>
                  </div>

                  {/* Expand button */}
                  {(step.toolCalls.length > 0 || step.errorMessage) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleStep(step.id)}
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>

                {/* Error message */}
                {step.errorMessage && (
                  <div className="mt-3 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                    <p className="font-semibold">Error:</p>
                    <p className="mt-1">{step.errorMessage}</p>
                  </div>
                )}

                {/* Expandable tool calls */}
                {isExpanded && step.toolCalls.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm font-medium">Tool Calls:</p>
                    {step.toolCalls.map((toolCall) => (
                      <div
                        key={toolCall.id}
                        className="border rounded-md p-3 text-sm space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{toolCall.toolName}</span>
                          {toolCall.latencyMs && (
                            <span className="text-muted-foreground">
                              {toolCall.latencyMs}ms
                            </span>
                          )}
                        </div>
                        {toolCall.error && (
                          <p className="text-destructive text-xs">{toolCall.error}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Status indicator icon component
function StatusIcon({ status }: { status: AgentStepStatus }) {
  switch (status) {
    case "PENDING":
      return <Circle className="h-8 w-8 text-muted-foreground" />;
    case "RUNNING":
      return <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />;
    case "COMPLETED":
      return <CheckCircle2 className="h-8 w-8 text-green-500" />;
    case "FAILED":
      return <XCircle className="h-8 w-8 text-destructive" />;
    case "SKIPPED":
      return <Minus className="h-8 w-8 text-muted-foreground" />;
    default:
      return <Circle className="h-8 w-8 text-muted-foreground" />;
  }
}
