// ============================================================
// FUSION UX — Core Type Definitions
// ============================================================

export type SeverityLevel = "critical" | "high" | "medium" | "low";
export type IssueStatus = "open" | "in_progress" | "resolved" | "ignored";
export type AuditStatus = "draft" | "in_progress" | "ai_analyzing" | "review" | "completed" | "archived";
export type AuditType = "url" | "image" | "full" | "figma";
export type UserRole = "admin" | "ux_researcher" | "ui_designer" | "business_analyst" | "qa_engineer" | "developer" | "product_manager" | "viewer";
export type FindingVerificationStatus = "pending" | "verified" | "edited" | "rejected";

// ============================================================
// HEURISTIC CHECKLIST TYPES (from JSON)
// ============================================================

export interface HeuristicItem {
  id: string;
  text: string;
  hint: string;
  role: string;
  response: boolean | null;
  severity: SeverityLevel | null;
  notes: string;
}

export interface HeuristicCategory {
  number: string;
  name: string;
  sheet: string;
  item_count: number;
  items: HeuristicItem[];
}

export interface HeuristicChecklist {
  version: string;
  product: string;
  categories: HeuristicCategory[];
}

// ============================================================
// USER & ORGANIZATION
// ============================================================

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  job_title: string | null;
  timezone: string;
  preferences: Record<string, unknown>;
  onboarded: boolean;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  website: string | null;
  industry: string | null;
  plan: "free" | "pro";
  ai_credits: number;
  plan_seats: number;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: UserRole;
  joined_at: string;
  profile?: Profile;
}

// ============================================================
// AUDIT
// ============================================================

export interface Audit {
  id: string;
  project_id: string | null;
  organization_id: string;
  created_by: string;
  name: string;
  description: string | null;
  status: AuditStatus;
  audit_type: AuditType;
  target_url: string | null;
  device_type: string;
  overall_score: number | null;
  heuristic_score: number | null;
  accessibility_score: number | null;
  ai_summary: string | null;
  screenshot_url: string | null;
  category_scores: Record<string, number> | null;
  findings_count: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  screenshots?: AuditScreenshot[];
  findings?: Finding[];
}

export interface AuditScreenshot {
  id: string;
  audit_id: string;
  url: string;
  filename: string;
  file_size: number | null;
  order_index: number;
  annotations: Annotation[];
  created_at: string;
}

export interface Annotation {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  color: string;
  finding_id?: string;
}

// ============================================================
// FINDINGS
// ============================================================

export interface Finding {
  id: string;
  audit_id: string;
  screenshot_id: string | null;
  created_by: string;
  assigned_to: string | null;
  title: string;
  description: string | null;
  severity: SeverityLevel;
  status: IssueStatus;
  verification_status: FindingVerificationStatus;
  heuristic_category: string | null;
  heuristic_item_id: string | null;
  location: string | null;
  impact_score: number | null;
  frequency_score: number | null;
  priority_score: number | null;
  ai_generated: boolean;
  ai_suggestion: string | null;
  business_impact: string | null;
  financial_risk: string | null;
  tags: string[];
  human_notes: string | null;
  wcag_criteria: string[] | null;
  design_reference: string | null;
  critical_analysis: string | null;
  bounding_box: BoundingBox | null;
  proposed_design_url: string | null;
  proposed_design_prompt: string | null;
  fix_generated_at: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  screenshot?: AuditScreenshot;
  comments?: Comment[];
}

// ============================================================
// AI ANALYSIS
// ============================================================

export interface AIAnalysisRequest {
  audit_id: string;
  image_urls?: string[];
  target_url?: string;
  audit_type: AuditType;
  checklist: HeuristicChecklist;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AIFinding {
  title: string;
  description: string;
  severity: SeverityLevel;
  heuristic_category: string;
  heuristic_item_id: string;
  location: string;
  impact_score: number;
  frequency_score: number;
  ai_suggestion: string;
  business_impact: string;
  financial_risk: string;
  wcag_criteria?: string[];
  design_reference?: string;
  critical_analysis?: string;
  tags: string[];
  bounding_box?: BoundingBox | null;
}

export interface AIAnalysisResult {
  overall_score: number;
  heuristic_score: number;
  accessibility_score: number;
  ai_summary: string;
  findings: AIFinding[];
  category_scores: Record<string, number>;
  executive_summary: string;
  top_priority_issues: string[];
  improvement_roadmap: string[];
}

// ============================================================
// COMMENTS
// ============================================================

export interface Comment {
  id: string;
  finding_id: string;
  audit_id: string | null;
  author_id: string;
  parent_id: string | null;
  body: string;
  mentions: string[];
  edited_at: string | null;
  created_at: string;
  author?: Profile;
}

// ============================================================
// REPORTS
// ============================================================

export interface Report {
  id: string;
  audit_id: string;
  created_by: string;
  name: string;
  status: "generating" | "ready" | "failed";
  file_url: string | null;
  config: ReportConfig;
  ai_summary: string | null;
  generated_at: string | null;
  created_at: string;
}

export interface ReportConfig {
  sections: ReportSection[];
  branding: {
    logo_url?: string;
    primary_color: string;
    company_name: string;
  };
  include_screenshots: boolean;
  include_roi: boolean;
  include_roadmap: boolean;
}

export type ReportSection =
  | "executive_summary"
  | "ux_score"
  | "severity_matrix"
  | "findings"
  | "screenshots"
  | "analytics"
  | "accessibility"
  | "recommendations"
  | "roi"
  | "roadmap"
  | "action_items";

// ============================================================
// API RESPONSES
// ============================================================

export interface ApiSuccess<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  code?: string;
  details?: unknown;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ============================================================
// UI STATE
// ============================================================

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  description?: string;
}

export interface SeverityConfig {
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: string;
}

export const SEVERITY_CONFIG: Record<SeverityLevel, SeverityConfig> = {
  critical: {
    label: "Critical",
    color: "text-red-600",
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-800",
    icon: "🔴",
  },
  high: {
    label: "High",
    color: "text-orange-600",
    bg: "bg-orange-50 dark:bg-orange-950/30",
    border: "border-orange-200 dark:border-orange-800",
    icon: "🟠",
  },
  medium: {
    label: "Medium",
    color: "text-yellow-600",
    bg: "bg-yellow-50 dark:bg-yellow-950/30",
    border: "border-yellow-200 dark:border-yellow-800",
    icon: "🟡",
  },
  low: {
    label: "Low",
    color: "text-green-600",
    bg: "bg-green-50 dark:bg-green-950/30",
    border: "border-green-200 dark:border-green-800",
    icon: "🟢",
  },
};
