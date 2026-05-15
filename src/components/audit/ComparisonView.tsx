"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import Image from "next/image";
import {
  X, Upload, Loader2, CheckCircle2, XCircle, AlertTriangle,
  TrendingUp, DollarSign, ArrowLeft,
  Sparkles, Eye, FileText, Scale, Download, Copy, Wand2, Zap,
} from "lucide-react";
import { UpgradeModal } from "@/components/shared/UpgradeModal";
import { cn } from "@/lib/utils/cn";
import { SEVERITY_CONFIG } from "@/types";
import { createClient } from "@/lib/supabase/client";
import {
  useResolution, getROIImpactUSD,
  type ValidationResult,
} from "./ResolutionProvider";

// ── Lifecycle Steps ──────────────────────────────────────────────

const LIFECYCLE_STEPS = [
  { key: "suggested",   label: "Suggested",  desc: "AI detected" },
  { key: "verified",    label: "Verified",   desc: "Expert confirmed" },
  { key: "in_progress", label: "In Progress", desc: "Dev assigned" },
  { key: "resolved",    label: "Resolved",   desc: "Fix deployed" },
  { key: "validated",   label: "Validated ✓", desc: "AI confirmed" },
];

const STEP_INDEX: Record<string, number> = {
  open: 0, in_progress: 2, resolved: 3, validated: 4, ignored: -1,
  pending: 0, verified: 1, edited: 1, rejected: -1,
};

// ── Main Component ───────────────────────────────────────────────

interface ComparisonViewProps {
  auditId: string;
  findingStatus: string;
  verificationStatus: string;
  onValidated: (findingId: string, afterUrl: string, result: ValidationResult) => void;
}

