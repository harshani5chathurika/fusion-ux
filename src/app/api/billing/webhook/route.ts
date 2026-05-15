import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-04-22.dahlia" });

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (e) {
    console.error("Webhook signature failed:", e);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const admin = createAdminClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orgId = session.metadata?.org_id;
    const plan = session.metadata?.plan;

    if (!orgId || !plan) return NextResponse.json({ received: true });

    const { data: org } = await admin.from("organizations").select("ai_credits").eq("id", orgId).single();

    if (plan === "credits_5") {
      await admin.from("organizations")
        .update({ ai_credits: (org?.ai_credits ?? 0) + 5 })
        .eq("id", orgId);
    } else if (plan === "pro_monthly") {
      await admin.from("organizations")
        .update({ plan: "pro", ai_credits: 9999 })
        .eq("id", orgId);
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    // Downgrade to free when subscription cancelled
    const sessions = await stripe.checkout.sessions.list({ subscription: sub.id, limit: 1 });
    const orgId = sessions.data[0]?.metadata?.org_id;
    if (orgId) {
      await admin.from("organizations").update({ plan: "free", ai_credits: 0 }).eq("id", orgId);
    }
  }

  return NextResponse.json({ received: true });
}
