"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  Edit3,
  ChevronRight,
  ExternalLink,
  Folder,
  FolderOpen,
} from "lucide-react";
import { formatRelative } from "@/lib/utils/format";
import { SEVERITY_CONFIG } from "@/types";
import type { SeverityLevel } from "@/types";
import { cn } from "@/lib/utils/cn";

interface Finding {
  id: string;
  title: string;
  description: string | null;
  severity: SeverityLevel;
  status: string;
  verification_status: string;
  heuristic_category: string | null;
  heuristic_item_id: string | null;
  location: string | null;
  impact_score: number | null;
  frequency_score: number | null;
  priority_score: number | null;
  ai_generated: boolean;
  ai_suggestion: string | null;
  business_impact: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
  audits: { id: string; name: string } | null;
}

const VERIFICATION_CONFIG: Record<string, { icon: JSX.Element; label: string; color: string }> = {
  pending: { icon: <Clock className="h-3.5 w-3.5" />, label: "Pending", color: "text-muted-foreground" },
  verified: { icon: <CheckCircle2 className="h-3.5 w-3.5" />, label: "Verified", color: "text-green-600" },
  edited: { icon: <Edit3 className="h-3.5 w-3.5" />, label: "Edited", color: "text-blue-600" },
  rejected: { icon: <XCircle className="h-3.5 w-3.5" />, label: "Rejected", color: "text-red-600" },
};

const SEVERITY_ORDER: SeverityLevel[] = ["critical", "high", "medium", "low"];

const SEVERITY_SECTION_STYLE: Record<SeverityLevel, { dot: string; label: string; bg: string; border: string }> = {
  critical: { dot: "bg-red-500", label: "Critical", bg: "bg-red-50 dark:bg-red-950/20", border: "border-red-200 dark:border-red-800" },
  high:     { dot: "bg-orange-500", label: "High", bg: "bg-orange-50 dark:bg-orange-950/20", border: "border-orange-200 dark:border-orange-800" },
  medium:   { dot: "bg-yellow-500", label: "Medium", bg: "bg-yellow-50 dark:bg-yellow-950/20", border: "border-yellow-200 dark:border-yellow-800" },
  low:      { dot: "bg-blue-400", label: "Low", bg: "bg-blue-50 dark:bg-blue-950/20", border: "border-blue-200 dark:border-blue-800" },
};

