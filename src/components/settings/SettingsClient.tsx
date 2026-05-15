"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Save, LogOut, User as UserIcon, Palette, Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils/cn";

const profileSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  job_title: z.string().optional(),
  timezone: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export function SettingsClient({ user, profile }: { user: User; profile: Record<string, string> | null }) {
  const router = useRouter();
  const supabase = createClient();
  const { theme, setTheme } = useTheme();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "appearance" | "security">("profile");

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name ?? "",
      job_title: profile?.job_title ?? "",
      timezone: profile?.timezone ?? "UTC",
    },
  });

  async function onSave(data: ProfileForm) {
    setIsSaving(true);
    try {
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        email: user.email!,
        full_name: data.full_name,
        job_title: data.job_title ?? null,
        timezone: data.timezone ?? "UTC",
      });
      if (error) throw error;
      toast.success("Profile updated successfully");
      router.refresh();
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const inputClass = cn(
    "w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm",
    "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your profile and workspace preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {[
          { id: "profile" as const, label: "Profile", icon: UserIcon },
          { id: "appearance" as const, label: "Appearance", icon: Palette },
          { id: "security" as const, label: "Security", icon: Shield },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "profile" && (
        <form onSubmit={handleSubmit(onSave)} className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h2 className="text-sm font-semibold">Personal Information</h2>

            <div className="flex items-center gap-4 pb-4 border-b border-border">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">
                  {(profile?.full_name ?? user.email ?? "U").charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-semibold">{profile?.full_name ?? "Your Name"}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Full name</label>
              <input placeholder="Your full name" className={inputClass} {...register("full_name")} />
              {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Job title</label>
              <input placeholder="e.g. Senior UX Researcher" className={inputClass} {...register("job_title")} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email address</label>
              <input value={user.email ?? ""} disabled className={cn(inputClass, "opacity-60 cursor-not-allowed")} />
              <p className="text-xs text-muted-foreground">Email cannot be changed here</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Timezone</label>
              <select className={inputClass} {...register("timezone")}>
                {["UTC", "America/New_York", "America/Chicago", "America/Los_Angeles",
                  "Europe/London", "Europe/Paris", "Asia/Kolkata", "Asia/Singapore", "Australia/Sydney"].map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </button>
        </form>
      )}

      {activeTab === "appearance" && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-6">
          <h2 className="text-sm font-semibold">Theme</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "light", label: "Light", preview: "bg-white border-2" },
              { value: "dark", label: "Dark", preview: "bg-gray-900 border-2" },
              { value: "system", label: "System", preview: "bg-gradient-to-br from-white to-gray-900 border-2" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={cn(
                  "rounded-xl p-4 text-left transition-all border-2",
                  theme === opt.value ? "border-primary" : "border-border hover:border-primary/50"
                )}
              >
                <div className={cn("h-16 rounded-lg mb-3", opt.preview, theme === opt.value ? "border-primary" : "border-border")} />
                <p className="text-sm font-medium capitalize">{opt.label}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === "security" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h2 className="text-sm font-semibold">Account Security</h2>
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <p className="text-sm font-medium">Email address</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <span className="text-xs text-green-600 font-medium">Verified</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium">Password</p>
                <p className="text-xs text-muted-foreground">Last changed: account creation</p>
              </div>
              <button className="text-xs text-primary hover:underline">Change password</button>
            </div>
          </div>

          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 space-y-3">
            <h2 className="text-sm font-semibold text-destructive">Danger Zone</h2>
            <p className="text-xs text-muted-foreground">
              Signing out will end your current session. Your data will be preserved.
            </p>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-destructive text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign out of all devices
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
