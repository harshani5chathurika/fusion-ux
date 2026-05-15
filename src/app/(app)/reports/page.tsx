import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ReportsClient } from "@/components/reports/ReportsClient";

export const metadata: Metadata = { title: "Reports" };

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: audits } = await supabase
    .from("audits")
    .select("id, name, status, overall_score, created_at, findings_count, critical_count, high_count")
    .eq("created_by", user!.id)
    .in("status", ["review", "completed"])
    .order("created_at", { ascending: false });

  const { data: reports } = await supabase
    .from("reports")
    .select("*, audits(name)")
    .eq("created_by", user!.id)
    .order("created_at", { ascending: false });

  return (
    <ReportsClient
      audits={audits ?? []}
      reports={reports ?? []}
    />
  );
}