export function FindingsClient({ findings }: { findings: Finding[] }) {
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [verificationFilter, setVerificationFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [collapsedAudits, setCollapsedAudits] = useState<Set<string>>(new Set());
  const [collapsedSeverities, setCollapsedSeverities] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    return findings.filter((f) => {
      const matchSearch =
        !search ||
        f.title.toLowerCase().includes(search.toLowerCase()) ||
        (f.heuristic_category ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (f.location ?? "").toLowerCase().includes(search.toLowerCase());
      const matchSeverity = severityFilter === "all" || f.severity === severityFilter;
      const matchVerification = verificationFilter === "all" || f.verification_status === verificationFilter;
      return matchSearch && matchSeverity && matchVerification;
    });
  }, [findings, search, severityFilter, verificationFilter]);

  // Group: audit → severity → findings
  const grouped = useMemo(() => {
    const auditMap = new Map<string, { auditId: string; auditName: string; bySeverity: Map<SeverityLevel, Finding[]> }>();
    for (const f of filtered) {
      const key = f.audits?.id ?? "__none__";
      const name = f.audits?.name ?? "Unassigned";
      if (!auditMap.has(key)) {
        auditMap.set(key, { auditId: key, auditName: name, bySeverity: new Map() });
      }
      const group = auditMap.get(key)!;
      if (!group.bySeverity.has(f.severity)) group.bySeverity.set(f.severity, []);
      group.bySeverity.get(f.severity)!.push(f);
    }
    return Array.from(auditMap.values());
  }, [filtered]);

  const counts = {
    critical: findings.filter((f) => f.severity === "critical").length,
    high: findings.filter((f) => f.severity === "high").length,
    medium: findings.filter((f) => f.severity === "medium").length,
    low: findings.filter((f) => f.severity === "low").length,
    pending: findings.filter((f) => f.verification_status === "pending").length,
    verified: findings.filter((f) => f.verification_status === "verified").length,
  };

  function toggleAudit(id: string) {
    setCollapsedAudits((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSeverity(key: string) {
    setCollapsedSeverities((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Findings</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {findings.length} issues across {grouped.length} audit{grouped.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Critical", count: counts.critical, color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/30" },
          { label: "High", count: counts.high, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-950/30" },
          { label: "Pending Review", count: counts.pending, color: "text-muted-foreground", bg: "bg-muted" },
          { label: "Verified", count: counts.verified, color: "text-green-600", bg: "bg-green-50 dark:bg-green-950/30" },
        ].map((stat) => (
          <div key={stat.label} className={cn("rounded-xl p-4", stat.bg)}>
            <p className={cn("text-2xl font-bold", stat.color)}>{stat.count}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search findings…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">All Severities</option>
          <option value="critical">Critical ({counts.critical})</option>
          <option value="high">High ({counts.high})</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select
          value={verificationFilter}
          onChange={(e) => setVerificationFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending ({counts.pending})</option>
          <option value="verified">Verified ({counts.verified})</option>
          <option value="edited">Edited</option>
          <option value="rejected">Rejected</option>
        </select>
        {(search || severityFilter !== "all" || verificationFilter !== "all") && (
          <span className="text-xs text-muted-foreground">Showing {filtered.length} of {findings.length}</span>
        )}
      </div>

      {/* Folder tree */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <AlertTriangle className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No findings match your filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {grouped.map(({ auditId, auditName, bySeverity }) => {
            const auditCollapsed = collapsedAudits.has(auditId);
            const totalInAudit = Array.from(bySeverity.values()).reduce((s, arr) => s + arr.length, 0);

            return (
              <div key={auditId} className="rounded-xl border border-border bg-card overflow-hidden">
                {/* ── Audit folder header ── */}
                <button
                  onClick={() => toggleAudit(auditId)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                >
                  {auditCollapsed
                    ? <Folder className="h-4 w-4 text-violet-500 flex-shrink-0" />
                    : <FolderOpen className="h-4 w-4 text-violet-500 flex-shrink-0" />
                  }
                  <span className="font-semibold text-sm flex-1 truncate">{auditName}</span>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full mr-1">
                    {totalInAudit} finding{totalInAudit !== 1 ? "s" : ""}
                  </span>
                  {auditId !== "__none__" && (
                    <Link
                      href={`/audits/${auditId}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs text-primary hover:underline flex items-center gap-1 mr-2"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Open
                    </Link>
                  )}
                  <ChevronRight className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform flex-shrink-0",
                    !auditCollapsed && "rotate-90"
                  )} />
                </button>

                {/* ── Severity sub-folders ── */}
                {!auditCollapsed && (
                  <div className="border-t border-border divide-y divide-border">
                    {SEVERITY_ORDER.filter((sev) => bySeverity.has(sev)).map((sev) => {
                      const sevFindings = bySeverity.get(sev)!;
                      const style = SEVERITY_SECTION_STYLE[sev];
                      const sevKey = `${auditId}:${sev}`;
                      const sevCollapsed = collapsedSeverities.has(sevKey);

                      return (
                        <div key={sev}>
                          {/* Severity header */}
                          <button
                            onClick={() => toggleSeverity(sevKey)}
                            className={cn(
                              "w-full flex items-center gap-2.5 px-4 py-2.5 text-left hover:bg-muted/30 transition-colors",
                              style.bg
                            )}
                          >
                            <span className={cn("w-2 h-2 rounded-full flex-shrink-0", style.dot)} />
                            <span className="text-xs font-semibold flex-1">{style.label}</span>
                            <span className="text-xs text-muted-foreground">{sevFindings.length}</span>
                            <ChevronRight className={cn(
                              "h-3.5 w-3.5 text-muted-foreground transition-transform flex-shrink-0",
                              !sevCollapsed && "rotate-90"
                            )} />
                          </button>

                          {/* Findings inside severity */}
                          {!sevCollapsed && (
                            <div className="divide-y divide-border/60">
                              {sevFindings.map((finding) => {
                                const severityConfig = SEVERITY_CONFIG[finding.severity];
                                const verConfig = VERIFICATION_CONFIG[finding.verification_status] ?? VERIFICATION_CONFIG.pending;
                                const isExpanded = expandedId === finding.id;

                                return (
                                  <div key={finding.id} className="bg-background">
                                    <button
                                      className="w-full text-left px-5 py-3 hover:bg-muted/20 transition-colors"
                                      onClick={() => setExpandedId(isExpanded ? null : finding.id)}
                                    >
                                      <div className="flex items-start gap-3">
                                        <span className={cn(
                                          "text-[10px] font-bold px-1.5 py-0.5 rounded border flex-shrink-0 mt-0.5",
                                          severityConfig.bg, severityConfig.color, severityConfig.border
                                        )}>
                                          {severityConfig.label.toUpperCase()}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium leading-snug">{finding.title}</p>
                                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                                            {finding.heuristic_category && <span>{finding.heuristic_category}</span>}
                                            {finding.location && (
                                              <><span>·</span><span>📍 {finding.location}</span></>
                                            )}
                                            <span>·</span>
                                            <span>{formatRelative(finding.created_at)}</span>
                                          </div>
                                        </div>
                                        <div className={cn("flex items-center gap-1 flex-shrink-0", verConfig.color)}>
                                          {verConfig.icon}
                                          <span className="text-xs hidden sm:block">{verConfig.label}</span>
                                        </div>
                                        <ChevronRight className={cn(
                                          "h-4 w-4 text-muted-foreground transition-transform flex-shrink-0",
                                          isExpanded && "rotate-90"
                                        )} />
                                      </div>
                                    </button>

                                    {isExpanded && (
                                      <div className="px-5 pb-4 pt-3 border-t border-border/60 space-y-3 bg-muted/10">
                                        {finding.description && (
                                          <p className="text-sm text-muted-foreground leading-relaxed">{finding.description}</p>
                                        )}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                          {finding.ai_suggestion && (
                                            <div className="rounded-lg bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 p-3">
                                              <p className="text-xs font-semibold text-violet-700 dark:text-violet-300 mb-1">AI Recommendation</p>
                                              <p className="text-xs text-violet-800 dark:text-violet-200 leading-relaxed">{finding.ai_suggestion}</p>
                                            </div>
                                          )}
                                          {finding.business_impact && (
                                            <div className="rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 p-3">
                                              <p className="text-xs font-semibold text-orange-700 dark:text-orange-300 mb-1">Business Impact</p>
                                              <p className="text-xs text-orange-800 dark:text-orange-200 leading-relaxed">{finding.business_impact}</p>
                                            </div>
                                          )}
                                        </div>
                                        <Link
                                          href={`/audits/${finding.audits?.id}`}
                                          className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                                        >
                                          <ExternalLink className="h-3 w-3" />
                                          Review in audit workspace
                                        </Link>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
