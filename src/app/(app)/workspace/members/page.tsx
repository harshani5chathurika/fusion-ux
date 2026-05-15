import { Metadata } from "next";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { MembersClient } from "@/components/workspace/MembersClient";
import { CreateWorkspaceFallback } from "@/components/workspace/CreateWorkspaceFallback";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Team Members" };

export default async function MembersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();

  const { data: currentMembership } = await admin
    .from("organization_members")
    .select("organization_id, role")
    .eq("user_id", user.id)
    .single();

  if (!currentMembership) {
    return <CreateWorkspaceFallback />;
  }

  // Fetch members
  const { data: memberships } = await admin
    .from("organization_members")
    .select("id, user_id, role, joined_at")
    .eq("organization_id", currentMembership.organization_id)
    .order("joined_at", { ascending: true });

  // Fetch profiles + auth users separately to avoid FK join issues
  const memberUserIds = (memberships ?? []).map((m) => m.user_id);

  const [{ data: profiles }, { data: { users: authUsers } }] = await Promise.all([
    memberUserIds.length > 0
      ? admin.from("profiles").select("id, email, full_name, avatar_url, job_title").in("id", memberUserIds)
      : Promise.resolve({ data: [] }),
    memberUserIds.length > 0
      ? admin.auth.admin.listUsers()
      : Promise.resolve({ data: { users: [] } }),
  ]);

  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));
  const authUserMap = Object.fromEntries((authUsers ?? []).map((u) => [u.id, u]));

  const members = (memberships ?? []).map((m) => {
    const profile = profileMap[m.user_id];
    const authUser = authUserMap[m.user_id];
    return {
      ...m,
      profile: {
        id: m.user_id,
        email: profile?.email ?? authUser?.email ?? "",
        full_name: profile?.full_name ?? null,
        avatar_url: profile?.avatar_url ?? null,
        job_title: profile?.job_title ?? null,
      },
    };
  });

  return (
    <MembersClient
      initialMembers={members as any}
      currentUserId={user.id}
      isAdmin={currentMembership.role === "admin"}
    />
  );
}
