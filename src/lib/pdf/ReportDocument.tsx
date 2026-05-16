import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { HEURISTIC_CHECKLIST } from "@/lib/checklist";

// ─────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────
const C = {
  slate950: "#020617",
  slate900: "#0f172a",
  slate800: "#1e293b",
  slate700: "#334155",
  slate600: "#475569",
  slate500: "#64748b",
  slate400: "#94a3b8",
  slate300: "#cbd5e1",
  slate200: "#e2e8f0",
  slate100: "#f1f5f9",
  slate50:  "#f8fafc",
  white:    "#ffffff",
  indigo600: "#4f46e5",
  indigo500: "#6366f1",
  indigo400: "#818cf8",
  indigo100: "#e0e7ff",
  red600:   "#dc2626",
  red50:    "#fef2f2",
  red200:   "#fecaca",
  orange600: "#ea580c",
  orange50:  "#fff7ed",
  orange200: "#fed7aa",
  yellow600: "#ca8a04",
  yellow50:  "#fefce8",
  yellow200: "#fde047",
  green600:  "#16a34a",
  green50:   "#f0fdf4",
  green200:  "#bbf7d0",
  blue600:   "#2563eb",
  blue50:    "#eff6ff",
  blue200:   "#bfdbfe",
  purple700: "#7e22ce",
  purple50:  "#faf5ff",
} as const;

