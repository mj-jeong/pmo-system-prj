"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useOrganization } from "@/hooks/use-organization";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading: userLoading } = useCurrentUser();
  const { data: org, isLoading: orgLoading } = useOrganization();
  const router = useRouter();

  async function handleLogout() {
    await signOut({ redirect: false });
    router.push("/login");
  }

  if (userLoading || orgLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSkeleton variant="text" count={3} />
      </div>
    );
  }

  return (
    <AppShell
      orgName={org?.name ?? "Organization"}
      userName={user?.name ?? "User"}
      userEmail={user?.email}
      currentRole={user?.role ?? "MEMBER"}
      onLogout={handleLogout}
    >
      {children}
    </AppShell>
  );
}
