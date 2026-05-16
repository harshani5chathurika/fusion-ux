"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Globe, ImageIcon, FileSearch, ArrowRight, MoreVertical,
  Archive, Trash2, RotateCcw, Figma,
} from "lucide-react";
import { formatDate, formatScore, getScoreColor } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

function getDayGroup(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.floor((todayStart.getTime() - new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()) / 86_400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays <= 6) return "This Week";
  if (diffDays <= 29) return "This Month";
  return "Older";
}

const GROUP_ORDER = ["Today", "Yesterday", "This Week", "This Month", "Older"];

interface Audit {
  id: string;
  name: string;
  status: string;
  audit_type: string;
  overall_score: number | null;
  target_url: string | null;
  critical_count: number;
  high_count: number;
  medium_count: number;
  created_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  draft: { label: "Draft", color: "text-muted-foreground", dot: "bg-muted-foreground" },
  in_progress: { label: "In Progress", color: "text-blue-600", dot: "bg-blue-500" },
  ai_analyzing: { label: "Analyzing", color: "text-violet-600", dot: "bg-violet-500" },
  review: { label: "In Review", color: "text-orange-600", dot: "bg-orange-500" },
  completed: { label: "Completed", color: "text-green-600", dot: "bg-green-500" },
  archived: { label: "Archived", color: "text-muted-foreground", dot: "bg-muted-foreground" },
};

const TYPE_ICON: Record<string, React.ElementType> = {
  url: Globe,
  image: ImageIcon,
  full: FileSearch,
  figma: Figma,
};

function ConfirmDialog({
  message, onConfirm, onCancel,
}: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-background border border-border rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4 space-y-4">
        <p className="text-sm font-medium">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-accent">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 px-4 py-2 rounded-xl bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export function AuditsList({ initialAudits }: { initialAudits: Audit[] }) {
  const router = useRouter();
  const [audits, setAudits] = useState(initialAudits);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ type: "delete" | "archive" | "restore"; id: string } | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<string, Audit[]>();
    for (const audit of audits) {
      const group = getDayGroup(audit.created_at);
      if (!map.has(group)) map.set(group, []);
      map.get(group)!.push(audit);
    }
    return GROUP_ORDER.filter((g) => map.has(g)).map((g) => ({ label: g, audits: map.get(g)! }));
  }, [audits]);

  async function handleAction(type: "delete" | "archive" | "restore", id: string) {
    setConfirm(null);
    setOpenMenu(null);

    if (type === "delete") {
      const res = await fetch(`/api/audits/${id}`, { method: "DELETE" });
      if (res.ok) {
        setAudits((prev) => prev.filter((a) => a.id !== id));
        toast.success("Audit deleted");
      } else {
        toast.error("Failed to delete audit");
      }
    } else {
      const status = type === "archive" ? "archived" : "review";
      const res = await fetch(`/api/audits/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setAudits((prev) => prev.map((a) => a.id === id ? { ...a, status } : a));
        toast.success(type === "archive" ? "Audit archived" : "Audit restored");
      } else {
        toast.error(`Failed to ${type} audit`);
      }
    }
  }

  return (
    <>
      {confirm && (
        <ConfirmDialog
          message={
            confirm.type === "delete"
              ? "Permanently delete this audit and all its findings? This cannot be undone."
              : confirm.type === "archive"
              ? "Archive this audit? You can restore it later."
              : "Restore this audit to In Review status?"
          }
          onConfirm={() => handleAction(confirm.type, confirm.id)}
          onCancel={() => setConfirm(null)}
        />
      )}

      <div className="space-y-6">
        {grouped.map(({ label, audits: groupAudits }) => (
          <div key={label}>
            {/* Day label */}
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{label}</span>
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">{groupAudits.length}</span>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Audit</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Score</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Issues</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Created</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {groupAudits.map((audit) => {
                      const statusConfig = STATUS_CONFIG[audit.status] ?? STATUS_CONFIG.draft;
                      const TypeIcon = TYPE_ICON[audit.audit_type] ?? FileSearch;
                      const isArchived = audit.status === "archived";

                      return (
                        <tr key={audit.id} className={cn("hover:bg-muted/30 transition-colors group", isArchived && "opacity-60")}>
                          <td className="px-4 py-3.5">
                            <p className="font-medium text-sm group-hover:text-primary transition-colors">{audit.name}</p>
                            {audit.target_url && (
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">{audit.target_url}</p>
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <TypeIcon className="h-3.5 w-3.5" />
                              <span className="text-xs capitalize">{audit.audit_type}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1.5">
                              <div className={cn("w-1.5 h-1.5 rounded-full", statusConfig.dot)} />
                              <span className={cn("text-xs font-medium", statusConfig.color)}>{statusConfig.label}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={cn("font-bold text-sm", getScoreColor(audit.overall_score ?? 0))}>
                              {formatScore(audit.overall_score)}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1">
                              {audit.critical_count > 0 && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400">
                                  {audit.critical_count}C
                                </span>
                              )}
                              {audit.high_count > 0 && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400">
                                  {audit.high_count}H
                                </span>
                              )}
                              {audit.medium_count > 0 && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400">
                                  {audit.medium_count}M
                                </span>
                              )}
                              {audit.critical_count === 0 && audit.high_count === 0 && audit.medium_count === 0 && (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-xs text-muted-foreground">{formatDate(audit.created_at)}</td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {!isArchived && (
                                <Link href={`/audits/${audit.id}`}
                                  className="flex items-center gap-1 text-xs text-primary hover:underline">
                                  Review <ArrowRight className="h-3 w-3" />
                                </Link>
                              )}
                              <div className="relative">
                                <button
                                  onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === audit.id ? null : audit.id); }}
                                  className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-accent text-muted-foreground"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                                {openMenu === audit.id && (
                                  <>
                                    <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
                                    <div className="absolute right-0 top-8 z-20 w-44 bg-background border border-border rounded-xl shadow-lg overflow-hidden py-1">
                                      {!isArchived ? (
                                        <button
                                          onClick={() => setConfirm({ type: "archive", id: audit.id })}
                                          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors text-muted-foreground"
                                        >
                                          <Archive className="h-4 w-4" /> Archive
                                        </button>
                                      ) : (
                                        <button
                                          onClick={() => setConfirm({ type: "restore", id: audit.id })}
                                          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors text-muted-foreground"
                                        >
                                          <RotateCcw className="h-4 w-4" /> Restore
                                        </button>
                                      )}
                                      <button
                                        onClick={() => setConfirm({ type: "delete", id: audit.id })}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-destructive/10 transition-colors text-destructive"
                                      >
                                        <Trash2 className="h-4 w-4" /> Delete
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
