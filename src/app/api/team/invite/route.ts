import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { email, role } = await request.json();
    if (!email || !role) return NextResponse.json({ error: "email and role are required" }, { status: 400 });

    const validRoles = ["admin", "ux_researcher", "ui_designer", "business_analyst", "qa_engineer", "developer", "product_manager", "viewer"];
    if (!validRoles.includes(role)) return NextResponse.json({ error: "Invalid role" }, { status: 400 });

    // Use admin client everywhere to bypass RLS
    const admin = createAdminClient();

    const { data: member } = await admin
      .from("organization_members")
      .select("organization_id, role")
      .eq("user_id", user.id)
      .single();

    if (!member) return NextResponse.json({ error: "You are not part of an organization" }, { status: 403 });
    if (member.role !== "admin") return NextResponse.json({ error: "Only admins can invite members" }, { status: 403 });

    // Send invite email via Supabase Auth
    const { data: inviteData, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { invited_to_org: member.organization_id, invited_role: role },
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/auth/callback?next=/workspace/members`,
    });

    if (inviteError) {
      // User already exists — find them and add directly
      if (inviteError.message?.includes("already been registered")) {
        const { data: { users } } = await admin.auth.admin.listUsers();
        const existing = users.find((u) => u.email === email);
        if (existing) {
          await admin.from("organization_members").upsert({
            organization_id: member.organization_id,
            user_id: existing.id,
            role,
          }, { onConflict: "organization_id,user_id" });
          return NextResponse.json({ data: { message: "User added to workspace", email } });
        }
      }
      return NextResponse.json({ error: inviteError.message }, { status: 500 });
    }

    // Add invited user to org
    if (inviteData.user) {
      await admin.from("organization_members").upsert({
        organization_id: member.organization_id,
        user_id: inviteData.user.id,
        role,
      }, { onConflict: "organization_id,user_id" });
    }

    return NextResponse.json({ data: { message: "Invitation sent", email } });
  } catch (error) {
    console.error("Invite error:", error);
    return NextResponse.json({ error: "Failed to send invitation" }, { status: 500 });
  }
}
