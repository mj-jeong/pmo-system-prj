"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Users, Trash2 } from "lucide-react";

import { inviteUserSchema, type InviteUserInput } from "@/lib/validators/user";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { RoleGuard } from "@/components/auth/role-guard";
import {
  useUsers,
  useInviteUser,
  useChangeRole,
  useRemoveUser,
} from "@/hooks/use-users";
import { useCurrentUser } from "@/hooks/use-current-user";
import type { UserResponse } from "@/lib/services/user.service";

export default function MembersPage() {
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data, isLoading } = useUsers({ page, limit: 20 });
  const { user: currentUser } = useCurrentUser();
  const changeRole = useChangeRole();
  const removeUser = useRemoveUser();

  const columns: DataTableColumn<UserResponse>[] = [
    {
      key: "name",
      header: "Name",
      cell: (row) => (
        <div>
          <p className="font-medium">{row.name}</p>
          <p className="text-xs text-muted-foreground">{row.email}</p>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      cell: (row) => (
        <Badge variant={row.role === "OWNER" ? "default" : "secondary"}>
          {row.role}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Joined",
      cell: (row) =>
        new Date(row.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
    },
    {
      header: "Actions",
      cell: (row) => {
        // Cannot modify yourself or OWNER
        if (row.id === currentUser?.id) return null;
        if (row.role === "OWNER") return null;

        return (
          <div className="flex gap-1">
            <RoleGuard role="OWNER">
              <Select
                defaultValue={row.role}
                onValueChange={(val) =>
                  changeRole.mutate({
                    userId: row.id,
                    data: { role: val as any },
                  })
                }
              >
                <SelectTrigger className="h-8 w-[110px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                  <SelectItem value="MEMBER">MEMBER</SelectItem>
                </SelectContent>
              </Select>
            </RoleGuard>
            <RoleGuard role="ADMIN">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={() => {
                  if (
                    window.confirm(
                      `Remove ${row.name} from the organization?`
                    )
                  ) {
                    removeUser.mutate(row.id);
                  }
                }}
                aria-label="Remove member"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </RoleGuard>
          </div>
        );
      },
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Members"
        description="Manage your organization's team members"
        actions={
          <RoleGuard role="ADMIN">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Invite Member
                </Button>
              </DialogTrigger>
              <InviteMemberDialog onClose={() => setDialogOpen(false)} />
            </Dialog>
          </RoleGuard>
        }
      />

      <div className="mt-4">
        {isLoading ? (
          <LoadingSkeleton variant="table" count={5} />
        ) : data && data.data.length > 0 ? (
          <DataTable
            columns={columns}
            data={data.data}
            pagination={data.pagination}
            onPageChange={setPage}
            getRowKey={(row) => row.id}
          />
        ) : (
          <EmptyState
            icon={Users}
            title="No members found"
            description="Invite team members to get started."
          />
        )}
      </div>
    </PageContainer>
  );
}

function InviteMemberDialog({ onClose }: { onClose: () => void }) {
  const inviteUser = useInviteUser();
  const { user: currentUser } = useCurrentUser();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      email: "",
      name: "",
      password: "",
      role: "MEMBER" as const,
    },
  });

  async function onSubmit(data: any) {
    await inviteUser.mutateAsync({
      email: data.email,
      name: data.name,
      password: data.password,
      role: data.role,
    });
    reset();
    onClose();
  }

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Invite Member</DialogTitle>
        <DialogDescription>
          Add a new member to your organization.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="inv-name">Name</Label>
          <Input
            id="inv-name"
            placeholder="John Doe"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="inv-email">Email</Label>
          <Input
            id="inv-email"
            type="email"
            placeholder="john@example.com"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="inv-password">Temporary Password</Label>
          <Input
            id="inv-password"
            type="password"
            placeholder="Min. 8 characters"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Role</Label>
          <Select
            defaultValue="MEMBER"
            onValueChange={(val) => setValue("role", val as any)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currentUser?.role === "OWNER" && (
                <SelectItem value="ADMIN">Admin</SelectItem>
              )}
              <SelectItem value="MEMBER">Member</SelectItem>
            </SelectContent>
          </Select>
          {errors.role && (
            <p className="text-sm text-destructive">{errors.role.message}</p>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={inviteUser.isPending}>
            {inviteUser.isPending ? "Inviting..." : "Invite"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
