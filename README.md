# PMO System - Multi-tenant SaaS Platform

A comprehensive Project Management Office (PMO) system designed for external development organizations, featuring strict multi-tenant data isolation, role-based access control, and AI-ready data structures.

[![Next.js](https://img.shields.io/badge/Next.js-15.5.12-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22.0-2D3748)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-green)](./LICENSE)

---

## 🌟 Features

### Core Functionality
- **Multi-tenant Architecture**: Complete data isolation between organizations with 100% security compliance
- **3-Tier RBAC**: OWNER > ADMIN > MEMBER with granular permission control
- **Project Management**: Track projects, updates, progress, and status with real-time dashboards
- **Workforce Management**: Button-based attendance (check-in/check-out) with server-side timestamps
- **Time-off Management**: Request and approval workflow for vacation, sick leave, and personal time
- **Real-time Dashboards**: Organization-scoped metrics, delayed project alerts, and workforce summaries

### Security & Compliance
- **Zero Cross-Organization Access**: All data scoped to `organizationId` with middleware enforcement
- **Security Headers**: Strict-Transport-Security, X-Frame-Options, CSP, and 5 additional headers
- **Rate Limiting**: Protects authentication endpoints (10 req/10s) and API endpoints (100 req/min)
- **Timing-Safe Authentication**: Protection against timing attacks with bcrypt
- **CSRF Protection**: Built-in NextAuth CSRF protection with httpOnly cookies

### Developer Experience
- **Clean Architecture**: Presentation → Application → Infrastructure layer separation
- **Type Safety**: 100% TypeScript with Prisma type generation
- **Zero Script QA**: Testing methodology using structured logging without test scripts
- **API-First Design**: RESTful API at `/api/v1` with consistent response formats
- **Soft-Delete Strategy**: Preserve audit trails for all critical entities

---

## 🏗️ Tech Stack

### Frontend
- **Next.js 15.5.12** - React framework with App Router
- **React 19** - UI library with Server Components
- **TypeScript 5** - Type safety and developer experience
- **TailwindCSS 3.4** - Utility-first CSS framework
- **shadcn/ui** - Accessible component library with Radix UI primitives
- **TanStack Query 5** - Server state management with polling and caching
- **React Hook Form 7** - Type-safe form handling with Zod validation
- **Framer Motion 11** - Animation library for UI transitions

### Backend
- **Next.js API Routes** - Serverless API endpoints at `/api/v1`
- **Prisma ORM 5.22** - Type-safe database client with migrations
- **PostgreSQL** - Relational database with SSL support
- **NextAuth 4** - Authentication with JWT and credentials provider
- **Zod 3** - Runtime validation and type inference
- **bcryptjs** - Secure password hashing

### DevOps
- **Vercel** - Deployment platform with zero-config (recommended)
- **ESLint 9** - Code linting with Next.js config
- **ts-node** - TypeScript execution for scripts and seed

---

## 📋 Prerequisites

- Node.js 18.x or 20.x
- PostgreSQL 14+ (Neon, Supabase, or self-hosted)
- npm or yarn package manager

---

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone <repository-url>
cd pmo-system-prj
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env.local

# Edit .env.local with your values
```

Required variables:
- `DATABASE_URL`: PostgreSQL connection string
- `AUTH_SECRET`: Minimum 32 characters (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL`: Application URL (e.g., `http://localhost:3000`)
- `NEXT_PUBLIC_APP_URL`: Public-facing URL

### 4. Database Setup

```bash
# Run migrations
npm run db:migrate

# Seed development data (optional)
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
pmo-system-prj/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/             # Authentication routes
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/        # Dashboard and main app
│   │   │   ├── page.tsx        # Dashboard home
│   │   │   ├── projects/       # Project management
│   │   │   ├── workforce/      # Attendance and time-off
│   │   │   └── settings/       # Organization settings
│   │   ├── api/                # API routes
│   │   │   ├── health/         # Health check endpoint
│   │   │   └── v1/             # Versioned API endpoints
│   │   ├── layout.tsx          # Root layout
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   └── layout/             # Layout components
│   ├── lib/
│   │   ├── api/                # API client and error handling
│   │   ├── auth/               # NextAuth configuration
│   │   ├── db/                 # Prisma client singleton
│   │   ├── domain/             # Business logic services
│   │   ├── permissions/        # RBAC and org scope middleware
│   │   ├── security/           # Rate limiting and security
│   │   ├── services/           # Frontend API services
│   │   └── validators/         # Zod validation schemas
│   ├── hooks/                  # React Query hooks
│   └── types/                  # TypeScript type definitions
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── migrations/             # Migration history
│   └── seed.ts                 # Seed script
├── docs/
│   ├── 1-plan/                 # Planning documents
│   │   ├── 2_PLAN.md           # 9-phase development plan
│   │   ├── glossary.md         # Domain terminology
│   │   ├── erd.md              # Entity relationship diagram
│   │   └── api-contracts.md    # API specifications
│   ├── 2-design/               # Design documents
│   │   ├── information-architecture.md
│   │   ├── page-flows.md
│   │   ├── role-views.md
│   │   ├── wireframes/
│   │   ├── component-mapping.md
│   │   └── design-tokens.md
│   ├── 3-analysis/             # Analysis and review
│   │   ├── gap-analysis.md
│   │   ├── multi-tenancy-audit.md
│   │   ├── code-quality.md
│   │   └── performance-review.md
│   └── 4-report/               # Deployment reports
│       ├── deployment-guide.md
│       ├── smoke-tests.md
│       └── data-isolation-test.md
├── scripts/
│   └── validate-env.ts         # Environment validation
├── CONVENTIONS.md              # Coding conventions
└── README.md                   # This file
```

---

## 🎯 Development Workflow

### Available Scripts

```bash
# Development
npm run dev                     # Start development server with Turbopack
npm run lint                    # Run ESLint
npm run validate-env            # Validate environment variables

# Database
npm run db:migrate              # Run migrations (development)
npm run db:migrate:prod         # Deploy migrations (production)
npm run db:seed                 # Seed development data
npm run db:reset                # Reset database (WARNING: deletes all data)

# Build and Deploy
npm run build                   # Build for production (includes validation)
npm start                       # Start production server
```

### Database Migrations

```bash
# Create new migration
npx prisma migrate dev --name migration_name

# Apply migrations to production
npm run db:migrate:prod

# View migration status
npx prisma migrate status

# Generate Prisma client after schema changes
npx prisma generate
```

---

## 🔑 Authentication

### User Registration

New users can self-register at `/register`:
1. First user becomes **OWNER** of new organization
2. Organization slug must be unique (used in URLs)
3. Password hashed with bcrypt (10 rounds)

### User Roles

| Role | Permissions | Use Case |
|------|-------------|----------|
| **OWNER** | Full access + org deletion + financial settings | Organization creator, CEO |
| **ADMIN** | Member management, monitoring, approval | Project managers, HR |
| **MEMBER** | Self-service only (own attendance, assigned projects) | Developers, employees |

### Session Management

- JWT strategy with httpOnly cookies
- Session includes: `{ id, email, name, organizationId, role }`
- Session extracted on every API request
- Auto-refresh on activity
- Secure flag in production, SameSite=Lax

---

## 🛡️ Security

### Multi-Tenancy Enforcement

**CRITICAL**: Every database query MUST include `organizationId` filter.

```typescript
// ✅ Correct - Always scoped
const projects = await prisma.project.findMany({
  where: { organizationId: user.organizationId }
});

// ❌ Wrong - Never do this
const projects = await prisma.project.findMany(); // No org filter!
```

All API routes use `withOrgScope()` middleware:
```typescript
export const GET = withOrgScope(async (req, { user }) => {
  // user.organizationId guaranteed from session
  const projects = await getProjects(user.organizationId);
  // ...
});
```

### Security Headers

7 security headers configured in `next.config.ts`:
- Strict-Transport-Security
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- Content-Security-Policy
- X-XSS-Protection
- Permissions-Policy

### Rate Limiting

- Authentication: 10 requests per 10 seconds
- API endpoints: 100 requests per minute
- Sliding window algorithm (Edge Runtime compatible)

---

## 📊 API Documentation

### Base URL

- Development: `http://localhost:3000/api/v1`
- Production: `https://your-domain.com/api/v1`

### Response Format

**Success Response**:
```json
{
  "success": true,
  "data": { /* ... */ },
  "meta": {
    "timestamp": "2026-02-12T12:00:00.000Z"
  }
}
```

**Error Response**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      { "field": "email", "message": "Invalid email format" }
    ]
  }
}
```

**Paginated Response**:
```json
{
  "success": true,
  "data": [ /* ... */ ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

### Health Check

```bash
GET /api/health
```

**Response**:
```json
{
  "status": "healthy",
  "services": {
    "api": "operational",
    "database": "operational"
  },
  "performance": {
    "responseTimeMs": 150
  }
}
```

### Full API Reference

See `docs/1-plan/api-contracts.md` for complete endpoint documentation.

---

## 🧪 Testing

### Zero Script QA Methodology

This project uses **Zero Script QA** - testing through structured logging and manual verification, not automated test scripts.

**Why?**
- Faster development (no test script maintenance)
- Real-world validation with actual database
- Catches integration issues automated tests miss

**How to Test**:
1. Run development server
2. Seed database: `npm run db:seed`
3. Test features manually
4. Verify structured logs in console
5. Check database state with Prisma Studio: `npx prisma studio`

### Smoke Tests

After deployment, run smoke tests from `docs/4-report/smoke-tests.md`:
- Organization registration
- User login
- Project CRUD
- Attendance check-in/check-out
- Time-off approval
- Dashboard rendering
- Role-based access control
- **Multi-tenancy isolation** (CRITICAL)

### Multi-Tenancy Testing

**CRITICAL**: Run `docs/4-report/data-isolation-test.md` before production.

Verifies:
- Zero cross-organization data access
- API returns 403 for unauthorized org access
- Session tampering protection

---

## 🚢 Deployment

### Vercel (Recommended)

1. **Prerequisites**:
   - Vercel account
   - PostgreSQL database (Neon, Supabase, AWS RDS)
   - GitHub repository

2. **Deploy**:
   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Deploy
   vercel
   ```

3. **Environment Variables**:
   Set in Vercel Dashboard → Project Settings → Environment Variables:
   - `DATABASE_URL` (with `?sslmode=require`)
   - `AUTH_SECRET` (64+ characters)
   - `NEXTAUTH_URL` (https://your-domain.com)
   - `NEXT_PUBLIC_APP_URL` (https://your-domain.com)

4. **Database Migration**:
   ```bash
   # Run on production database
   DATABASE_URL="postgresql://..." npm run db:migrate:prod
   ```

5. **Verification**:
   - Health check: `https://your-domain.com/api/health`
   - Run smoke tests
   - Verify multi-tenancy isolation

### Full Deployment Guide

See `docs/4-report/deployment-guide.md` for complete deployment instructions.

---

## 📚 Documentation

### Planning Phase
- [Development Plan](./docs/1-plan/2_PLAN.md) - Complete 9-phase plan
- [Domain Glossary](./docs/1-plan/glossary.md) - Business terminology
- [ERD](./docs/1-plan/erd.md) - Entity relationships
- [API Contracts](./docs/1-plan/api-contracts.md) - API specifications

### Design Phase
- [Information Architecture](./docs/2-design/information-architecture.md)
- [Page Flows](./docs/2-design/page-flows.md)
- [Role-Based Views](./docs/2-design/role-views.md)
- [Wireframes](./docs/2-design/wireframes/)
- [Design Tokens](./docs/2-design/design-tokens.md)

### Analysis Phase
- [Gap Analysis](./docs/3-analysis/gap-analysis.md) - 94% match rate
- [Multi-Tenancy Audit](./docs/3-analysis/multi-tenancy-audit.md) - 100% compliance
- [Code Quality](./docs/3-analysis/code-quality.md) - 0 errors
- [Performance Review](./docs/3-analysis/performance-review.md)

### Deployment Phase
- [Deployment Guide](./docs/4-report/deployment-guide.md)
- [Smoke Tests](./docs/4-report/smoke-tests.md)
- [Data Isolation Test](./docs/4-report/data-isolation-test.md)

---

## 🤝 Contributing

### Code Conventions

See [CONVENTIONS.md](./CONVENTIONS.md) for detailed coding standards:
- Naming conventions (camelCase, PascalCase, kebab-case)
- Folder structure and file organization
- API response format standards
- Clean Architecture layer rules
- Error code registry

### Pull Request Process

1. Create feature branch from `main`
2. Follow conventions in CONVENTIONS.md
3. Ensure all quality gates pass:
   - TypeScript: `npx tsc --noEmit`
   - ESLint: `npm run lint`
   - Build: `npm run build`
4. Test multi-tenancy isolation for data-related changes
5. Update documentation if needed
6. Create PR with clear description

---

## 🐛 Troubleshooting

### Common Issues

**Build fails with environment validation error**:
```bash
# Solution: Validate your .env.local
npm run validate-env
```

**Database connection fails**:
```bash
# Check connection string format
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require

# Test connection
npx prisma db pull
```

**NextAuth callback URL mismatch**:
- Ensure `NEXTAUTH_URL` matches your actual domain
- Clear browser cookies and retry
- Check Vercel environment variables

**Cross-organization data visible**:
- **CRITICAL SECURITY ISSUE** - Stop deployment
- Run `docs/4-report/data-isolation-test.md`
- Check all API routes use `withOrgScope()`
- Verify Prisma queries include `organizationId`

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details

---

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/) and [Prisma](https://www.prisma.io/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Radix UI primitives for accessibility
- Inspired by modern SaaS multi-tenancy patterns

---

## 📞 Support

- **Documentation**: See `docs/` directory
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Email**: your-email@example.com

---

**Built with ❤️ for modern development teams**
