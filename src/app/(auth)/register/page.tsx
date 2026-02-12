"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { registerSchema, type RegisterInput } from "@/lib/validators/user";
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
import { ApiClientError } from "@/lib/api/client";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterInput) {
    setIsLoading(true);
    setError(null);

    try {
      // Register via API
      const response = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new ApiClientError(response.status, {
          code: json.error?.code ?? "UNKNOWN_ERROR",
          message: json.error?.message ?? "Registration failed",
          details: json.error?.details,
        });
      }

      // Auto-login after successful registration
      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        // Registration succeeded but auto-login failed -- redirect to login
        router.push("/login");
        return;
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === "EMAIL_ALREADY_EXISTS") {
          setError("This email address is already registered.");
        } else if (err.code === "ORG_SLUG_TAKEN") {
          setError("This organization slug is already in use.");
        } else {
          setError(err.message);
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-semibold">
            Create an account
          </CardTitle>
          <CardDescription>
            Register to create your organization
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                disabled={isLoading}
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                autoComplete="email"
                disabled={isLoading}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Min. 8 characters"
                autoComplete="new-password"
                disabled={isLoading}
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="organizationName">Organization Name</Label>
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
              <Label htmlFor="organizationSlug">Organization Slug</Label>
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
                URL-safe identifier. Lowercase letters, numbers, and hyphens
                only.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
