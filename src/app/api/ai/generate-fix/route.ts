import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { GoogleGenerativeAI } from "@google/generative-ai";

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

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

    // Step 1: Gemini analyzes the violation → spec + image prompt
    const visionModel = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
      generationConfig: { responseMimeType: "application/json" } as never,
    });

    const analysisPrompt = `You are a senior UX designer. Analyze this UI screenshot and the heuristic violation below, then generate a precise visual fix specification.

VIOLATION:
- Title: ${finding.title}
- Description: ${finding.description}
- Heuristic: ${finding.heuristic_category} / ${finding.heuristic_item_id}
- Severity: ${finding.severity}
- AI Recommendation: ${finding.ai_suggestion}

Return a JSON object with these exact keys:
{
  "specification": "A 2-3 sentence description of what the fixed UI looks like — colors, layout, spacing, typography",
  "dalle_prompt": "A UI mockup prompt (max 150 words) starting with 'Clean modern UI mockup,' describing the FIXED interface. Be specific about the exact visual elements that resolve the violation.",
  "figma_prompt": "A Figma AI / FigJam prompt a designer can paste directly. Include component names, variant properties, spacing values, and color tokens."
}`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parts: any[] = [];

    if (screenshot_url) {
      const imgRes = await fetch(screenshot_url as string);
      const imgBuf = await imgRes.arrayBuffer();
      const imgBase64 = Buffer.from(imgBuf).toString("base64");
      const mimeType = imgRes.headers.get("content-type") ?? "image/png";
      parts.push({ inlineData: { mimeType, data: imgBase64 } });
    }
    parts.push({ text: analysisPrompt });

    const specResponse = await visionModel.generateContent({
      contents: [{ role: "user", parts }],
    });

    const specText = specResponse.response.text() ?? "{}";
    let spec: { specification: string; dalle_prompt: string; figma_prompt: string };
    try {
      spec = JSON.parse(specText);
    } catch {
      return NextResponse.json({ error: "Failed to parse AI specification" }, { status: 500 });
    }

    // Step 2: Gemini generates the fixed UI mockup
    const imageModel = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp-image-generation",
    });

    const imageResult = await imageModel.generateContent({
      contents: [{ role: "user", parts: [{ text: `Generate a clean, modern UI mockup image. ${spec.dalle_prompt}` }] }],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      generationConfig: { responseModalities: ["IMAGE"] } as any,
    });

    let imgBuffer: Buffer | null = null;
    for (const part of imageResult.response.candidates?.[0]?.content?.parts ?? []) {
      if (part.inlineData?.data) {
        imgBuffer = Buffer.from(part.inlineData.data, "base64");
        break;
      }
    }
    if (!imgBuffer) return NextResponse.json({ error: "Image generation failed" }, { status: 500 });

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
