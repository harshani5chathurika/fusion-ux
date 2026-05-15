import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const maxDuration = 60;

function extractFigmaFileId(url: string): string | null {
  const match = url.match(/figma\.com\/(?:file|design)\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

async function persistFrameToSupabase(
  frameUrl: string,
  idx: number,
  auditId: string,
  userId: string
): Promise<string | null> {
  try {
    const admin = createAdminClient();
    const res = await fetch(frameUrl, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) return null;

    const buffer = Buffer.from(await res.arrayBuffer());
    // Reject unreasonably large frames (>15MB) to avoid memory issues
    if (buffer.length > 15 * 1024 * 1024) return null;

    const path = `${userId}/${auditId}/figma_frame_${idx + 1}.png`;
    const { error: uploadErr } = await admin.storage
      .from("audit-screenshots")
      .upload(path, buffer, { contentType: "image/png", upsert: true });

    if (uploadErr) return null;

    const { data: { publicUrl } } = admin.storage
      .from("audit-screenshots")
      .getPublicUrl(path);

    await admin.from("audit_screenshots").insert({
      audit_id: auditId,
      url: publicUrl,
      filename: `Figma Frame ${idx + 1}`,
      file_size: buffer.length,
      order_index: idx,
      annotations: [],
    });

    return publicUrl;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { figma_url, figma_token, audit_id, user_id } = await request.json();

    if (!figma_url || !figma_token) {
      return NextResponse.json({ error: "figma_url and figma_token are required" }, { status: 400 });
    }

    const fileId = extractFigmaFileId(figma_url);
    if (!fileId) {
      return NextResponse.json(
        { error: "Invalid Figma URL. Expected format: figma.com/file/… or figma.com/design/…" },
        { status: 400 }
      );
    }

    // 1 — Fetch file structure
    const fileRes = await fetch(`https://api.figma.com/v1/files/${fileId}`, {
      headers: { "X-Figma-Token": figma_token },
      signal: AbortSignal.timeout(20000),
    });

    if (!fileRes.ok) {
      const err = await fileRes.json().catch(() => ({}));
      const msg = err.message ?? "Failed to access Figma file";
      const hint = fileRes.status === 403
        ? " — check your personal access token has read access"
        : fileRes.status === 404
        ? " — the file ID in the URL could not be found"
        : "";
      return NextResponse.json({ error: msg + hint }, { status: fileRes.status });
    }

    const fileData = await fileRes.json();
    const pages: Array<{ children?: Array<{ type: string; id: string }> }> =
      fileData.document?.children ?? [];

    // 2 — Collect top-level frame IDs (max 6)
    const frameIds: string[] = [];
    for (const page of pages) {
      for (const child of page.children ?? []) {
        if (child.type === "FRAME" || child.type === "COMPONENT") {
          frameIds.push(child.id);
          if (frameIds.length >= 6) break;
        }
      }
      if (frameIds.length >= 6) break;
    }

    if (frameIds.length === 0) {
      return NextResponse.json(
        { error: "No top-level frames found. Make sure the file has frames (not just components or groups)." },
        { status: 400 }
      );
    }

    // 3 — Render frames at scale=1 (scale=2 is huge and causes OOM/timeouts)
    const imgRes = await fetch(
      `https://api.figma.com/v1/images/${fileId}?ids=${frameIds.join(",")}&format=png&scale=1`,
      { headers: { "X-Figma-Token": figma_token }, signal: AbortSignal.timeout(20000) }
    );

    if (!imgRes.ok) {
      return NextResponse.json({ error: "Figma failed to render frames. Try again in a moment." }, { status: 500 });
    }

    const imgData = await imgRes.json();
    const tempUrls = Object.values(imgData.images as Record<string, string | null>)
      .filter((u): u is string => Boolean(u));

    if (tempUrls.length === 0) {
      return NextResponse.json({ error: "Figma returned no rendered images for the frames." }, { status: 500 });
    }

    // 4 — If audit context provided, persist frames to Supabase storage
    //     This runs in the background — failures fall back to temp URLs gracefully
    let imageUrls = tempUrls;

    if (audit_id && user_id) {
      try {
        const results = await Promise.all(
          tempUrls.map((url, idx) => persistFrameToSupabase(url, idx, audit_id, user_id))
        );
        const persistedUrls = results.filter((u): u is string => u !== null);
        if (persistedUrls.length > 0) {
          imageUrls = persistedUrls;
        }
        // If persistence partially failed, fill gaps with temp URLs
        if (persistedUrls.length < tempUrls.length) {
          imageUrls = results.map((u, i) => u ?? tempUrls[i]);
        }
      } catch {
        // Persistence failed entirely — temp URLs will still work for AI analysis
        imageUrls = tempUrls;
      }
    }

    return NextResponse.json({ image_urls: imageUrls, file_name: fileData.name });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Figma integration error";
    console.error("Figma route error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
