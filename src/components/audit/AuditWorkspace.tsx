"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import {
  CheckCircle2, XCircle, Edit3, AlertTriangle, Clock, Loader2,
  ChevronLeft, ChevronRight, Save, ZoomIn, ZoomOut, RefreshCw,
  TrendingUp, Target, Layers, Eye, BarChart3, MessageSquare, Send,
  User, UserPlus, Flag, Columns, ShieldCheck, Scale, DollarSign,
  Calendar, ChevronDown, Users2,
} from "lucide-react";
import { ResolutionProvider, useResolution, getROIImpactUSD } from "./ResolutionProvider";
import { ComparisonView } from "./ComparisonView";
import { formatScore } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { SEVERITY_CONFIG } from "@/types";
import type { SeverityLevel, BoundingBox } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { HEURISTIC_CHECKLIST } from "@/lib/checklist";

type FindingStatus = "pending" | "verified" | "edited" | "rejected";

type IssueStatus = "open" | "in_progress" | "resolved" | "validated" | "ignored";
type Priority = "p1" | "p2" | "p3" | "p4";
type AssignedRole = "BA" | "Dev" | "QA" | null;

interface Finding {
  id: string;
  title: string;
  description: string | null;
  severity: SeverityLevel;
  status: IssueStatus;
  verification_status: FindingStatus;
  heuristic_category: string | null;
  heuristic_item_id: string | null;
  location: string | null;
  impact_score: number | null;
  frequency_score: number | null;
  ai_generated: boolean;
  ai_suggestion: string | null;
  business_impact: string | null;
  financial_risk: string | null;
  wcag_criteria: string[] | null;
  design_reference: string | null;
  critical_analysis: string | null;
  tags: string[];
  human_notes: string | null;
  bounding_box: BoundingBox | null;
  assigned_to: string | null;
  assigned_role: AssignedRole;
  due_date: string | null;
  priority: Priority | null;
  after_screenshot_url: string | null;
  before_screenshot_url: string | null;
  validated_at: string | null;
  created_at: string;
}

interface Screenshot {
  id: string;
  url: string;
  filename: string;
  order_index: number;
}

interface Audit {
  id: string;
  name: string;
  status: string;
  audit_type: string;
  overall_score: number | null;
  heuristic_score: number | null;
  accessibility_score: number | null;
  ai_summary: string | null;
  screenshot_url: string | null;
  category_scores: Record<string, number> | null;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  target_url: string | null;
  created_at: string;
  audit_screenshots: Screenshot[];
  findings: Finding[];
}

const SEVERITY_COLORS: Record<SeverityLevel, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#22c55e",
};

const SEVERITY_BG: Record<SeverityLevel, string> = {
  critical: "rgba(239,68,68,0.15)",
  high: "rgba(249,115,22,0.15)",
  medium: "rgba(234,179,8,0.15)",
  low: "rgba(34,197,94,0.15)",
};

const SEVERITY_WEIGHT: Record<SeverityLevel, number> = { critical: 4, high: 3, medium: 2, low: 1 };

function calcROI(finding: Finding): number | null {
  if (!finding.impact_score || !finding.frequency_score) return null;
  return finding.impact_score * finding.frequency_score * SEVERITY_WEIGHT[finding.severity];
}

function ROIBadge({ roi }: { roi: number }) {
  const bg = roi >= 60 ? "#ef4444" : roi >= 36 ? "#f97316" : roi >= 20 ? "#eab308" : "#22c55e";
  return (
    <span
      className="text-[9px] font-bold px-1.5 py-0.5 rounded leading-none text-white flex-shrink-0"
      style={{ backgroundColor: bg }}
      title={`ROI Risk Score: ${roi}/100`}
    >
      ROI {roi}
    </span>
  );
}

const STATUS_ICON: Record<FindingStatus, React.ReactNode> = {
  pending: <Clock className="h-4 w-4 text-muted-foreground" />,
  verified: <CheckCircle2 className="h-4 w-4 text-green-600" />,
  edited: <Edit3 className="h-4 w-4 text-blue-600" />,
  rejected: <XCircle className="h-4 w-4 text-red-500" />,
};

const AUDIT_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: "Draft", color: "text-muted-foreground", bg: "bg-muted" },
  in_progress: { label: "In Progress", color: "text-blue-700", bg: "bg-blue-100 dark:bg-blue-900/30" },
  ai_analyzing: { label: "AI Analyzing…", color: "text-violet-700", bg: "bg-violet-100 dark:bg-violet-900/30" },
  review: { label: "In Review", color: "text-orange-700", bg: "bg-orange-100 dark:bg-orange-900/30" },
  completed: { label: "Completed", color: "text-green-700", bg: "bg-green-100 dark:bg-green-900/30" },
  archived: { label: "Archived", color: "text-muted-foreground", bg: "bg-muted" },
};

const ISSUE_STATUS_CONFIG: Record<IssueStatus, { label: string; color: string; bg: string; border: string }> = {
  open:        { label: "Open",        color: "text-blue-700 dark:text-blue-300",    bg: "bg-blue-50 dark:bg-blue-950/30",    border: "border-blue-200 dark:border-blue-700" },
  in_progress: { label: "In Progress", color: "text-orange-700 dark:text-orange-300", bg: "bg-orange-50 dark:bg-orange-950/30", border: "border-orange-200 dark:border-orange-700" },
  resolved:    { label: "Resolved",    color: "text-teal-700 dark:text-teal-300",    bg: "bg-teal-50 dark:bg-teal-950/30",    border: "border-teal-200 dark:border-teal-700" },
  validated:   { label: "Validated ✓", color: "text-green-700 dark:text-green-300",  bg: "bg-green-50 dark:bg-green-950/30",  border: "border-green-200 dark:border-green-700" },
  ignored:     { label: "Ignored",     color: "text-muted-foreground",               bg: "bg-muted",                          border: "border-border" },
};

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string }> = {
  p1: { label: "P1 Critical", color: "text-red-700 dark:text-red-300",    bg: "bg-red-100 dark:bg-red-950/40" },
  p2: { label: "P2 High",     color: "text-orange-700 dark:text-orange-300", bg: "bg-orange-100 dark:bg-orange-950/40" },
  p3: { label: "P3 Medium",   color: "text-yellow-700 dark:text-yellow-300", bg: "bg-yellow-100 dark:bg-yellow-950/40" },
  p4: { label: "P4 Low",      color: "text-green-700 dark:text-green-300",  bg: "bg-green-100 dark:bg-green-950/40" },
};

