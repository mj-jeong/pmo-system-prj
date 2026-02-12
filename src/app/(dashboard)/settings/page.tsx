"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Settings, Trash2 } from "lucide-react";

import {
  updateOrganizationSchema,
  type UpdateOrganizationInput,
} from "@/lib/validators/organization";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import {
  useOrganization,
  useUpdateOrganization,
  useDeleteOrganization,
} from "@/hooks/use-organization";

export default function SettingsPage() {
  const router = useRouter();
  const { data: org, isLoading } = useOrganization();
  const updateOrg = useUpdateOrganization();
  const deleteOrg = useDeleteOrganization();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<UpdateOrganizationInput>({
    resolver: zodResolver(updateOrganizationSchema),
    values: {
      name: org?.name ?? "",
      slug: org?.slug ?? "",
    },
  });

  async function onSubmit(data: UpdateOrganizationInput) {
    await updateOrg.mutateAsync(data);
  }

  async function handleDelete() {
    await deleteOrg.mutateAsync();
    await signOut({ redirect: false });
    router.push("/login");
  }

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingSkeleton variant="card" count={2} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Organization Settings"
        description="Manage your organization details"
      />

      {/* Update Organization */}
      <Card className="mt-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Settings className="h-4 w-4" />
              General
            </CardTitle>
            <CardDescription>
              Update your organization name and slug.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="org-name">Organization Name</Label>
              <Input
                id="org-name"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-slug">Slug</Label>
              <Input
                id="org-slug"
                {...register("slug")}
              />
              {errors.slug && (
                <p className="text-sm text-destructive">
                  {errors.slug.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Lowercase letters, numbers, and hyphens only.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              disabled={!isDirty || updateOrg.isPending}
            >
              {updateOrg.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Danger Zone */}
      <Card className="mt-6 border-destructive/50">
        <CardHeader>
          <CardTitle className="text-base text-destructive">
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions that affect your entire organization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Organization
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Organization</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete &quot;{org?.name}&quot;? This
                  will permanently remove all projects, members, and data. This
                  action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteOrg.isPending}
                >
                  {deleteOrg.isPending
                    ? "Deleting..."
                    : "Yes, Delete Organization"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
