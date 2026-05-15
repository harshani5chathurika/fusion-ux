"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";
import { OAuthButtons } from "@/components/auth/OAuthButtons";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

const ERROR_MESSAGES: Record<string, string> = {
  figma_no_code: "Figma login was cancelled or failed.",
  figma_token_failed: "Failed to connect to Figma. Check your app credentials.",
  figma_user_failed: "Could not retrieve your Figma account info.",
  figma_no_email: "Your Figma account has no email address.",
  figma_create_failed: "Failed to create your account. Please try again.",
  figma_session_failed: "Failed to start your session. Please try again.",
  figma_failed: "Figma login failed. Please try again.",
  figma_not_configured: "Figma login is not configured.",
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const error = searchParams.get("error");
    if (error && ERROR_MESSAGES[error]) {
      toast.error("Login failed", { description: ERROR_MESSAGES[error] });
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginForm) {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        toast.error("Login failed", { description: error.message });
        return;
      }

      toast.success("Welcome back!");
      router.push("/dashboard");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Sign in to your Fusion UX workspace
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email address
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            className={cn(
              "w-full px-3 py-2.5 rounded-lg border bg-background text-sm",
              "placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring",
              errors.email ? "border-destructive" : "border-input"
            )}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete="current-password"
              className={cn(
                "w-full px-3 py-2.5 rounded-lg border bg-background text-sm pr-10",
                "placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-ring",
                errors.password ? "border-destructive" : "border-input"
              )}
              {...register("password")}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            "w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg",
            "bg-primary text-primary-foreground font-medium text-sm",
            "hover:opacity-90 active:scale-[0.98] transition-all",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Sign in
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">or continue with</span>
        </div>
      </div>

      <OAuthButtons />

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-primary font-medium hover:underline">
          Create workspace
        </Link>
      </p>
    </div>
  );
}