export function ComparisonView({ auditId, findingStatus, verificationStatus, onValidated }: ComparisonViewProps) {
  const { comparingFinding, auditScreenshotUrl, validationResult, closeComparison, setValidationResult } = useResolution();
  const supabase = createClient();

  const [afterMode, setAfterMode] = useState<"upload" | "ai">(
    comparingFinding?.proposed_design_url ? "ai" : "upload"
  );
  const [afterUrl, setAfterUrl] = useState<string | null>(comparingFinding?.after_screenshot_url ?? null);
  const [afterPreview, setAfterPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // AI fix state
  const [isGenerating, setIsGenerating] = useState(false);
  const [proposedUrl, setProposedUrl] = useState<string | null>(comparingFinding?.proposed_design_url ?? null);
  const [figmaPrompt, setFigmaPrompt] = useState<string | null>(comparingFinding?.proposed_design_prompt ?? null);
  const [aiSpec, setAiSpec] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [planStatus, setPlanStatus] = useState<"free" | "pro">("free");
  const [showUpgrade, setShowUpgrade] = useState(false);

  // Load daily usage on mount
  useEffect(() => {
    fetch("/api/usage")
      .then((r) => r.json())
      .then((d) => {
        setRemaining(d.remaining ?? null);
        setPlanStatus(d.plan_status ?? "free");
      })
      .catch(() => {});
  }, []);

  const onDrop = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file || !comparingFinding) return;
    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const ext = file.name.split(".").pop() ?? "png";
      const path = `${user.id}/${auditId}/after_${comparingFinding.id}.${ext}`;
      const { error } = await supabase.storage
        .from("audit-screenshots")
        .upload(path, file, { upsert: true });
      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from("audit-screenshots").getPublicUrl(path);

      // Persist after_screenshot_url on finding
      await supabase.from("findings")
        .update({ after_screenshot_url: publicUrl })
        .eq("id", comparingFinding.id);

      setAfterUrl(publicUrl);
      setAfterPreview(URL.createObjectURL(file));
      toast.success("After screenshot uploaded");
    } catch (e) {
      toast.error("Upload failed", { description: e instanceof Error ? e.message : "Unknown error" });
    } finally {
      setIsUploading(false);
    }
  }, [comparingFinding, auditId, supabase]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  async function handleValidate() {
    if (!afterUrl || !comparingFinding) return;
    setIsValidating(true);
    try {
      const res = await fetch("/api/ai/validate-fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          finding_id: comparingFinding.id,
          before_screenshot_url: auditScreenshotUrl,
          after_screenshot_url: afterUrl,
          finding: {
            title: comparingFinding.title,
            description: comparingFinding.description,
            severity: comparingFinding.severity,
            heuristic_category: comparingFinding.heuristic_category,
            heuristic_item_id: comparingFinding.heuristic_item_id,
            wcag_criteria: comparingFinding.wcag_criteria,
            ai_suggestion: comparingFinding.ai_suggestion,
          },
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Validation failed");
      }
      const data = await res.json();
      const result: ValidationResult = data.result;
      setValidationResult(result);

      if (result.validated) {
        onValidated(comparingFinding.id, afterUrl, result);
        toast.success("Fix validated! ✅ UX Health Score updated.");
      } else {
        toast.warning("Fix not yet complete — see AI feedback below.");
      }
    } catch (e) {
      toast.error("AI validation error", { description: e instanceof Error ? e.message : "Unknown error" });
    } finally {
      setIsValidating(false);
    }
  }

  async function generateAiFix() {
    if (!comparingFinding) return;
    if (planStatus !== "pro" && remaining !== null && remaining <= 0) {
      setShowUpgrade(true);
      return;
    }
    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/generate-fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          finding_id: comparingFinding.id,
          audit_id: auditId,
          screenshot_url: auditScreenshotUrl,
          finding: {
            title: comparingFinding.title,
            description: comparingFinding.description,
            severity: comparingFinding.severity,
            heuristic_category: comparingFinding.heuristic_category,
            heuristic_item_id: comparingFinding.heuristic_item_id,
            ai_suggestion: comparingFinding.ai_suggestion,
          },
        }),
      });
      if (res.status === 402) {
        setShowUpgrade(true);
        return;
      }
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Generation failed");
      }
      const data = await res.json();
      setProposedUrl(data.proposed_design_url);
      setFigmaPrompt(data.figma_prompt);
      setAiSpec(data.specification);
      if (data.remaining !== undefined) setRemaining(data.remaining);
      toast.success("AI design generated! ✨");
    } catch (e) {
      toast.error("Generation failed", { description: e instanceof Error ? e.message : "Unknown error" });
    } finally {
      setIsGenerating(false);
    }
  }

  async function downloadImage(url: string, filename: string) {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
    } catch {
      toast.error("Download failed");
    }
  }

  if (!comparingFinding) return null;

  const sc = SEVERITY_CONFIG[comparingFinding.severity];
  const roi = getROIImpactUSD(comparingFinding);
  const currentStep = STEP_INDEX[findingStatus] ?? 0;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col overflow-hidden">
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-background flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={closeComparison}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Audit
          </button>
          <span className="text-border">|</span>
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">Validation Lab</span>
          </div>
          <span className={cn("text-xs font-bold px-2.5 py-1 rounded-lg border", sc.bg, sc.color, sc.border)}>
            {sc.icon} {sc.label.toUpperCase()}
          </span>
        </div>
        <button onClick={closeComparison} className="w-8 h-8 rounded-lg hover:bg-accent flex items-center justify-center text-muted-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* ── Lifecycle Progress ── */}
      <div className="px-6 py-3 border-b border-border bg-muted/30 flex-shrink-0">
        <div className="flex items-center gap-0 max-w-2xl">
          {LIFECYCLE_STEPS.map((step, idx) => {
            const done = idx < currentStep;
            const active = idx === currentStep;
            return (
              <div key={step.key} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1">
                  <div className={cn(
                    "w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all",
                    done ? "bg-green-500 border-green-500 text-white" :
                    active ? "bg-primary border-primary text-primary-foreground" :
                    "bg-background border-border text-muted-foreground"
                  )}>
                    {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : idx + 1}
                  </div>
                  <div className="text-center">
                    <p className={cn("text-[10px] font-semibold whitespace-nowrap", active ? "text-primary" : done ? "text-green-600" : "text-muted-foreground")}>
                      {step.label}
                    </p>
                  </div>
                </div>
                {idx < LIFECYCLE_STEPS.length - 1 && (
                  <div className={cn("flex-1 h-0.5 mb-4 mx-1 transition-all", done ? "bg-green-500" : "bg-border")} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Finding Header ── */}
      <div className="px-6 py-3 border-b border-border bg-background flex-shrink-0">
        <h2 className="font-semibold text-sm truncate">{comparingFinding.title}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {comparingFinding.heuristic_item_id} · {comparingFinding.heuristic_category}
          {comparingFinding.location && <> · 📍 {comparingFinding.location}</>}
        </p>
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 flex min-h-0 overflow-hidden">

        {/* LEFT — Before */}
        <div className="flex-1 flex flex-col border-r border-border min-w-0">
          <div className="px-4 py-2.5 bg-red-50 dark:bg-red-950/30 border-b border-red-200 dark:border-red-800 flex items-center gap-2 flex-shrink-0">
            <XCircle className="h-4 w-4 text-red-500" />
            <p className="text-xs font-bold text-red-700 dark:text-red-300">BEFORE — Original Failure State</p>
          </div>
          <div className="flex-1 overflow-auto bg-muted/20 flex items-start justify-center p-4">
            {auditScreenshotUrl ? (
              <div className="relative w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={auditScreenshotUrl}
                  alt="Before"
                  className="w-full h-auto rounded-lg border border-border shadow-sm"
                />
                {/* Highlight the failing area */}
                {comparingFinding.bounding_box && (
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      left: `${comparingFinding.bounding_box.x}%`,
                      top: `${comparingFinding.bounding_box.y}%`,
                      width: `${comparingFinding.bounding_box.width}%`,
                      height: `${comparingFinding.bounding_box.height}%`,
                      border: "3px solid #ef4444",
                      backgroundColor: "rgba(239,68,68,0.15)",
                      borderRadius: 4,
                      boxShadow: "0 0 0 4px rgba(239,68,68,0.2), 0 0 20px rgba(239,68,68,0.3)",
                    }}
                  >
                    <span className="absolute -top-6 left-0 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded whitespace-nowrap">
                      ❌ VIOLATION: {comparingFinding.heuristic_item_id}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
                <Eye className="h-10 w-10 opacity-30" />
                <p className="text-sm">No original screenshot available</p>
                <p className="text-xs">This finding was captured without a visual reference</p>
              </div>
            )}
          </div>
          {/* Before details */}
          <div className="p-4 border-t border-border space-y-2 flex-shrink-0 max-h-48 overflow-y-auto">
            <p className="text-xs font-semibold text-red-700 dark:text-red-300 uppercase tracking-wider">Original Violation</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{comparingFinding.description}</p>
            {comparingFinding.wcag_criteria && comparingFinding.wcag_criteria.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {comparingFinding.wcag_criteria.map((c) => (
                  <span key={c} className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    {c}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — After */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Tab header */}
          <div className="flex-shrink-0 border-b border-border">
            <div className="flex">
              <button
                onClick={() => setAfterMode("upload")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all",
                  afterMode === "upload"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Upload className="h-3.5 w-3.5" />
                Upload Fix
              </button>
              <button
                onClick={() => setAfterMode("ai")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all",
                  afterMode === "ai"
                    ? "border-violet-500 text-violet-600 dark:text-violet-400"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Wand2 className="h-3.5 w-3.5" />
                Generate AI Fix
                {planStatus !== "pro" && remaining !== null && (
                  <span className={cn(
                    "text-[9px] font-bold px-1.5 py-0.5 rounded-full",
                    remaining > 0 ? "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300" : "bg-red-100 dark:bg-red-900/40 text-red-600"
                  )}>
                    {remaining} left today
                  </span>
                )}
                {planStatus === "pro" && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300">PRO</span>
                )}
              </button>
            </div>
          </div>

          {/* AI VALIDATED badge (shown regardless of tab) */}
          {validationResult?.validated && (
            <div className="px-4 py-1.5 bg-green-50 dark:bg-green-950/30 border-b border-green-200 dark:border-green-800 flex items-center gap-2 flex-shrink-0">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              <span className="text-[10px] font-bold text-green-700 dark:text-green-300">AI VALIDATED ✓</span>
            </div>
          )}
          {/* Upload tab */}
          {afterMode === "upload" && (
            <div className="flex-1 overflow-auto bg-muted/20 p-4">
              {afterUrl ? (
                <div className="space-y-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={afterPreview ?? afterUrl}
                    alt="After"
                    className={cn(
                      "w-full h-auto rounded-lg border shadow-sm transition-all",
                      validationResult?.validated
                        ? "border-green-400 dark:border-green-600 shadow-green-200 dark:shadow-green-900"
                        : validationResult && !validationResult.validated
                        ? "border-orange-400 dark:border-orange-600"
                        : "border-border"
                    )}
                  />
                  {validationResult && (
                    <div className={cn(
                      "rounded-xl border p-4 space-y-3",
                      validationResult.validated
                        ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
                        : "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800"
                    )}>
                      <div className="flex items-center gap-2">
                        {validationResult.validated
                          ? <CheckCircle2 className="h-5 w-5 text-green-600" />
                          : <AlertTriangle className="h-5 w-5 text-orange-600" />
                        }
                        <p className={cn("font-bold text-sm", validationResult.validated ? "text-green-700 dark:text-green-300" : "text-orange-700 dark:text-orange-300")}>
                          {validationResult.validated ? "Fix Validated ✓" : "Fix Incomplete"}
                        </p>
                        <span className={cn("ml-auto text-xs font-bold px-2 py-0.5 rounded-full", validationResult.validated ? "bg-green-500 text-white" : "bg-orange-500 text-white")}>
                          {validationResult.confidence}% confidence
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed">{validationResult.explanation}</p>
                      {validationResult.passed_checks.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-green-700 dark:text-green-300 uppercase tracking-wider mb-1">Passed Checks</p>
                          {validationResult.passed_checks.map((c, i) => (
                            <div key={i} className="flex items-start gap-1.5 text-xs text-green-700 dark:text-green-300">
                              <CheckCircle2 className="h-3 w-3 mt-0.5 flex-shrink-0" />
                              {c}
                            </div>
                          ))}
                        </div>
                      )}
                      {validationResult.remaining_issues.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-orange-700 dark:text-orange-300 uppercase tracking-wider mb-1">Still Needs Work</p>
                          {validationResult.remaining_issues.map((issue, i) => (
                            <div key={i} className="flex items-start gap-1.5 text-xs text-orange-700 dark:text-orange-300">
                              <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                              {issue}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {!validationResult?.validated && (
                    <div {...getRootProps()} className="border border-dashed border-border rounded-xl p-3 text-center cursor-pointer hover:border-primary/50 hover:bg-accent/50 transition-all">
                      <input {...getInputProps()} />
                      <p className="text-xs text-muted-foreground">Upload a different after screenshot</p>
                    </div>
                  )}
                </div>
              ) : (
                <div {...getRootProps()} className={cn(
                  "h-full min-h-[300px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-4 cursor-pointer transition-all",
                  isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-accent/30"
                )}>
                  <input {...getInputProps()} />
                  {isUploading ? (
                    <><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="text-sm">Uploading…</p></>
                  ) : (
                    <>
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Upload className="h-7 w-7 text-primary" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold">{isDragActive ? "Drop here" : "Upload the fixed screenshot"}</p>
                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WebP · max 10MB</p>
                      </div>
                      <p className="text-xs text-muted-foreground max-w-xs text-center">
                        Capture a screenshot of the UI after the fix has been deployed
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* AI Generate tab */}
          {afterMode === "ai" && (
            <div className="flex-1 overflow-auto bg-muted/20 p-4">
              {proposedUrl ? (
                <div className="space-y-3">
                  <div className="rounded-xl overflow-hidden border border-violet-300 dark:border-violet-700 shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={proposedUrl} alt="AI Proposed Design" className="w-full h-auto" />
                  </div>

                  {aiSpec && (
                    <div className="rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 p-3">
                      <p className="text-[10px] font-bold text-violet-700 dark:text-violet-300 uppercase tracking-wider mb-1">AI Design Specification</p>
                      <p className="text-xs text-violet-800 dark:text-violet-200 leading-relaxed">{aiSpec}</p>
                    </div>
                  )}

                  {figmaPrompt && (
                    <div className="rounded-xl bg-muted border border-border p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Figma AI Prompt</p>
                        <button
                          onClick={() => { navigator.clipboard.writeText(figmaPrompt); toast.success("Prompt copied!"); }}
                          className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-background border border-border text-xs font-medium hover:bg-accent transition-colors"
                        >
                          <Copy className="h-3 w-3" />
                          Copy
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed font-mono">{figmaPrompt}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => downloadImage(proposedUrl, `ai-fix-${comparingFinding.id}.png`)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-border bg-background text-xs font-medium hover:bg-accent transition-colors"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download PNG
                    </button>
                    <button
                      onClick={() => {
                        setAfterUrl(proposedUrl);
                        setAfterMode("upload");
                        toast.success("AI design set as fix — validate it below");
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-violet-300 dark:border-violet-700 bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300 text-xs font-medium hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-colors"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Use as Fix & Validate
                    </button>
                  </div>

                  <button
                    onClick={generateAiFix}
                    disabled={isGenerating}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-dashed border-violet-300 dark:border-violet-700 text-xs text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/20 transition-colors disabled:opacity-50"
                  >
                    {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
                    Regenerate
                  </button>
                </div>
              ) : showUpgrade ? (
                <div className="h-full min-h-[300px] flex flex-col items-center justify-center gap-4 text-center p-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <Zap className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">Out of AI Fix credits</h3>
                    <p className="text-xs text-muted-foreground mt-1">Upgrade to generate more design fixes</p>
                  </div>
                  <button
                    onClick={() => setShowUpgrade(true)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-bold hover:opacity-90 transition-opacity"
                  >
                    View Plans
                  </button>
                  <button onClick={() => setShowUpgrade(false)} className="text-xs text-muted-foreground hover:underline">Maybe later</button>
                </div>
              ) : (
                /* Generate CTA */
                <div className="h-full min-h-[300px] flex flex-col items-center justify-center gap-5 text-center p-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                    {isGenerating
                      ? <Loader2 className="h-8 w-8 text-white animate-spin" />
                      : <Wand2 className="h-8 w-8 text-white" />
                    }
                  </div>
                  <div>
                    <h3 className="font-bold text-base">Generate AI Design Fix</h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">
                      GPT-4o + DALL·E 3 will analyze the violation and generate a visual proposed design that resolves it
                    </p>
                  </div>
                  {planStatus !== "pro" && remaining !== null && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Zap className="h-3.5 w-3.5 text-violet-500" />
                      <span>{remaining} fix{remaining !== 1 ? "es" : ""} remaining today</span>
                    </div>
                  )}
                  <button
                    onClick={generateAiFix}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-bold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-violet-500/25"
                  >
                    {isGenerating ? (
                      <><Loader2 className="h-4 w-4 animate-spin" />Generating design…</>
                    ) : (
                      <><Sparkles className="h-4 w-4" />Generate AI Fix</>
                    )}
                  </button>
                  {isGenerating && (
                    <p className="text-xs text-muted-foreground animate-pulse">
                      Analyzing violation · Creating fix specification · Rendering UI mockup…
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Validate button — only in upload mode */}
          {afterMode === "upload" && (
            <div className="p-4 border-t border-border space-y-3 flex-shrink-0">
              {comparingFinding.ai_suggestion && (
                <div className="rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 p-3">
                  <p className="text-[10px] font-bold text-violet-700 dark:text-violet-300 uppercase tracking-wider mb-1">AI Recommendation</p>
                  <p className="text-xs text-violet-800 dark:text-violet-200 leading-relaxed">{comparingFinding.ai_suggestion}</p>
                </div>
              )}
              <button
                onClick={handleValidate}
                disabled={!afterUrl || isValidating || validationResult?.validated}
                className={cn(
                  "w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all",
                  validationResult?.validated
                    ? "bg-green-500 text-white cursor-default"
                    : "bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                )}
              >
                {isValidating ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />AI is checking the fix…</>
                ) : validationResult?.validated ? (
                  <><CheckCircle2 className="h-4 w-4" />Fix Validated</>
                ) : (
                  <><Sparkles className="h-4 w-4" />Check Fix with AI</>
                )}
              </button>
              {!afterUrl && <p className="text-xs text-center text-muted-foreground">Upload the after screenshot first</p>}
            </div>
          )}
        </div>
      </div>

      {/* ── ROI Impact Footer ── */}
      {roi && (
        <div className={cn(
          "flex-shrink-0 border-t px-6 py-3 flex items-center gap-4",
          roi.type === "legal" ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
          : roi.type === "revenue" ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
          : "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
        )}>
          {roi.type === "legal" ? <Scale className="h-5 w-5 text-red-600 flex-shrink-0" />
            : roi.type === "revenue" ? <TrendingUp className="h-5 w-5 text-green-600 flex-shrink-0" />
            : <DollarSign className="h-5 w-5 text-blue-600 flex-shrink-0" />
          }
          <div className="flex-1 min-w-0">
            <p className={cn("text-xs font-bold", roi.type === "legal" ? "text-red-700 dark:text-red-300" : roi.type === "revenue" ? "text-green-700 dark:text-green-300" : "text-blue-700 dark:text-blue-300")}>
              {validationResult?.validated ? "✅ Risk Mitigated: " : ""}{roi.label} — {roi.amount}
            </p>
            <p className="text-xs text-muted-foreground">{roi.description}</p>
          </div>
          {validationResult?.validated && (
            <span className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-full bg-green-500 text-white">
              CLOSED
            </span>
          )}
        </div>
      )}

      {/* ── Evidence Trail ── */}
      {validationResult?.validated && (
        <div className="flex-shrink-0 border-t border-border bg-muted/30 px-6 py-2.5 flex items-center gap-3">
          <FileText className="h-3.5 w-3.5 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            Evidence trail preserved · Original violation screenshot retained for SOC 2 / audit history · {new Date().toLocaleDateString("en-US", { dateStyle: "long" })}
          </p>
        </div>
      )}

      {showUpgrade && (
        <UpgradeModal
          onClose={() => setShowUpgrade(false)}
          onSuccess={() => { setShowUpgrade(false); setPlanStatus("pro"); setRemaining(null); }}
        />
      )}
    </div>
  );
}
