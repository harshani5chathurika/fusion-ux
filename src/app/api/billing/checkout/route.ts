import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { lemonSqueezySetup, createCheckout } from "@lemonsqueezy/lemonsqueezy.js";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setAll(list: any[]) { list.forEach(({ name, value, options }: any) => cookieStore.set(name, value, options)); },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { billing } = await request.json() as { billing: "monthly" | "yearly" };

  const variantId = billing === "yearly"
    ? process.env.LEMONSQUEEZY_YEARLY_VARIANT_ID!
    : process.env.LEMONSQUEEZY_MONTHLY_VARIANT_ID!;

  lemonSqueezySetup({ apiKey: process.env.LEMONSQUEEZY_API_KEY! });

  const { data, error } = await createCheckout(
    process.env.LEMONSQUEEZY_STORE_ID!,
    variantId,
    {
      checkoutOptions: { embed: true, media: false, logo: true },
      checkoutData: {
        email: user.email ?? undefined,
        custom: { user_id: user.id },
      },
      productOptions: {
        redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        receiptThankYouNote: "Thank you for upgrading to Fusion UX Pro!",
      },
    }
  );

  if (error || !data?.data?.attributes?.url) {
    console.error("LS checkout error:", error);
    return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 });
  }

  return NextResponse.json({ url: data.data.attributes.url });
}
