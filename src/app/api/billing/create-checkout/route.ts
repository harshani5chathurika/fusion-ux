import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-04-22.dahlia" });

const PLANS = {
  credits_5: {
    name: "5 AI Fix Credits",
    amount: 5000, // $50 in cents
    credits: 5,
    mode: "payment" as const,
  },
  pro_monthly: {
    name: "Fusion UX Pro — Monthly",
    amount: 9900, // $99 in cents
    mode: "subscription" as const,
  },
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

    const { plan } = await request.json();
    const planConfig = PLANS[plan as keyof typeof PLANS];
    if (!planConfig) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

    // Get org ID for metadata
    const { data: member } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .single();

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: planConfig.mode,
      customer_email: user.email,
      metadata: {
        user_id: user.id,
        org_id: member?.organization_id ?? "",
        plan,
      },
      success_url: `${appUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/billing/cancelled`,
    };

    if (planConfig.mode === "payment") {
      sessionParams.line_items = [{
        price_data: {
          currency: "usd",
          product_data: { name: planConfig.name },
          unit_amount: planConfig.amount,
        },
        quantity: 1,
      }];
    } else {
      sessionParams.line_items = [{
        price_data: {
          currency: "usd",
          product_data: { name: planConfig.name },
          unit_amount: planConfig.amount,
          recurring: { interval: "month" },
        },
        quantity: 1,
      }];
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("create-checkout error:", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 });
  }
}
