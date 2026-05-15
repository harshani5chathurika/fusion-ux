import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import OpenAI from "openai";

export const dynamic = "force-dynamic";

const FREE_DAILY_LIMIT = 2;

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setAll(cookiesToSet: any[]) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cookiesToSet.forEach(({ name, value, options }: any) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // ── Daily limit check ────────────────────────────────────────
    const { data: usageRow } = await supabase
      .from("usage")
      .select("fixes_today, last_reset, plan_status")
      .eq("user_id", user.id)
      .single();

    const now = new Date();
    const isNewDay = !usageRow?.last_reset ||
      (now.getTime() - new Date(usageRow.last_reset).getTime()) > 86_400_000;

    const fixesToday = isNewDay ? 0 : (usageRow?.fixes_today ?? 0);
    const planStatus = usageRow?.plan_status ?? "free";

    if (planStatus !== "pro" && fixesToday >= FREE_DAILY_LIMIT) {
      return NextResponse.json({ error: "daily_limit" }, { status: 402 });
    }

    const body = await request.json();
    const { finding_id, audit_id, screenshot_url, finding } = body;

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Step 1: GPT-4o analyzes the violation → spec + DALL-E prompt
    const specResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            ...(screenshot_url ? [{
              type: "image_url" as const,
              image_url: { url: screenshot_url as string, detail: "high" as const },
            }] : []),
            {
              type: "text" as const,
              text: `You are a senior UX designer. Analyze this UI screenshot and the heuristic violation below, then generate a precise visual fix specification.

VIOLATION:
- Title: ${finding.title}
- Description: ${finding.description}
- Heuristic: ${finding.heuristic_category} / ${finding.heuristic_item_id}
- Severity: ${finding.severity}
- AI Recommendation: ${finding.ai_suggestion}

Return a JSON object with these exact keys:
{
  "specification": "A 2-3 sentence description of what the fixed UI looks like — colors, layout, spacing, typography",
  "dalle_prompt": "A DALL-E 3 prompt (max 150 words) starting with 'Clean modern UI mockup,' describing the FIXED interface. Be specific about the exact visual elements that resolve the violation.",
  "figma_prompt": "A Figma AI / FigJam prompt a designer can paste directly. Include component names, variant properties, spacing values, and color tokens."
}`,
            },
          ],
        },
      ],
      max_tokens: 800,
      response_format: { type: "json_object" },
    });

    const specText = specResponse.choices[0]?.message?.content ?? "{}";
    let spec: { specification: string; dalle_prompt: string; figma_prompt: string };
    try {
      spec = JSON.parse(specText);
    } catch {
      return NextResponse.json({ error: "Failed to parse AI specification" }, { status: 500 });
    }

    // Step 2: DALL-E 3 generates the fixed UI mockup
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: spec.dalle_prompt,
      size: "1792x1024",
      quality: "hd",
      n: 1,
    });

    const imageUrl = imageResponse.data?.[0]?.url;
    if (!imageUrl) return NextResponse.json({ error: "Image generation failed" }, { status: 500 });

    // Step 3: Download and upload to Supabase storage
    const imgRes = await fetch(imageUrl);
    const imgBuffer = Buffer.from(await imgRes.arrayBuffer());

    const storagePath = `${user.id}/${audit_id}/ai_fix_${finding_id}_${Date.now()}.png`;
    const { error: uploadError } = await supabase.storage
      .from("audit-screenshots")
      .upload(storagePath, imgBuffer, { contentType: "image/png", upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from("audit-screenshots")
      .getPublicUrl(storagePath);

    // Step 4: Save proposed design to finding
    await supabase.from("findings").update({
      proposed_design_url: publicUrl,
      proposed_design_prompt: spec.figma_prompt,
      fix_generated_at: now.toISOString(),
    }).eq("id", finding_id);

    // Step 5: Increment daily usage counter
    if (planStatus !== "pro") {
      await supabase.from("usage").upsert(
        {
          user_id: user.id,
          fixes_today: fixesToday + 1,
          last_reset: isNewDay ? now.toISOString() : (usageRow?.last_reset ?? now.toISOString()),
          plan_status: planStatus,
        },
        { onConflict: "user_id" }
      );
    }

    return NextResponse.json({
      proposed_design_url: publicUrl,
      figma_prompt: spec.figma_prompt,
      specification: spec.specification,
      fixes_today: fixesToday + 1,
      remaining: planStatus === "pro" ? null : FREE_DAILY_LIMIT - (fixesToday + 1),
    });
  } catch (e) {
    console.error("generate-fix error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
