import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AuditWorkspace } from "@/components/audit/AuditWorkspace";

interface AuditPageProps {
  params: { auditId: string };
}

export async function generateMetadata({ params }: AuditPageProps): Promise<Metadata> {
  const supabase = await createClient();
  const { data: audit } = await supabase
    .from("audits")
    .select("name")
    .eq("id", params.auditId)
    .single();
  return { title: audit?.name ?? "Audit" };
}

export default async function AuditPage({ params }: AuditPageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: audit } = await supabase
    .from("audits")
    .select(`
      *,
      audit_screenshots (*),
      findings (*)
    `)
    .eq("id", params.auditId)
    .eq("created_by", user!.id)
    .single();

  if (!audit) notFound();

  return <AuditWorkspace audit={audit} />;
}
