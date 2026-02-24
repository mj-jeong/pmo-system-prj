"use client";

import { useState } from "react";
import { Plus, Users, Trash2, Copy, Check, Download, QrCode, Mail, Link } from "lucide-react";

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
  useChangeRole,
  useRemoveUser,
} from "@/hooks/use-users";
import { useCurrentUser } from "@/hooks/use-current-user";
import type { UserResponse } from "@/lib/services/user.service";
import { useMembershipRequests } from "@/hooks/use-membership-requests";
import { useLanguage } from "@/lib/i18n/language-context";

// ─── Invite Member Dialog (3-tab) ──────────────────────────────────────────
type InviteTab = "email" | "qrcode" | "link";

interface QRResult {
  token: string;
  inviteUrl: string;
  expiresAt: string;
  qrSvg: string;
}

interface LinkResult {
  token: string;
  inviteUrl: string;
  expiresAt: string;
}

function InviteMemberDialog({ onClose }: { onClose: () => void }) {
  const { user: currentUser } = useCurrentUser();
  const [activeTab, setActiveTab] = useState<InviteTab>("email");
  const [role, setRole] = useState<"ADMIN" | "MEMBER">("MEMBER");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Email state
  const [emailInput, setEmailInput] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  // QR state
  const [qrResult, setQrResult] = useState<QRResult | null>(null);

  // Link state
  const [linkResult, setLinkResult] = useState<LinkResult | null>(null);
  const [copied, setCopied] = useState(false);

  async function sendInvite(deliveryMethod: string, email?: string) {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/v1/users/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryMethod, email, role }),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error?.message ?? "오류가 발생했습니다.");
        return;
      }

      return json.data;
    } catch {
      setError("예기치 않은 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleEmailSend() {
    if (!emailInput) {
      setError("이메일을 입력하세요.");
      return;
    }
    const result = await sendInvite("EMAIL", emailInput);
    if (result) {
      setEmailSent(true);
    }
  }

  async function handleQRGenerate() {
    const result = await sendInvite("QR_CODE");
    if (result) setQrResult(result);
  }

  async function handleLinkGenerate() {
    const result = await sendInvite("LINK");
    if (result) setLinkResult(result);
  }

  async function handleCopyLink(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("링크 복사에 실패했습니다.");
    }
  }

  function handleQRDownload(svgStr: string, token: string) {
    const blob = new Blob([svgStr], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invite-qr-${token.slice(0, 8)}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const tabs: { key: InviteTab; label: string; icon: typeof Mail }[] = [
    { key: "email", label: "이메일 발송", icon: Mail },
    { key: "qrcode", label: "QR 코드", icon: QrCode },
    { key: "link", label: "링크 복사", icon: Link },
  ];

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>멤버 초대</DialogTitle>
        <DialogDescription>초대 방식을 선택하세요.</DialogDescription>
      </DialogHeader>

      {/* Role selector */}
      <div className="space-y-1">
        <Label>역할</Label>
        <Select
          value={role}
          onValueChange={(val) => setRole(val as "ADMIN" | "MEMBER")}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {currentUser?.role === "OWNER" && (
              <SelectItem value="ADMIN">관리자 (Admin)</SelectItem>
            )}
            <SelectItem value="MEMBER">멤버 (Member)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tab switcher */}
      <div className="flex rounded-lg bg-muted p-1 gap-1">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setActiveTab(key);
              setError(null);
            }}
            className={`flex flex-1 items-center justify-center gap-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
              activeTab === key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-3 w-3" />
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* EMAIL TAB */}
      {activeTab === "email" && (
        <div className="space-y-3">
          {emailSent ? (
            <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">
              ✅ 초대 이메일을 발송했습니다.
            </div>
          ) : (
            <>
              <div className="space-y-1">
                <Label htmlFor="invite-email">이메일 주소</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="user@example.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button
                className="w-full"
                onClick={handleEmailSend}
                disabled={isLoading}
              >
                <Mail className="mr-2 h-4 w-4" />
                {isLoading ? "발송 중..." : "초대 이메일 발송"}
              </Button>
            </>
          )}
        </div>
      )}

      {/* QR CODE TAB */}
      {activeTab === "qrcode" && (
        <div className="space-y-3">
          {qrResult ? (
            <>
              <div
                className="mx-auto w-fit rounded-lg border bg-white p-3"
                dangerouslySetInnerHTML={{ __html: qrResult.qrSvg }}
              />
              <p className="text-center text-xs text-muted-foreground">
                만료: {new Date(qrResult.expiresAt).toLocaleString("ko-KR")}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleQRDownload(qrResult.qrSvg, qrResult.token)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  SVG 다운로드
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleCopyLink(qrResult.inviteUrl)}
                >
                  {copied ? (
                    <Check className="mr-2 h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="mr-2 h-4 w-4" />
                  )}
                  {copied ? "복사됨!" : "링크 복사"}
                </Button>
              </div>
            </>
          ) : (
            <Button
              className="w-full"
              onClick={handleQRGenerate}
              disabled={isLoading}
            >
              <QrCode className="mr-2 h-4 w-4" />
              {isLoading ? "생성 중..." : "QR 코드 생성"}
            </Button>
          )}
        </div>
      )}

      {/* LINK TAB */}
      {activeTab === "link" && (
        <div className="space-y-3">
          {linkResult ? (
            <>
              <div className="rounded-md border bg-muted/50 p-3 text-xs break-all text-muted-foreground font-mono">
                {linkResult.inviteUrl}
              </div>
              <p className="text-xs text-muted-foreground">
                만료: {new Date(linkResult.expiresAt).toLocaleString("ko-KR")}
              </p>
              <Button
                className="w-full"
                onClick={() => handleCopyLink(linkResult.inviteUrl)}
              >
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    복사됨!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    링크 복사
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button
              className="w-full"
              onClick={handleLinkGenerate}
              disabled={isLoading}
            >
              <Link className="mr-2 h-4 w-4" />
              {isLoading ? "생성 중..." : "초대 링크 생성"}
            </Button>
          )}
        </div>
      )}

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          닫기
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

// ─── Membership Requests Section ──────────────────────────────────────────
function MembershipRequestsSection() {
  const { data: requests, isLoading, refetch } = useMembershipRequests();
  const [reviewing, setReviewing] = useState<string | null>(null);

  async function handleReview(id: string, action: "APPROVE" | "REJECT") {
    setReviewing(id);
    try {
      await fetch(`/api/v1/settings/membership-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      refetch();
    } finally {
      setReviewing(null);
    }
  }

  const pending = requests?.filter((r) => r.status === "PENDING") ?? [];

  if (isLoading) return <LoadingSkeleton variant="table" count={3} />;
  if (pending.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-3">
        참여 요청{" "}
        <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
          {pending.length}
        </span>
      </h2>
      <div className="space-y-2">
        {pending.map((req) => (
          <div
            key={req.id}
            className="flex items-center justify-between rounded-lg border bg-card p-4"
          >
            <div>
              <p className="font-medium text-sm">{req.name}</p>
              <p className="text-xs text-muted-foreground">{req.email}</p>
              {req.message && (
                <p className="text-xs text-muted-foreground mt-1 italic">
                  &ldquo;{req.message}&rdquo;
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleReview(req.id, "APPROVE")}
                disabled={reviewing === req.id}
              >
                {reviewing === req.id ? "처리 중..." : "승인"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleReview(req.id, "REJECT")}
                disabled={reviewing === req.id}
              >
                거절
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function MembersPage() {
  const { t } = useLanguage();
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data, isLoading } = useUsers({ page, limit: 20 });
  const { user: currentUser } = useCurrentUser();
  const changeRole = useChangeRole();
  const removeUser = useRemoveUser();

  const columns: DataTableColumn<UserResponse>[] = [
    {
      key: "name",
      header: "이름",
      cell: (row) => (
        <div>
          <p className="font-medium">{row.name}</p>
          <p className="text-xs text-muted-foreground">{row.email}</p>
        </div>
      ),
    },
    {
      key: "role",
      header: "역할",
      cell: (row) => (
        <Badge variant={row.role === "OWNER" ? "default" : "secondary"}>
          {row.role}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "가입일",
      cell: (row) =>
        new Date(row.createdAt).toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
    },
    {
      header: "관리",
      cell: (row) => {
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
                    window.confirm(`${row.name}님을 조직에서 제거하시겠습니까?`)
                  ) {
                    removeUser.mutate(row.id);
                  }
                }}
                aria-label="멤버 제거"
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
        title={t("pages.members.title")}
        description={t("pages.members.description")}
        actions={
          <RoleGuard role="ADMIN">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  멤버 초대
                </Button>
              </DialogTrigger>
              <InviteMemberDialog onClose={() => setDialogOpen(false)} />
            </Dialog>
          </RoleGuard>
        }
      />

      {/* Membership requests (ADMIN+) */}
      <RoleGuard role="ADMIN">
        <MembershipRequestsSection />
      </RoleGuard>

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
            title="멤버가 없습니다"
            description="초대 버튼을 눌러 팀원을 추가하세요."
          />
        )}
      </div>
    </PageContainer>
  );
}
