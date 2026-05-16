import { Metadata } from "next";
import Link from "next/link";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  FileSearch,
  Zap,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { RecentAudits } from "@/components/dashboard/RecentAudits";
import { GreetingHeader } from "@/components/dashboard/GreetingHeader";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = { title: "Dashboard" };

async function getDashboardData(userId: string) {
  const supabase = await createClient();

  const { data: audits } = await supabase
    .from("audits")
    .select("id, name, status, overall_score, critical_count, high_count, medium_count, low_count, created_at, audit_type")
    .eq("created_by", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  const allAudits = audits ?? [];
  const completed = allAudits.filter((a) => a.status === "completed");
  const avgScore = completed.length > 0
    ? Math.round(completed.reduce((s, a) => s + (a.overall_score ?? 0), 0) / completed.length)
    : null;

  const totalCritical = allAudits.reduce((s, a) => s + (a.critical_count ?? 0), 0);
  const totalHigh = allAudits.reduce((s, a) => s + (a.high_count ?? 0), 0);
  const totalMedium = allAudits.reduce((s, a) => s + (a.medium_count ?? 0), 0);
  const totalLow = allAudits.reduce((s, a) => s + (a.low_count ?? 0), 0);

  return {
    audits: allAudits,
    totalAudits: allAudits.length,
    completedAudits: completed.length,
    avgScore,
    openIssues: totalCritical + totalHigh + totalMedium + totalLow,
    totalCritical,
    totalHigh,
    totalMedium,
    totalLow,
  };
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const data = await getDashboardData(user!.id);
  const displayName = user!.user_metadata?.full_name?.split(" ")[0] ?? "there";

  const scoreColor =
    data.avgScore === null ? "text-muted-foreground" :
    data.avgScore >= 80 ? "text-green-600" :
    data.avgScore >= 60 ? "text-yellow-600" :
    data.avgScore >= 40 ? "text-orange-600" :
    "text-red-600";

  const scoreLabel =
    data.avgScore === null ? "No audits yet" :
    data.avgScore >= 80 ? "Good" :
    data.avgScore >= 60 ? "Fair" :
    data.avgScore >= 40 ? "Poor" :
    "Critical";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <GreetingHeader name={displayName} />
          <p className="text-muted-foreground text-sm mt-1">
            Here&apos;s your UX intelligence overview
          </p>
        </div>
        <Link
          href="/audits/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          New Audit
        </Link>
      </div>

      {/* Zero state */}
      {data.totalAudits === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
            <FileSearch className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Run your first UX audit</h2>
            <p className="text-muted-foreground text-sm mt-1 max-w-md mx-auto">
              Upload UI screenshots or enter a website URL. Our AI will evaluate your interface
              against 153 heuristic checks across 12 expert categories.
            </p>
          </div>
          <Link
            href="/audits/new"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Zap className="h-4 w-4" />
            Start first audit
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {data.totalAudits > 0 && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* UX Health Score */}
            <div className="col-span-2 lg:col-span-1 rounded-xl border border-border bg-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Avg UX Score</p>
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className={cn("text-4xl font-bold", scoreColor)}>
                  {data.avgScore ?? "—"}
                  {data.avgScore !== null && <span className="text-lg font-normal text-muted-foreground">/100</span>}
                </p>
                <p className={cn("text-sm font-medium mt-1", scoreColor)}>{scoreLabel}</p>
              </div>
            </div>

            {/* Total Audits */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Total Audits</p>
                <FileSearch className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-3xl font-bold">{data.totalAudits}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.completedAudits} completed
                </p>
              </div>
            </div>

            {/* Open Issues */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Open Issues</p>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </div>
              <div>
                <p className="text-3xl font-bold">{data.openIssues}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.totalCritical} critical
                </p>
              </div>
            </div>

            {/* Critical Issues */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Critical</p>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </div>
              <div>
                <p className="text-3xl font-bold text-red-600">{data.totalCritical}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Needs immediate attention
                </p>
              </div>
            </div>
          </div>

          {/* Severity Overview */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Critical", count: data.totalCritical, color: "bg-red-500", light: "bg-red-50 dark:bg-red-950/30", text: "text-red-700 dark:text-red-400" },
              { label: "High", count: data.totalHigh, color: "bg-orange-500", light: "bg-orange-50 dark:bg-orange-950/30", text: "text-orange-700 dark:text-orange-400" },
              { label: "Medium", count: data.totalMedium, color: "bg-yellow-500", light: "bg-yellow-50 dark:bg-yellow-950/30", text: "text-yellow-700 dark:text-yellow-400" },
              { label: "Low", count: data.totalLow, color: "bg-green-500", light: "bg-green-50 dark:bg-green-950/30", text: "text-green-700 dark:text-green-400" },
            ].map((severity) => (
              <div
                key={severity.label}
                className={cn("rounded-xl p-4 space-y-2", severity.light)}
              >
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", severity.color)} />
                  <p className={cn("text-xs font-medium", severity.text)}>{severity.label}</p>
                </div>
                <p className={cn("text-2xl font-bold", severity.text)}>{severity.count}</p>
              </div>
            ))}
          </div>

          {/* Charts + Recent Audits */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <DashboardCharts audits={data.audits} />
            </div>
            <div>
              <RecentAudits audits={data.audits.slice(0, 5)} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
