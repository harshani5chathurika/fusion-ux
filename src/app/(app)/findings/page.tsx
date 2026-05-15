import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { FindingsClient } from "@/components/findings/FindingsClient";

export const metadata: Metadata = { title: "Findings" };

export default async function FindingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: findings } = await supabase
    .from("findings")
    .select(`
      id, title, description, severity, status, verification_status,
      heuristic_category, heuristic_item_id, location,
      impact_score, frequency_score, priority_score,
      ai_generated, ai_suggestion, business_impact, tags,
      created_at, updated_at,
      audits!inner(id, name)
    `)
    .eq("audits.created_by", user?.id ?? "")
    .order("priority_score", { ascending: false })
    .limit(200);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <FindingsClient findings={(findings ?? []) as any} />;
}
