// PMO System - Seed Script
// Creates 2 organizations with users and test data for data isolation testing.
//
// Run: npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
// Or: npx prisma db seed

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing data (order matters for FK constraints)
  // Agent & Report tables (must be deleted before User/Organization)
  await prisma.toolCall.deleteMany();
  await prisma.agentStep.deleteMany();
  await prisma.agentRun.deleteMany();
  await prisma.report.deleteMany();
  // Core domain tables
  await prisma.projectUpdate.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.timeOff.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  await prisma.organization.deleteMany();

  const hashedPassword = await bcrypt.hash("password123", 10);

  // ==========================================================================
  // Organization A - "Acme Corp"
  // ==========================================================================
  const orgA = await prisma.organization.create({
    data: {
      name: "Acme Corp",
      slug: "acme-corp",
    },
  });

  const orgARoles = {
    owner: await prisma.role.create({
      data: { name: "OWNER", organizationId: orgA.id },
    }),
    admin: await prisma.role.create({
      data: { name: "ADMIN", organizationId: orgA.id },
    }),
    member: await prisma.role.create({
      data: { name: "MEMBER", organizationId: orgA.id },
    }),
  };

  const aliceOwner = await prisma.user.create({
    data: {
      email: "alice@acme.com",
      name: "Alice Owner",
      hashedPassword,
      organizationId: orgA.id,
      roleId: orgARoles.owner.id,
    },
  });

  const bobAdmin = await prisma.user.create({
    data: {
      email: "bob@acme.com",
      name: "Bob Admin",
      hashedPassword,
      organizationId: orgA.id,
      roleId: orgARoles.admin.id,
    },
  });

  const charlieMember = await prisma.user.create({
    data: {
      email: "charlie@acme.com",
      name: "Charlie Member",
      hashedPassword,
      organizationId: orgA.id,
      roleId: orgARoles.member.id,
    },
  });

  // Org A - Projects
  const projectA1 = await prisma.project.create({
    data: {
      name: "Website Redesign",
      description: "Complete overhaul of the corporate website",
      status: "IN_PROGRESS",
      progress: 65,
      startDate: new Date("2026-01-15"),
      endDate: new Date("2026-03-30"),
      organizationId: orgA.id,
    },
  });

  const projectA2 = await prisma.project.create({
    data: {
      name: "Mobile App MVP",
      description: "First version of the mobile application",
      status: "BLOCKED",
      progress: 30,
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-02-28"),
      organizationId: orgA.id,
    },
  });

  const projectA3 = await prisma.project.create({
    data: {
      name: "API Documentation",
      description: "Comprehensive API documentation for partners",
      status: "COMPLETED",
      progress: 100,
      startDate: new Date("2025-12-01"),
      endDate: new Date("2026-01-31"),
      organizationId: orgA.id,
    },
  });

  // Org A - Project Updates
  await prisma.projectUpdate.create({
    data: {
      content: "Completed homepage wireframes and started development. Frontend team is on track.",
      projectId: projectA1.id,
      authorId: aliceOwner.id,
      organizationId: orgA.id,
    },
  });

  await prisma.projectUpdate.create({
    data: {
      content: "Design review delayed by 1 week due to client feedback. Adjusted timeline accordingly.",
      projectId: projectA2.id,
      authorId: bobAdmin.id,
      organizationId: orgA.id,
    },
  });

  // Org A - Attendance (today)
  const today = new Date();
  const todayDate = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));

  await prisma.attendance.create({
    data: {
      userId: aliceOwner.id,
      date: todayDate,
      checkIn: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0),
      status: "CHECKED_IN",
      organizationId: orgA.id,
    },
  });

  await prisma.attendance.create({
    data: {
      userId: bobAdmin.id,
      date: todayDate,
      checkIn: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 30),
      checkOut: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 17, 0),
      status: "CHECKED_OUT",
      organizationId: orgA.id,
    },
  });

  // Org A - Time-off
  await prisma.timeOff.create({
    data: {
      userId: charlieMember.id,
      startDate: new Date("2026-02-20"),
      endDate: new Date("2026-02-22"),
      type: "VACATION",
      status: "PENDING",
      reason: "Family vacation",
      organizationId: orgA.id,
    },
  });

  await prisma.timeOff.create({
    data: {
      userId: bobAdmin.id,
      startDate: new Date("2026-03-01"),
      endDate: new Date("2026-03-03"),
      type: "SICK",
      status: "APPROVED",
      reason: "Medical appointment",
      organizationId: orgA.id,
    },
  });

  // ==========================================================================
  // Organization B - "Beta Labs"
  // ==========================================================================
  const orgB = await prisma.organization.create({
    data: {
      name: "Beta Labs",
      slug: "beta-labs",
    },
  });

  const orgBRoles = {
    owner: await prisma.role.create({
      data: { name: "OWNER", organizationId: orgB.id },
    }),
    admin: await prisma.role.create({
      data: { name: "ADMIN", organizationId: orgB.id },
    }),
    member: await prisma.role.create({
      data: { name: "MEMBER", organizationId: orgB.id },
    }),
  };

  const daveOwner = await prisma.user.create({
    data: {
      email: "dave@betalabs.com",
      name: "Dave Owner",
      hashedPassword,
      organizationId: orgB.id,
      roleId: orgBRoles.owner.id,
    },
  });

  const eveMember = await prisma.user.create({
    data: {
      email: "eve@betalabs.com",
      name: "Eve Member",
      hashedPassword,
      organizationId: orgB.id,
      roleId: orgBRoles.member.id,
    },
  });

  // Org B - Projects
  await prisma.project.create({
    data: {
      name: "Data Pipeline v2",
      description: "Upgrade data processing pipeline to handle 10x throughput",
      status: "IN_PROGRESS",
      progress: 45,
      startDate: new Date("2026-02-01"),
      endDate: new Date("2026-04-15"),
      organizationId: orgB.id,
    },
  });

  await prisma.project.create({
    data: {
      name: "Internal Dashboard",
      description: "Team performance tracking dashboard",
      status: "IN_PROGRESS",
      progress: 20,
      startDate: new Date("2026-02-10"),
      endDate: new Date("2026-03-20"),
      organizationId: orgB.id,
    },
  });

  // Org B - Attendance
  await prisma.attendance.create({
    data: {
      userId: daveOwner.id,
      date: todayDate,
      checkIn: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 0),
      checkOut: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16, 30),
      status: "CHECKED_OUT",
      organizationId: orgB.id,
    },
  });

  // Org B - Time-off
  await prisma.timeOff.create({
    data: {
      userId: eveMember.id,
      startDate: new Date("2026-02-15"),
      endDate: new Date("2026-02-17"),
      type: "SPECIAL",
      status: "PENDING",
      reason: "Personal matter",
      organizationId: orgB.id,
    },
  });

  console.log("Seed completed successfully!");
  console.log("");
  console.log("=== Test Credentials ===");
  console.log("Organization A (Acme Corp):");
  console.log("  OWNER: alice@acme.com / password123");
  console.log("  ADMIN: bob@acme.com / password123");
  console.log("  MEMBER: charlie@acme.com / password123");
  console.log("");
  console.log("Organization B (Beta Labs):");
  console.log("  OWNER: dave@betalabs.com / password123");
  console.log("  MEMBER: eve@betalabs.com / password123");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
