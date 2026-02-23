"use client";

import { useState, useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  registerSchema,
  joinRequestSchema,
  type RegisterInput,
  type JoinRequestInput,
} from "@/lib/validators/user";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiClientError } from "@/lib/api/client";

type TabKey = "create" | "join";

interface PublicOrg {
  id: string;
  name: string;
  slug: string;
}

// ─── Debounced email check hook ─────────────────────────────────────────────
type EmailCheckStatus = "idle" | "checking" | "available" | "taken";

function useEmailCheck(email: string, orgSlug?: string, orgId?: string) {
  const [status, setStatus] = useState<EmailCheckStatus>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!email || email.length < 3) {
      setStatus("idle");
      return;
    }
    clearTimeout(timerRef.current);
    setStatus("checking");

    timerRef.current = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ email });
        if (orgId) params.set("organizationId", orgId);
        else if (orgSlug) params.set("organizationSlug", orgSlug);

        const res = await fetch(`/api/v1/auth/check-email?${params}`);
        const json = await res.json();
        setStatus(json.data?.available ? "available" : "taken");
      } catch {
        setStatus("idle");
      }
    }, 300);

    return () => clearTimeout(timerRef.current);
  }, [email, orgSlug, orgId]);

  return status;
}

// ─── Create Organization Form ─────────────────────────────────────────────
function CreateOrgForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const emailValue = watch("email") ?? "";
  const slugValue = watch("organizationSlug") ?? "";
  const emailStatus = useEmailCheck(emailValue, slugValue);

  async function onSubmit(data: RegisterInput) {
    setIsLoading(true);
    setError(null);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...apiData } = data;

    try {
      const response = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiData),
      });
      const json = await response.json();

      if (!response.ok) {
        throw new ApiClientError(response.status, {
          code: json.error?.code ?? "UNKNOWN_ERROR",
          message: json.error?.message ?? "Registration failed",
          details: json.error?.details,
        });
      }

      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        router.push("/login");
        return;
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === "EMAIL_ALREADY_EXISTS") {
          setError("이미 등록된 이메일 주소입니다.");
        } else if (err.code === "ORG_SLUG_TAKEN") {
          setError("이미 사용 중인 조직 슬러그입니다.");
        } else {
          setError(err.message);
        }
      } else {
        setError("예기치 않은 오류가 발생했습니다. 다시 시도해주세요.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="name">이름</Label>
          <Input
            id="name"
            placeholder="홍길동"
            disabled={isLoading}
            {...register("name")}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">이메일</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            autoComplete="email"
            disabled={isLoading}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
          {!errors.email && emailStatus === "checking" && (
            <p className="text-sm text-muted-foreground">이메일 확인 중...</p>
          )}
          {!errors.email && emailStatus === "taken" && (
            <p className="text-sm text-destructive">
              이미 사용 중인 이메일입니다.
            </p>
          )}
          {!errors.email && emailStatus === "available" && (
            <p className="text-sm text-green-600">사용 가능한 이메일입니다.</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">비밀번호</Label>
          <Input
            id="password"
            type="password"
            placeholder="8자 이상, 영문+숫자 포함"
            autoComplete="new-password"
            disabled={isLoading}
            {...register("password")}
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">비밀번호 확인</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="비밀번호를 다시 입력하세요"
            autoComplete="new-password"
            disabled={isLoading}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="organizationName">조직명</Label>
          <Input
            id="organizationName"
            placeholder="Acme Inc."
            disabled={isLoading}
            {...register("organizationName")}
          />
          {errors.organizationName && (
            <p className="text-sm text-destructive">
              {errors.organizationName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="organizationSlug">조직 슬러그</Label>
          <Input
            id="organizationSlug"
            placeholder="acme-inc"
            disabled={isLoading}
            {...register("organizationSlug")}
          />
          {errors.organizationSlug && (
            <p className="text-sm text-destructive">
              {errors.organizationSlug.message}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            소문자, 숫자, 하이픈(-)만 사용 가능합니다.
          </p>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || emailStatus === "taken"}
        >
          {isLoading ? "계정 생성 중..." : "계정 만들기"}
        </Button>
      </CardFooter>
    </form>
  );
}

// ─── Join Organization Form ────────────────────────────────────────────────
function JoinOrgForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [orgs, setOrgs] = useState<PublicOrg[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<JoinRequestInput>({
    resolver: zodResolver(joinRequestSchema),
  });

  const emailValue = watch("email") ?? "";
  const emailStatus = useEmailCheck(emailValue, undefined, selectedOrgId);

  // Fetch org list on mount
  useEffect(() => {
    fetch("/api/v1/organizations/public")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setOrgs(json.data);
      })
      .catch(() => {});
  }, []);

  async function onSubmit(data: JoinRequestInput) {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/v1/auth/join-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (!res.ok) {
        const code = json.error?.code ?? "";
        if (code === "EMAIL_ALREADY_EXISTS") {
          setError("이미 해당 조직의 멤버입니다.");
        } else if (code === "JOIN_REQUEST_ALREADY_PENDING") {
          setError("이미 대기 중인 참여 요청이 있습니다.");
        } else {
          setError(json.error?.message ?? "오류가 발생했습니다.");
        }
        return;
      }

      setSuccess(true);
    } catch {
      setError("예기치 않은 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <CardContent className="py-8 text-center space-y-3">
        <p className="text-lg font-semibold">✅ 참여 요청이 제출되었습니다</p>
        <p className="text-sm text-muted-foreground">
          조직 관리자가 요청을 검토한 후 승인하면 로그인할 수 있습니다.
        </p>
        <Link href="/login">
          <Button variant="outline" className="mt-4">
            로그인 페이지로 이동
          </Button>
        </Link>
      </CardContent>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label>참여할 조직 선택</Label>
          <Select
            value={selectedOrgId}
            onValueChange={(val) => {
              setSelectedOrgId(val);
              setValue("organizationId", val);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="조직을 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {orgs.map((org) => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name}
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({org.slug})
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.organizationId && (
            <p className="text-sm text-destructive">
              {errors.organizationId.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="join-name">이름</Label>
          <Input
            id="join-name"
            placeholder="홍길동"
            disabled={isLoading}
            {...register("name")}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="join-email">이메일</Label>
          <Input
            id="join-email"
            type="email"
            placeholder="name@example.com"
            autoComplete="email"
            disabled={isLoading}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
          {!errors.email && emailStatus === "checking" && (
            <p className="text-sm text-muted-foreground">이메일 확인 중...</p>
          )}
          {!errors.email && emailStatus === "taken" && (
            <p className="text-sm text-destructive">
              이미 해당 조직에 등록된 이메일입니다.
            </p>
          )}
          {!errors.email && emailStatus === "available" && selectedOrgId && (
            <p className="text-sm text-green-600">사용 가능한 이메일입니다.</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="join-password">비밀번호</Label>
          <Input
            id="join-password"
            type="password"
            placeholder="8자 이상, 영문+숫자 포함"
            autoComplete="new-password"
            disabled={isLoading}
            {...register("password")}
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="join-confirmPassword">비밀번호 확인</Label>
          <Input
            id="join-confirmPassword"
            type="password"
            placeholder="비밀번호를 다시 입력하세요"
            autoComplete="new-password"
            disabled={isLoading}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="join-message">메모 (선택사항)</Label>
          <Input
            id="join-message"
            placeholder="참여 이유나 소속을 간단히 적어주세요"
            disabled={isLoading}
            {...register("message")}
          />
          {errors.message && (
            <p className="text-sm text-destructive">{errors.message.message}</p>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || emailStatus === "taken" || !selectedOrgId}
        >
          {isLoading ? "요청 제출 중..." : "참여 요청 보내기"}
        </Button>
      </CardFooter>
    </form>
  );
}

// ─── Main Register Page ────────────────────────────────────────────────────
export default function RegisterPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("create");

  const tabs: { key: TabKey; label: string }[] = [
    { key: "create", label: "새 조직 만들기" },
    { key: "join", label: "기존 조직 참여" },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-semibold">계정 만들기</CardTitle>
          <CardDescription>
            {activeTab === "create"
              ? "새로운 조직을 만들고 관리자로 등록합니다"
              : "기존 조직에 참여 요청을 보냅니다"}
          </CardDescription>
        </CardHeader>

        {/* Tab selector */}
        <div className="px-6 pb-2">
          <div className="flex rounded-lg bg-muted p-1 gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        {activeTab === "create" ? <CreateOrgForm /> : <JoinOrgForm />}

        {/* Footer link */}
        <div className="px-6 pb-6 text-center">
          <p className="text-sm text-muted-foreground">
            이미 계정이 있으신가요?{" "}
            <Link
              href="/login"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              로그인
            </Link>
          </p>
          {activeTab === "join" && (
            <p className="mt-2 text-xs text-muted-foreground">
              초대 링크가 있다면{" "}
              <span className="text-primary">해당 링크로 직접 접속</span>하세요.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