// ─────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  // ── Page layouts ──
  darkPage: {
    fontFamily: "Helvetica",
    backgroundColor: C.slate900,
    paddingTop: 0, paddingBottom: 0, paddingHorizontal: 0,
    color: C.white,
  },
  lightPage: {
    fontFamily: "Helvetica",
    backgroundColor: C.white,
    paddingTop: 36, paddingBottom: 48,
    paddingHorizontal: 44,
    color: C.slate900,
  },

  // ── Running footer ──
  footer: {
    position: "absolute", bottom: 16, left: 44, right: 44,
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1, borderTopColor: C.slate200, paddingTop: 5,
  },
  footerText: { fontSize: 7, color: C.slate400 },
  footerBrand: { fontSize: 7, color: C.indigo600, fontFamily: "Helvetica-Bold" },

  // ── Light page running header ──
  runningHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginBottom: 18, paddingBottom: 10,
    borderBottomWidth: 1, borderBottomColor: C.slate200,
  },
  runningHeaderLeft: { fontSize: 8, fontFamily: "Helvetica-Bold", color: C.indigo600 },
  runningHeaderRight: { fontSize: 8, color: C.slate500 },

  // ── Cover page elements ──
  coverInner: {
    flex: 1, justifyContent: "space-between",
    paddingTop: 56, paddingBottom: 44, paddingHorizontal: 50,
  },
  coverTopBar: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingBottom: 28, borderBottomWidth: 1, borderBottomColor: C.slate700,
    marginBottom: 36,
  },
  coverLogo: {
    width: 44, height: 44, backgroundColor: C.indigo500,
    borderRadius: 10, justifyContent: "center", alignItems: "center",
  },
  coverLogoText: { fontSize: 20, fontFamily: "Helvetica-Bold", color: C.white },
  coverBrand: { fontSize: 11, fontFamily: "Helvetica-Bold", color: C.indigo400, letterSpacing: 2 },
  coverConfidential: { fontSize: 7, color: C.slate500 },
  coverReportType: { fontSize: 9, color: C.indigo400, fontFamily: "Helvetica-Bold", marginBottom: 10 },
  coverTitle: { fontSize: 28, fontFamily: "Helvetica-Bold", color: C.white, lineHeight: 1.2, marginBottom: 8 },
  coverSubtitle: { fontSize: 13, color: C.slate400, marginBottom: 36 },
  coverMetaGrid: { flexDirection: "row", gap: 12, marginBottom: 36 },
  coverMetaCard: {
    flex: 1, backgroundColor: C.slate800, borderRadius: 8, padding: 14,
    borderTopWidth: 2, borderTopColor: C.indigo600,
  },
  coverMetaLabel: { fontSize: 7, color: C.slate500, marginBottom: 4, fontFamily: "Helvetica-Bold" },
  coverMetaValue: { fontSize: 10, fontFamily: "Helvetica-Bold", color: C.white },
  coverScoreGrid: { flexDirection: "row", gap: 8 },
  coverScoreCard: {
    flex: 1, backgroundColor: C.slate800, borderRadius: 6, padding: 12, alignItems: "center",
  },
  coverScoreNum: { fontSize: 20, fontFamily: "Helvetica-Bold", color: C.white, marginBottom: 2 },
  coverScoreLabel: { fontSize: 6, color: C.slate400, textAlign: "center" },
  coverBottomBar: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingTop: 20, borderTopWidth: 1, borderTopColor: C.slate700,
  },
  coverBottomText: { fontSize: 7, color: C.slate600 },

  // ── Section headings ──
  sectionTitle: {
    fontSize: 13, fontFamily: "Helvetica-Bold", color: C.slate900,
    marginBottom: 10, paddingBottom: 6,
    borderBottomWidth: 2, borderBottomColor: C.indigo600,
  },
  subsectionTitle: { fontSize: 9, fontFamily: "Helvetica-Bold", color: C.slate700, marginBottom: 5, marginTop: 8 },

  // ── Exec summary ──
  scoreBand: { flexDirection: "row", gap: 8, marginBottom: 16 },
  scoreTile: { flex: 1, borderRadius: 7, padding: 13, alignItems: "center" },
  scoreTilePrimary: { backgroundColor: C.indigo100, borderTopWidth: 3, borderTopColor: C.indigo600 },
  scoreTileGood:    { backgroundColor: C.green50,   borderTopWidth: 3, borderTopColor: C.green600 },
  scoreTileWarn:    { backgroundColor: C.yellow50,  borderTopWidth: 3, borderTopColor: C.yellow600 },
  scoreTileDanger:  { backgroundColor: C.red50,     borderTopWidth: 3, borderTopColor: C.red600 },
  scoreTileNum: { fontSize: 24, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  scoreTileLabel: { fontSize: 6, color: C.slate600, textAlign: "center" },
  riskBox: {
    backgroundColor: C.slate900, borderRadius: 7, padding: 14,
    marginBottom: 14, flexDirection: "row", alignItems: "center", gap: 14,
  },
  riskLabel: { fontSize: 7, color: C.slate400, fontFamily: "Helvetica-Bold" },
  riskValue: { fontSize: 22, fontFamily: "Helvetica-Bold", color: C.white },
  riskFormula: { fontSize: 7, color: C.slate500 },
  riskDesc: { fontSize: 8, color: C.slate300, flex: 1, lineHeight: 1.5 },
  infoBox: {
    backgroundColor: C.slate50, borderRadius: 6, padding: 12,
    borderLeftWidth: 3, borderLeftColor: C.indigo600, marginBottom: 12,
  },
  infoBoxText: { fontSize: 9, color: C.slate700, lineHeight: 1.6 },
  severityMatrix: { flexDirection: "row", gap: 8, marginBottom: 12 },
  severityTile: { flex: 1, borderRadius: 6, padding: 10, alignItems: "center" },
  severityTileNum: { fontSize: 18, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  severityTileLabel: { fontSize: 6, fontFamily: "Helvetica-Bold" },
  priorityItem: { flexDirection: "row", gap: 8, marginBottom: 7 },
  priorityBullet: {
    width: 20, height: 20, borderRadius: 10,
    justifyContent: "center", alignItems: "center",
  },
  priorityBulletText: { fontSize: 8, fontFamily: "Helvetica-Bold", color: C.white },
  priorityText: { fontSize: 9, color: C.slate700, flex: 1, lineHeight: 1.5, paddingTop: 3 },

  // ── Category chapter header ──
  catChapter: {
    backgroundColor: C.slate900, borderRadius: 7,
    padding: 14, marginBottom: 12,
    flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start",
  },
  catChapterLeft: { flex: 1 },
  catChapterEyebrow: { fontSize: 7, color: C.indigo400, fontFamily: "Helvetica-Bold", marginBottom: 3 },
  catChapterName: { fontSize: 14, fontFamily: "Helvetica-Bold", color: C.white, marginBottom: 6 },
  catChapterStats: { flexDirection: "row", gap: 8 },
  catChapterStat: {
    backgroundColor: C.slate800, borderRadius: 4, padding: "5 8",
    alignItems: "center", minWidth: 44,
  },
  catChapterStatNum: { fontSize: 11, fontFamily: "Helvetica-Bold", color: C.white },
  catChapterStatLabel: { fontSize: 6, color: C.slate400 },
  catChapterRight: { alignItems: "flex-end", gap: 4 },
  catScore: { fontSize: 28, fontFamily: "Helvetica-Bold", color: C.white },
  catScoreLabel: { fontSize: 7, color: C.slate400 },
  healthBadge: {
    fontSize: 7, fontFamily: "Helvetica-Bold",
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10,
  },

  // ── Failure section ──
  failuresSectionBar: {
    backgroundColor: C.red50, borderRadius: 4,
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingVertical: 5, paddingHorizontal: 10, marginBottom: 8,
    borderLeftWidth: 3, borderLeftColor: C.red600,
  },
  failuresSectionTitle: { fontSize: 8, fontFamily: "Helvetica-Bold", color: C.red600 },
  failureCard: {
    borderRadius: 6, padding: 10, marginBottom: 8,
    borderLeftWidth: 3,
  },
  failureCardCritical: { backgroundColor: "#fef9f9", borderLeftColor: C.red600 },
  failureCardHigh:     { backgroundColor: "#fff9f5", borderLeftColor: C.orange600 },
  failureCardMedium:   { backgroundColor: "#fffef0", borderLeftColor: C.yellow600 },
  failureCardLow:      { backgroundColor: "#f5fff8", borderLeftColor: C.green600 },
  failureTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 5 },
  failureCriterionId: { fontSize: 8, fontFamily: "Helvetica-Bold", color: C.indigo600 },
  failureTitle: { fontSize: 9, fontFamily: "Helvetica-Bold", color: C.slate900, flex: 1, marginRight: 8 },
  severityPill: {
    fontSize: 6, fontFamily: "Helvetica-Bold",
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3,
  },
  pillCritical: { backgroundColor: C.red200,    color: C.red600 },
  pillHigh:     { backgroundColor: C.orange200, color: C.orange600 },
  pillMedium:   { backgroundColor: C.yellow200, color: C.yellow600 },
  pillLow:      { backgroundColor: C.green200,  color: C.green600 },

  evidenceBox: {
    backgroundColor: C.slate800, borderRadius: 4, padding: 6, marginBottom: 6,
    flexDirection: "row", gap: 6, alignItems: "flex-start",
  },
  evidenceLabel: { fontSize: 6, color: C.indigo400, fontFamily: "Helvetica-Bold", width: 60 },
  evidenceText: { fontSize: 7, color: C.slate200, flex: 1, lineHeight: 1.4 },

  fieldLabel: { fontSize: 7, fontFamily: "Helvetica-Bold", color: C.slate600, marginBottom: 3 },
  fieldText:  { fontSize: 8, color: C.slate700, lineHeight: 1.5 },

  wcagRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 4, marginBottom: 5 },
  wcagLabel: { fontSize: 7, fontFamily: "Helvetica-Bold", color: C.blue600 },
  wcagPill: {
    fontSize: 6, fontFamily: "Helvetica-Bold",
    backgroundColor: C.blue50, color: C.blue600,
    paddingHorizontal: 5, paddingVertical: 2, borderRadius: 3,
  },
  remediationBox: {
    backgroundColor: C.purple50, borderRadius: 5, padding: 7,
    borderLeftWidth: 2, borderLeftColor: C.purple700, marginTop: 5,
  },
  remediationLabel: { fontSize: 6, fontFamily: "Helvetica-Bold", color: C.purple700, marginBottom: 3 },
  remediationText: { fontSize: 8, color: "#4c1d95", lineHeight: 1.45 },
  businessImpactText: { fontSize: 7, color: C.orange600, lineHeight: 1.4, marginTop: 5, fontFamily: "Helvetica-Oblique" },

  // ── Passed checks ──
  passedSectionBar: {
    backgroundColor: C.green50, borderRadius: 4,
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingVertical: 5, paddingHorizontal: 10, marginBottom: 6,
    borderLeftWidth: 3, borderLeftColor: C.green600,
  },
  passedSectionTitle: { fontSize: 8, fontFamily: "Helvetica-Bold", color: C.green600 },
  passedGrid: { flexDirection: "row", flexWrap: "wrap", gap: 3 },
  passedItem: {
    flexDirection: "row", alignItems: "flex-start", gap: 3,
    width: "48%",
    backgroundColor: C.green50, borderRadius: 3, padding: "3 5",
  },
  passedCheckmark: { fontSize: 7, color: C.green600, fontFamily: "Helvetica-Bold" },
  passedId: { fontSize: 6, color: C.green600, fontFamily: "Helvetica-Bold", width: 22 },
  passedText: { fontSize: 6, color: C.slate600, flex: 1, lineHeight: 1.3 },

  // ── Validation protocol ──
  validationStep: {
    flexDirection: "row", gap: 12, marginBottom: 12,
    backgroundColor: C.slate50, borderRadius: 6, padding: 10,
  },
  validationStepNum: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: C.slate900, justifyContent: "center", alignItems: "center",
    flexShrink: 0,
  },
  validationStepNumText: { fontSize: 10, fontFamily: "Helvetica-Bold", color: C.white },
  validationStepBody: { flex: 1 },
  validationStepTitle: { fontSize: 9, fontFamily: "Helvetica-Bold", color: C.slate900, marginBottom: 3 },
  validationStepText: { fontSize: 8, color: C.slate600, lineHeight: 1.5 },
  criteriaTable: { borderWidth: 1, borderColor: C.slate200, borderRadius: 5, overflow: "hidden", marginTop: 10 },
  criteriaHeaderRow: { flexDirection: "row", backgroundColor: C.slate900, padding: 7 },
  criteriaHeaderCell: { fontSize: 7, fontFamily: "Helvetica-Bold", color: C.white },
  criteriaRow: { flexDirection: "row", padding: 7, borderTopWidth: 1, borderTopColor: C.slate200 },
  criteriaRowAlt: { backgroundColor: C.slate50 },
  criteriaCell: { fontSize: 8, color: C.slate700 },

  // ── Category score table ──
  catScoreRow: { flexDirection: "row", alignItems: "center", marginBottom: 5, gap: 8 },
  catScoreRowNum: { fontSize: 7, color: C.slate500, width: 22 },
  catScoreRowName: { fontSize: 8, color: C.slate700, width: 170 },
  catScoreBarBg: { flex: 1, height: 8, backgroundColor: C.slate200, borderRadius: 4, overflow: "hidden" },
  catScoreBarFill: { height: 8, borderRadius: 4 },
  catScoreValue: { fontSize: 8, fontFamily: "Helvetica-Bold", width: 25, textAlign: "right" },

  // ── General ──
  divider: { borderBottomWidth: 1, borderBottomColor: C.slate200, marginVertical: 10 },
  twoCol: { flexDirection: "row", gap: 10 },
  col: { flex: 1 },
  tag: {
    fontSize: 6, color: C.slate500, backgroundColor: C.slate100,
    paddingHorizontal: 5, paddingVertical: 2, borderRadius: 10,
  },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 3, marginTop: 4 },
});

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────
export interface ReportFinding {
  title: string;
  description: string | null;
  severity: "critical" | "high" | "medium" | "low";
  heuristic_category: string | null;
  heuristic_item_id: string | null;
  location: string | null;
  ai_suggestion: string | null;
  business_impact: string | null;
  financial_risk: string | null;
  wcag_criteria: string[] | null;
  design_reference: string | null;
  critical_analysis: string | null;
  tags: string[] | null;
  verification_status: string;
  impact_score: number | null;
  frequency_score: number | null;
}

