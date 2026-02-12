# PMO System - Coding Conventions

> **Version**: 1.0.0
> **Last Updated**: 2026-02-12
> **Authority**: cto-lead
> **Applies To**: All agents and human developers working on this project

This document defines the authoritative coding standards, naming conventions, API contracts, folder structure, clean architecture rules, and error handling patterns for the multi-tenant PMO system. All code contributions MUST comply with these conventions.

---

## Table of Contents

1. [Folder Structure](#1-folder-structure)
2. [Naming Conventions](#2-naming-conventions)
3. [API Conventions](#3-api-conventions)
4. [Environment Variables](#4-environment-variables)
5. [Error Code Registry](#5-error-code-registry)
6. [Clean Architecture Rules](#6-clean-architecture-rules)
7. [Multi-Tenancy Rules](#7-multi-tenancy-rules)
8. [TypeScript Guidelines](#8-typescript-guidelines)
9. [Import Order](#9-import-order)

---

## 1. Folder Structure

All paths are relative to the project root. The `src/` prefix maps to the `@/` alias in TypeScript imports.

```
pmo-system-prj/
|
|-- prisma/
|   |-- schema.prisma              # Single source of truth for data model
|   |-- seed.ts                    # Development seed data (Phase 4)
|
|-- src/
|   |-- app/                       # Next.js App Router (Presentation Layer)
|   |   |-- layout.tsx             # Root layout
|   |   |-- page.tsx               # Landing page
|   |   |-- providers.tsx          # Client-side providers (QueryClient, Theme)
|   |   |
|   |   |-- (auth)/                # Auth route group (no layout nesting)
|   |   |   |-- login/
|   |   |   |   |-- page.tsx
|   |   |   |-- register/
|   |   |       |-- page.tsx
|   |   |
|   |   |-- (dashboard)/           # Dashboard route group
|   |   |   |-- page.tsx
|   |   |
|   |   |-- (projects)/            # Projects route group
|   |   |   |-- page.tsx           # Project list
|   |   |   |-- [id]/
|   |   |       |-- page.tsx       # Project detail
|   |   |
|   |   |-- (workforce)/           # Workforce route group
|   |   |   |-- attendance/
|   |   |   |   |-- page.tsx       # Member attendance (check-in/out)
|   |   |   |-- time-off/
|   |   |       |-- page.tsx       # Time-off requests
|   |   |
|   |   |-- api/                   # API Route Handlers
|   |       |-- v1/
|   |           |-- auth/
|   |           |   |-- [...nextauth]/
|   |           |       |-- route.ts
|   |           |-- organizations/
|   |           |   |-- route.ts
|   |           |-- projects/
|   |           |   |-- route.ts
|   |           |   |-- [id]/
|   |           |       |-- route.ts
|   |           |       |-- updates/
|   |           |           |-- route.ts
|   |           |-- attendance/
|   |           |   |-- route.ts
|   |           |-- time-off/
|   |           |   |-- route.ts
|   |           |-- users/
|   |               |-- route.ts
|   |
|   |-- lib/                       # Shared logic (Application + Infrastructure)
|   |   |-- auth/
|   |   |   |-- auth-options.ts    # NextAuth configuration
|   |   |   |-- session.ts         # Session helpers (getCurrentUser)
|   |   |
|   |   |-- db/
|   |   |   |-- prisma.ts          # Prisma client singleton
|   |   |
|   |   |-- domain/                # Domain services (Application Layer)
|   |   |   |-- organization.ts    # Organization business logic
|   |   |   |-- project.ts         # Project business logic
|   |   |   |-- attendance.ts      # Attendance business logic
|   |   |   |-- time-off.ts        # Time-off business logic
|   |   |
|   |   |-- env.ts                 # Environment variable validation (Zod)
|   |   |-- errors.ts              # Error code registry + helpers
|   |   |
|   |   |-- permissions/           # Authorization (Application Layer)
|   |   |   |-- rbac.ts            # Role-based access control
|   |   |   |-- organization-scope.ts # Multi-tenancy middleware
|   |   |
|   |   |-- validators/            # Input validation (Zod schemas)
|   |       |-- organization.ts
|   |       |-- project.ts
|   |       |-- attendance.ts
|   |       |-- time-off.ts
|   |
|   |-- components/                # React components (Presentation Layer)
|   |   |-- ui/                    # shadcn/ui base components
|   |   |-- layout/                # App shell: Header, Sidebar, Footer
|   |   |-- dashboard/             # Dashboard-specific composites
|   |
|   |-- hooks/                     # React hooks (client-side)
|   |   |-- use-toast.ts           # Toast notification hook (existing)
|   |
|   |-- types/                     # TypeScript type definitions
|       |-- index.ts               # Domain types + re-exports
|       |-- api.ts                 # API response/request types
|       |-- organization.ts        # Organization-specific types
|       |-- project.ts             # Project-specific types
|       |-- attendance.ts          # Attendance-specific types
|       |-- time-off.ts            # Time-off-specific types
|
|-- docs/                          # Project documentation
|   |-- 01-schema/                 # Phase 1 deliverables
|   |   |-- glossary.md
|   |   |-- erd.md
|   |   |-- api-contracts.md
|   |-- 1-plan/                    # Planning documents
|       |-- 2_PLAN.md              # Master development plan
|
|-- .env.example                   # Environment variable template
|-- .gitignore
|-- CONVENTIONS.md                 # This file
|-- package.json
|-- tsconfig.json
|-- next.config.ts
|-- tailwind.config.ts
|-- postcss.config.mjs
|-- eslint.config.mjs
|-- components.json                # shadcn/ui configuration
```

### Directory Creation Rules

- Route groups use parentheses: `(auth)`, `(dashboard)`, `(projects)`, `(workforce)`
- Dynamic segments use brackets: `[id]`, `[...nextauth]`
- API routes live under `app/api/v1/` with REST resource naming
- Every new domain entity gets: a type file, a validator file, and a domain service file

---

## 2. Naming Conventions

### File Naming

| Category | Convention | Example |
|----------|-----------|---------|
| React components | PascalCase | `ProjectCard.tsx`, `DashboardSummary.tsx` |
| React hooks | camelCase with `use` prefix | `useProjects.ts`, `useAttendance.ts` |
| API route handlers | `route.ts` (Next.js convention) | `app/api/v1/projects/route.ts` |
| Page components | `page.tsx` (Next.js convention) | `app/(dashboard)/page.tsx` |
| Layout components | `layout.tsx` (Next.js convention) | `app/(dashboard)/layout.tsx` |
| Validators | camelCase | `organization.ts` (exports `createOrganizationSchema`) |
| Domain services | camelCase | `project.ts` (exports `projectService`) |
| Type files | camelCase | `organization.ts`, `api.ts` |
| Utility files | camelCase | `prisma.ts`, `errors.ts`, `env.ts` |
| Config files | camelCase or kebab-case | `next.config.ts`, `tailwind.config.ts` |

### Code Naming

| Category | Convention | Example |
|----------|-----------|---------|
| Types/Interfaces | PascalCase | `ProjectStatus`, `SessionUser`, `ApiResponse<T>` |
| Enums | PascalCase (type), UPPER_SNAKE_CASE (values) | `type RoleName = "OWNER" \| "ADMIN" \| "MEMBER"` |
| Functions | camelCase | `createProject()`, `getAttendance()` |
| Variables | camelCase | `organizationId`, `currentUser` |
| Constants | UPPER_SNAKE_CASE | `MAX_PROJECT_MEMBERS`, `ERROR_CODES` |
| Zod schemas | camelCase with descriptive suffix | `createProjectSchema`, `attendanceQuerySchema` |
| Domain service objects | camelCase with `Service` suffix | `projectService`, `attendanceService` |
| React components | PascalCase | `ProjectCard`, `AttendanceButton` |
| React hooks | camelCase with `use` prefix | `useProjects()`, `useCheckIn()` |
| CSS classes | Tailwind utility classes | `className="flex items-center gap-2"` |

### API Route Naming

| Rule | Example |
|------|---------|
| All routes prefixed with `/api/v1` | `/api/v1/projects` |
| Resource names are plural nouns | `/api/v1/projects`, `/api/v1/users` |
| Kebab-case for multi-word resources | `/api/v1/time-off` |
| Nested resources use parent path | `/api/v1/projects/[id]/updates` |
| Actions use descriptive sub-paths | `/api/v1/attendance/check-in` |

### Database Column Naming

| Rule | Example |
|------|---------|
| camelCase (Prisma convention) | `organizationId`, `createdAt`, `hashedPassword` |
| Table names: snake_case plural (@@map) | `@@map("project_updates")` |
| Foreign keys: referenced entity + `Id` | `organizationId`, `projectId`, `authorId` |
| Timestamps: `createdAt`, `updatedAt`, `deletedAt` | Standard across all models |

---

## 3. API Conventions

### Endpoint Design

- **Versioning**: All endpoints use `/api/v1` prefix
- **Resources**: Plural nouns (`/projects`, `/users`, `/attendance`)
- **HTTP Methods**: Follow REST semantics

| Method | Purpose | Example |
|--------|---------|---------|
| GET | Read resource(s) | `GET /api/v1/projects` |
| POST | Create resource | `POST /api/v1/projects` |
| PATCH | Partial update | `PATCH /api/v1/projects/[id]` |
| DELETE | Remove resource (soft-delete) | `DELETE /api/v1/projects/[id]` |

### Response Formats

**Success Response** (single resource):

```typescript
{
  success: true,
  data: T,
  meta?: {
    timestamp: string   // ISO 8601
  }
}
```

**Success Response** (paginated list):

```typescript
{
  success: true,
  data: T[],
  pagination: {
    page: number,       // Current page (1-indexed)
    limit: number,      // Items per page
    total: number,      // Total items count
    totalPages: number  // Calculated total pages
  }
}
```

**Error Response**:

```typescript
{
  success: false,
  error: {
    code: string,       // From ERROR_CODES registry
    message: string,    // Human-readable description
    details?: Array<{   // Field-level validation errors
      field: string,
      message: string
    }>
  }
}
```

**No Content Response** (204):

No response body. Used for successful DELETE operations.

### HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | Successful GET or PATCH |
| 201 | Successful POST (resource created) |
| 204 | Successful DELETE (no content) |
| 400 | Validation error (malformed input) |
| 401 | Unauthorized (no valid session) |
| 403 | Forbidden (insufficient role or cross-org access) |
| 404 | Resource not found |
| 409 | Conflict (duplicate resource) |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

### Pagination Defaults

| Parameter | Default | Range |
|-----------|---------|-------|
| `page` | 1 | >= 1 |
| `limit` | 20 | 1-100 |
| `sortBy` | `createdAt` | Valid column name |
| `sortOrder` | `desc` | `asc` or `desc` |

---

## 4. Environment Variables

### Configuration File

All environment variables are defined in `.env.example` and validated at startup by `src/lib/env.ts` using Zod.

### Prefix Rules

| Prefix | Visibility | Usage |
|--------|-----------|-------|
| `DATABASE_` | Server-only | Database connection strings |
| `AUTH_` | Server-only | Authentication secrets |
| `NEXTAUTH_` | Server-only | NextAuth.js configuration |
| `NEXT_PUBLIC_` | Client + Server | Public-facing URLs only |
| (no prefix) | Server-only | General server configuration |

**SECURITY RULE**: Never store secrets (API keys, passwords, tokens) in `NEXT_PUBLIC_` prefixed variables. These are exposed to the browser.

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `AUTH_SECRET` | NextAuth session signing secret (min 32 chars) | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Canonical application URL | `http://localhost:3000` |
| `NEXT_PUBLIC_APP_URL` | Public-facing application URL | `http://localhost:3000` |

### Validation

Environment variables are validated at application startup using `src/lib/env.ts`. If any required variable is missing or invalid, the application will fail to start with a descriptive error message.

```typescript
import { env } from "@/lib/env";

// Type-safe access to environment variables
const dbUrl = env.DATABASE_URL;
```

---

## 5. Error Code Registry

All error codes are defined in `src/lib/errors.ts`. Use the `ERROR_CODES` constant for type-safe error references.

### Error Categories

**Validation Errors (400)**:

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Generic input validation failure |

**Authentication Errors (401)**:

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | No valid session / not authenticated |
| `INVALID_CREDENTIALS` | Wrong email or password |
| `SESSION_EXPIRED` | Session token has expired |

**Authorization Errors (403)**:

| Code | Description |
|------|-------------|
| `FORBIDDEN` | Generic forbidden action |
| `INSUFFICIENT_ROLE` | User's role is below required level |
| `CROSS_ORG_ACCESS_DENIED` | **CRITICAL** - Attempt to access another organization's data |

**Not Found Errors (404)**:

| Code | Description |
|------|-------------|
| `NOT_FOUND` | Generic resource not found |
| `ORG_NOT_FOUND` | Organization does not exist |
| `PROJECT_NOT_FOUND` | Project does not exist (in user's org) |
| `USER_NOT_FOUND` | User does not exist (in user's org) |
| `ATTENDANCE_NOT_FOUND` | Attendance record does not exist |
| `TIME_OFF_NOT_FOUND` | Time-off request does not exist |

**Conflict Errors (409)**:

| Code | Description |
|------|-------------|
| `CONFLICT` | Generic conflict |
| `EMAIL_ALREADY_EXISTS` | Email already registered in organization |
| `ORG_SLUG_TAKEN` | Organization slug is already in use |
| `ATTENDANCE_ALREADY_LOGGED` | Attendance already recorded for this date |

**Rate Limiting (429)**:

| Code | Description |
|------|-------------|
| `RATE_LIMIT_EXCEEDED` | Too many requests |

**Server Errors (5xx)**:

| Code | Description |
|------|-------------|
| `INTERNAL_ERROR` | Unhandled server error |
| `SERVICE_UNAVAILABLE` | Service temporarily unavailable |

### Usage

```typescript
import { ERROR_CODES, createErrorResponse } from "@/lib/errors";

// In a route handler:
return createErrorResponse(
  ERROR_CODES.CROSS_ORG_ACCESS_DENIED,
  "You do not have access to this resource.",
  403
);
```

---

## 6. Clean Architecture Rules

### Layer Diagram

```
+------------------------------------------------------+
|          Presentation Layer                           |
|  app/ (routes, pages)    components/ (React UI)      |
|  - Route handlers call domain services               |
|  - Components consume hooks, never call DB directly  |
+------------------------------------------------------+
                        |
                        | imports (downward only)
                        v
+------------------------------------------------------+
|          Application Layer                            |
|  lib/domain/      lib/permissions/    lib/validators/ |
|  - Business logic  - RBAC checks      - Input schemas|
|  - Orchestrates DB queries via Prisma                 |
|  - Enforces business rules                           |
+------------------------------------------------------+
                        |
                        | imports (downward only)
                        v
+------------------------------------------------------+
|          Infrastructure Layer                         |
|  lib/db/prisma.ts     lib/auth/        lib/env.ts    |
|  - Database client     - Session mgmt   - Config     |
|  - External services   - Auth provider               |
+------------------------------------------------------+
```

### Dependency Direction Rules

1. **Presentation -> Application -> Infrastructure** (never reverse)
2. Route handlers in `app/api/` MUST call domain services in `lib/domain/`
3. Route handlers MUST NOT import `prisma` directly
4. React components MUST NOT contain business logic
5. React components MUST NOT call domain services directly (use hooks)
6. Domain services MAY import from `lib/db/prisma.ts` (infrastructure)
7. Validators are pure schemas with no side effects

### What Goes Where

| Layer | Contains | Does NOT Contain |
|-------|----------|------------------|
| `app/api/` | HTTP parsing, response formatting, middleware orchestration | Business rules, direct DB queries |
| `lib/domain/` | Business logic, data transformation, validation orchestration | HTTP concerns, UI rendering |
| `lib/db/` | Database client, connection config | Business rules, HTTP concerns |
| `lib/validators/` | Zod schemas for input validation | Side effects, DB calls |
| `lib/permissions/` | Role checks, org scope enforcement | Business logic beyond access control |
| `components/` | UI rendering, event handling, presentation logic | API calls, business logic |
| `hooks/` | Data fetching (React Query), state management | Business rules |

### Example: Correct Request Flow

```
1. Client sends POST /api/v1/projects
2. Route handler (app/api/v1/projects/route.ts):
   a. withOrgScope() extracts session + organizationId
   b. Validates input with createProjectSchema (lib/validators/project.ts)
   c. Calls projectService.createProject(data, orgId) (lib/domain/project.ts)
   d. Returns formatted ApiResponse
3. Domain service (lib/domain/project.ts):
   a. Applies business rules
   b. Calls prisma.project.create({ data: { ...input, organizationId } })
   c. Returns created project
```

---

## 7. Multi-Tenancy Rules

These rules are NON-NEGOTIABLE. Every code change MUST comply.

### Core Principle

**organizationId is ALWAYS derived from the authenticated session, NEVER from request body, URL parameters, or client-provided data.**

### Enforcement Layers

1. **Middleware**: `withOrgScope()` wraps every protected route handler
2. **Domain Services**: Every query includes `organizationId` in WHERE clause
3. **Prisma Queries**: All CRUD operations scoped to organization

### Query Rules

```typescript
// CORRECT: Organization scoped
prisma.project.findMany({
  where: { organizationId: ctx.organizationId }
});

// WRONG: No organization scope
prisma.project.findMany();

// CORRECT: Organization scoped find
prisma.project.findUnique({
  where: { id: projectId, organizationId: ctx.organizationId }
});

// WRONG: Find by ID only (allows cross-org access)
prisma.project.findUnique({
  where: { id: projectId }
});

// CORRECT: Organization scoped create
prisma.project.create({
  data: { ...input, organizationId: ctx.organizationId }
});

// WRONG: Organization ID from request body
prisma.project.create({
  data: { ...input, organizationId: req.body.organizationId }
});
```

### Error Handling

Cross-organization access attempts MUST return:
- HTTP Status: `403`
- Error Code: `CROSS_ORG_ACCESS_DENIED`
- No organization-specific details in error message

---

## 8. TypeScript Guidelines

### Strict Typing

- Prefer `interface` for object shapes, `type` for unions and computed types
- Use the domain types from `@/types` for all API boundaries
- Avoid `any` - use `unknown` with type guards when needed
- All function parameters and return types should be explicitly typed

### Prisma Types

- Use Prisma-generated types for internal DB operations
- Map to domain types at the service boundary (domain layer output)

### Zod Integration

- All API input validated through Zod schemas in `lib/validators/`
- Infer TypeScript types from Zod schemas: `z.infer<typeof schema>`
- Schemas are the single source of truth for input shapes

---

## 9. Import Order

Use the following order for imports, separated by blank lines:

```typescript
// 1. Node.js built-ins
import { type } from "node:crypto";

// 2. External packages
import { NextRequest } from "next/server";
import { z } from "zod";

// 3. Internal aliases (@/)
import { prisma } from "@/lib/db/prisma";
import { ERROR_CODES, createErrorResponse } from "@/lib/errors";
import type { SessionUser } from "@/types";

// 4. Relative imports (same module)
import { validateInput } from "./helpers";
```

---

## Appendix: Quick Reference

### File Creation Checklist

When adding a new domain entity:

1. Add Prisma model to `prisma/schema.prisma` (with `organizationId`)
2. Create type file: `src/types/{entity}.ts`
3. Create validator file: `src/lib/validators/{entity}.ts`
4. Create domain service: `src/lib/domain/{entity}.ts`
5. Create API routes: `src/app/api/v1/{entity}/route.ts`
6. Add error codes to `src/lib/errors.ts` if needed
7. Update this CONVENTIONS.md if new patterns are introduced

### Common Patterns

**Route Handler Pattern**:
```typescript
import { withOrgScope } from "@/lib/permissions/organization-scope";
import { createSuccessResponse } from "@/types/api";

export const GET = withOrgScope(async (req, { organizationId }) => {
  const data = await someService.getAll(organizationId);
  return Response.json(createSuccessResponse(data));
});
```

**Validator Pattern**:
```typescript
import { z } from "zod";

export const createEntitySchema = z.object({
  name: z.string().min(1).max(200),
});

export type CreateEntityInput = z.infer<typeof createEntitySchema>;
```

**Domain Service Pattern**:
```typescript
import { prisma } from "@/lib/db/prisma";

export const entityService = {
  async getAll(organizationId: string) {
    return prisma.entity.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });
  },
};
```
