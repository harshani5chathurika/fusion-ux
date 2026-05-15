"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Users, Mail, Plus, X, Loader2, Shield,
  Crown, Eye, Code2, TestTube2, BarChart3, Palette, Search, MoreHorizontal,
  Trash2, RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { createClient } from "@/lib/supabase/client";

type UserRole =
  | "admin"
  | "ux_researcher"
  | "ui_designer"
  | "business_analyst"
  | "qa_engineer"
  | "developer"
  | "product_manager"
  | "viewer";

interface Member {
  id: string;
  user_id: string;
  role: UserRole;
  joined_at: string;
  profile: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    job_title: string | null;
  } | null;
}

const ROLE_CONFIG: Record<UserRole, { label: string; icon: React.ElementType; color: string; bg: string; description: string }> = {
  admin: { label: "Admin", icon: Crown, color: "text-yellow-700 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-950/30", description: "Full access — can manage members, billing, and all audits" },
  ux_researcher: { label: "UX Researcher", icon: Search, color: "text-violet-700 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-950/30", description: "Can create and review audits, run analysis" },
  ui_designer: { label: "UI Designer", icon: Palette, color: "text-pink-700 dark:text-pink-400", bg: "bg-pink-50 dark:bg-pink-950/30", description: "Can view and annotate designs, add findings" },
  business_analyst: { label: "Business Analyst", icon: BarChart3, color: "text-blue-700 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/30", description: "Can view audits, access reports and analytics" },
  qa_engineer: { label: "QA Engineer", icon: TestTube2, color: "text-teal-700 dark:text-teal-400", bg: "bg-teal-50 dark:bg-teal-950/30", description: "Can review findings, verify and reject issues" },
  developer: { label: "Developer", icon: Code2, color: "text-green-700 dark:text-green-400", bg: "bg-green-50 dark:bg-green-950/30", description: "Can view audits and implement recommendations" },
  product_manager: { label: "Product Manager", icon: Shield, color: "text-orange-700 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/30", description: "Can manage audit scope, approve and close findings" },
  viewer: { label: "Viewer", icon: Eye, color: "text-muted-foreground", bg: "bg-muted", description: "Read-only access to audits and reports" },
};

const ROLES = Object.keys(ROLE_CONFIG) as UserRole[];