function ScoreRing({ score, size = 80 }: { score: number | null; size?: number }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = score !== null ? (score / 100) * circumference : 0;
  const color = score === null ? "#6b7280" : score >= 80 ? "#22c55e" : score >= 60 ? "#eab308" : "#ef4444";
  const cx = size / 2;
  const cy = size / 2;

  return (
    <svg width={size} height={size}>
      <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={6} />
      <circle
        cx={cx} cy={cy} r={radius}
        fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={`${progress} ${circumference}`}
        strokeDashoffset={0}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: "stroke-dasharray 0.6s ease" }}
      />
      <text
        x={cx} y={cy}
        textAnchor="middle" dominantBaseline="central"
        style={{ fontSize: size * 0.22, fontWeight: 700, fill: color, fontFamily: "inherit" }}
      >
        {score ?? "—"}
      </text>
    </svg>
  );
}

export function AuditWorkspace({ audit }: { audit: Audit }) {
  const router = useRouter();
  const supabase = createClient();
  const [findings, setFindings] = useState<Finding[]>(audit.findings ?? []);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(
    findings.find((f) => f.verification_status === "pending") ?? findings[0] ?? null
  );
  const [activeScreenshot, setActiveScreenshot] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [editedNotes, setEditedNotes] = useState(selectedFinding?.human_notes ?? "");
  const [editedSuggestion, setEditedSuggestion] = useState(selectedFinding?.ai_suggestion ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [imageZoom, setImageZoom] = useState(1);
  const [activeTab, setActiveTab] = useState<"findings" | "summary" | "scores">("findings");
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [comments, setComments] = useState<Record<string, Array<{id:string;content:string;created_at:string}>>>({});
  const [commentInput, setCommentInput] = useState("");
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [assigneeInput, setAssigneeInput] = useState(selectedFinding?.assigned_to ?? "");
  const [showWcagOverlay, setShowWcagOverlay] = useState(false);
  const [viewMode, setViewMode] = useState<"standard" | "lab">("standard");
  const [selectedRole, setSelectedRole] = useState<AssignedRole>(selectedFinding?.assigned_role ?? null);
  const [dueDateInput, setDueDateInput] = useState(selectedFinding?.due_date ?? "");
  const [selectedPriority, setSelectedPriority] = useState<Priority | null>(selectedFinding?.priority ?? null);
  const imgRef = useRef<HTMLDivElement>(null);

  const screenshots = audit.audit_screenshots ?? [];
  // For URL audits: use thum.io screenshot_url; for image audits: use uploaded screenshots
  const primaryScreenshot = screenshots[activeScreenshot]?.url ?? audit.screenshot_url ?? null;

  const statusConfig = AUDIT_STATUS_CONFIG[audit.status] ?? AUDIT_STATUS_CONFIG.draft;
  const pendingCount = findings.filter((f) => f.verification_status === "pending").length;
  const verifiedCount = findings.filter((f) => f.verification_status === "verified").length;
  const rejectedCount = findings.filter((f) => f.verification_status === "rejected").length;

  const severityOrder: Record<SeverityLevel, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  const sortedFindings = [...findings].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  function selectFinding(finding: Finding) {
    setSelectedFinding(finding);
    setEditMode(false);
    setEditedNotes(finding.human_notes ?? "");
    setEditedSuggestion(finding.ai_suggestion ?? "");
    setAssigneeInput(finding.assigned_to ?? "");
    setSelectedRole(finding.assigned_role ?? null);
    setDueDateInput(finding.due_date ?? "");
    setSelectedPriority(finding.priority ?? null);
  }

  async function updatePriority(findingId: string, priority: Priority) {
    const { error } = await supabase.from("findings").update({ priority }).eq("id", findingId);
    if (error) { console.error("updatePriority error:", error); toast.error(`Failed to update priority: ${error.message}`); return; }
    setFindings((prev) => prev.map((f) => f.id === findingId ? { ...f, priority } : f));
    setSelectedFinding((prev) => prev?.id === findingId ? { ...prev, priority } as Finding : prev);
    setSelectedPriority(priority);
    toast.success(`Priority → ${PRIORITY_CONFIG[priority].label}`);
  }

  async function updateRole(findingId: string, role: AssignedRole) {
    const { error } = await supabase.from("findings").update({ assigned_role: role }).eq("id", findingId);
    if (error) { console.error("updateRole error:", error); toast.error(`Failed to update role: ${error.message}`); return; }
    setFindings((prev) => prev.map((f) => f.id === findingId ? { ...f, assigned_role: role } : f));
    setSelectedFinding((prev) => prev?.id === findingId ? { ...prev, assigned_role: role } as Finding : prev);
    setSelectedRole(role);
    if (role) toast.success(`Assigned to ${role}`);
  }

  async function updateDueDate(findingId: string, date: string) {
    const val = date || null;
    const { error } = await supabase.from("findings").update({ due_date: val }).eq("id", findingId);
    if (error) { console.error("updateDueDate error:", error); toast.error(`Failed to update due date: ${error.message}`); return; }
    setFindings((prev) => prev.map((f) => f.id === findingId ? { ...f, due_date: val } : f));
    setSelectedFinding((prev) => prev?.id === findingId ? { ...prev, due_date: val } as Finding : prev);
    if (val) toast.success(`Due date set`);
  }

  function handleValidated(findingId: string, afterUrl: string) {
    setFindings((prev) => prev.map((f) =>
      f.id === findingId ? { ...f, status: "validated" as IssueStatus, after_screenshot_url: afterUrl } : f
    ));
    setSelectedFinding((prev) =>
      prev?.id === findingId ? { ...prev, status: "validated" as IssueStatus, after_screenshot_url: afterUrl } : prev
    );
  }

  async function updateFindingStatus(findingId: string, verificationStatus: FindingStatus) {
    setIsSaving(true);
    try {
      const updates: Record<string, unknown> = { verification_status: verificationStatus };
      if (verificationStatus === "edited") {
        updates.human_notes = editedNotes;
        updates.ai_suggestion = editedSuggestion;
      }
      const { error } = await supabase.from("findings").update(updates).eq("id", findingId);
      if (error) throw error;

      setFindings((prev) => prev.map((f) => f.id === findingId ? { ...f, verification_status: verificationStatus, ...updates } : f));
      setSelectedFinding((prev) => prev?.id === findingId ? { ...prev, verification_status: verificationStatus, ...updates } as Finding : prev);
      setEditMode(false);

      const labels: Partial<Record<FindingStatus, string>> = {
        verified: "Finding verified ✓",
        rejected: "Finding rejected",
        edited: "Changes saved ✓",
      };
      toast.success(labels[verificationStatus] ?? "Updated");
    } catch {
      toast.error("Failed to update finding");
    } finally {
      setIsSaving(false);
    }
  }

  async function markAuditComplete() {
    const { error } = await supabase.from("audits")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", audit.id);
    if (error) { toast.error("Failed to complete audit"); return; }
    toast.success("Audit marked as complete!");
    router.refresh();
  }

  async function postComment(findingId: string) {
    if (!commentInput.trim()) return;
    setIsPostingComment(true);
    try {
      const { data, error } = await supabase.from("finding_comments").insert({
        finding_id: findingId,
        content: commentInput.trim(),
      }).select().single();
      if (error) throw error;
      setComments((prev) => ({
        ...prev,
        [findingId]: [...(prev[findingId] ?? []), data],
      }));
      setCommentInput("");
    } catch {
      toast.error("Failed to post comment");
    } finally {
      setIsPostingComment(false);
    }
  }

  async function updateIssueStatus(findingId: string, status: IssueStatus) {
    const { error } = await supabase.from("findings").update({ status }).eq("id", findingId);
    if (error) { toast.error("Failed to update status"); return; }
    setFindings((prev) => prev.map((f) => f.id === findingId ? { ...f, status } : f));
    setSelectedFinding((prev) => prev?.id === findingId ? { ...prev, status } as Finding : prev);
    toast.success(`Status → ${ISSUE_STATUS_CONFIG[status].label}`);
  }

  async function updateAssignment(findingId: string, assignee: string) {
    const val = assignee.trim() || null;
    const { error } = await supabase.from("findings").update({ assigned_to: val }).eq("id", findingId);
    if (error) { toast.error("Failed to update assignment"); return; }
    setFindings((prev) => prev.map((f) => f.id === findingId ? { ...f, assigned_to: val } : f));
    setSelectedFinding((prev) => prev?.id === findingId ? { ...prev, assigned_to: val } as Finding : prev);
    toast.success(val ? `Assigned to ${val}` : "Assignment cleared");
  }

  const annotatedFindings = sortedFindings.filter((f) => f.bounding_box);

  return (
    <ResolutionProvider>
    <WorkspaceInner
      audit={audit}
      findings={findings} setFindings={setFindings}
      selectedFinding={selectedFinding} setSelectedFinding={setSelectedFinding}
      activeScreenshot={activeScreenshot} setActiveScreenshot={setActiveScreenshot}
      editMode={editMode} setEditMode={setEditMode}
      editedNotes={editedNotes} setEditedNotes={setEditedNotes}
      editedSuggestion={editedSuggestion} setEditedSuggestion={setEditedSuggestion}
      isSaving={isSaving} setIsSaving={setIsSaving}
      imageZoom={imageZoom} setImageZoom={setImageZoom}
      activeTab={activeTab} setActiveTab={setActiveTab}
      showAnnotations={showAnnotations} setShowAnnotations={setShowAnnotations}
      comments={comments} setComments={setComments}
      commentInput={commentInput} setCommentInput={setCommentInput}
      isPostingComment={isPostingComment} setIsPostingComment={setIsPostingComment}
      assigneeInput={assigneeInput} setAssigneeInput={setAssigneeInput}
      showWcagOverlay={showWcagOverlay} setShowWcagOverlay={setShowWcagOverlay}
      viewMode={viewMode} setViewMode={setViewMode}
      selectedRole={selectedRole} setSelectedRole={setSelectedRole}
      dueDateInput={dueDateInput} setDueDateInput={setDueDateInput}
      selectedPriority={selectedPriority} setSelectedPriority={setSelectedPriority}
      sortedFindings={sortedFindings}
      annotatedFindings={annotatedFindings}
      primaryScreenshot={primaryScreenshot}
      statusConfig={statusConfig}
      pendingCount={pendingCount} verifiedCount={verifiedCount} rejectedCount={rejectedCount}
      screenshots={screenshots}
      supabase={supabase} router={router}
      imgRef={imgRef}
      selectFinding={selectFinding}
      updateFindingStatus={updateFindingStatus}
      markAuditComplete={markAuditComplete}
      postComment={postComment}
      updateIssueStatus={updateIssueStatus}
      updateAssignment={updateAssignment}
      updatePriority={updatePriority}
      updateRole={updateRole}
      updateDueDate={updateDueDate}
      handleValidated={handleValidated}
    />
    </ResolutionProvider>
  );
}

// ── Inner workspace (has access to ResolutionContext) ────────────

interface WorkspaceInnerProps {
  audit: Audit;
  findings: Finding[]; setFindings: React.Dispatch<React.SetStateAction<Finding[]>>;
  selectedFinding: Finding | null; setSelectedFinding: React.Dispatch<React.SetStateAction<Finding | null>>;
  activeScreenshot: number; setActiveScreenshot: React.Dispatch<React.SetStateAction<number>>;
  editMode: boolean; setEditMode: React.Dispatch<React.SetStateAction<boolean>>;
  editedNotes: string; setEditedNotes: React.Dispatch<React.SetStateAction<string>>;
  editedSuggestion: string; setEditedSuggestion: React.Dispatch<React.SetStateAction<string>>;
  isSaving: boolean; setIsSaving: React.Dispatch<React.SetStateAction<boolean>>;
  imageZoom: number; setImageZoom: React.Dispatch<React.SetStateAction<number>>;
  activeTab: "findings" | "summary" | "scores"; setActiveTab: React.Dispatch<React.SetStateAction<"findings" | "summary" | "scores">>;
  showAnnotations: boolean; setShowAnnotations: React.Dispatch<React.SetStateAction<boolean>>;
  comments: Record<string, Array<{id:string;content:string;created_at:string}>>; setComments: React.Dispatch<React.SetStateAction<Record<string, Array<{id:string;content:string;created_at:string}>>>>;
  commentInput: string; setCommentInput: React.Dispatch<React.SetStateAction<string>>;
  isPostingComment: boolean; setIsPostingComment: React.Dispatch<React.SetStateAction<boolean>>;
  assigneeInput: string; setAssigneeInput: React.Dispatch<React.SetStateAction<string>>;
  showWcagOverlay: boolean; setShowWcagOverlay: React.Dispatch<React.SetStateAction<boolean>>;
  viewMode: "standard" | "lab"; setViewMode: React.Dispatch<React.SetStateAction<"standard" | "lab">>;
  selectedRole: AssignedRole; setSelectedRole: React.Dispatch<React.SetStateAction<AssignedRole>>;
  dueDateInput: string; setDueDateInput: React.Dispatch<React.SetStateAction<string>>;
  selectedPriority: Priority | null; setSelectedPriority: React.Dispatch<React.SetStateAction<Priority | null>>;
  sortedFindings: Finding[]; annotatedFindings: Finding[];
  primaryScreenshot: string | null;
  statusConfig: { label: string; color: string; bg: string };
  pendingCount: number; verifiedCount: number; rejectedCount: number;
  screenshots: Screenshot[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any; router: ReturnType<typeof import("next/navigation").useRouter>;
  imgRef: React.RefObject<HTMLDivElement>;
  selectFinding: (f: Finding) => void;
  updateFindingStatus: (id: string, s: FindingStatus) => Promise<void>;
  markAuditComplete: () => Promise<void>;
  postComment: (findingId: string) => Promise<void>;
  updateIssueStatus: (id: string, s: IssueStatus) => Promise<void>;
  updateAssignment: (id: string, val: string) => Promise<void>;
  updatePriority: (id: string, p: Priority) => Promise<void>;
  updateRole: (id: string, r: AssignedRole) => Promise<void>;
  updateDueDate: (id: string, d: string) => Promise<void>;
  handleValidated: (id: string, afterUrl: string) => void;
}

function WorkspaceInner(props: WorkspaceInnerProps) {
  const { openComparison, isComparing, comparingFinding } = useResolution();
  const {
    audit, findings, setFindings, selectedFinding, setSelectedFinding,
    activeScreenshot, setActiveScreenshot, editMode, setEditMode,
    editedNotes, setEditedNotes, editedSuggestion, setEditedSuggestion,
    isSaving, setIsSaving, imageZoom, setImageZoom, activeTab, setActiveTab,
    showAnnotations, setShowAnnotations, comments, setComments,
    commentInput, setCommentInput, isPostingComment, setIsPostingComment,
    assigneeInput, setAssigneeInput, showWcagOverlay, setShowWcagOverlay,
    viewMode, setViewMode, selectedRole, dueDateInput, setDueDateInput,
    selectedPriority, sortedFindings, annotatedFindings, primaryScreenshot,
    statusConfig, pendingCount, verifiedCount, rejectedCount, screenshots,
    supabase, router, imgRef, selectFinding, updateFindingStatus,
    markAuditComplete, postComment, updateIssueStatus, updateAssignment,
    updatePriority, updateRole, updateDueDate, handleValidated,
  } = props;

  const roiImpact = selectedFinding ? getROIImpactUSD(selectedFinding) : null;

  return (
    <>
    {isComparing && comparingFinding && (
      <ComparisonView
        auditId={audit.id}
        findingStatus={selectedFinding?.status ?? "open"}
        verificationStatus={selectedFinding?.verification_status ?? "pending"}
        onValidated={(id, url, result) => handleValidated(id, url)}
      />
    )}
    <div className="flex h-[calc(100vh-3.5rem)] -mx-6 -mt-6 overflow-hidden">
      {/* ── LEFT PANEL ── */}
      <div className={cn("flex flex-col border-r border-border bg-background min-w-0", viewMode === "lab" ? "w-1/2" : "w-[42%]")}>

        {/* Header */}
        <div className="p-4 border-b border-border space-y-3 flex-shrink-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h1 className="font-semibold text-sm truncate">{audit.name}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", statusConfig.bg, statusConfig.color)}>
                  {statusConfig.label}
                </span>
                {audit.target_url && (
                  <a href={audit.target_url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline truncate max-w-[180px]">
                    {audit.target_url}
                  </a>
                )}
              </div>
            </div>
            {pendingCount === 0 && findings.length > 0 && audit.status !== "completed" && (
              <button onClick={markAuditComplete}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 flex-shrink-0">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Complete
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1">
            {(["findings", "summary", "scores"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={cn("px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors",
                  activeTab === tab ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent")}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* ── SCREENSHOT WITH ANNOTATION OVERLAY ── */}
        {primaryScreenshot && (
          <div className={cn("border-b border-border bg-muted/30", viewMode === "lab" ? "flex-1 flex flex-col min-h-0" : "flex-shrink-0")}>
            <div ref={imgRef} className="relative overflow-auto" style={viewMode === "lab" ? { flex: 1, minHeight: 0 } : { maxHeight: 320 }}>
              <img
                src={primaryScreenshot}
                alt="Screenshot"
                className="w-full object-contain block"
                style={{ transform: `scale(${imageZoom})`, transformOrigin: "top left" }}
              />

              {/* Annotation overlays */}
              {showAnnotations && sortedFindings.map((finding, idx) => {
                if (!finding.bounding_box) return null;
                const bb = finding.bounding_box;
                const isSelected = selectedFinding?.id === finding.id;
                const color = SEVERITY_COLORS[finding.severity];
                const bg = SEVERITY_BG[finding.severity];

                return (
                  <div
                    key={finding.id}
                    onClick={() => selectFinding(finding)}
                    className="absolute cursor-pointer transition-all"
                    style={{
                      left: `${bb.x}%`,
                      top: `${bb.y}%`,
                      width: `${bb.width}%`,
                      height: `${bb.height}%`,
                      border: `${isSelected ? 3 : 2}px solid ${color}`,
                      backgroundColor: isSelected ? bg : "transparent",
                      boxShadow: isSelected ? `0 0 0 3px ${color}40, 0 0 12px ${color}40` : "none",
                      borderRadius: 4,
                      zIndex: isSelected ? 20 : 10,
                    }}
                  >
                    {/* Number badge */}
                    <span
                      className="absolute -top-5 left-0 text-white text-[10px] font-bold px-1.5 py-0.5 rounded leading-none"
                      style={{ backgroundColor: color, whiteSpace: "nowrap" }}
                    >
                      {idx + 1} · {finding.severity.toUpperCase()}
                    </span>
                    {/* Pulse ring on selected */}
                    {isSelected && (
                      <span className="absolute inset-0 rounded animate-ping opacity-20"
                        style={{ border: `2px solid ${color}` }} />
                    )}
                  </div>
                );
              })}

              {/* WCAG Overlay — blue boxes with criteria codes */}
              {showWcagOverlay && sortedFindings.map((finding) => {
                if (!finding.bounding_box || !finding.wcag_criteria?.length) return null;
                const bb = finding.bounding_box;
                const isSelected = selectedFinding?.id === finding.id;
                return (
                  <div
                    key={`wcag-${finding.id}`}
                    onClick={() => selectFinding(finding)}
                    className="absolute cursor-pointer transition-all"
                    style={{
                      left: `${bb.x}%`,
                      top: `${bb.y}%`,
                      width: `${bb.width}%`,
                      height: `${bb.height}%`,
                      border: `${isSelected ? 3 : 2}px solid #3b82f6`,
                      backgroundColor: isSelected ? "rgba(59,130,246,0.15)" : "rgba(59,130,246,0.06)",
                      borderRadius: 4,
                      zIndex: 25,
                    }}
                  >
                    <div className="absolute -top-5 left-0 flex gap-0.5 flex-wrap max-w-[200px]">
                      {finding.wcag_criteria.slice(0, 3).map((c) => (
                        <span key={c}
                          className="text-white text-[8px] font-bold px-1 py-0.5 rounded leading-none whitespace-nowrap"
                          style={{ backgroundColor: "#3b82f6" }}>
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Screenshot nav */}
              {screenshots.length > 1 && (
                <div className="absolute bottom-2 left-2 flex items-center gap-1 z-30">
                  <button onClick={() => setActiveScreenshot((i) => Math.max(0, i - 1))}
                    disabled={activeScreenshot === 0}
                    className="w-7 h-7 rounded-lg bg-black/60 text-white flex items-center justify-center disabled:opacity-30">
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <span className="px-2 py-0.5 rounded bg-black/60 text-white text-xs">
                    {activeScreenshot + 1}/{screenshots.length}
                  </span>
                  <button onClick={() => setActiveScreenshot((i) => Math.min(screenshots.length - 1, i + 1))}
                    disabled={activeScreenshot === screenshots.length - 1}
                    className="w-7 h-7 rounded-lg bg-black/60 text-white flex items-center justify-center disabled:opacity-30">
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Lab mode finding navigator */}
            {viewMode === "lab" && sortedFindings.length > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-2 border-t border-border bg-background/80 overflow-x-auto flex-shrink-0">
                <span className="text-[10px] text-muted-foreground mr-1 flex-shrink-0">Jump:</span>
                {sortedFindings.map((finding, idx) => {
                  const color = SEVERITY_COLORS[finding.severity];
                  const isSelected = selectedFinding?.id === finding.id;
                  return (
                    <button
                      key={finding.id}
                      onClick={() => selectFinding(finding)}
                      title={finding.title}
                      className="w-6 h-6 rounded-full flex-shrink-0 text-white text-[9px] font-bold flex items-center justify-center transition-all"
                      style={{
                        backgroundColor: color,
                        opacity: isSelected ? 1 : 0.55,
                        transform: isSelected ? "scale(1.25)" : "scale(1)",
                        outline: isSelected ? `2px solid ${color}` : "none",
                        outlineOffset: 2,
                      }}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Screenshot toolbar */}
            <div className="flex items-center justify-between px-3 py-1.5 border-t border-border bg-background/80">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowAnnotations((v) => !v)}
                  className={cn("flex items-center gap-1.5 text-xs px-2 py-1 rounded transition-colors",
                    showAnnotations ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent")}
                >
                  <Eye className="h-3.5 w-3.5" />
                  {showAnnotations ? `${annotatedFindings.length}` : "UX"}
                </button>
                <button
                  onClick={() => setShowWcagOverlay((v) => !v)}
                  className={cn("flex items-center gap-1.5 text-xs px-2 py-1 rounded transition-colors",
                    showWcagOverlay ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" : "text-muted-foreground hover:bg-accent")}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  WCAG
                </button>
                <button
                  onClick={() => setViewMode((m) => m === "lab" ? "standard" : "lab")}
                  className={cn("flex items-center gap-1.5 text-xs px-2 py-1 rounded transition-colors",
                    viewMode === "lab" ? "bg-violet-500/10 text-violet-600 dark:text-violet-400" : "text-muted-foreground hover:bg-accent")}
                >
                  <Columns className="h-3.5 w-3.5" />
                  Lab
                </button>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setImageZoom((z) => Math.max(0.5, z - 0.25))}
                  className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:bg-accent">
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>
                <span className="text-xs text-muted-foreground w-10 text-center">{Math.round(imageZoom * 100)}%</span>
                <button onClick={() => setImageZoom((z) => Math.min(3, z + 0.25))}
                  className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:bg-accent">
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => setImageZoom(1)}
                  className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:bg-accent">
                  <RefreshCw className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB CONTENT (hidden in lab mode) ── */}

        <div className={cn("flex-1 overflow-y-auto", viewMode === "lab" && "hidden")}>

          {/* FINDINGS TAB */}
          {activeTab === "findings" && (
            <div className="p-3 space-y-2">
              <div className="flex items-center gap-3 text-xs px-1">
                <span className="text-green-600 font-medium">{verifiedCount} verified</span>
                <span className="text-orange-500 font-medium">{pendingCount} pending</span>
                <span className="text-red-500 font-medium">{rejectedCount} rejected</span>
              </div>

              {sortedFindings.map((finding, idx) => {
                const sc = SEVERITY_CONFIG[finding.severity];
                const isSelected = selectedFinding?.id === finding.id;
                const color = SEVERITY_COLORS[finding.severity];
                const roi = calcROI(finding);

                return (
                  <button key={finding.id} onClick={() => selectFinding(finding)}
                    className={cn("w-full text-left rounded-xl border transition-all group",
                      isSelected ? "border-primary/60 bg-primary/5 shadow-sm" : "border-border hover:border-primary/30 hover:bg-accent/50")}>
                    <div className="flex items-stretch">
                      {/* Severity stripe */}
                      <div className="w-1 rounded-l-xl flex-shrink-0" style={{ backgroundColor: color }} />
                      <div className="flex flex-col gap-1.5 p-3 flex-1 min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          {/* Number badge */}
                          <span className="w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: color }}>
                            {idx + 1}
                          </span>
                          <p className="text-xs font-semibold leading-tight truncate flex-1">{finding.title}</p>
                          {STATUS_ICON[finding.verification_status]}
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap pl-7">
                          {/* Severity badge */}
                          <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border leading-none", sc.bg, sc.color, sc.border)}>
                            {sc.label.toUpperCase()}
                          </span>
                          {roi !== null && <ROIBadge roi={roi} />}
                          {finding.bounding_box && (
                            <span className="text-[9px] bg-primary/10 text-primary px-1 py-0.5 rounded font-medium">📍</span>
                          )}
                          <span className="text-[10px] text-muted-foreground truncate">
                            {finding.heuristic_category ?? "General"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}

              {findings.length === 0 && (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  {audit.status === "ai_analyzing" ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p>AI is analyzing your interface…</p>
                      <p className="text-xs">This takes 30–60 seconds</p>
                    </div>
                  ) : "No findings generated yet"}
                </div>
              )}
            </div>
          )}

          {/* SUMMARY TAB */}
          {activeTab === "summary" && (
            <div className="p-4 space-y-4">
              {/* Score rings */}
              <div className="flex items-center justify-around py-4 rounded-xl border border-border bg-card">
                {[
                  { label: "UX Score", score: audit.overall_score },
                  { label: "Heuristic", score: audit.heuristic_score },
                  { label: "Accessibility", score: audit.accessibility_score },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col items-center gap-2">
                    <ScoreRing score={item.score} size={72} />
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                  </div>
                ))}
              </div>

              {/* AI Summary */}
              <div className="rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 p-4">
                <p className="text-xs font-semibold text-violet-700 dark:text-violet-300 mb-2 flex items-center gap-1.5">
                  🤖 AI Summary
                </p>
                <p className="text-xs text-violet-800 dark:text-violet-200 leading-relaxed">
                  {audit.ai_summary ?? "AI summary will appear here after analysis."}
                </p>
              </div>

              {/* Severity breakdown */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "Critical", count: audit.critical_count, color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/30" },
                  { label: "High", count: audit.high_count, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-950/30" },
                  { label: "Medium", count: audit.medium_count, color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-950/30" },
                  { label: "Low", count: audit.low_count, color: "text-green-600", bg: "bg-green-50 dark:bg-green-950/30" },
                ].map((s) => (
                  <div key={s.label} className={cn("rounded-xl p-3 text-center", s.bg)}>
                    <p className={cn("text-xl font-bold", s.color)}>{s.count}</p>
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SCORES TAB */}
          {activeTab === "scores" && (
            <div className="p-4 space-y-5">
              {/* Main scores */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Overall Scores</p>
                {[
                  { label: "Overall UX Score", score: audit.overall_score, icon: Target },
                  { label: "Heuristic Score", score: audit.heuristic_score, icon: Layers },
                  { label: "Accessibility Score", score: audit.accessibility_score, icon: TrendingUp },
                ].map((item) => {
                  const Icon = item.icon;
                  const color = item.score === null ? "#6b7280" : item.score >= 80 ? "#22c55e" : item.score >= 60 ? "#eab308" : "#ef4444";
                  return (
                    <div key={item.label} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{item.label}</span>
                        </div>
                        <span className="font-bold text-sm" style={{ color }}>{formatScore(item.score)}</span>
                      </div>
                      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${item.score ?? 0}%`, backgroundColor: color }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Category breakdown */}
              {audit.category_scores && Object.keys(audit.category_scores).length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <BarChart3 className="h-3.5 w-3.5" />
                    Category Breakdown
                  </p>
                  <div className="space-y-2">
                    {HEURISTIC_CHECKLIST.categories.map((cat) => {
                      const score = audit.category_scores?.[cat.number];
                      if (score === undefined) return null;
                      const color = score >= 80 ? "#22c55e" : score >= 60 ? "#eab308" : "#ef4444";
                      return (
                        <div key={cat.number} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                              <span className="font-medium text-foreground">{cat.number}.</span> {cat.name}
                            </span>
                            <span className="text-xs font-bold ml-2 flex-shrink-0" style={{ color }}>{score}</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${score}%`, backgroundColor: color }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT PANEL — Finding Detail ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-muted/10">
        {selectedFinding ? (
          <>
            {/* Finding header */}
            <div className="p-5 border-b border-border bg-background flex-shrink-0">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    {/* Severity badge */}
                    <span className={cn(
                      "text-xs font-bold px-2.5 py-1 rounded-lg border",
                      SEVERITY_CONFIG[selectedFinding.severity].bg,
                      SEVERITY_CONFIG[selectedFinding.severity].color,
                      SEVERITY_CONFIG[selectedFinding.severity].border
                    )}>
                      {SEVERITY_CONFIG[selectedFinding.severity].icon} {SEVERITY_CONFIG[selectedFinding.severity].label.toUpperCase()}
                    </span>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-lg">
                      {selectedFinding.heuristic_item_id ?? "—"} · {selectedFinding.heuristic_category}
                    </span>
                  </div>
                  <h2 className="text-base font-semibold leading-snug">{selectedFinding.title}</h2>
                  {selectedFinding.location && (
                    <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                      <span>📍</span> {selectedFinding.location}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs flex-shrink-0">
                  {STATUS_ICON[selectedFinding.verification_status]}
                  <span className={cn("font-medium capitalize",
                    selectedFinding.verification_status === "verified" ? "text-green-600" :
                    selectedFinding.verification_status === "rejected" ? "text-red-500" :
                    selectedFinding.verification_status === "edited" ? "text-blue-600" :
                    "text-muted-foreground")}>
                    {selectedFinding.verification_status}
                  </span>
                </div>
              </div>

              {/* Status lifecycle row */}
              <div className="flex items-center gap-1 bg-muted rounded-xl p-1 mt-3 flex-wrap">
                <Flag className="h-3.5 w-3.5 text-muted-foreground ml-1.5 flex-shrink-0" />
                {(["open", "in_progress", "resolved", "ignored"] as IssueStatus[]).map((s) => {
                  const cfg = ISSUE_STATUS_CONFIG[s];
                  const isActive = selectedFinding.status === s;
                  const isValidated = selectedFinding.status === "validated";
                  return (
                    <button
                      key={s}
                      onClick={() => !isValidated && updateIssueStatus(selectedFinding.id, s)}
                      disabled={isValidated}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-xs font-medium transition-all",
                        isActive || (isValidated && s === "resolved") ? cn(cfg.bg, cfg.color, cfg.border, "border") : "text-muted-foreground hover:bg-accent disabled:opacity-50"
                      )}
                    >
                      {cfg.label}
                    </button>
                  );
                })}
                {selectedFinding.status === "validated" && (
                  <span className={cn("px-2.5 py-1 rounded-lg text-xs font-medium border", ISSUE_STATUS_CONFIG.validated.bg, ISSUE_STATUS_CONFIG.validated.color, ISSUE_STATUS_CONFIG.validated.border)}>
                    Validated ✓
                  </span>
                )}
              </div>

              {/* Assignment row — role, assignee, due date, priority */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                {/* Role */}
                <div className="flex items-center gap-1.5">
                  <Users2 className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  <select
                    value={selectedRole ?? ""}
                    onChange={(e) => updateRole(selectedFinding.id, (e.target.value || null) as AssignedRole)}
                    className="flex-1 text-xs px-2 py-1.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">No role assigned</option>
                    <option value="BA">Business Analyst</option>
                    <option value="Dev">Developer</option>
                    <option value="QA">QA Engineer</option>
                  </select>
                </div>

                {/* Priority */}
                <div className="flex items-center gap-1.5">
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  <select
                    value={selectedPriority ?? ""}
                    onChange={(e) => e.target.value && updatePriority(selectedFinding.id, e.target.value as Priority)}
                    className="flex-1 text-xs px-2 py-1.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Set priority…</option>
                    {(Object.entries(PRIORITY_CONFIG) as [Priority, typeof PRIORITY_CONFIG[Priority]][]).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>

                {/* Assignee */}
                <div className="flex items-center gap-1.5">
                  <UserPlus className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  <input
                    value={assigneeInput}
                    onChange={(e) => setAssigneeInput(e.target.value)}
                    onBlur={() => updateAssignment(selectedFinding.id, assigneeInput)}
                    onKeyDown={(e) => e.key === "Enter" && updateAssignment(selectedFinding.id, assigneeInput)}
                    placeholder="Assign to name or email…"
                    className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-input bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                {/* Due date */}
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  <input
                    type="date"
                    value={dueDateInput}
                    onChange={(e) => setDueDateInput(e.target.value)}
                    onBlur={() => updateDueDate(selectedFinding.id, dueDateInput)}
                    className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              {/* Validation Lab trigger — shows when resolved */}
              {(selectedFinding.status === "resolved" || selectedFinding.status === "validated") && (
                <div className={cn(
                  "mt-3 rounded-xl border p-3 flex items-center justify-between gap-3",
                  selectedFinding.status === "validated"
                    ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
                    : "bg-teal-50 dark:bg-teal-950/30 border-teal-200 dark:border-teal-800"
                )}>
                  <div className="flex items-center gap-2">
                    <Scale className={cn("h-4 w-4 flex-shrink-0", selectedFinding.status === "validated" ? "text-green-600" : "text-teal-600")} />
                    <div>
                      <p className={cn("text-xs font-semibold", selectedFinding.status === "validated" ? "text-green-700 dark:text-green-300" : "text-teal-700 dark:text-teal-300")}>
                        {selectedFinding.status === "validated" ? "Fix Validated ✓" : "Ready for Validation"}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {selectedFinding.status === "validated"
                          ? `Validated · Evidence preserved for audit history`
                          : "Upload the after screenshot and run AI validation"}
                      </p>
                    </div>
                  </div>
                  {selectedFinding.status !== "validated" && (
                    <button
                      onClick={() => openComparison(selectedFinding, primaryScreenshot)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-colors flex-shrink-0"
                    >
                      <Scale className="h-3.5 w-3.5" />
                      Open Lab
                    </button>
                  )}
                </div>
              )}

              {/* Action buttons */}
              {selectedFinding.verification_status === "pending" && !editMode && (
                <div className="flex gap-2 mt-4">
                  <button onClick={() => updateFindingStatus(selectedFinding.id, "verified")}
                    disabled={isSaving}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50">
                    <CheckCircle2 className="h-4 w-4" />
                    Verify
                  </button>
                  <button onClick={() => setEditMode(true)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border bg-background text-sm font-medium hover:bg-accent">
                    <Edit3 className="h-4 w-4" />
                    Edit & Verify
                  </button>
                  <button onClick={() => updateFindingStatus(selectedFinding.id, "rejected")}
                    disabled={isSaving}
                    className="px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-800 text-red-600 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50">
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              )}
              {selectedFinding.verification_status !== "pending" && (
                <button onClick={() => updateFindingStatus(selectedFinding.id, "pending")}
                  className="mt-3 text-xs text-muted-foreground hover:text-foreground underline">
                  Reset to pending
                </button>
              )}
            </div>

            {/* Finding body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">

              {/* UX Problem */}
              <section>
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">UX Problem</h3>
                <p className="text-sm leading-relaxed">{selectedFinding.description}</p>
              </section>

              {/* Edit mode */}
              {editMode && (
                <section className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20 p-4 space-y-3">
                  <h3 className="text-xs font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                    <Edit3 className="h-3.5 w-3.5" /> Edit Mode
                  </h3>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-blue-700 dark:text-blue-300">AI Recommendation (editable)</label>
                    <textarea value={editedSuggestion} onChange={(e) => setEditedSuggestion(e.target.value)} rows={3}
                      className="w-full px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-700 bg-white dark:bg-gray-900 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-blue-700 dark:text-blue-300">Your Notes</label>
                    <textarea value={editedNotes} onChange={(e) => setEditedNotes(e.target.value)} rows={3}
                      placeholder="Add expert context, observations, or caveats…"
                      className="w-full px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-700 bg-white dark:bg-gray-900 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-muted-foreground" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => updateFindingStatus(selectedFinding.id, "edited")} disabled={isSaving}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save & Verify
                    </button>
                    <button onClick={() => setEditMode(false)}
                      className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent">
                      Cancel
                    </button>
                  </div>
                </section>
              )}

              {/* AI Recommendation */}
              <section>
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">AI Recommendation</h3>
                <div className="rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 p-4">
                  <p className="text-sm leading-relaxed text-violet-800 dark:text-violet-200">
                    {selectedFinding.ai_suggestion ?? "No recommendation generated."}
                  </p>
                </div>
              </section>

              {/* Human notes */}
              {selectedFinding.human_notes && (
                <section>
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Reviewer Notes</h3>
                  <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-4">
                    <p className="text-sm leading-relaxed text-blue-800 dark:text-blue-200">
                      {selectedFinding.human_notes}
                    </p>
                  </div>
                </section>
              )}

              {/* Business Impact + Financial Risk */}
              <div className="grid grid-cols-2 gap-3">
                {selectedFinding.business_impact && (
                  <section>
                    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Business Impact</h3>
                    <div className="rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 p-3">
                      <p className="text-xs text-orange-800 dark:text-orange-200 leading-relaxed">
                        {selectedFinding.business_impact}
                      </p>
                    </div>
                  </section>
                )}
                {selectedFinding.financial_risk && (
                  <section>
                    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Financial Risk</h3>
                    <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3">
                      <p className="text-xs text-red-800 dark:text-red-200 leading-relaxed">
                        {selectedFinding.financial_risk}
                      </p>
                    </div>
                  </section>
                )}
              </div>

              {/* ROI Risk Engine + Priority Matrix */}
              {selectedFinding.impact_score !== null && selectedFinding.frequency_score !== null && (() => {
                const roi = calcROI(selectedFinding);
                const roiBg = roi === null ? "#6b7280" : roi >= 60 ? "#ef4444" : roi >= 36 ? "#f97316" : roi >= 20 ? "#eab308" : "#22c55e";
                const roiLabel = roi === null ? "—" : roi >= 60 ? "Critical Risk" : roi >= 36 ? "High Risk" : roi >= 20 ? "Medium Risk" : "Low Risk";
                return (
                  <section>
                    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                      💰 ROI Risk Engine
                    </h3>
                    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                      <div className="flex items-center gap-4">
                        <div className="text-center flex-1">
                          <p className="text-2xl font-bold" style={{ color: roiBg }}>
                            {roi ?? "—"}
                            <span className="text-muted-foreground text-sm font-normal">/100</span>
                          </p>
                          <p className="text-xs font-semibold mt-0.5" style={{ color: roiBg }}>{roiLabel}</p>
                          <p className="text-[10px] text-muted-foreground">ROI Risk Score</p>
                        </div>
                        <div className="h-10 w-px bg-border" />
                        <div className="text-center flex-1">
                          <p className="text-xl font-semibold">{selectedFinding.impact_score}<span className="text-muted-foreground text-sm">/5</span></p>
                          <p className="text-xs text-muted-foreground">Impact</p>
                        </div>
                        <span className="text-muted-foreground font-light text-lg">×</span>
                        <div className="text-center flex-1">
                          <p className="text-xl font-semibold">{selectedFinding.frequency_score}<span className="text-muted-foreground text-sm">/5</span></p>
                          <p className="text-xs text-muted-foreground">Frequency</p>
                        </div>
                        <span className="text-muted-foreground font-light text-lg">×</span>
                        <div className="text-center flex-1">
                          <p className="text-xl font-semibold">{SEVERITY_WEIGHT[selectedFinding.severity]}<span className="text-muted-foreground text-sm">/4</span></p>
                          <p className="text-xs text-muted-foreground">Severity Wt.</p>
                        </div>
                      </div>
                      {/* Risk bar */}
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${roi ?? 0}%`, backgroundColor: roiBg }} />
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        Formula: Impact × Frequency × Severity Weight (critical=4, high=3, medium=2, low=1)
                      </p>
                    </div>
                  </section>
                );
              })()}

              {/* Critical Analysis */}
              {selectedFinding.critical_analysis && (
                <section>
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                    🧠 Critical UX Analysis
                  </h3>
                  <div className="rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 p-4">
                    <p className="text-xs text-indigo-800 dark:text-indigo-200 leading-relaxed">
                      {selectedFinding.critical_analysis}
                    </p>
                  </div>
                </section>
              )}

              {/* WCAG Criteria */}
              {selectedFinding.wcag_criteria && selectedFinding.wcag_criteria.length > 0 && (
                <section>
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    ♿ WCAG 2.1/2.2 Criteria
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedFinding.wcag_criteria.map((criterion) => (
                      <span key={criterion}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-mono font-medium">
                        {criterion}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Design Reference */}
              {selectedFinding.design_reference && (
                <section>
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    📚 Pattern Reference
                  </h3>
                  <div className="rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 p-3">
                    <p className="text-xs text-teal-800 dark:text-teal-200 leading-relaxed">
                      {selectedFinding.design_reference}
                    </p>
                  </div>
                </section>
              )}

              {/* Tags */}
              {selectedFinding.tags && selectedFinding.tags.length > 0 && (
                <section>
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedFinding.tags.map((tag) => (
                      <span key={tag} className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </section>
              )}
              {/* Comments */}
              <section>
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Comments & Collaboration
                </h3>
                <div className="space-y-2">
                  {(comments[selectedFinding.id] ?? []).map((c) => (
                    <div key={c.id} className="rounded-xl border border-border bg-card p-3 flex gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="h-3 w-3 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs leading-relaxed">{c.content}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {new Date(c.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && postComment(selectedFinding.id)}
                      placeholder="Add a comment or note for your team…"
                      className="flex-1 px-3 py-2 rounded-xl border border-input bg-background text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <button
                      onClick={() => postComment(selectedFinding.id)}
                      disabled={isPostingComment || !commentInput.trim()}
                      className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40"
                    >
                      {isPostingComment ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-3 max-w-xs">
              <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mx-auto">
                <AlertTriangle className="h-7 w-7 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">Select a finding to review</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Click any finding on the left, or click a highlighted area on the screenshot
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
