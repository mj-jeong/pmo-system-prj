// PMO System - Audit Domain Service
// Records audit log entries for all significant business actions.
// Failures are intentionally swallowed — audit must never block main flows.

import { prisma } from "@/lib/db/prisma";
import type { AuditAction } from "@prisma/client";

interface AuditParams {
  organizationId: string;
  actorId: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  meta?: Record<string, unknown>;
}

export async function recordAudit(params: AuditParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        organizationId: params.organizationId,
        actorId: params.actorId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        // Prisma Json fields accept unknown objects via JSON.parse round-trip casting
        meta: params.meta !== undefined
          ? JSON.parse(JSON.stringify(params.meta))
          : undefined,
      },
    });
  } catch (error) {
    console.error("[audit] Failed to record audit log:", error);
  }
}
