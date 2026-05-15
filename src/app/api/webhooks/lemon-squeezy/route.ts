import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export const dynamic = "force-dynamic";

// Service-role client — bypasses RLS so we can update any user's plan
function adminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-signature") ?? "";
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET ?? "";

  // Verify HMAC signature
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  const event = payload.meta?.event_name as string;
  const userId = payload.meta?.custom_data?.user_id as string | undefined;

  if (!userId) return NextResponse.json({ received: true });

  const supabase = adminSupabase();

  // Grant Pro on successful payment or active subscription
  if (
    event === "order_created" ||
    event === "subscription_created" ||
    event === "subscription_updated" ||
    event === "subscription_resumed"
  ) {
    const status = payload.data?.attributes?.status as string;
    if (status === "active" || status === "paid") {
      await supabase.from("usage").upsert(
        { user_id: userId, plan_status: "pro", fixes_today: 0, last_reset: new Date().toISOString() },
        { onConflict: "user_id" }
      );
    }
  }

  // Revoke Pro when subscription ends
  if (event === "subscription_cancelled" || event === "subscription_expired") {
    await supabase.from("usage").upsert(
      { user_id: userId, plan_status: "free" },
      { onConflict: "user_id" }
    );
  }

  return NextResponse.json({ received: true });
}
