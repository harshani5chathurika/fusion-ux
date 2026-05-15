import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const PAYPAL_BASE = process.env.PAYPAL_MODE === "live"
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";

async function getPayPalToken() {
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = await res.json();
  return data.access_token as string;
}

const PRICES: Record<string, { amount: string; description: string }> = {
  credits_5: { amount: "50.00", description: "5 AI Fix Credits — Fusion UX" },
  pro_monthly: { amount: "99.00", description: "Fusion UX Pro — Monthly" },
};

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
            cookiesToSet.forEach(({ name, value, options }: any) => cookieStore.set(name, value, options));
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { plan, action, order_id } = await request.json();

    if (action === "create") {
      const price = PRICES[plan];
      if (!price) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

      const token = await getPayPalToken();
      const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [{
            amount: { currency_code: "USD", value: price.amount },
            description: price.description,
            custom_id: `${user.id}|${plan}`,
          }],
        }),
      });
      const order = await res.json();
      return NextResponse.json({ id: order.id });
    }

    if (action === "capture") {
      const token = await getPayPalToken();
      const captureRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${order_id}/capture`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const capture = await captureRes.json();
      if (capture.status === "COMPLETED") {
        await grantCredits(supabase, user.id, plan);
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ error: "Capture failed", details: capture }, { status: 400 });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e) {
    console.error("paypal-order error:", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function grantCredits(supabase: any, userId: string, plan: string) {
  const { data: member } = await supabase
    .from("organization_members")
    .select("organization_id, organizations(ai_credits)")
    .eq("user_id", userId)
    .single();

  if (!member) return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const org = (member as any).organizations;
  const orgId = member.organization_id;

  if (plan === "credits_5") {
    await supabase.from("organizations").update({ ai_credits: (org?.ai_credits ?? 0) + 5 }).eq("id", orgId);
  } else if (plan === "pro_monthly") {
    await supabase.from("organizations").update({ plan: "pro", ai_credits: 9999 }).eq("id", orgId);
  }
}
