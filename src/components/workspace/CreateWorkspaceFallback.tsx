"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Users, Loader2, Plus } from "lucide-react";

export function CreateWorkspaceFallback() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function createWorkspace() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/team/create-org", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed");
      toast.success("Workspace created!");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create workspace");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Team Members</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your workspace members and roles</p>
      </div>
      <div className="rounded-2xl border border-dashed border-border p-16 text-center space-y-4">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
          <Users className="h-8 w-8 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold">You don't have a workspace yet</p>
          <p className="text-xs text-muted-foreground mt-1">Create one to start inviting team members.</p>
        </div>
        <button
          onClick={createWorkspace}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Create Workspace
        </button>
      </div>
    </div>
  );
}
