"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Edit,
  Trash2,
  MessageSquare,
  Calendar,
} from "lucide-react";

import {
  updateProjectSchema,
  createProjectUpdateSchema,
  type UpdateProjectInput,
  type CreateProjectUpdateInput,
} from "@/lib/validators/project";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { RoleGuard } from "@/components/auth/role-guard";
import { useProject, useUpdateProject, useDeleteProject } from "@/hooks/use-projects";
import { useProjectUpdates, useAddProjectUpdate } from "@/hooks/use-project-updates";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: updatesData, isLoading: updatesLoading } = useProjectUpdates(
    projectId,
    { page: 1, limit: 50 }
  );

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  if (projectLoading) {
    return (
      <PageContainer>
        <LoadingSkeleton variant="card" count={2} />
        <div className="mt-6">
          <LoadingSkeleton variant="text" count={5} />
        </div>
      </PageContainer>
    );
  }

  if (!project) {
    return (
      <PageContainer>
        <EmptyState
          title="Project not found"
          description="The project you are looking for does not exist or has been deleted."
          action={
            <Button variant="outline" onClick={() => router.push("/projects")}>
              Back to Projects
            </Button>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex items-center gap-3 mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/projects")}
          aria-label="Back to projects"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader
          title={project.name}
          actions={
            <RoleGuard role="ADMIN">
              <div className="flex gap-2">
                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </DialogTrigger>
                  <EditProjectDialog
                    project={project}
                    onClose={() => setEditDialogOpen(false)}
                  />
                </Dialog>
                <Dialog
                  open={deleteDialogOpen}
                  onOpenChange={setDeleteDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </DialogTrigger>
                  <DeleteProjectDialog
                    projectId={project.id}
                    projectName={project.name}
                    onClose={() => setDeleteDialogOpen(false)}
                  />
                </Dialog>
              </div>
            </RoleGuard>
          }
        />
      </div>

      {/* Project Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <div className="mt-1">
                <StatusBadge status={project.status} />
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Progress</p>
              <div className="mt-1 flex items-center gap-2">
                <div className="flex-1 rounded-full bg-muted h-2">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{
                      width: `${Math.min(project.progress, 100)}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-semibold">
                  {project.progress}%
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Start Date</p>
              <p className="mt-1 text-sm font-medium">
                {project.startDate
                  ? new Date(project.startDate).toLocaleDateString()
                  : "Not set"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">End Date</p>
              <p className="mt-1 text-sm font-medium">
                {project.endDate
                  ? new Date(project.endDate).toLocaleDateString()
                  : "Not set"}
              </p>
            </div>
          </div>
          {project.description && (
            <div className="mt-4 border-t pt-4">
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="mt-1 text-sm">{project.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Updates Timeline */}
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="h-4 w-4" />
            Updates ({project._count?.updates ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Add Update Form */}
          <AddUpdateForm projectId={projectId} />

          {/* Updates List */}
          {updatesLoading ? (
            <LoadingSkeleton variant="text" count={3} className="mt-4" />
          ) : updatesData && updatesData.data.length > 0 ? (
            <div className="mt-4 space-y-4">
              {updatesData.data.map((update) => (
                <div
                  key={update.id}
                  className="border-l-2 border-primary/30 pl-4"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">{update.author.name}</span>
                    <span className="text-muted-foreground">
                      {formatDistanceToNow(new Date(update.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <p className="mt-1 text-sm">{update.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={MessageSquare}
              title="No updates yet"
              description="Add the first update to track progress on this project."
              className="mt-4"
            />
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}

function AddUpdateForm({ projectId }: { projectId: string }) {
  const addUpdate = useAddProjectUpdate(projectId);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createProjectUpdateSchema),
    defaultValues: { content: "" },
  });

  async function onSubmit(data: any) {
    await addUpdate.mutateAsync({ content: data.content } as any);
    reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
      <div className="flex-1">
        <Textarea
          placeholder="Write an update..."
          className="min-h-[80px]"
          {...register("content")}
        />
        {errors.content && (
          <p className="mt-1 text-sm text-destructive">
            {errors.content.message}
          </p>
        )}
      </div>
      <Button
        type="submit"
        size="sm"
        className="self-end"
        disabled={addUpdate.isPending}
      >
        {addUpdate.isPending ? "Posting..." : "Post"}
      </Button>
    </form>
  );
}

function EditProjectDialog({
  project,
  onClose,
}: {
  project: any;
  onClose: () => void;
}) {
  const updateProject = useUpdateProject();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UpdateProjectInput>({
    resolver: zodResolver(updateProjectSchema),
    defaultValues: {
      name: project.name,
      description: project.description ?? "",
      status: project.status,
      progress: project.progress,
      startDate: project.startDate ?? "",
      endDate: project.endDate ?? "",
    },
  });

  async function onSubmit(data: UpdateProjectInput) {
    await updateProject.mutateAsync({ id: project.id, data });
    onClose();
  }

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Edit Project</DialogTitle>
        <DialogDescription>Update the project details.</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="edit-name">Name</Label>
          <Input id="edit-name" {...register("name")} />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-desc">Description</Label>
          <Textarea id="edit-desc" {...register("description")} />
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            defaultValue={project.status}
            onValueChange={(val) => setValue("status", val as any)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="DELAYED">Delayed</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-progress">Progress (0-100)</Label>
          <Input
            id="edit-progress"
            type="number"
            min={0}
            max={100}
            {...register("progress", { valueAsNumber: true })}
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={updateProject.isPending}>
            {updateProject.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function DeleteProjectDialog({
  projectId,
  projectName,
  onClose,
}: {
  projectId: string;
  projectName: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const deleteProject = useDeleteProject();

  async function handleDelete() {
    await deleteProject.mutateAsync(projectId);
    onClose();
    router.push("/projects");
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Delete Project</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete &quot;{projectName}&quot;? This action
          cannot be undone.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={deleteProject.isPending}
        >
          {deleteProject.isPending ? "Deleting..." : "Delete"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
