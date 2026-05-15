import { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Plus, FileSearch } from "lucide-react";
import { AuditsList } from "@/components/audit/AuditsList";

export const metadata: Metadata = { title: "Audits" };

export default async function AuditsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: audits } = await supabase
    .from("audits")
    .select("id,name,status,audit_type,overall_score,target_url,critical_count,high_count,medium_count,created_at")
    .eq("created_by", user!.id)
    .order("created_at", { ascending: false });

  const allAudits = audits ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audits</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {allAudits.length} audit{allAudits.length !== 1 ? "s" : ""} in your workspace
          </p>
        </div>
        <Link
          href="/audits/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          New Audit
        </Link>
      </div>

      {allAudits.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-16 text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
            <FileSearch className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">No audits yet</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Create your first audit to start evaluating UI with AI
            </p>
          </div>
          <Link
            href="/audits/new"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Create First Audit
          </Link>
        </div>
      ) : (
        <AuditsList initialAudits={allAudits} />
      )}
    </div>
  );
}
