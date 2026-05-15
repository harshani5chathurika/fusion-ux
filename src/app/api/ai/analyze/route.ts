import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runAIAnalysis, getScreenshotUrl } from "@/lib/ai/analyzer";

export const maxDuration = 180; // 3 minutes — multi-section screenshot + AI analysis

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { audit_id, audit_type, image_urls, target_url } = body;

    if (!audit_id) {
      return NextResponse.json({ error: "audit_id is required" }, { status: 400 });
    }

    // Verify the audit belongs to the user
    const { data: audit, error: auditError } = await supabase
      .from("audits")
      .select("id, created_by")
      .eq("id", audit_id)
      .eq("created_by", user.id)
      .single();

    if (auditError || !audit) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }

    // Run AI analysis
    const result = await runAIAnalysis({
      imageUrls: image_urls,
      targetUrl: target_url,
      auditType: audit_type,
    });

    // Save findings to database
    if (result.findings && result.findings.length > 0) {
      const findingsToInsert = result.findings.map((finding) => ({
        audit_id,
        created_by: user.id,
        title: finding.title,
        description: finding.description,
        severity: ["critical","high","medium","low"].includes(finding.severity) ? finding.severity : "medium",
        status: "open",
        verification_status: "pending",
        heuristic_category: finding.heuristic_category ?? null,
        heuristic_item_id: finding.heuristic_item_id ?? null,
        location: finding.location ?? null,
        impact_score: finding.impact_score ?? null,
        frequency_score: finding.frequency_score ?? null,
        ai_generated: true,
        ai_suggestion: finding.ai_suggestion ?? null,
        business_impact: finding.business_impact ?? null,
        financial_risk: finding.financial_risk ?? null,
        tags: Array.isArray(finding.tags) ? finding.tags : [],
        human_notes: null,
        bounding_box: finding.bounding_box ?? null,
        wcag_criteria: Array.isArray(finding.wcag_criteria) ? finding.wcag_criteria : [],
        design_reference: finding.design_reference ?? null,
        critical_analysis: finding.critical_analysis ?? null,
      }));

      const { error: findingsError } = await supabase
        .from("findings")
        .insert(findingsToInsert);

      if (findingsError) {
        console.error("Failed to insert findings:", findingsError);
      }
    }

    // Count findings by severity
    const criticalCount = result.findings.filter((f) => f.severity === "critical").length;
    const highCount = result.findings.filter((f) => f.severity === "high").length;
    const mediumCount = result.findings.filter((f) => f.severity === "medium").length;
    const lowCount = result.findings.filter((f) => f.severity === "low").length;

    // Build screenshot_url:
    // - URL audits → thum.io viewport thumbnail
    // - Figma audits → first persisted frame (already in Supabase storage)
    // - Image audits → null (screenshots stored in audit_screenshots table)
    let screenshotUrl: string | null = null;
    if (audit_type === "url" && target_url) {
      screenshotUrl = getScreenshotUrl(target_url);
    } else if (audit_type === "figma" && image_urls?.length > 0) {
      screenshotUrl = image_urls[0];
    }

    // Update audit with AI results
    const { error: updateError } = await supabase
      .from("audits")
      .update({
        status: "review",
        overall_score: result.overall_score,
        heuristic_score: result.heuristic_score,
        accessibility_score: result.accessibility_score,
        ai_summary: result.ai_summary,
        category_scores: result.category_scores ?? null,
        screenshot_url: screenshotUrl,
        findings_count: result.findings.length,
        critical_count: criticalCount,
        high_count: highCount,
        medium_count: mediumCount,
        low_count: lowCount,
        started_at: new Date().toISOString(),
      })
      .eq("id", audit_id);

    if (updateError) {
      console.error("Failed to update audit:", updateError);
    }

    return NextResponse.json({
      data: {
        audit_id,
        overall_score: result.overall_score,
        findings_count: result.findings.length,
        ai_summary: result.ai_summary,
      },
    });
  } catch (error) {
    console.error("AI analysis error:", error);
    const message = error instanceof Error ? error.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
