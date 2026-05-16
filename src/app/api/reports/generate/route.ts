import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { ReportDocument } from "@/lib/pdf/ReportDocument";
import { generateReportSummary } from "@/lib/ai/analyzer";
import React from "react";

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { audit_id } = body;
    if (!audit_id) return NextResponse.json({ error: "audit_id required" }, { status: 400 });

    // Fetch audit + findings + project name (for org field on cover page)
    const { data: audit, error: auditError } = await supabase
      .from("audits")
      .select(`*, findings(*), projects(name)`)
      .eq("id", audit_id)
      .eq("created_by", user.id)
      .single();

    if (auditError || !audit) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }

    const findings = audit.findings ?? [];

    // Insert report record
    const { data: reportRecord } = await supabase
      .from("reports")
      .insert({ audit_id, created_by: user.id, name: `${audit.name} — UX Report`, status: "generating", config: {} })
      .select()
      .single();

    // Generate AI executive summary (non-blocking — use empty fallback on failure)
    let aiContent = { executive_summary: "", roi_analysis: "", roadmap: [] as string[] };
    try {
      const topFindings = findings
        .filter((f: { severity: string }) => ["critical", "high"].includes(f.severity))
        .slice(0, 5)
        .map((f: { title: string; severity: string; business_impact: string | null }) => ({
          title: f.title, severity: f.severity, business_impact: f.business_impact ?? "",
        }));
      aiContent = await generateReportSummary({
        overall_score: audit.overall_score ?? 0,
        critical_count: audit.critical_count,
        high_count: audit.high_count,
        medium_count: audit.medium_count,
        low_count: audit.low_count,
        top_findings: topFindings,
        audit_name: audit.name,
      });
    } catch (e) {
      console.error("AI summary skipped:", e);
    }

    // Fetch user profile
    const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();

    // Build report data and generate PDF
    const projectName = Array.isArray(audit.projects)
      ? audit.projects[0]?.name ?? null
      : (audit.projects as { name?: string } | null)?.name ?? null;

    const reportData = {
      audit,
      findings,
      executive_summary: aiContent.executive_summary,
      roi_analysis: aiContent.roi_analysis,
      roadmap: aiContent.roadmap,
      preparer_name: profile?.full_name ?? user.email ?? "Fusion UX",
      organization_name: projectName ?? undefined,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfBuffer = await renderToBuffer(React.createElement(ReportDocument, { data: reportData }) as any);

    // Try uploading to storage (works if bucket allows PDFs — won't fail the response)
    let fileUrl: string | null = null;
    try {
      const filename = `reports/${user.id}/${reportRecord?.id ?? audit_id}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from("audit-screenshots")
        .upload(filename, pdfBuffer, { contentType: "application/pdf", upsert: true });

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage.from("audit-screenshots").getPublicUrl(filename);
        fileUrl = publicUrl;
      }
    } catch {
      // Storage upload failed — will fall back to base64 download
    }

    // Update report record
    if (reportRecord) {
      await supabase.from("reports").update({
        status: "ready",
        file_url: fileUrl,
        ai_summary: aiContent.executive_summary,
        generated_at: new Date().toISOString(),
      }).eq("id", reportRecord.id);
    }

    // Always return PDF as base64 so client can download directly
    const pdfBase64 = pdfBuffer.toString("base64");

    return NextResponse.json({
      data: {
        report_id: reportRecord?.id ?? null,
        file_url: fileUrl,
        pdf_base64: pdfBase64,
        filename: `${audit.name.replace(/[^a-z0-9]/gi, "_")}_UX_Report.pdf`,
        status: "ready",
      },
    });
  } catch (error) {
    console.error("Report generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Report generation failed" },
      { status: 500 }
    );
  }
}
