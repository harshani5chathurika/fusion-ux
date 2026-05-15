import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 120;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function fetchBase64(url: string) {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(30000),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; FusionUX/1.0)" },
    });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    const ct = res.headers.get("content-type") ?? "image/png";
    const media_type = ct.includes("jpeg") || ct.includes("jpg") ? "image/jpeg"
      : ct.includes("webp") ? "image/webp" : "image/png";
    return { data: buf.toString("base64"), media_type } as const;
  } catch {
    return null;
  }
}

function safeParseJSON(text: string) {
  try { return JSON.parse(text); } catch {}
  const s = text.indexOf("{"), e = text.lastIndexOf("}");
  if (s === -1 || e === -1) return null;
  try { return JSON.parse(text.slice(s, e + 1)); } catch { return null; }
}

const SEVERITY_SCORE: Record<string, number> = { critical: 8, high: 5, medium: 3, low: 1 };

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { finding_id, before_screenshot_url, after_screenshot_url, finding } = await request.json();
    if (!finding_id || !after_screenshot_url || !finding) {
      return NextResponse.json({ error: "finding_id, after_screenshot_url, and finding are required" }, { status: 400 });
    }

    // Fetch both screenshots as base64
    const [beforeImg, afterImg] = await Promise.all([
      before_screenshot_url ? fetchBase64(before_screenshot_url) : null,
      fetchBase64(after_screenshot_url),
    ]);

    if (!afterImg) {
      return NextResponse.json({ error: "Could not load the after screenshot" }, { status: 400 });
    }

    // Build image content array
    const imageContent: Anthropic.ImageBlockParam[] = [];
    if (beforeImg) {
      imageContent.push({ type: "image", source: { type: "base64", media_type: beforeImg.media_type, data: beforeImg.data } });
    }
    imageContent.push({ type: "image", source: { type: "base64", media_type: afterImg.media_type, data: afterImg.data } });

    const prompt = `You are a senior UX quality assurance expert validating whether a design fix resolves a specific UX violation.

${beforeImg ? "Image 1 = BEFORE screenshot (original failing state)\nImage 2 = AFTER screenshot (claimed fix)" : "Image 1 = AFTER screenshot (claimed fix) — no before screenshot available"}

ORIGINAL VIOLATION:
- Title: ${finding.title}
- Category: ${finding.heuristic_category ?? "Unknown"} (${finding.heuristic_item_id ?? "—"})
- Severity: ${finding.severity}
- Description: ${finding.description ?? "No description"}
- WCAG Criteria: ${finding.wcag_criteria?.join(", ") || "None"}
- AI Recommendation: ${finding.ai_suggestion ?? "None"}

YOUR TASK:
1. Examine the ${beforeImg ? "AFTER screenshot (Image 2)" : "screenshot"} carefully
2. Determine if the specific violation described above has been fixed
3. Check against the WCAG criteria listed (if any)
4. Identify what was fixed and what (if anything) still needs work

IMPORTANT: Be fair but rigorous. A fix is "validated" only if the core violation is genuinely resolved, not just cosmetically changed.

Return ONLY valid JSON:
{
  "validated": <true|false>,
  "confidence": <0-100>,
  "explanation": "<2-3 sentence verdict explaining your decision>",
  "passed_checks": ["<specific thing that was fixed>", ...],
  "remaining_issues": ["<specific issue still present>", ...]
}`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: [
          ...imageContent,
          { type: "text", text: prompt },
        ],
      }],
    });

    const content = message.content[0];
    if (content.type !== "text") throw new Error("Unexpected Claude response");

    const result = safeParseJSON(content.text);
    if (!result) throw new Error("Could not parse AI validation response");

    // Update finding in DB
    const now = new Date().toISOString();
    const updates: Record<string, unknown> = {
      validation_result: result,
      after_screenshot_url,
    };

    if (result.validated) {
      updates.status = "validated";
      updates.validated_at = now;
    }

    await supabase.from("findings").update(updates).eq("id", finding_id);

    // If validated, boost the audit's overall score
    if (result.validated) {
      const { data: findingRow } = await supabase
        .from("findings")
        .select("audit_id")
        .eq("id", finding_id)
        .single();

      if (findingRow?.audit_id) {
        const { data: auditRow } = await supabase
          .from("audits")
          .select("overall_score, heuristic_score")
          .eq("id", findingRow.audit_id)
          .single();

        if (auditRow) {
          const boost = SEVERITY_SCORE[finding.severity] ?? 2;
          const newOverall = Math.min(100, (auditRow.overall_score ?? 50) + boost);
          const newHeuristic = Math.min(100, (auditRow.heuristic_score ?? 50) + Math.ceil(boost * 0.8));
          await supabase.from("audits").update({
            overall_score: newOverall,
            heuristic_score: newHeuristic,
          }).eq("id", findingRow.audit_id);
        }
      }
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error("validate-fix error:", error);
    const msg = error instanceof Error ? error.message : "Validation failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