export interface ReportData {
  audit: {
    name: string;
    target_url: string | null;
    audit_type: string;
    device_type: string;
    overall_score: number | null;
    heuristic_score: number | null;
    accessibility_score: number | null;
    ai_summary: string | null;
    executive_summary: string | null;
    top_priority_issues: string[] | null;
    improvement_roadmap: string[] | null;
    category_scores: Record<string, number> | null;
    critical_count: number;
    high_count: number;
    medium_count: number;
    low_count: number;
    created_at: string;
    completed_at: string | null;
  };
  findings: ReportFinding[];
  executive_summary?: string;
  roi_analysis?: string;
  roadmap?: string[];
  organization_name?: string;
  preparer_name?: string;
}

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────
const CATEGORY_NAMES: Record<string, string> = {
  "01": "Visibility of System State",
  "02": "Match Between System & Real World",
  "03": "User Control and Freedom",
  "04": "Consistency and Standards",
  "05": "Error Prevention and Recovery",
  "06": "Recognition Over Recall",
  "07": "Flexibility, Aesthetics & Minimalism",
  "08": "Adaptability and User Efficiency",
  "09": "Inclusivity and Accessibility",
  "10": "Information Architecture",
  "11": "Content and Microcopy",
  "12": "Trust, Privacy and Data UX",
};

const SEVERITY_WEIGHTS: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
const RISK_UNIT_VALUE = 1000; // $1,000 per risk unit (Impact × Frequency × Severity Weight)

const TOTAL_CRITERIA = HEURISTIC_CHECKLIST.categories.reduce((s, c) => s + c.item_count, 0);

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function formatCurrency(n: number) {
  return "$" + n.toLocaleString("en-US");
}

function truncate(s: string, len: number) {
  return s.length > len ? s.slice(0, len) + "…" : s;
}

function getBarColor(score: number | null): string {
  if (!score) return C.slate300;
  if (score >= 80) return C.green600;
  if (score >= 60) return C.yellow600;
  if (score >= 40) return C.orange600;
  return C.red600;
}

function getScoreColor(score: number | null): string {
  if (!score) return C.slate500;
  if (score >= 80) return C.green600;
  if (score >= 60) return C.yellow600;
  if (score >= 40) return C.orange600;
  return C.red600;
}

function getHealthLevel(score: number | null): { label: string; bg: string; color: string } {
  if (!score) return { label: "Not Scored", bg: C.slate700, color: C.slate300 };
  if (score >= 90) return { label: "Excellent",  bg: "#14532d", color: "#86efac" };
  if (score >= 75) return { label: "Good",       bg: "#166534", color: "#4ade80" };
  if (score >= 60) return { label: "Fair",       bg: "#854d0e", color: "#fde047" };
  if (score >= 40) return { label: "Poor",       bg: "#7c2d12", color: "#fb923c" };
  return                    { label: "Critical",  bg: "#7f1d1d", color: "#f87171" };
}

function calcFindingRisk(f: ReportFinding): number {
  return (f.impact_score ?? 3) * (f.frequency_score ?? 3) * (SEVERITY_WEIGHTS[f.severity] ?? 1) * RISK_UNIT_VALUE;
}

function getItemCategoryNum(itemId: string | null): string | null {
  if (!itemId) return null;
  const n = parseInt(itemId.split(".")[0], 10);
  if (isNaN(n)) return null;
  return n.toString().padStart(2, "0");
}

function getFailureCardStyle(severity: string) {
  switch (severity) {
    case "critical": return S.failureCardCritical;
    case "high":     return S.failureCardHigh;
    case "medium":   return S.failureCardMedium;
    default:         return S.failureCardLow;
  }
}

