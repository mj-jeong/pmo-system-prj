"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";

import { acceptInviteSchema, type AcceptInviteInput } from "@/lib/validators/user";
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

type TokenStatus =
  | { state: "loading" }
  | { state: "valid"; organizationName: string; role: string; expiresAt: string }
  | { state: "invalid"; reason: "expired" | "used" | "notFound" };

export default function InviteAcceptPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const token = params.token;

  const [tokenStatus, setTokenStatus] = useState<TokenStatus>({ state: "loading" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AcceptInviteInput>({
    resolver: zodResolver(acceptInviteSchema),
    defaultValues: { token },
  });

  // Validate token on mount
  useEffect(() => {
    if (!token) return;
    fetch(`/api/v1/invite/${token}/validate`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setTokenStatus({
            state: "valid",
            organizationName: json.data.organizationName,
            role: json.data.role,
            expiresAt: json.data.expiresAt,
          });
        } else {
          const code = json.error?.code ?? "";
          setTokenStatus({
            state: "invalid",
            reason:
              code === "INVITATION_EXPIRED"
                ? "expired"
                : code === "INVITATION_ALREADY_USED"
                ? "used"
                : "notFound",
          });
        }
      })
      .catch(() => setTokenStatus({ state: "invalid", reason: "notFound" }));
  }, [token]);

  async function onSubmit(data: AcceptInviteInput) {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/v1/auth/accept-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (!res.ok) {
        setSubmitError(json.error?.message ?? "오류가 발생했습니다.");
        return;
      }

      setSuccess(true);

      // Auto sign-in
      const signInResult = await signIn("credentials", {
        email: json.data.email,
        password: data.password,
        redirect: false,
      });

      if (!signInResult?.error) {
        router.push("/");
        router.refresh();
      } else {
        router.push("/login");
      }
    } catch {
      setSubmitError("예기치 않은 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Loading
  if (tokenStatus.state === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted px-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center text-muted-foreground">
            초대 링크를 확인하는 중입니다...
          </CardContent>
        </Card>
      </div>
    );
  }

  // Invalid token
  if (tokenStatus.state === "invalid") {
    const messages = {
      expired: {
        title: "초대 링크 만료",
        desc: "이 초대 링크는 만료되었습니다. 조직 관리자에게 새 초대를 요청하세요.",
      },
      used: {
        title: "이미 사용된 초대 링크",
        desc: "이 초대 링크는 이미 사용되었습니다. 계정이 있다면 로그인하세요.",
      },
      notFound: {
        title: "유효하지 않은 초대 링크",
        desc: "초대 링크를 찾을 수 없습니다. 링크가 올바른지 확인해주세요.",
      },
    };
    const { title, desc } = messages[tokenStatus.reason];

    return (
      <div className="flex min-h-screen items-center justify-center bg-muted px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-destructive">{title}</CardTitle>
            <CardDescription>{desc}</CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Link href="/login">
              <Button variant="outline">로그인 페이지로 이동</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted px-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <p className="text-lg font-medium">✅ 계정이 생성되었습니다!</p>
            <p className="text-sm text-muted-foreground mt-2">
              {tokenStatus.organizationName}으로 이동 중입니다...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const roleKorean =
    tokenStatus.role === "ADMIN"
      ? "관리자"
      : tokenStatus.role === "OWNER"
      ? "소유자"
      : "멤버";

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-semibold">초대 수락</CardTitle>
          <CardDescription>
            <strong>{tokenStatus.organizationName}</strong> 조직에{" "}
            <strong>{roleKorean}</strong>로 참여합니다.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {submitError && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {submitError}
              </div>
            )}

            <input type="hidden" {...register("token")} value={token} />

            <div className="space-y-2">
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                placeholder="홍길동"
                disabled={isSubmitting}
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="8자 이상, 영문+숫자 포함"
                autoComplete="new-password"
                disabled={isSubmitting}
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
                disabled={isSubmitting}
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "계정 생성 중..." : "계정 생성 및 참여"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              이미 계정이 있으신가요?{" "}
              <Link
                href="/login"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                로그인
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
