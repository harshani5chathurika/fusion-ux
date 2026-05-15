"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, ArrowRight, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";

const signupSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  organization_name: z.string().min(2, "Organization name must be at least 2 characters"),
});

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  const password = watch("password", "");

  async function onSubmit(data: SignupForm) {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
            organization_name: data.organization_name,
          },
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        },
      });

      if (error) {
        toast.error("Signup failed", { description: error.message });
        return;
      }

      setDone(true);
    } finally {
      setIsLoading(false);
    }
  }

  if (done) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Check your email</h2>
          <p className="text-muted-foreground text-sm mt-2">
            We&apos;ve sent a verification link to your email address. Click it to activate your Fusion UX workspace.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          Back to login
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    );
  }

  const passwordStrength = password.length === 0 ? 0 : password.length < 8 ? 1 : password.length < 12 ? 2 : 3;
  const strengthLabel = ["", "Weak", "Good", "Strong"][passwordStrength];
  const strengthColor = ["", "bg-red-500", "bg-yellow-500", "bg-green-500"][passwordStrength];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create your workspace</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Start your free Fusion UX trial — no credit card required
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 col-span-2">
            <label htmlFor="full_name" className="text-sm font-medium">
              Full name
            </label>
            <input
              id="full_name"
              placeholder="Your full name"
              className={cn(
                "w-full px-3 py-2.5 rounded-lg border bg-background text-sm",
                "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                errors.full_name ? "border-destructive" : "border-input"
              )}
              {...register("full_name")}
            />
            {errors.full_name && (
              <p className="text-xs text-destructive">{errors.full_name.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="organization_name" className="text-sm font-medium">
            Organization name
          </label>
          <input
            id="organization_name"
            placeholder="Your company or team name"
            className={cn(
              "w-full px-3 py-2.5 rounded-lg border bg-background text-sm",
              "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
              errors.organization_name ? "border-destructive" : "border-input"
            )}
            {...register("organization_name")}
          />
          {errors.organization_name && (
            <p className="text-xs text-destructive">{errors.organization_name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Work email
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            className={cn(
              "w-full px-3 py-2.5 rounded-lg border bg-background text-sm",
              "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
              errors.email ? "border-destructive" : "border-input"
            )}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              autoComplete="new-password"
              className={cn(
                "w-full px-3 py-2.5 rounded-lg border bg-background text-sm pr-10",
                "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                errors.password ? "border-destructive" : "border-input"
              )}
              {...register("password")}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {password.length > 0 && (
            <div className="space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3].map((level) => (
                  <div
                    key={level}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-all",
                      passwordStrength >= level ? strengthColor : "bg-muted"
                    )}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Password strength:{" "}
                <span className={cn(
                  passwordStrength === 1 ? "text-red-600" :
                  passwordStrength === 2 ? "text-yellow-600" :
                  "text-green-600"
                )}>
                  {strengthLabel}
                </span>
              </p>
            </div>
          )}
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
              Create free workspace
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <p className="text-xs text-muted-foreground text-center">
        By creating an account, you agree to our{" "}
        <Link href="#" className="text-primary hover:underline">Terms of Service</Link>{" "}
        and{" "}
        <Link href="#" className="text-primary hover:underline">Privacy Policy</Link>.
      </p>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