function getSeverityPillStyle(severity: string) {
  switch (severity) {
    case "critical": return S.pillCritical;
    case "high":     return S.pillHigh;
    case "medium":   return S.pillMedium;
    default:         return S.pillLow;
  }
}

// ─────────────────────────────────────────────────────────────
// PAGE CHROME
// ─────────────────────────────────────────────────────────────
function LightHeader({ right }: { right: string }) {
  return (
    <View style={S.runningHeader}>
      <Text style={S.runningHeaderLeft}>FUSION UX  ·  UX AUDIT REPORT</Text>
      <Text style={S.runningHeaderRight}>{right}</Text>
    </View>
  );
}

function Footer({ auditName, page }: { auditName: string; page: string }) {
  return (
    <View style={S.footer}>
      <Text style={S.footerText}>{auditName}</Text>
      <Text style={S.footerBrand}>FUSION UX</Text>
      <Text style={S.footerText}>Page {page}  ·  Confidential</Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// FAILURE DETAIL CARD (inside category chapter)
// ─────────────────────────────────────────────────────────────
function FailureDetail({ finding, globalIndex }: { finding: ReportFinding; globalIndex: number }) {
  const checklistItem = HEURISTIC_CHECKLIST.categories
    .flatMap((c) => c.items)
    .find((i) => i.id === finding.heuristic_item_id);

  return (
    <View style={[S.failureCard, getFailureCardStyle(finding.severity)]}>
      {/* Header row */}
      <View style={S.failureTopRow}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={S.failureCriterionId}>
            {finding.heuristic_item_id
              ? `Criterion ${finding.heuristic_item_id} — ${CATEGORY_NAMES[getItemCategoryNum(finding.heuristic_item_id) ?? ""] ?? finding.heuristic_category ?? "Uncategorised"}`
              : finding.heuristic_category ?? "Uncategorised"}
          </Text>
          <Text style={S.failureTitle}>{finding.title}</Text>
        </View>
        <View style={{ alignItems: "flex-end", gap: 3 }}>
          <Text style={[S.severityPill, getSeverityPillStyle(finding.severity)]}>
            {finding.severity.toUpperCase()}
          </Text>
          {(finding.impact_score != null && finding.frequency_score != null) && (
            <Text style={{ fontSize: 6, color: C.slate500 }}>
              Priority {finding.impact_score * finding.frequency_score}/25
            </Text>
          )}
        </View>
      </View>

      {/* Visual evidence */}
      {finding.location && (
        <View style={S.evidenceBox}>
          <Text style={S.evidenceLabel}>VISUAL EVIDENCE</Text>
          <Text style={S.evidenceText}>{finding.location}</Text>
        </View>
      )}

      {/* Original checklist criterion text */}
      {checklistItem && (
        <View style={{ marginBottom: 6 }}>
          <Text style={S.fieldLabel}>CRITERION TEXT</Text>
          <Text style={[S.fieldText, { fontSize: 7, color: C.slate500, fontFamily: "Helvetica-Oblique" }]}>
            "{checklistItem.text}"
          </Text>
        </View>
      )}

      {/* Heuristic analysis */}
      {(finding.description || finding.critical_analysis) && (
        <View style={{ marginBottom: 6 }}>
          <Text style={S.fieldLabel}>HEURISTIC ANALYSIS</Text>
          {finding.description && (
            <Text style={S.fieldText}>{finding.description}</Text>
          )}
          {finding.critical_analysis && (
            <Text style={[S.fieldText, { marginTop: 5, color: C.slate600 }]}>
              {finding.critical_analysis}
            </Text>
          )}
        </View>
      )}

      {/* WCAG criteria */}
      {finding.wcag_criteria && finding.wcag_criteria.length > 0 && (
        <View style={S.wcagRow}>
          <Text style={S.wcagLabel}>WCAG:</Text>
          {finding.wcag_criteria.map((w, i) => (
            <Text key={i} style={S.wcagPill}>{w}</Text>
          ))}
          {finding.design_reference && (
            <Text style={{ fontSize: 7, color: C.slate500, flex: 1, marginLeft: 6, fontFamily: "Helvetica-Oblique" }}>
              Ref: {truncate(finding.design_reference, 60)}
            </Text>
          )}
        </View>
      )}

      {/* AI remediation */}
      {finding.ai_suggestion && (
        <View style={S.remediationBox}>
          <Text style={S.remediationLabel}>AI-GENERATED REMEDIATION STRATEGY</Text>
          <Text style={S.remediationText}>{finding.ai_suggestion}</Text>
        </View>
      )}

      {/* Business / financial impact */}
      {(finding.business_impact || finding.financial_risk) && (
        <View style={S.twoCol}>
          {finding.business_impact && (
            <View style={[S.col, { backgroundColor: "#fff7ed", borderRadius: 4, padding: 6, marginTop: 6 }]}>
              <Text style={{ fontSize: 6, fontFamily: "Helvetica-Bold", color: C.orange600, marginBottom: 2 }}>BUSINESS IMPACT</Text>
              <Text style={{ fontSize: 7, color: "#7c2d12", lineHeight: 1.4 }}>{finding.business_impact}</Text>
            </View>
          )}
          {finding.financial_risk && (
            <View style={[S.col, { backgroundColor: C.red50, borderRadius: 4, padding: 6, marginTop: 6 }]}>
              <Text style={{ fontSize: 6, fontFamily: "Helvetica-Bold", color: C.red600, marginBottom: 2 }}>FINANCIAL / COMPLIANCE RISK</Text>
              <Text style={{ fontSize: 7, color: "#7f1d1d", lineHeight: 1.4 }}>{finding.financial_risk}</Text>
            </View>
          )}
        </View>
      )}

      {/* Tags */}
      {finding.tags && finding.tags.length > 0 && (
        <View style={S.tagRow}>
          {finding.tags.map((t, i) => <Text key={i} style={S.tag}>#{t}</Text>)}
        </View>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN DOCUMENT
// ─────────────────────────────────────────────────────────────
export function ReportDocument({ data }: { data: ReportData }) {
  const { audit, findings, executive_summary, roi_analysis, roadmap, organization_name, preparer_name } = data;

  const totalIssues = audit.critical_count + audit.high_count + audit.medium_count + audit.low_count;
  const catScores = audit.category_scores ?? {};

  // Build finding maps
  const findingsByCategory = new Map<string, ReportFinding[]>();
  const findingMap = new Map<string, { severity: string; title: string }>();
  for (const f of findings) {
    if (f.heuristic_item_id) {
      findingMap.set(f.heuristic_item_id, { severity: f.severity, title: f.title });
      const catNum = getItemCategoryNum(f.heuristic_item_id);
      if (catNum) {
        if (!findingsByCategory.has(catNum)) findingsByCategory.set(catNum, []);
        findingsByCategory.get(catNum)!.push(f);
        continue;
      }
    }
    // Fallback: match by category name
    if (f.heuristic_category) {
      const match = Object.entries(CATEGORY_NAMES).find(([, name]) =>
        name.toLowerCase().includes(f.heuristic_category!.toLowerCase().split(" ")[0]) ||
        f.heuristic_category!.toLowerCase().includes(name.toLowerCase().split(" ")[0])
      );
      if (match) {
        if (!findingsByCategory.has(match[0])) findingsByCategory.set(match[0], []);
        findingsByCategory.get(match[0])!.push(f);
      }
    }
  }

  // Financial risk
  const totalFinancialRisk = findings.reduce((sum, f) => sum + calcFindingRisk(f), 0);
  const verifiedCount = findings.filter(
    (f) => f.verification_status === "verified" || f.verification_status === "edited"
  ).length;

  // Page counter (approximate — react-pdf has no dynamic refs)
  const catStartPage = 4;

  return (
    <Document
      title={`Fusion UX Report — ${audit.name}`}
      author="Fusion UX Platform"
      subject="UX Audit Report"
    >

      {/* ══════════════════════════════════════
          PAGE 1 — DARK COVER
      ══════════════════════════════════════ */}
      <Page size="A4" style={S.darkPage}>
        <View style={S.coverInner}>
          {/* Top bar */}
          <View style={S.coverTopBar}>
            <View style={S.coverLogo}>
              <Text style={S.coverLogoText}>F</Text>
            </View>
            <Text style={S.coverBrand}>FUSION UX</Text>
            <Text style={S.coverConfidential}>CONFIDENTIAL · NOT FOR DISTRIBUTION</Text>
          </View>

          {/* Title block */}
          <View>
            <Text style={S.coverReportType}>UX HEURISTIC AUDIT REPORT</Text>
            <Text style={S.coverTitle}>{audit.name}</Text>
            <Text style={S.coverSubtitle}>
              {audit.target_url ?? "Screenshot-based audit"}  ·  {formatDate(audit.created_at)}
            </Text>

            {/* Metadata cards */}
            <View style={S.coverMetaGrid}>
              {[
                { label: "ORGANISATION",   value: organization_name ?? "—" },
                { label: "PREPARED BY",    value: preparer_name ?? "Fusion UX Platform" },
                { label: "AUDIT TYPE",     value: audit.audit_type.toUpperCase() },
                { label: "DEVICE",         value: audit.device_type?.toUpperCase() ?? "—" },
              ].map(({ label, value }) => (
                <View key={label} style={S.coverMetaCard}>
                  <Text style={S.coverMetaLabel}>{label}</Text>
                  <Text style={S.coverMetaValue}>{value}</Text>
                </View>
              ))}
            </View>

            {/* Score tiles */}
            <View style={S.coverScoreGrid}>
              {[
                { label: "UX HEALTH SCORE",   value: audit.overall_score },
                { label: "HEURISTIC SCORE",   value: audit.heuristic_score },
                { label: "ACCESSIBILITY",     value: audit.accessibility_score },
                { label: "CRITICAL ISSUES",   value: audit.critical_count },
                { label: "TOTAL FINDINGS",    value: totalIssues },
                { label: "CRITERIA EVALUATED", value: TOTAL_CRITERIA },
              ].map(({ label, value }) => (
                <View key={label} style={S.coverScoreCard}>
                  <Text style={[S.coverScoreNum, { color: typeof value === "number" && value <= 20 ? "#f87171" : C.white }]}>
                    {value ?? "—"}
                  </Text>
                  <Text style={S.coverScoreLabel}>{label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Bottom bar */}
          <View style={S.coverBottomBar}>
            <Text style={S.coverBottomText}>
              Based on the Fusion UX {TOTAL_CRITERIA}-criterion heuristic framework across 12 categories
            </Text>
            <Text style={S.coverBottomText}>
              Generated {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </Text>
          </View>
        </View>
      </Page>

      {/* ══════════════════════════════════════
          PAGE 2 — EXECUTIVE SUMMARY
      ══════════════════════════════════════ */}
      <Page size="A4" style={S.lightPage}>
        <LightHeader right="Section 1 — Executive Summary" />

        <Text style={S.sectionTitle}>SECTION 1 — EXECUTIVE SUMMARY</Text>

        {/* Score band */}
        <View style={S.scoreBand}>
          {[
            { label: "Overall UX Health Score", value: audit.overall_score,      style: S.scoreTilePrimary },
            { label: "Heuristic Compliance",    value: audit.heuristic_score,    style: S.scoreTileGood },
            { label: "Accessibility Score",     value: audit.accessibility_score, style: S.scoreTileWarn },
            { label: "Critical Issues",         value: audit.critical_count,      style: S.scoreTileDanger },
          ].map(({ label, value, style }) => (
            <View key={label} style={[S.scoreTile, style]}>
              <Text style={[S.scoreTileNum, { color: getScoreColor(typeof value === "number" ? value : null) }]}>
                {value ?? "—"}
              </Text>
              <Text style={S.scoreTileLabel}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Financial risk */}
        <View style={S.riskBox}>
          <View>
            <Text style={S.riskLabel}>TOTAL FINANCIAL / LEGAL RISK MITIGATED</Text>
            <Text style={S.riskValue}>{formatCurrency(totalFinancialRisk)}</Text>
            <Text style={S.riskFormula}>Formula: Impact × Frequency × Severity Weight × $1,000 per unit</Text>
          </View>
          <Text style={S.riskDesc}>
            This figure represents the estimated annual exposure from the identified UX violations —
            including conversion losses, accessibility legal risk (ADA / EAA), and user churn.
            Remediating all findings eliminates this exposure. Severity weights: Critical ×4,
            High ×3, Medium ×2, Low ×1.
          </Text>
        </View>

        {/* Severity breakdown */}
        <Text style={S.subsectionTitle}>FINDINGS BREAKDOWN BY SEVERITY</Text>
        <View style={S.severityMatrix}>
          {[
            { label: "Critical", count: audit.critical_count, bg: C.red50,     color: C.red600,    border: C.red600 },
            { label: "High",     count: audit.high_count,     bg: C.orange50,  color: C.orange600, border: C.orange600 },
            { label: "Medium",   count: audit.medium_count,   bg: C.yellow50,  color: C.yellow600, border: C.yellow600 },
            { label: "Low",      count: audit.low_count,      bg: C.green50,   color: C.green600,  border: C.green600 },
          ].map(({ label, count, bg, color, border }) => (
            <View key={label} style={[S.severityTile, { backgroundColor: bg, borderTopWidth: 3, borderTopColor: border }]}>
              <Text style={[S.severityTileNum, { color }]}>{count}</Text>
              <Text style={[S.severityTileLabel, { color }]}>{label}</Text>
              <Text style={{ fontSize: 6, color: C.slate500, marginTop: 2 }}>
                {totalIssues ? Math.round((count / totalIssues) * 100) : 0}% of total
              </Text>
            </View>
          ))}
        </View>
        <Text style={{ fontSize: 7, color: C.slate500, marginBottom: 10 }}>
          {TOTAL_CRITERIA} criteria evaluated · {totalIssues} violations found · {TOTAL_CRITERIA - totalIssues} criteria passed · {verifiedCount} human-verified
        </Text>

        {/* AI narrative */}
        {(audit.ai_summary || executive_summary) && (
          <View>
            <Text style={S.subsectionTitle}>AI ANALYSIS — OVERVIEW</Text>
            <View style={S.infoBox}>
              <Text style={S.infoBoxText}>{audit.ai_summary ?? executive_summary}</Text>
            </View>
          </View>
        )}

        {/* Board-level summary */}
        {(audit.executive_summary || executive_summary) && (
          <View>
            <Text style={S.subsectionTitle}>BOARD-LEVEL ASSESSMENT</Text>
            <Text style={[S.infoBoxText, { marginBottom: 10 }]}>
              {audit.executive_summary ?? executive_summary}
            </Text>
          </View>
        )}

        {/* Top priorities */}
        {audit.top_priority_issues && audit.top_priority_issues.length > 0 && (
          <View>
            <Text style={S.subsectionTitle}>TOP PRIORITY ISSUES REQUIRING IMMEDIATE ATTENTION</Text>
            {audit.top_priority_issues.map((issue, i) => (
              <View key={i} style={S.priorityItem}>
                <View style={[S.priorityBullet, {
                  backgroundColor: i === 0 ? C.red600 : i === 1 ? C.orange600 : C.indigo600,
                }]}>
                  <Text style={S.priorityBulletText}>{i + 1}</Text>
                </View>
                <Text style={S.priorityText}>{issue}</Text>
              </View>
            ))}
          </View>
        )}

        <Footer auditName={audit.name} page="2" />
      </Page>

      {/* ══════════════════════════════════════
          PAGE 3 — CATEGORY SCORES OVERVIEW
      ══════════════════════════════════════ */}
      <Page size="A4" style={S.lightPage}>
        <LightHeader right="Section 2 — Category Scores Overview" />

        <Text style={S.sectionTitle}>SECTION 2 — CATEGORY-BY-CATEGORY DEEP DIVE</Text>
        <Text style={{ fontSize: 9, color: C.slate600, marginBottom: 12, lineHeight: 1.5 }}>
          The following pages provide a full audit chapter for each of the 12 evaluation categories.
          Each chapter lists every violation with its precise criterion ID, heuristic analysis, and
          AI-generated remediation strategy — plus a complete list of criteria that passed inspection.
        </Text>

        {/* Score bars for all 12 categories */}
        <Text style={S.subsectionTitle}>SCORE SUMMARY — ALL 12 CATEGORIES</Text>
        {HEURISTIC_CHECKLIST.categories.map((cat) => {
          const score = catScores[cat.number] ?? null;
          const catFindings = findingsByCategory.get(cat.number) ?? [];
          const health = getHealthLevel(score);
          return (
            <View key={cat.number} style={S.catScoreRow}>
              <Text style={S.catScoreRowNum}>{cat.number}</Text>
              <Text style={S.catScoreRowName}>{cat.name}</Text>
              <View style={S.catScoreBarBg}>
                <View style={[S.catScoreBarFill, {
                  width: score ? `${score}%` : "0%",
                  backgroundColor: getBarColor(score),
                }]} />
              </View>
              <Text style={[S.catScoreValue, { color: getScoreColor(score) }]}>{score ?? "—"}</Text>
              <Text style={{ fontSize: 6, color: catFindings.length > 0 ? C.red600 : C.green600, width: 40, textAlign: "right" }}>
                {catFindings.length > 0 ? `${catFindings.length} fail` : "Pass"}
              </Text>
            </View>
          );
        })}

        <View style={[S.divider, { marginTop: 16 }]} />

        {/* ROI summary if available */}
        {roi_analysis && (
          <View style={{ marginTop: 12 }}>
            <Text style={S.subsectionTitle}>ROI ANALYSIS</Text>
            <View style={S.infoBox}>
              <Text style={S.infoBoxText}>{roi_analysis}</Text>
            </View>
          </View>
        )}

        {/* Improvement roadmap */}
        {(audit.improvement_roadmap ?? roadmap) && (
          <View style={{ marginTop: 8 }}>
            <Text style={S.subsectionTitle}>IMPROVEMENT ROADMAP</Text>
            {(audit.improvement_roadmap ?? roadmap ?? []).map((item, i) => {
              const phases = [
                { label: "30-DAY", bg: C.green50, color: C.green600 },
                { label: "60-DAY", bg: C.blue50,  color: C.blue600 },
                { label: "90-DAY", bg: C.purple50, color: C.purple700 },
              ];
              const phase = phases[i] ?? phases[2];
              return (
                <View key={i} style={{ flexDirection: "row", gap: 10, marginBottom: 7 }}>
                  <Text style={{
                    fontSize: 7, fontFamily: "Helvetica-Bold", paddingHorizontal: 8, paddingVertical: 3,
                    borderRadius: 10, minWidth: 55, textAlign: "center",
                    backgroundColor: phase.bg, color: phase.color,
                  }}>{phase.label}</Text>
                  <Text style={{ fontSize: 9, color: C.slate700, flex: 1, lineHeight: 1.5 }}>{item}</Text>
                </View>
              );
            })}
          </View>
        )}

        <Footer auditName={audit.name} page="3" />
      </Page>

      {/* ══════════════════════════════════════
          PAGES 4–15 — CATEGORY DEEP DIVE (×12)
      ══════════════════════════════════════ */}
      {HEURISTIC_CHECKLIST.categories.map((cat, catIdx) => {
        const catFindings = findingsByCategory.get(cat.number) ?? [];
        const score = catScores[cat.number] ?? null;
        const health = getHealthLevel(score);
        const passedItems = cat.items.filter((item) => !findingMap.has(item.id));
        const pageNum = catStartPage + catIdx;

        return (
          <Page key={cat.number} size="A4" style={S.lightPage}>
            <LightHeader right={`Category ${cat.number} of 12 — ${cat.name}`} />

            {/* Dark category chapter header */}
            <View style={S.catChapter}>
              <View style={S.catChapterLeft}>
                <Text style={S.catChapterEyebrow}>CATEGORY {cat.number} OF 12</Text>
                <Text style={S.catChapterName}>{cat.name}</Text>
                <View style={S.catChapterStats}>
                  {[
                    { num: String(cat.item_count),    label: "Criteria" },
                    { num: String(catFindings.length), label: "Failures",  color: catFindings.length > 0 ? "#f87171" : "#4ade80" },
                    { num: String(passedItems.length), label: "Passed",    color: "#4ade80" },
                  ].map(({ num, label, color }) => (
                    <View key={label} style={S.catChapterStat}>
                      <Text style={[S.catChapterStatNum, color ? { color } : {}]}>{num}</Text>
                      <Text style={S.catChapterStatLabel}>{label}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <View style={S.catChapterRight}>
                <Text style={[S.catScore, { color: getBarColor(score) }]}>{score ?? "—"}</Text>
                <Text style={S.catScoreLabel}>out of 100</Text>
                <Text style={[S.healthBadge, { backgroundColor: health.bg, color: health.color }]}>
                  {health.label}
                </Text>
              </View>
            </View>

            {/* ── FAILURES ── */}
            {catFindings.length > 0 ? (
              <View>
                <View style={S.failuresSectionBar}>
                  <Text style={S.failuresSectionTitle}>
                    DETAILED FAILURES — {catFindings.length} VIOLATION{catFindings.length > 1 ? "S" : ""} FOUND
                  </Text>
                </View>
                {catFindings.map((finding, fi) => (
                  <FailureDetail
                    key={fi}
                    finding={finding}
                    globalIndex={findings.indexOf(finding)}
                  />
                ))}
              </View>
            ) : (
              <View style={{ backgroundColor: C.green50, borderRadius: 6, padding: 10, marginBottom: 10, borderLeftWidth: 3, borderLeftColor: C.green600 }}>
                <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: C.green600, marginBottom: 3 }}>
                  ALL CLEAR — No violations detected in this category
                </Text>
                <Text style={{ fontSize: 8, color: C.slate600 }}>
                  All {cat.item_count} evaluation criteria in this category passed inspection.
                  The interface demonstrates strong compliance with {cat.name} principles.
                </Text>
              </View>
            )}

            {/* ── PASSED CHECKS ── */}
            <View style={S.passedSectionBar}>
              <Text style={S.passedSectionTitle}>
                PASSED CHECKS — {passedItems.length} OF {cat.item_count} CRITERIA MET
              </Text>
            </View>
            <View style={S.passedGrid}>
              {passedItems.map((item) => (
                <View key={item.id} style={S.passedItem}>
                  <Text style={S.passedCheckmark}>✓</Text>
                  <Text style={S.passedId}>{item.id}</Text>
                  <Text style={S.passedText}>{truncate(item.text, 58)}</Text>
                </View>
              ))}
            </View>

            <Footer auditName={audit.name} page={String(pageNum)} />
          </Page>
        );
      })}

      {/* ══════════════════════════════════════
          PAGE 16 — RE-AUDIT & VALIDATION PROTOCOL
      ══════════════════════════════════════ */}
      <Page size="A4" style={S.lightPage}>
        <LightHeader right="Section 3 — Re-Audit & Validation Protocol" />

        <Text style={S.sectionTitle}>SECTION 3 — RE-AUDIT & VALIDATION PROTOCOL</Text>
        <Text style={{ fontSize: 9, color: C.slate600, marginBottom: 14, lineHeight: 1.6 }}>
          This page defines the formal process by which your development and design teams can submit
          remediated items for validation. Clearing all Critical and High flags closes the compliance
          loop and unlocks a clean re-audit score. Follow each step in order.
        </Text>

        {[
          {
            title: "1. Implement the Remediation Strategy",
            text: "For each FLAGGED item in this report, follow the AI-Generated Remediation Strategy provided in the relevant category chapter. Assign each item to the responsible role (UX Designer, Developer, or both) using the Role Key from the checklist pages. Ensure fixes are committed to a dedicated remediation branch.",
          },
          {
            title: "2. Self-Assessment Checklist Sign-Off",
            text: "Before submitting for validation, each responsible team member must mark their assigned criteria as resolved in the project tracking system. QA engineers should conduct a regression pass against every FLAGGED criterion listed in Section 2, using the Criterion ID as the test case reference (e.g., 'TC-9.5 Colour Contrast').",
          },
          {
            title: "3. Submit Evidence Package to Fusion UX Validation Lab",
            text: "Upload a screen-recording or annotated screenshot set demonstrating each fix. One piece of visual evidence per Criterion ID. Name files using the convention: CriterionID_Before.png and CriterionID_After.png. Submit via the Fusion UX dashboard under Audits → Re-Validate → Upload Evidence.",
          },
          {
            title: "4. Automated Re-Analysis",
            text: "Fusion UX will re-run the AI analysis pipeline against the updated screenshots, cross-referencing the same 153-criterion checklist. A preliminary diff report will be generated within minutes, showing which previously FLAGGED criteria now pass. Critical and High severity items require manual review before the flag is cleared.",
          },
          {
            title: "5. Human Review & Flag Closure",
            text: "A Fusion UX analyst will review the evidence package for all Critical-severity findings. Flags are cleared only when the remediation fully addresses the heuristic violation described in the original finding. Partial fixes will receive a Partially Resolved status with a follow-up note.",
          },
          {
            title: "6. Compliance Certificate & Updated Score",
            text: "Once all Critical and High flags are cleared, Fusion UX issues a dated Compliance Certificate confirming the audit score at time of validation. This certificate can be shared with legal, procurement, and accessibility compliance teams as evidence of due diligence under WCAG 2.1/2.2, ADA, and EAA requirements.",
          },
        ].map(({ title, text }, i) => (
          <View key={i} style={S.validationStep}>
            <View style={S.validationStepNum}>
              <Text style={S.validationStepNumText}>{i + 1}</Text>
            </View>
            <View style={S.validationStepBody}>
              <Text style={S.validationStepTitle}>{title}</Text>
              <Text style={S.validationStepText}>{text}</Text>
            </View>
          </View>
        ))}

        {/* Validation criteria table */}
        <Text style={[S.subsectionTitle, { marginTop: 12 }]}>VALIDATION ACCEPTANCE CRITERIA</Text>
        <View style={S.criteriaTable}>
          <View style={S.criteriaHeaderRow}>
            <Text style={[S.criteriaHeaderCell, { width: "18%" }]}>Severity</Text>
            <Text style={[S.criteriaHeaderCell, { width: "30%" }]}>Evidence Required</Text>
            <Text style={[S.criteriaHeaderCell, { width: "22%" }]}>Review Type</Text>
            <Text style={[S.criteriaHeaderCell, { width: "30%" }]}>SLA to Clear</Text>
          </View>
          {[
            { sev: "CRITICAL", ev: "Screenshot + screen recording + dev note", rev: "Manual analyst review", sla: "3 business days" },
            { sev: "HIGH",     ev: "Before/after screenshots annotated",       rev: "Manual analyst review", sla: "5 business days" },
            { sev: "MEDIUM",   ev: "Before/after screenshots",                 rev: "Automated + spot check", sla: "7 business days" },
            { sev: "LOW",      ev: "After screenshot",                         rev: "Automated re-analysis",  sla: "10 business days" },
          ].map(({ sev, ev, rev, sla }, i) => (
            <View key={sev} style={[S.criteriaRow, i % 2 !== 0 ? S.criteriaRowAlt : {}]}>
              <Text style={[S.criteriaCell, { width: "18%", fontFamily: "Helvetica-Bold" }]}>{sev}</Text>
              <Text style={[S.criteriaCell, { width: "30%" }]}>{ev}</Text>
              <Text style={[S.criteriaCell, { width: "22%" }]}>{rev}</Text>
              <Text style={[S.criteriaCell, { width: "30%" }]}>{sla}</Text>
            </View>
          ))}
        </View>

        <Footer auditName={audit.name} page="16" />
      </Page>

      {/* ══════════════════════════════════════
          PAGE 17 — METHODOLOGY
      ══════════════════════════════════════ */}
      <Page size="A4" style={S.lightPage}>
        <LightHeader right="Appendix — Methodology & Standards" />

        <Text style={S.sectionTitle}>APPENDIX — METHODOLOGY & EVALUATION STANDARDS</Text>

        <View style={S.twoCol}>
          <View style={S.col}>
            <Text style={S.subsectionTitle}>Heuristic Frameworks Applied</Text>
            {[
              "Nielsen's 10 Usability Heuristics",
              "Shneiderman's 8 Golden Rules of Interface Design",
              "Gestalt Principles of Visual Perception",
              "Fitts's Law — interaction target sizing",
              "Miller's Law — cognitive load theory",
              "Baymard Institute UX Research (2023)",
              "GOV.UK Design System patterns",
              "Material Design 3 guidelines",
            ].map((item, i) => (
              <View key={i} style={{ flexDirection: "row", gap: 6, marginBottom: 4 }}>
                <Text style={{ fontSize: 8, color: C.indigo600 }}>•</Text>
                <Text style={{ fontSize: 8, color: C.slate700 }}>{item}</Text>
              </View>
            ))}
          </View>
          <View style={S.col}>
            <Text style={S.subsectionTitle}>Accessibility & Legal Standards</Text>
            {[
              "WCAG 2.1 Level A / AA / AAA",
              "WCAG 2.2 (2023) new Success Criteria",
              "ARIA Authoring Practices Guide (APG)",
              "ADA — Americans with Disabilities Act",
              "EAA — European Accessibility Act (2025)",
              "EN 301 549 — EU accessibility standard",
              "Section 508 (US federal requirements)",
            ].map((item, i) => (
              <View key={i} style={{ flexDirection: "row", gap: 6, marginBottom: 4 }}>
                <Text style={{ fontSize: 8, color: C.indigo600 }}>•</Text>
                <Text style={{ fontSize: 8, color: C.slate700 }}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={S.divider} />

        <Text style={S.subsectionTitle}>THE {TOTAL_CRITERIA}-CRITERION EVALUATION FRAMEWORK</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
          {HEURISTIC_CHECKLIST.categories.map((cat) => {
            const score = catScores[cat.number] ?? null;
            return (
              <View key={cat.number} style={{
                width: "47%", flexDirection: "row", alignItems: "center", gap: 6,
                backgroundColor: C.slate50, borderRadius: 5, padding: 7,
                borderLeftWidth: 2, borderLeftColor: getBarColor(score),
              }}>
                <Text style={{ fontSize: 8, color: C.indigo600, fontFamily: "Helvetica-Bold", width: 22 }}>{cat.number}</Text>
                <Text style={{ fontSize: 8, color: C.slate700, flex: 1 }}>{cat.name}</Text>
                <Text style={{ fontSize: 7, fontFamily: "Helvetica-Bold", color: getScoreColor(score) }}>
                  {score ?? "—"}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={S.divider} />

        <Text style={S.subsectionTitle}>SEVERITY CLASSIFICATION GUIDE</Text>
        {[
          { sev: "CRITICAL", pill: S.pillCritical, desc: "Blocks task completion, WCAG Level A/AA failure, legal accessibility exposure, or data loss. Zero tolerance — requires immediate remediation before next release." },
          { sev: "HIGH",     pill: S.pillHigh,     desc: "Significant usability friction, measurable conversion or abandonment impact, major heuristic violation. Remediate within 30 days." },
          { sev: "MEDIUM",   pill: S.pillMedium,   desc: "Noticeable friction, cognitive load increase, or design inconsistency. Remediate within 60 days in next sprint cycle." },
          { sev: "LOW",      pill: S.pillLow,      desc: "Polish issue, minor inconsistency, or small cognitive load cost. Address in next quarterly design review." },
        ].map(({ sev, pill, desc }) => (
          <View key={sev} style={{ flexDirection: "row", gap: 10, marginBottom: 7 }}>
            <Text style={[S.severityPill, pill, { width: 55, textAlign: "center" }]}>{sev}</Text>
            <Text style={{ fontSize: 8, color: C.slate700, flex: 1, lineHeight: 1.5 }}>{desc}</Text>
          </View>
        ))}

        <View style={S.divider} />
        <Text style={{ fontSize: 7, color: C.slate400, textAlign: "center", lineHeight: 1.7 }}>
          {"This report was generated by the Fusion UX AI platform. All findings are AI-identified and may be enhanced by human review.\n"}
          {"Generated: "}{new Date().toLocaleString()}
          {"  ·  Confidential — not for external distribution without authorisation from the commissioning organisation."}
        </Text>

        <Footer auditName={audit.name} page="17" />
      </Page>

    </Document>
  );
}
