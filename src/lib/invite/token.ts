// PMO System - Invitation Token Utilities
// Shared logic for creating, verifying, and consuming invitation tokens.

import crypto from "crypto";
import { prisma } from "@/lib/db/prisma";
import type { InviteDelivery } from "@prisma/client";
import { env } from "@/lib/env";

/** Generate a cryptographically secure random token (64 hex chars). */
export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

interface CreateTokenOptions {
  email?: string;
  organizationId: string;
  roleId: string;
  deliveryMethod: InviteDelivery;
  invitedBy: string;
}

/** Create and persist a new InvitationToken record. */
export async function createInvitationToken(options: CreateTokenOptions) {
  const token = generateToken();
  const expireHours = env.INVITATION_EXPIRE_HOURS;
  const expiresAt = new Date(Date.now() + expireHours * 60 * 60 * 1000);

  return prisma.invitationToken.create({
    data: {
      token,
      email: options.email,
      organizationId: options.organizationId,
      roleId: options.roleId,
      deliveryMethod: options.deliveryMethod,
      invitedBy: options.invitedBy,
      expiresAt,
    },
    include: {
      organization: { select: { name: true, slug: true } },
      role: { select: { name: true } },
    },
  });
}

export type TokenVerifyError =
  | "TOKEN_NOT_FOUND"
  | "TOKEN_EXPIRED"
  | "TOKEN_ALREADY_USED";

export type VerifyTokenResult =
  | {
      valid: true;
      record: {
        id: string;
        token: string;
        email: string | null;
        organizationId: string;
        roleId: string;
        expiresAt: Date;
        organization: { name: string; slug: string };
        role: { name: string };
      };
    }
  | { valid: false; error: TokenVerifyError };

/** Verify a token: returns the record if valid, or an error reason. */
export async function verifyToken(token: string): Promise<VerifyTokenResult> {
  const record = await prisma.invitationToken.findUnique({
    where: { token },
    include: {
      organization: { select: { name: true, slug: true } },
      role: { select: { name: true } },
    },
  });

  if (!record) return { valid: false, error: "TOKEN_NOT_FOUND" };
  if (record.usedAt) return { valid: false, error: "TOKEN_ALREADY_USED" };
  if (record.expiresAt < new Date()) return { valid: false, error: "TOKEN_EXPIRED" };

  return { valid: true, record };
}

/** Mark a token as used (idempotent within a transaction). */
export async function markTokenUsed(token: string, email: string) {
  return prisma.invitationToken.update({
    where: { token },
    data: { usedAt: new Date(), usedByEmail: email },
  });
}

/** Build the full invitation URL. */
export function buildInviteUrl(token: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base}/invite/${token}`;
}
