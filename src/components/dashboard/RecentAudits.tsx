import Link from "next/link";
import { ArrowRight, Globe, Image, FileSearch } from "lucide-react";
import { formatRelative } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

interface Audit {
  id: string;
  name: string;
  status: string;
  overall_score: number | null;
  created_at: string;
  audit_type: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "text-muted-foreground" },
  in_progress: { label: "In Progress", color: "text-blue-600" },
  ai_analyzing: { label: "Analyzing", color: "text-violet-600" },
  review: { label: "In Review", color: "text-orange-600" },
  completed: { label: "Completed", color: "text-green-600" },
  archived: { label: "Archived", color: "text-muted-foreground" },
};

export function RecentAudits({ audits }: { audits: Audit[] }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Recent Audits</h3>
        <Link
          href="/audits"
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          View all
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {audits.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No audits yet
        </div>
      ) : (
        <ul className="space-y-3">
          {audits.map((audit) => {
            const statusConfig = STATUS_CONFIG[audit.status] ?? STATUS_CONFIG.draft;
            const TypeIcon = audit.audit_type === "url" ? Globe : audit.audit_type === "image" ? Image : FileSearch;
            const scoreColor =
              audit.overall_score === null ? "text-muted-foreground" :
              audit.overall_score >= 80 ? "text-green-600" :
              audit.overall_score >= 60 ? "text-yellow-600" :
              audit.overall_score >= 40 ? "text-orange-600" :
              "text-red-600";

            return (
              <li key={audit.id}>
                <Link
                  href={`/audits/${audit.id}`}
                  className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-accent transition-colors group"
                >
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TypeIcon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                      {audit.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={cn("text-xs font-medium", statusConfig.color)}>
                        {statusConfig.label}
                      </span>
                      <span className="text-muted-foreground text-xs">·</span>
                      <span className="text-xs text-muted-foreground">
                        {formatRelative(audit.created_at)}
                      </span>
                    </div>
                  </div>
                  {audit.overall_score !== null && (
                    <div className="text-right flex-shrink-0">
                      <p className={cn("text-sm font-bold", scoreColor)}>
                        {audit.overall_score}
                      </p>
                      <p className="text-xs text-muted-foreground">/100</p>
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
