"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Settings, Trash2, Clock } from "lucide-react";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { RoleGuard } from "@/components/auth/role-guard";
import {
  useOrganization,
  useUpdateOrganization,
  useDeleteOrganization,
  useWorkspaceSettings,
  useUpdateWorkspaceSettings,
} from "@/hooks/use-organization";
import type { WeekDay } from "@/lib/services/organization.service";
import { useLanguage } from "@/lib/i18n/language-context";

const WEEK_DAYS: WeekDay[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function SettingsPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { data: org, isLoading } = useOrganization();
  const updateOrg = useUpdateOrganization();
  const deleteOrg = useDeleteOrganization();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { data: wsSettings, isLoading: wsLoading } = useWorkspaceSettings();
  const updateWsSettings = useUpdateWorkspaceSettings();
  const [wsStart, setWsStart] = useState<string>("");
  const [wsEnd, setWsEnd] = useState<string>("");
  const [wsReportDay, setWsReportDay] = useState<string>("");

  const weekDayLabels: Record<WeekDay, string> = {
    MON: t("settings.monday"),
    TUE: t("settings.tuesday"),
    WED: t("settings.wednesday"),
    THU: t("settings.thursday"),
    FRI: t("settings.friday"),
    SAT: t("settings.saturday"),
    SUN: t("settings.sunday"),
  };

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

  async function handleSaveWorkspaceSettings() {
    const payload: {
      workingHoursStart?: number;
      workingHoursEnd?: number;
      weeklyReportDay?: WeekDay;
    } = {};
    if (wsStart !== "") payload.workingHoursStart = Number(wsStart);
    if (wsEnd !== "") payload.workingHoursEnd = Number(wsEnd);
    if (wsReportDay !== "") payload.weeklyReportDay = wsReportDay as WeekDay;
    await updateWsSettings.mutateAsync(payload);
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
        title={t("pages.settings.title")}
        description={t("pages.settings.description")}
      />

      {/* Update Organization */}
      <Card className="mt-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Settings className="h-4 w-4" />
              {t("settings.general")}
            </CardTitle>
            <CardDescription>
              {t("settings.updateOrgDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="org-name">{t("settings.orgName")}</Label>
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
              <Label htmlFor="org-slug">{t("settings.slug")}</Label>
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
                {t("settings.slugHint")}
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              disabled={!isDirty || updateOrg.isPending}
            >
              {updateOrg.isPending ? t("settings.saving") : t("settings.saveChanges")}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Workspace Settings */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4" />
            {t("settings.workspaceSettings")}
          </CardTitle>
          <CardDescription>
            {t("settings.workspaceDesc")}
            {wsSettings?.updatedAt && (
              <span className="ml-2 text-xs text-muted-foreground">
                {t("settings.lastUpdated")} {new Date(wsSettings.updatedAt).toLocaleDateString()}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {wsLoading ? (
            <LoadingSkeleton variant="text" count={3} />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("settings.workStartHour")}</Label>
                  <Select
                    value={wsStart || String(wsSettings?.workingHoursStart ?? "")}
                    onValueChange={setWsStart}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("settings.selectHour")} />
                    </SelectTrigger>
                    <SelectContent>
                      {HOURS.map((h) => (
                        <SelectItem key={h} value={String(h)}>
                          {String(h).padStart(2, "0")}:00
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("settings.workEndHour")}</Label>
                  <Select
                    value={wsEnd || String(wsSettings?.workingHoursEnd ?? "")}
                    onValueChange={setWsEnd}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("settings.selectHour")} />
                    </SelectTrigger>
                    <SelectContent>
                      {HOURS.map((h) => (
                        <SelectItem key={h} value={String(h)}>
                          {String(h).padStart(2, "0")}:00
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("settings.weeklyReportDay")}</Label>
                <Select
                  value={wsReportDay || (wsSettings?.weeklyReportDay ?? "")}
                  onValueChange={setWsReportDay}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder={t("settings.selectDay")} />
                  </SelectTrigger>
                  <SelectContent>
                    {WEEK_DAYS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {weekDayLabels[d]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {t("settings.reportDayHint")}
                </p>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter>
          <RoleGuard
            role="OWNER"
            fallback={
              <p className="text-sm text-muted-foreground">
                {t("settings.ownerOnly")}
              </p>
            }
          >
            <Button
              onClick={handleSaveWorkspaceSettings}
              disabled={updateWsSettings.isPending}
            >
              {updateWsSettings.isPending ? t("settings.saving") : t("settings.saveWorkspaceSettings")}
            </Button>
          </RoleGuard>
        </CardFooter>
      </Card>

      {/* Danger Zone */}
      <Card className="mt-6 border-destructive/50">
        <CardHeader>
          <CardTitle className="text-base text-destructive">
            {t("settings.dangerZone")}
          </CardTitle>
          <CardDescription>
            {t("settings.dangerDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                {t("settings.deleteOrg")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("settings.deleteOrg")}</DialogTitle>
                <DialogDescription>
                  {t("settings.deleteConfirmPre")}{org?.name}{t("settings.deleteConfirmPost")}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteOrg.isPending}
                >
                  {deleteOrg.isPending
                    ? t("settings.deleting")
                    : t("settings.confirmDelete")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