function RoleBadge({ role }: { role: UserRole }) {
  const cfg = ROLE_CONFIG[role];
  const Icon = cfg.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium", cfg.bg, cfg.color)}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

function Avatar({ name, email, avatarUrl, size = "md" }: { name: string | null; email: string; avatarUrl: string | null; size?: "sm" | "md" }) {
  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : email[0].toUpperCase();

  const sizeClass = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";

  if (avatarUrl) {
    return <img src={avatarUrl} alt={name ?? email} className={cn("rounded-full object-cover", sizeClass)} />;
  }

  return (
    <div className={cn("rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center flex-shrink-0", sizeClass)}>
      {initials}
    </div>
  );
}

function InviteModal({ onClose, onInvited }: { onClose: () => void; onInvited: () => void }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("ux_researcher");
  const [isLoading, setIsLoading] = useState(false);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), role }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to invite");
      toast.success(`Invitation sent to ${email.trim()}`);
      onInvited();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send invitation");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div>
            <h2 className="text-base font-bold">Invite a team member</h2>
            <p className="text-xs text-muted-foreground mt-0.5">They'll receive an email with a link to join your workspace.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-accent text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleInvite} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 space-y-5 overflow-y-auto flex-1">
            {/* Email input */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            {/* Role selector — inline grid, no dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map((r) => {
                  const cfg = ROLE_CONFIG[r];
                  const Icon = cfg.icon;
                  const isSelected = role === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={cn(
                        "flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all",
                        isSelected
                          ? cn("border-primary bg-primary/5 shadow-sm")
                          : "border-border hover:border-primary/40 hover:bg-accent/50"
                      )}
                    >
                      <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5", cfg.bg)}>
                        <Icon className={cn("h-3.5 w-3.5", cfg.color)} />
                      </div>
                      <div className="min-w-0">
                        <p className={cn("text-xs font-semibold", isSelected ? "text-primary" : "text-foreground")}>
                          {cfg.label}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{cfg.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Actions — pinned to bottom */}
          <div className="flex gap-2 px-6 py-4 border-t border-border flex-shrink-0">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-accent">
              Cancel
            </button>
            <button type="submit" disabled={isLoading || !email.trim()}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              Send Invite
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MemberRow({
  member,
  isCurrentUser,
  onRoleChange,
  onRemove,
}: {
  member: Member;
  isCurrentUser: boolean;
  onRoleChange: (memberId: string, role: UserRole) => Promise<void>;
  onRemove: (memberId: string) => Promise<void>;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const profile = member.profile;
  const displayName = profile?.full_name ?? profile?.email ?? "Unknown";
  const email = profile?.email ?? "";

  async function handleRoleChange(newRole: UserRole) {
    setRoleDropdownOpen(false);
    setIsUpdating(true);
    await onRoleChange(member.id, newRole);
    setIsUpdating(false);
  }

  return (
    <div className="flex items-center gap-4 py-3 px-4 hover:bg-accent/40 rounded-xl transition-colors group">
      <Avatar name={profile?.full_name ?? null} email={email} avatarUrl={profile?.avatar_url ?? null} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold truncate">{displayName}</p>
          {isCurrentUser && (
            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">You</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">{email}</p>
        {profile?.job_title && (
          <p className="text-xs text-muted-foreground/70 truncate">{profile.job_title}</p>
        )}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Role changer */}
        <div className="relative">
          <button
            onClick={() => !isCurrentUser && setRoleDropdownOpen((v) => !v)}
            disabled={isCurrentUser || isUpdating}
            className={cn(
              "transition-colors",
              !isCurrentUser && "hover:opacity-80 cursor-pointer"
            )}
          >
            {isUpdating ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-muted text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" /> Updating…
              </span>
            ) : (
              <RoleBadge role={member.role} />
            )}
          </button>

          {roleDropdownOpen && (
            <div className="absolute top-full right-0 mt-1 w-56 bg-background border border-border rounded-xl shadow-lg z-20 overflow-hidden">
              {ROLES.map((r) => {
                const cfg = ROLE_CONFIG[r];
                const Icon = cfg.icon;
                return (
                  <button
                    key={r}
                    onClick={() => handleRoleChange(r)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-accent text-sm",
                      member.role === r && "bg-primary/5"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", cfg.color)} />
                    <span className="font-medium">{cfg.label}</span>
                    {member.role === r && <span className="ml-auto text-primary text-xs">✓</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions menu */}
        {!isCurrentUser && (
          <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-accent text-muted-foreground"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {menuOpen && (
              <div className="absolute top-full right-0 mt-1 w-44 bg-background border border-border rounded-xl shadow-lg z-20 overflow-hidden">
                <button
                  onClick={() => { setMenuOpen(false); onRemove(member.id); }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove member
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function MembersClient({
  initialMembers,
  currentUserId,
  isAdmin,
}: {
  initialMembers: Member[];
  currentUserId: string;
  isAdmin: boolean;
}) {
  const supabase = createClient();
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = members.filter((m) => {
    const q = search.toLowerCase();
    return (
      m.profile?.full_name?.toLowerCase().includes(q) ||
      m.profile?.email?.toLowerCase().includes(q) ||
      m.role.toLowerCase().includes(q)
    );
  });

  async function handleRoleChange(memberId: string, role: UserRole) {
    const { error } = await supabase.from("organization_members").update({ role }).eq("id", memberId);
    if (error) { toast.error("Failed to update role"); return; }
    setMembers((prev) => prev.map((m) => m.id === memberId ? { ...m, role } : m));
    toast.success(`Role updated to ${ROLE_CONFIG[role].label}`);
  }

  async function handleRemove(memberId: string) {
    const { error } = await supabase.from("organization_members").delete().eq("id", memberId);
    if (error) { toast.error("Failed to remove member"); return; }
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    toast.success("Member removed");
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team Members</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {members.length} {members.length === 1 ? "member" : "members"} in your workspace
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 flex-shrink-0"
          >
            <Plus className="h-4 w-4" />
            Invite Member
          </button>
        )}
      </div>

      {/* Role legend */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Available Roles</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(["admin", "ux_researcher", "ui_designer", "viewer"] as UserRole[]).map((r) => (
            <div key={r} className={cn("rounded-xl p-3", ROLE_CONFIG[r].bg)}>
              <div className="flex items-center gap-1.5 mb-1">
                {(() => { const Icon = ROLE_CONFIG[r].icon; return <Icon className={cn("h-3.5 w-3.5", ROLE_CONFIG[r].color)} />; })()}
                <span className={cn("text-xs font-semibold", ROLE_CONFIG[r].color)}>{ROLE_CONFIG[r].label}</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-tight">{ROLE_CONFIG[r].description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Search */}
      {members.length > 3 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search members by name, email or role…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      )}

      {/* Members list */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            Members ({filtered.length})
          </p>
          {isAdmin && (
            <p className="text-xs text-muted-foreground">Click a role badge to change it</p>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {search ? "No members match your search" : "No members yet"}
            </p>
            {!search && isAdmin && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
              >
                <Mail className="h-4 w-4" />
                Invite your first teammate
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border/50 p-2">
            {filtered.map((member) => (
              <MemberRow
                key={member.id}
                member={member}
                isCurrentUser={member.user_id === currentUserId}
                onRoleChange={handleRoleChange}
                onRemove={handleRemove}
              />
            ))}
          </div>
        )}
      </div>

      {/* Non-admin notice */}
      {!isAdmin && (
        <div className="rounded-xl bg-muted/50 border border-border p-4 flex items-start gap-3">
          <Shield className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            Only workspace admins can invite members or change roles. Contact your admin to make changes.
          </p>
        </div>
      )}

      {/* Invite modal */}
      {showInviteModal && (
        <InviteModal
          onClose={() => setShowInviteModal(false)}
          onInvited={() => {}}
        />
      )}
    </div>
  );
}
