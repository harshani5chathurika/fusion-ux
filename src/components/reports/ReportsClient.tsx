"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  FileText,
  Download,
  Loader2,
  Plus,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  Zap,
} from "lucide-react";
import { formatDate, formatRelative, formatScore, getScoreColor } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

interface Audit {
  id: string;
  name: string;
  status: string;
  overall_score: number | null;
  created_at: string;
  findings_count: number;
  critical_count: number;
  high_count: number;
}

interface Report {
  id: string;
  name: string;
  status: string;
  file_url: string | null;
  pdf_base64?: string;
  filename?: string;
  created_at: string;
  generated_at: string | null;
  audits: { name: string } | null;
}

interface ReportsClientProps {
  audits: Audit[];
  reports: Report[];
}

export function ReportsClient({ audits, reports: initialReports }: ReportsClientProps) {
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"generate" | "history">("generate");

  function downloadBase64PDF(base64: string, filename: string) {
    const byteChars = atob(base64);
    const byteNums = new Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) byteNums[i] = byteChars.charCodeAt(i);
    const blob = new Blob([new Uint8Array(byteNums)], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function generateReport(auditId: string, auditName: string) {
    setGeneratingFor(auditId);
    try {
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audit_id: auditId }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Generation failed");

      const { pdf_base64, filename, file_url, report_id } = data.data;

      // Trigger download immediately from base64
      if (pdf_base64) downloadBase64PDF(pdf_base64, filename);

      toast.success("Report downloaded!", {
        description: "Your PDF report has been saved to your downloads folder.",
      });

      setReports((prev) => [
        {
          id: report_id ?? auditId,
          name: `${auditName} — UX Report`,
          status: "ready",
          file_url: file_url ?? null,
          pdf_base64,
          filename,
          created_at: new Date().toISOString(),
          generated_at: new Date().toISOString(),
          audits: { name: auditName },
        },
        ...prev,
      ]);
      setActiveTab("history");
    } catch (error) {
      toast.error("Failed to generate report", {
        description: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setGeneratingFor(null);
    }
  }

  const STATUS_ICON = {
    generating: <Loader2 className="h-4 w-4 animate-spin text-violet-600" />,
    ready: <CheckCircle2 className="h-4 w-4 text-green-600" />,
    failed: <XCircle className="h-4 w-4 text-red-600" />,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Generate AI-powered enterprise PDF reports from your audits
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {(["generate", "history"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px",
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab === "generate" ? "Generate Report" : `Report History (${reports.length})`}
          </button>
        ))}
      </div>

      {activeTab === "generate" && (
        <div className="space-y-4">
          {audits.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-16 text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">No completed audits</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Complete an audit first to generate a report
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {audits.map((audit) => (
                <div
                  key={audit.id}
                  className="rounded-xl border border-border bg-card p-5 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{audit.name}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{formatDate(audit.created_at)}</span>
                        <span>·</span>
                        <span className={cn("font-medium", getScoreColor(audit.overall_score ?? 0))}>
                          Score: {formatScore(audit.overall_score)}
                        </span>
                        <span>·</span>
                        <span className="text-red-600 font-medium">{audit.critical_count} critical</span>
                        <span>·</span>
                        <span>{audit.findings_count} total findings</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => generateReport(audit.id, audit.name)}
                    disabled={generatingFor === audit.id}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium flex-shrink-0",
                      "bg-primary text-primary-foreground hover:opacity-90 transition-opacity",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    {generatingFor === audit.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating…
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4" />
                        Generate PDF
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* AI Report features info */}
          <div className="rounded-xl border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/30 p-5">
            <h3 className="text-sm font-semibold text-violet-800 dark:text-violet-200 mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              What&apos;s included in the AI Report
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                "Executive Summary (AI-generated)",
                "UX Score & Accessibility Score",
                "Full Severity Matrix",
                "All Critical & High Findings",
                "AI Recommendations per finding",
                "Business Impact Analysis",
                "ROI & Revenue Risk Assessment",
                "90-Day Improvement Roadmap",
                "Human-verified Findings",
                "Heuristic Framework Appendix",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-xs text-violet-700 dark:text-violet-300">
                  <CheckCircle2 className="h-3 w-3 flex-shrink-0" />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div className="space-y-3">
          {reports.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-16 text-center space-y-4">
              <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto">
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">No reports generated yet</p>
            </div>
          ) : (
            reports.map((report) => (
              <div
                key={report.id}
                className="rounded-xl border border-border bg-card p-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{report.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {STATUS_ICON[report.status as keyof typeof STATUS_ICON] ?? STATUS_ICON.generating}
                      <span className="text-xs text-muted-foreground capitalize">{report.status}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">
                        {formatRelative(report.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {report.status === "ready" && (
                  <div className="flex items-center gap-2">
                    {report.file_url && (
                      <a href={report.file_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border hover:bg-accent transition-colors">
                        <ExternalLink className="h-3 w-3" />
                        Preview
                      </a>
                    )}
                    <button
                      onClick={() => {
                        if (report.pdf_base64 && report.filename) {
                          downloadBase64PDF(report.pdf_base64, report.filename);
                        } else if (report.file_url) {
                          window.open(report.file_url, "_blank");
                        }
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                    >
                      <Download className="h-3 w-3" />
                      Download PDF
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
