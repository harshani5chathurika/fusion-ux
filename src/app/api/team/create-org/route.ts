import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createAdminClient();

    // Check if already in an org
    const { data: existing } = await admin
      .from("organization_members")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (existing) return NextResponse.json({ data: { message: "Already in an org" } });

    // Create org
    const orgName = (user.email?.split("@")[0] ?? "My") + "'s Workspace";
    const orgSlug = orgName.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + user.id.slice(0, 6);

    const { data: org, error: orgError } = await admin
      .from("organizations")
      .insert({ name: orgName, slug: orgSlug })
      .select("id")
      .single();

    if (orgError) return NextResponse.json({ error: orgError.message }, { status: 500 });

    const { error: memberError } = await admin
      .from("organization_members")
      .insert({ organization_id: org.id, user_id: user.id, role: "admin" });

    if (memberError) return NextResponse.json({ error: memberError.message }, { status: 500 });

    return NextResponse.json({ data: { message: "Workspace created" } });
  } catch (e) {
    return NextResponse.json({ error: "Failed to create workspace" }, { status: 500 });
  }
}
