import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

function makeSupabase() {
  const cookieStore = cookies();
  return createServerClient(
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
}

const FREE_DAILY_LIMIT = 2;

export async function GET() {
  const supabase = makeSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: row } = await supabase
    .from("usage")
    .select("fixes_today, last_reset, plan_status")
    .eq("user_id", user.id)
    .single();

  if (!row) {
    return NextResponse.json({ fixes_today: 0, plan_status: "free", remaining: FREE_DAILY_LIMIT, limit: FREE_DAILY_LIMIT });
  }

  const isNewDay = (Date.now() - new Date(row.last_reset).getTime()) > 86_400_000;
  const fixesToday = isNewDay ? 0 : (row.fixes_today ?? 0);
  const plan = row.plan_status ?? "free";

  return NextResponse.json({
    fixes_today: fixesToday,
    plan_status: plan,
    remaining: plan === "pro" ? null : Math.max(0, FREE_DAILY_LIMIT - fixesToday),
    limit: FREE_DAILY_LIMIT,
  });
}
