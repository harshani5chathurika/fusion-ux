import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { HEURISTIC_CHECKLIST } from "@/lib/checklist";

// ============================================================
// STYLES
// ============================================================
const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    paddingTop: 40,
    paddingBottom: 50,
    paddingHorizontal: 46,
    backgroundColor: "#ffffff",
    color: "#111827",
  },
  coverPage: { justifyContent: "center", alignItems: "center", backgroundColor: "#4f46e5" },

  // Header / Footer
  pageHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginBottom: 20, paddingBottom: 10,
    borderBottomWidth: 1, borderBottomColor: "#e5e7eb",
  },
  pageHeaderTitle: { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#4f46e5" },
  pageHeaderSub: { fontSize: 8, color: "#9ca3af" },
  pageFooter: {
    position: "absolute", bottom: 18, left: 46, right: 46,
    flexDirection: "row", justifyContent: "space-between",
    fontSize: 7, color: "#9ca3af",
    borderTopWidth: 1, borderTopColor: "#f3f4f6", paddingTop: 5,
  },

  // Cover
  coverLogo: {
    width: 64, height: 64, backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 14, justifyContent: "center", alignItems: "center", marginBottom: 20,
  },
  coverTitle: { fontSize: 34, fontFamily: "Helvetica-Bold", color: "#ffffff", textAlign: "center", marginBottom: 6 },
  coverSubtitle: { fontSize: 13, color: "rgba(255,255,255,0.8)", textAlign: "center", marginBottom: 36 },
  coverMeta: { backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 12, padding: 22, width: "82%" },
  coverMetaRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 9 },
  coverMetaLabel: { color: "rgba(255,255,255,0.6)", fontSize: 9 },
  coverMetaValue: { color: "#ffffff", fontFamily: "Helvetica-Bold", fontSize: 9 },
  coverScoreRow: {
    flexDirection: "row", gap: 10, marginTop: 20, width: "82%",
  },
  coverScoreCard: {
    flex: 1, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 8,
    padding: 12, alignItems: "center",
  },
  coverScoreNum: { fontSize: 22, fontFamily: "Helvetica-Bold", color: "#ffffff" },
  coverScoreLabel: { fontSize: 7, color: "rgba(255,255,255,0.7)", textAlign: "center", marginTop: 2 },

  // Section
  section: { marginBottom: 22 },
  sectionTitle: {
    fontSize: 13, fontFamily: "Helvetica-Bold", color: "#111827",
    marginBottom: 10, paddingBottom: 5,
    borderBottomWidth: 2, borderBottomColor: "#4f46e5",
  },
  subsectionTitle: {
    fontSize: 10, fontFamily: "Helvetica-Bold", color: "#374151", marginBottom: 6, marginTop: 10,
  },

  // Info box
  infoBox: {
    backgroundColor: "#f8f7ff", borderRadius: 8, padding: 14,
    borderLeftWidth: 4, borderLeftColor: "#4f46e5", marginBottom: 14,
  },
  infoBoxText: { fontSize: 9, color: "#374151", lineHeight: 1.6 },

  // Score cards
  scoreGrid: { flexDirection: "row", gap: 10, marginBottom: 14 },
  scoreCard: { flex: 1, borderRadius: 8, padding: 14, alignItems: "center" },
  scoreCardPrimary: { backgroundColor: "#eef2ff" },
  scoreCardGood: { backgroundColor: "#f0fdf4" },
  scoreCardWarn: { backgroundColor: "#fffbeb" },
  scoreCardDanger: { backgroundColor: "#fef2f2" },
  scoreNumber: { fontSize: 26, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  scoreLabel: { fontSize: 7, color: "#6b7280", textAlign: "center" },

  // Category score row
  categoryRow: { flexDirection: "row", alignItems: "center", marginBottom: 5, gap: 8 },
  categoryName: { fontSize: 8, color: "#374151", width: 180 },
  categoryNum: { fontSize: 7, color: "#9ca3af", width: 22 },
  categoryBarBg: { flex: 1, height: 9, backgroundColor: "#f3f4f6", borderRadius: 5, overflow: "hidden" },
  categoryBarFill: { height: 9, borderRadius: 5 },
  categoryScore: { fontSize: 8, fontFamily: "Helvetica-Bold", width: 28, textAlign: "right" },

  // Severity matrix
  severityRow: { flexDirection: "row", alignItems: "center", marginBottom: 8, gap: 8 },
  severityLabel: { fontSize: 9, width: 52, color: "#374151" },
  severityBar: { height: 13, borderRadius: 4 },
  severityCount: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#111827" },

  // Finding card — base
  findingCard: { borderRadius: 8, padding: 12, marginBottom: 12, borderWidth: 1 },
  findingCritical: { backgroundColor: "#fef2f2", borderColor: "#fca5a5" },
  findingHigh:     { backgroundColor: "#fff7ed", borderColor: "#fdba74" },
  findingMedium:   { backgroundColor: "#fefce8", borderColor: "#fde047" },
  findingLow:      { backgroundColor: "#f0fdf4", borderColor: "#86efac" },

  findingHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 },
  findingTitleBlock: { flex: 1, marginRight: 10 },
  findingBadgeRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  findingTitle: { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#111827" },
  findingBadge: {
    fontSize: 7, fontFamily: "Helvetica-Bold",
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  idBadge: {
    fontSize: 7, color: "#6b7280",
    backgroundColor: "rgba(0,0,0,0.06)", paddingHorizontal: 5, paddingVertical: 2, borderRadius: 3,
  },
  priorityBadge: {
    fontSize: 7, color: "#4f46e5", fontFamily: "Helvetica-Bold",
    backgroundColor: "#eef2ff", paddingHorizontal: 5, paddingVertical: 2, borderRadius: 3,
  },
  badgeCritical: { backgroundColor: "#fee2e2", color: "#dc2626" },
  badgeHigh:     { backgroundColor: "#ffedd5", color: "#ea580c" },
  badgeMedium:   { backgroundColor: "#fef9c3", color: "#ca8a04" },
  badgeLow:      { backgroundColor: "#dcfce7", color: "#16a34a" },

  // Score dots
  scoreDotsRow: { alignItems: "flex-end", gap: 4 },
  scoreDotLabel: { fontSize: 6, color: "#9ca3af", textAlign: "right" },
  dotsRow: { flexDirection: "row", gap: 2, justifyContent: "flex-end" },

  // Meta strip
  metaStrip: {
    flexDirection: "row", flexWrap: "wrap", gap: 10,
    backgroundColor: "rgba(0,0,0,0.04)", borderRadius: 4, padding: 6, marginBottom: 8,
  },
  metaItem: { fontSize: 7, color: "#6b7280" },
  metaBold: { fontFamily: "Helvetica-Bold", color: "#374151" },

  // Field label
  fieldLabel: { fontSize: 7, fontFamily: "Helvetica-Bold", color: "#374151", marginBottom: 3 },
  fieldText:  { fontSize: 8, color: "#4b5563", lineHeight: 1.5 },

  // Pill blocks
  pillRow: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginBottom: 6 },
  wcagPill: {
    fontSize: 6, fontFamily: "Helvetica-Bold", backgroundColor: "#dbeafe", color: "#1d4ed8",
    paddingHorizontal: 5, paddingVertical: 2, borderRadius: 3,
  },
  tagPill: {
    fontSize: 6, color: "#6b7280", backgroundColor: "#f3f4f6",
    paddingHorizontal: 5, paddingVertical: 2, borderRadius: 10,
  },

  // Inset boxes
  aiBox: { marginTop: 6, backgroundColor: "#f5f3ff", borderRadius: 5, padding: 8 },
  aiBoxLabel: { fontSize: 7, color: "#7c3aed", fontFamily: "Helvetica-Bold", marginBottom: 3 },
  aiBoxText: { fontSize: 8, color: "#4c1d95", lineHeight: 1.45 },
  impactBox: { flex: 1, backgroundColor: "#fff7ed", borderRadius: 5, padding: 8 },
  impactLabel: { fontSize: 7, color: "#c2410c", fontFamily: "Helvetica-Bold", marginBottom: 3 },
  impactText: { fontSize: 8, color: "#7c2d12", lineHeight: 1.45 },
  riskBox: { flex: 1, backgroundColor: "#fef2f2", borderRadius: 5, padding: 8 },
  riskLabel: { fontSize: 7, color: "#dc2626", fontFamily: "Helvetica-Bold", marginBottom: 3 },
  riskText:  { fontSize: 8, color: "#7f1d1d", lineHeight: 1.45 },
  analysisBox: { backgroundColor: "rgba(0,0,0,0.03)", borderRadius: 5, padding: 8, marginBottom: 6 },

  // Table
  tableHeader: {
    flexDirection: "row", backgroundColor: "#f9fafb",
    paddingVertical: 6, paddingHorizontal: 8,
    borderTopLeftRadius: 5, borderTopRightRadius: 5,
    borderWidth: 1, borderColor: "#e5e7eb",
  },
  tableRow: {
    flexDirection: "row", paddingVertical: 5, paddingHorizontal: 8,
    borderLeftWidth: 1, borderRightWidth: 1, borderBottomWidth: 1, borderColor: "#e5e7eb",
  },
  tableRowAlt: { backgroundColor: "#f9fafb" },
  tableCell: { fontSize: 8, color: "#374151", lineHeight: 1.3 },
  tableCellBold: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#111827" },

  // Roadmap
  roadmapItem: { flexDirection: "row", alignItems: "flex-start", marginBottom: 10, gap: 10 },
  roadmapBadge: {
    fontSize: 7, fontFamily: "Helvetica-Bold",
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, minWidth: 55, textAlign: "center",
  },
  roadmapBadge1: { backgroundColor: "#dcfce7", color: "#166534" },
  roadmapBadge2: { backgroundColor: "#dbeafe", color: "#1d4ed8" },
  roadmapBadge3: { backgroundColor: "#f3e8ff", color: "#7e22ce" },
  roadmapText: { fontSize: 9, color: "#374151", flex: 1, lineHeight: 1.5 },

  // Divider
  divider: { borderBottomWidth: 1, borderBottomColor: "#e5e7eb", marginVertical: 12 },

  // TOC
  tocRow: { flexDirection: "row", alignItems: "center", marginBottom: 7 },
  tocDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#4f46e5", marginRight: 10 },
  tocTitle: { fontSize: 10, color: "#374151", flex: 1 },
  tocSub: { fontSize: 8, color: "#9ca3af" },

  // Checklist coverage
  catHeader: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#4f46e5",
    paddingVertical: 5, paddingHorizontal: 8, borderRadius: 4,
    marginTop: 10, marginBottom: 0, gap: 6,
  },
  catHeaderText: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#ffffff", flex: 1 },
  catHeaderCount: { fontSize: 7, color: "rgba(255,255,255,0.75)" },
  catAllClearBadge: {
    fontSize: 6, fontFamily: "Helvetica-Bold",
    backgroundColor: "rgba(255,255,255,0.25)", color: "#ffffff",
    paddingHorizontal: 5, paddingVertical: 2, borderRadius: 3,
  },
  checkColHeader: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#f9fafb",
    paddingVertical: 3, paddingHorizontal: 6,
    borderBottomWidth: 1, borderBottomColor: "#e5e7eb", gap: 6,
  },
  checkColHeaderText: { fontSize: 6, fontFamily: "Helvetica-Bold", color: "#9ca3af", textTransform: "uppercase" },
  checkRow: {
    flexDirection: "row", alignItems: "flex-start",
    paddingVertical: 3, paddingHorizontal: 6,
    borderBottomWidth: 1, borderBottomColor: "#f3f4f6", gap: 6,
  },
  checkRowAlt: { backgroundColor: "#fafafa" },
  checkRowFlagged: { backgroundColor: "#fffbeb" },
  checkId: { fontSize: 7, color: "#9ca3af", width: 26, paddingTop: 1 },
  checkTextCol: { flex: 1 },
  checkText: { fontSize: 7, color: "#374151", lineHeight: 1.35 },
  checkFindingNote: { fontSize: 6, color: "#b45309", lineHeight: 1.3, marginTop: 2, fontFamily: "Helvetica-Oblique" },
  roleBadge: {
    fontSize: 6, fontFamily: "Helvetica-Bold",
    paddingHorizontal: 4, paddingVertical: 2, borderRadius: 3, width: 28, textAlign: "center",
  },
  checkBadge: {
    fontSize: 6, fontFamily: "Helvetica-Bold",
    paddingHorizontal: 4, paddingVertical: 2, borderRadius: 3, width: 55, textAlign: "center",
  },
  checkPass: { fontSize: 6, color: "#d1d5db", width: 55, textAlign: "center", paddingTop: 2 },
  howToReadBox: {
    backgroundColor: "#f8f7ff", borderRadius: 6, padding: 10,
    borderLeftWidth: 3, borderLeftColor: "#4f46e5", marginBottom: 10,
  },
  howToReadTitle: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#4f46e5", marginBottom: 5 },
  howToReadGrid: { flexDirection: "row", gap: 10 },
  howToReadCol: { flex: 1, gap: 3 },
  howToReadRow: { flexDirection: "row", alignItems: "flex-start", gap: 5 },
  howToReadRolePill: {
    fontSize: 6, fontFamily: "Helvetica-Bold",
    paddingHorizontal: 4, paddingVertical: 2, borderRadius: 3, minWidth: 24, textAlign: "center",
  },
  howToReadText: { fontSize: 7, color: "#374151", flex: 1, lineHeight: 1.3 },
  roleLegendRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 6, flexWrap: "wrap" },
  roleLegendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  roleLegendLabel: { fontSize: 6, color: "#6b7280" },
});

// ============================================================
// TYPES
// ============================================================
interface ReportFinding {
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

// ============================================================
// HELPERS
// ============================================================
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

function getScoreColor(score: number | null): string {
  if (!score) return "#6b7280";
  if (score >= 80) return "#16a34a";
  if (score >= 60) return "#ca8a04";
  if (score >= 40) return "#ea580c";
  return "#dc2626";
}

function getBarColor(score: number | null): string {
  if (!score) return "#d1d5db";
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#eab308";
  if (score >= 40) return "#f97316";
  return "#ef4444";
}

function getSeverityColors(severity: string): { bg: string; color: string } {
  switch (severity) {
    case "critical": return { bg: "#fee2e2", color: "#dc2626" };
    case "high":     return { bg: "#ffedd5", color: "#ea580c" };
    case "medium":   return { bg: "#fef9c3", color: "#ca8a04" };
    default:         return { bg: "#dcfce7", color: "#16a34a" };
  }
}

function getFindingCardStyle(severity: string) {
  switch (severity) {
    case "critical": return { card: styles.findingCritical, badge: styles.badgeCritical };
    case "high":     return { card: styles.findingHigh,     badge: styles.badgeHigh };
    case "medium":   return { card: styles.findingMedium,   badge: styles.badgeMedium };
    default:         return { card: styles.findingLow,       badge: styles.badgeLow };
  }
}

function getCheckBadgeColors(severity: string): { bg: string; color: string } {
  switch (severity) {
    case "critical": return { bg: "#fee2e2", color: "#dc2626" };
    case "high":     return { bg: "#ffedd5", color: "#ea580c" };
    case "medium":   return { bg: "#fef9c3", color: "#ca8a04" };
    default:         return { bg: "#dcfce7", color: "#16a34a" };
  }
}

function getRoleStyle(role: string): { bg: string; color: string } {
  switch (role) {
    case "UX":  return { bg: "#f3e8ff", color: "#7e22ce" };
    case "Dev": return { bg: "#dbeafe", color: "#1d4ed8" };
    case "BA":  return { bg: "#ffedd5", color: "#c2410c" };
    case "QA":  return { bg: "#dcfce7", color: "#166534" };
    default:    return { bg: "#f3f4f6", color: "#374151" };
  }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function truncate(str: string, len: number): string {
  return str.length > len ? str.slice(0, len) + "..." : str;
}

// ============================================================
// PAGE CHROME
// ============================================================
function PageHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <View style={styles.pageHeader}>
      <Text style={styles.pageHeaderTitle}>FUSION UX AUDIT REPORT</Text>
      <Text style={styles.pageHeaderSub}>{sub ?? title}</Text>
    </View>
  );
}

function PageFooter({ auditName, pageNum }: { auditName: string; pageNum: string }) {
  return (
    <View style={styles.pageFooter}>
      <Text>Fusion UX — {auditName}</Text>
      <Text>Page {pageNum} · Confidential</Text>
      <Text>Generated {new Date().toLocaleDateString()}</Text>
    </View>
  );
}

// ============================================================
// SCORE DOTS
// ============================================================
function ScoreDots({ score, color }: { score: number; color: string }) {
  return (
    <View style={styles.dotsRow}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View
          key={i}
          style={{
            width: 6, height: 6, borderRadius: 3,
            backgroundColor: i <= score ? color : "#e5e7eb",
          }}
        />
      ))}
    </View>
  );
}

// ============================================================
// FULL FINDING CARD
// ============================================================
function FindingCard({ finding, index }: { finding: ReportFinding; index: number }) {
  const sev = getSeverityColors(finding.severity);
  const sevCard = getFindingCardStyle(finding.severity);
  const priorityScore = (finding.impact_score ?? 0) * (finding.frequency_score ?? 0);

  return (
    <View style={[styles.findingCard, sevCard.card]}>
      {/* ── Header ── */}
      <View style={styles.findingHeader}>
        <View style={styles.findingTitleBlock}>
          <View style={styles.findingBadgeRow}>
            <Text style={[styles.findingBadge, sevCard.badge]}>{finding.severity.toUpperCase()}</Text>
            {finding.heuristic_item_id && (
              <Text style={styles.idBadge}>Check {finding.heuristic_item_id}</Text>
            )}
            {priorityScore > 0 && (
              <Text style={styles.priorityBadge}>Priority {priorityScore}/25</Text>
            )}
          </View>
          <Text style={styles.findingTitle}>#{index + 1} — {finding.title}</Text>
        </View>

        {/* Impact / frequency dots */}
        <View style={styles.scoreDotsRow}>
          {finding.impact_score != null && (
            <View>
              <Text style={styles.scoreDotLabel}>Impact</Text>
              <ScoreDots score={finding.impact_score} color={sev.color} />
            </View>
          )}
          {finding.frequency_score != null && (
            <View>
              <Text style={styles.scoreDotLabel}>Frequency</Text>
              <ScoreDots score={finding.frequency_score} color="#94a3b8" />
            </View>
          )}
        </View>
      </View>

      {/* ── Meta strip ── */}
      <View style={styles.metaStrip}>
        {finding.heuristic_category && (
          <Text style={styles.metaItem}>
            <Text style={styles.metaBold}>Category: </Text>{finding.heuristic_category}
          </Text>
        )}
        {finding.location && (
          <Text style={styles.metaItem}>
            <Text style={styles.metaBold}>Location: </Text>{finding.location}
          </Text>
        )}
        <Text style={styles.metaItem}>
          <Text style={styles.metaBold}>Status: </Text>
          {finding.verification_status === "verified" || finding.verification_status === "edited"
            ? "Human Verified"
            : "AI Identified"}
        </Text>
      </View>

      {/* ── Why it violates UX principles ── */}
      {finding.description && (
        <View style={{ marginBottom: 7 }}>
          <Text style={styles.fieldLabel}>Why this violates UX principles</Text>
          <Text style={styles.fieldText}>{finding.description}</Text>
        </View>
      )}

      {/* ── Critical analysis ── */}
      {finding.critical_analysis && (
        <View style={[styles.analysisBox, { marginBottom: 7 }]}>
          <Text style={styles.fieldLabel}>Critical Analysis (Cognitive Load, Gestalt & Heuristic Reasoning)</Text>
          <Text style={styles.fieldText}>{finding.critical_analysis}</Text>
        </View>
      )}

      {/* ── WCAG + Design reference ── */}
      {((finding.wcag_criteria && finding.wcag_criteria.length > 0) || finding.design_reference) && (
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 7 }}>
          {finding.wcag_criteria && finding.wcag_criteria.length > 0 && (
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>WCAG 2.1 / 2.2 Criteria</Text>
              <View style={styles.pillRow}>
                {finding.wcag_criteria.map((w, i) => (
                  <Text key={i} style={styles.wcagPill}>{w}</Text>
                ))}
              </View>
            </View>
          )}
          {finding.design_reference && (
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Design Pattern / Research Reference</Text>
              <Text style={styles.fieldText}>{finding.design_reference}</Text>
            </View>
          )}
        </View>
      )}

      {/* ── AI recommendation ── */}
      {finding.ai_suggestion && (
        <View style={styles.aiBox}>
          <Text style={styles.aiBoxLabel}>AI RECOMMENDATION</Text>
          <Text style={styles.aiBoxText}>{finding.ai_suggestion}</Text>
        </View>
      )}

      {/* ── Business impact + financial risk ── */}
      {(finding.business_impact || finding.financial_risk) && (
        <View style={{ flexDirection: "row", gap: 6, marginTop: 7 }}>
          {finding.business_impact && (
            <View style={styles.impactBox}>
              <Text style={styles.impactLabel}>BUSINESS IMPACT</Text>
              <Text style={styles.impactText}>{finding.business_impact}</Text>
            </View>
          )}
          {finding.financial_risk && (
            <View style={styles.riskBox}>
              <Text style={styles.riskLabel}>FINANCIAL / COMPLIANCE RISK</Text>
              <Text style={styles.riskText}>{finding.financial_risk}</Text>
            </View>
          )}
        </View>
      )}

      {/* ── Tags ── */}
      {finding.tags && finding.tags.length > 0 && (
        <View style={[styles.pillRow, { marginTop: 7 }]}>
          {finding.tags.map((tag, i) => (
            <Text key={i} style={styles.tagPill}>#{tag}</Text>
          ))}
        </View>
      )}
    </View>
  );
}

// ============================================================
// COMPACT FINDING CARD (medium / low — 2 per page)
// ============================================================
function CompactFindingCard({ finding, index }: { finding: ReportFinding; index: number }) {
  const sev = getSeverityColors(finding.severity);
  const sevCard = getFindingCardStyle(finding.severity);
  const priorityScore = (finding.impact_score ?? 0) * (finding.frequency_score ?? 0);

  return (
    <View style={[styles.findingCard, sevCard.card]}>
      <View style={styles.findingHeader}>
        <View style={styles.findingTitleBlock}>
          <View style={styles.findingBadgeRow}>
            <Text style={[styles.findingBadge, sevCard.badge]}>{finding.severity.toUpperCase()}</Text>
            {finding.heuristic_item_id && <Text style={styles.idBadge}>Check {finding.heuristic_item_id}</Text>}
            {priorityScore > 0 && <Text style={styles.priorityBadge}>Priority {priorityScore}/25</Text>}
          </View>
          <Text style={styles.findingTitle}>#{index + 1} — {finding.title}</Text>
        </View>
        <View style={styles.scoreDotsRow}>
          {finding.impact_score != null && (
            <View>
              <Text style={styles.scoreDotLabel}>Impact</Text>
              <ScoreDots score={finding.impact_score} color={sev.color} />
            </View>
          )}
        </View>
      </View>

      <View style={styles.metaStrip}>
        {finding.heuristic_category && (
          <Text style={styles.metaItem}><Text style={styles.metaBold}>Category: </Text>{finding.heuristic_category}</Text>
        )}
        {finding.location && (
          <Text style={styles.metaItem}><Text style={styles.metaBold}>Location: </Text>{finding.location}</Text>
        )}
      </View>

      {finding.description && (
        <View style={{ marginBottom: 6 }}>
          <Text style={styles.fieldLabel}>Issue description</Text>
          <Text style={styles.fieldText}>{finding.description}</Text>
        </View>
      )}

      {finding.critical_analysis && (
        <View style={[styles.analysisBox, { marginBottom: 6 }]}>
          <Text style={styles.fieldLabel}>Critical Analysis</Text>
          <Text style={styles.fieldText}>{finding.critical_analysis}</Text>
        </View>
      )}

      {finding.wcag_criteria && finding.wcag_criteria.length > 0 && (
        <View style={{ marginBottom: 6 }}>
          <Text style={styles.fieldLabel}>WCAG Criteria</Text>
          <View style={styles.pillRow}>
            {finding.wcag_criteria.map((w, i) => <Text key={i} style={styles.wcagPill}>{w}</Text>)}
          </View>
        </View>
      )}

      {finding.ai_suggestion && (
        <View style={styles.aiBox}>
          <Text style={styles.aiBoxLabel}>AI RECOMMENDATION</Text>
          <Text style={styles.aiBoxText}>{finding.ai_suggestion}</Text>
        </View>
      )}

      {(finding.business_impact || finding.financial_risk) && (
        <View style={{ flexDirection: "row", gap: 6, marginTop: 6 }}>
          {finding.business_impact && (
            <View style={styles.impactBox}>
              <Text style={styles.impactLabel}>BUSINESS IMPACT</Text>
              <Text style={styles.impactText}>{finding.business_impact}</Text>
            </View>
          )}
          {finding.financial_risk && (
            <View style={styles.riskBox}>
              <Text style={styles.riskLabel}>FINANCIAL RISK</Text>
              <Text style={styles.riskText}>{finding.financial_risk}</Text>
            </View>
          )}
        </View>
      )}

      {finding.design_reference && (
        <View style={{ marginTop: 6 }}>
          <Text style={styles.fieldLabel}>Design Reference</Text>
          <Text style={[styles.fieldText, { fontSize: 7 }]}>{finding.design_reference}</Text>
        </View>
      )}

      {finding.tags && finding.tags.length > 0 && (
        <View style={[styles.pillRow, { marginTop: 6 }]}>
          {finding.tags.map((tag, i) => <Text key={i} style={styles.tagPill}>#{tag}</Text>)}
        </View>
      )}
    </View>
  );
}

// ============================================================
// MAIN PDF DOCUMENT
// ============================================================
export function ReportDocument({ data }: { data: ReportData }) {
  const { audit, findings, executive_summary, roi_analysis, roadmap, organization_name, preparer_name } = data;
  const totalIssues = audit.critical_count + audit.high_count + audit.medium_count + audit.low_count;
  const verifiedFindings = findings.filter((f) => f.verification_status === "verified" || f.verification_status === "edited");

  const criticalFindings = findings.filter((f) => f.severity === "critical");
  const highFindings     = findings.filter((f) => f.severity === "high");
  const mediumFindings   = findings.filter((f) => f.severity === "medium");
  const lowFindings      = findings.filter((f) => f.severity === "low");

  // Build finding map for checklist pages
  const findingMap = new Map<string, { severity: string; title: string }>();
  for (const f of findings) {
    if (f.heuristic_item_id) {
      findingMap.set(f.heuristic_item_id, { severity: f.severity, title: f.title });
    }
  }
  const checklistHalves = [
    HEURISTIC_CHECKLIST.categories.slice(0, 6),
    HEURISTIC_CHECKLIST.categories.slice(6),
  ];

  // Category scores
  const catScores = audit.category_scores ?? {};

  // Page counter (approximate — react-pdf doesn't support dynamic refs)
  let pg = 1;
  const nextPg = () => String(++pg);

  return (
    <Document title={`Fusion UX Report — ${audit.name}`} author="Fusion UX Platform" subject="UX Audit Report">

      {/* ══════════════════════════════════════════════════════
          PAGE 1 — COVER
      ══════════════════════════════════════════════════════ */}
      <Page size="A4" style={[styles.page, styles.coverPage]}>
        <View style={styles.coverLogo}>
          <Text style={{ fontSize: 26, color: "#ffffff", fontFamily: "Helvetica-Bold" }}>F</Text>
        </View>
        <Text style={styles.coverTitle}>UX Audit Report</Text>
        <Text style={styles.coverSubtitle}>{audit.name}</Text>

        <View style={styles.coverMeta}>
          {[
            ["Organisation",  organization_name ?? "—"],
            ["Prepared by",   preparer_name ?? "Fusion UX Platform"],
            ["Audit type",    audit.audit_type.toUpperCase()],
            ["Device",        audit.device_type.toUpperCase()],
            ["Target URL",    audit.target_url ?? "Screenshot-based audit"],
            ["Date",          formatDate(audit.created_at)],
            ["Completed",     formatDate(audit.completed_at)],
            ["Total issues",  String(totalIssues)],
            ["Human verified",String(verifiedFindings.length) + " findings"],
          ].map(([label, value]) => (
            <View key={label} style={styles.coverMetaRow}>
              <Text style={styles.coverMetaLabel}>{label}</Text>
              <Text style={styles.coverMetaValue}>{value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.coverScoreRow}>
          {[
            { label: "Overall UX Score", value: audit.overall_score },
            { label: "Heuristic Score",  value: audit.heuristic_score },
            { label: "Accessibility",    value: audit.accessibility_score },
            { label: "Critical Issues",  value: audit.critical_count },
          ].map(({ label, value }) => (
            <View key={label} style={styles.coverScoreCard}>
              <Text style={styles.coverScoreNum}>{value ?? "—"}</Text>
              <Text style={styles.coverScoreLabel}>{label}</Text>
            </View>
          ))}
        </View>

        <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 7, marginTop: 28, textAlign: "center" }}>
          CONFIDENTIAL — FUSION UX PLATFORM · {new Date().toLocaleDateString()}
        </Text>
      </Page>

      {/* ══════════════════════════════════════════════════════
          PAGE 2 — TABLE OF CONTENTS
      ══════════════════════════════════════════════════════ */}
      <Page size="A4" style={styles.page}>
        <PageHeader title="Table of Contents" />
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Document Structure</Text>
          <Text style={{ fontSize: 8, color: "#6b7280", marginBottom: 14, lineHeight: 1.5 }}>
            This report is structured to serve multiple audiences. Pages 3–4 are for executives and project managers.
            Pages 5 onwards are detailed findings for UX designers, developers, and QA engineers.
            The checklist coverage section provides evidence for business analysts and compliance teams.
          </Text>

          {[
            { section: "1. Executive Summary",                  desc: "Overall scores, AI analysis, board-level narrative, top 3 priorities" },
            { section: "2. Scores & Category Dashboard",        desc: "All 12 heuristic category scores, severity breakdown, verified issues" },
            { section: "3. Critical Findings",                  desc: `${criticalFindings.length} findings — full detail including WCAG, cognitive analysis, business risk` },
            { section: "4. High Priority Findings",             desc: `${highFindings.length} findings — full detail with AI recommendations and financial risk` },
            { section: "5. Medium Priority Findings",           desc: `${mediumFindings.length} findings — detailed cards with design references and fix guidance` },
            { section: "6. Low Priority Findings",              desc: `${lowFindings.length} findings — full detail with polish and consistency recommendations` },
            { section: "7. Complete Findings Register",         desc: "All findings in tabular format — sortable reference for project tracking" },
            { section: "8. ROI Analysis & Improvement Roadmap", desc: "30/60/90-day action plan, business case, estimated impact of fixes" },
            { section: "9. Heuristic Checklist — Cat 01–06",   desc: "All 153 checks — flagged vs evaluated-clean, per role (UX/Dev/BA/QA)" },
            { section: "10. Heuristic Checklist — Cat 07–12",  desc: "Continued checklist coverage with role-based guidance" },
            { section: "11. Methodology & Framework",           desc: "How the audit was conducted, the 12-category framework, WCAG standards applied" },
          ].map(({ section, desc }, i) => (
            <View key={i} style={styles.tocRow}>
              <View style={styles.tocDot} />
              <View style={{ flex: 1 }}>
                <Text style={styles.tocTitle}>{section}</Text>
                <Text style={styles.tocSub}>{desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.infoBox, { marginTop: 8 }]}>
          <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: "#4f46e5", marginBottom: 4 }}>Who should read what</Text>
          <Text style={{ fontSize: 8, color: "#374151", lineHeight: 1.5 }}>
            {"PM / Exec:  Pages 3–4 (Executive Summary + Dashboard)\n"}
            {"UX Designer:  Pages 5–8 (all findings, especially critical and high)\n"}
            {"Developer:  Pages 5–9 (findings + AI recommendations + findings register)\n"}
            {"QA Engineer:  Pages 5–10 (findings + checklist — test every FLAGGED row)\n"}
            {"Business Analyst:  Pages 3 + 9–10 (priorities + checklist coverage against requirements)"}
          </Text>
        </View>

        <PageFooter auditName={audit.name} pageNum="2" />
      </Page>

      {/* ══════════════════════════════════════════════════════
          PAGE 3 — EXECUTIVE SUMMARY
      ══════════════════════════════════════════════════════ */}
      <Page size="A4" style={styles.page}>
        <PageHeader title="Executive Summary" />

        {/* Score cards */}
        <View style={styles.scoreGrid}>
          {[
            { label: "Overall UX Score",  value: audit.overall_score,       style: styles.scoreCardPrimary },
            { label: "Heuristic Score",   value: audit.heuristic_score,     style: styles.scoreCardGood },
            { label: "Accessibility",     value: audit.accessibility_score,  style: styles.scoreCardWarn },
            { label: "Critical Issues",   value: audit.critical_count,       style: styles.scoreCardDanger },
          ].map(({ label, value, style }) => (
            <View key={label} style={[styles.scoreCard, style]}>
              <Text style={[styles.scoreNumber, { color: getScoreColor(typeof value === "number" ? value : null) }]}>
                {value ?? "—"}
              </Text>
              <Text style={styles.scoreLabel}>{label}</Text>
            </View>
          ))}
        </View>

        {/* AI summary from original audit run */}
        {audit.ai_summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AI Analysis Summary</Text>
            <View style={styles.infoBox}>
              <Text style={styles.infoBoxText}>{audit.ai_summary}</Text>
            </View>
          </View>
        )}

        {/* Board-level executive summary */}
        {(audit.executive_summary || executive_summary) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Executive Summary</Text>
            <Text style={styles.infoBoxText}>{audit.executive_summary ?? executive_summary}</Text>
          </View>
        )}

        {/* Top 3 priority issues */}
        {audit.top_priority_issues && audit.top_priority_issues.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Priority Issues</Text>
            {audit.top_priority_issues.map((issue, i) => (
              <View key={i} style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
                <View style={{
                  width: 20, height: 20, borderRadius: 10,
                  backgroundColor: i === 0 ? "#dc2626" : i === 1 ? "#ea580c" : "#4f46e5",
                  justifyContent: "center", alignItems: "center",
                }}>
                  <Text style={{ fontSize: 9, color: "#fff", fontFamily: "Helvetica-Bold" }}>{i + 1}</Text>
                </View>
                <Text style={{ fontSize: 9, color: "#374151", flex: 1, lineHeight: 1.5, paddingTop: 3 }}>{issue}</Text>
              </View>
            ))}
          </View>
        )}

        <PageFooter auditName={audit.name} pageNum="3" />
      </Page>

      {/* ══════════════════════════════════════════════════════
          PAGE 4 — SCORES DASHBOARD
      ══════════════════════════════════════════════════════ */}
      <Page size="A4" style={styles.page}>
        <PageHeader title="Scores & Category Dashboard" />

        {/* Issue count cards */}
        <View style={styles.scoreGrid}>
          {[
            { label: "Critical", value: audit.critical_count, color: "#dc2626", bg: "#fef2f2" },
            { label: "High",     value: audit.high_count,     color: "#ea580c", bg: "#fff7ed" },
            { label: "Medium",   value: audit.medium_count,   color: "#ca8a04", bg: "#fefce8" },
            { label: "Low",      value: audit.low_count,      color: "#16a34a", bg: "#f0fdf4" },
          ].map(({ label, value, color, bg }) => (
            <View key={label} style={[styles.scoreCard, { backgroundColor: bg }]}>
              <Text style={[styles.scoreNumber, { color }]}>{value}</Text>
              <Text style={styles.scoreLabel}>{label} issues</Text>
            </View>
          ))}
        </View>

        {/* Severity distribution */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Severity Distribution</Text>
          {[
            { label: "Critical", count: audit.critical_count, color: "#ef4444" },
            { label: "High",     count: audit.high_count,     color: "#f97316" },
            { label: "Medium",   count: audit.medium_count,   color: "#eab308" },
            { label: "Low",      count: audit.low_count,      color: "#22c55e" },
          ].map((item) => (
            <View key={item.label} style={styles.severityRow}>
              <Text style={styles.severityLabel}>{item.label}</Text>
              <View style={{ flex: 1, height: 13, backgroundColor: "#f3f4f6", borderRadius: 4, overflow: "hidden" }}>
                <View style={[styles.severityBar, {
                  width: totalIssues ? `${(item.count / totalIssues) * 100}%` : "0%",
                  backgroundColor: item.color,
                }]} />
              </View>
              <Text style={styles.severityCount}>{item.count}</Text>
            </View>
          ))}
          <Text style={{ fontSize: 7, color: "#9ca3af", marginTop: 4 }}>
            Total: {totalIssues} issues · Human-verified: {verifiedFindings.length} of {findings.length}
          </Text>
        </View>

        {/* 12-category scores */}
        {Object.keys(catScores).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>12-Category Heuristic Scores</Text>
            {Object.entries(CATEGORY_NAMES).map(([num, name]) => {
              const score = catScores[num] ?? null;
              return (
                <View key={num} style={styles.categoryRow}>
                  <Text style={styles.categoryNum}>{num}</Text>
                  <Text style={styles.categoryName}>{name}</Text>
                  <View style={styles.categoryBarBg}>
                    <View style={[styles.categoryBarFill, {
                      width: score ? `${score}%` : "0%",
                      backgroundColor: getBarColor(score),
                    }]} />
                  </View>
                  <Text style={[styles.categoryScore, { color: getScoreColor(score) }]}>
                    {score ?? "—"}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Improvement roadmap from original AI audit */}
        {audit.improvement_roadmap && audit.improvement_roadmap.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AI-Generated Improvement Roadmap</Text>
            {audit.improvement_roadmap.map((item, i) => {
              const badges = [
                { label: "30-Day", style: styles.roadmapBadge1 },
                { label: "60-Day", style: styles.roadmapBadge2 },
                { label: "90-Day", style: styles.roadmapBadge3 },
              ];
              const badge = badges[i] ?? badges[2];
              return (
                <View key={i} style={styles.roadmapItem}>
                  <Text style={[styles.roadmapBadge, badge.style]}>{badge.label}</Text>
                  <Text style={styles.roadmapText}>{item}</Text>
                </View>
              );
            })}
          </View>
        )}

        <PageFooter auditName={audit.name} pageNum="4" />
      </Page>

      {/* ══════════════════════════════════════════════════════
          PAGES 5+ — CRITICAL FINDINGS (1 per page)
      ══════════════════════════════════════════════════════ */}
      {criticalFindings.map((finding, i) => (
        <Page key={`crit-${i}`} size="A4" style={styles.page}>
          <PageHeader title={`Critical Finding ${i + 1} of ${criticalFindings.length}`} />
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Critical Findings</Text>
            <FindingCard finding={finding} index={findings.indexOf(finding)} />
          </View>
          <PageFooter auditName={audit.name} pageNum={String(5 + i)} />
        </Page>
      ))}

      {/* ══════════════════════════════════════════════════════
          HIGH FINDINGS (1 per page — all fields visible)
      ══════════════════════════════════════════════════════ */}
      {highFindings.map((finding, i) => (
        <Page key={`high-${i}`} size="A4" style={styles.page}>
          <PageHeader title={`High Priority Finding ${i + 1} of ${highFindings.length}`} />
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>High Priority Findings</Text>
            <FindingCard finding={finding} index={findings.indexOf(finding)} />
          </View>
          <PageFooter auditName={audit.name} pageNum={String(5 + criticalFindings.length + i)} />
        </Page>
      ))}

      {/* ══════════════════════════════════════════════════════
          MEDIUM FINDINGS (1 per page — full compact card)
      ══════════════════════════════════════════════════════ */}
      {mediumFindings.map((finding, i) => (
        <Page key={`med-${i}`} size="A4" style={styles.page}>
          <PageHeader title={`Medium Priority Finding ${i + 1} of ${mediumFindings.length}`} />
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Medium Priority Findings</Text>
            <CompactFindingCard finding={finding} index={findings.indexOf(finding)} />
          </View>
          <PageFooter auditName={audit.name} pageNum={String(5 + criticalFindings.length + highFindings.length + i)} />
        </Page>
      ))}

      {/* ══════════════════════════════════════════════════════
          LOW FINDINGS (1 per page)
      ══════════════════════════════════════════════════════ */}
      {lowFindings.map((finding, i) => (
        <Page key={`low-${i}`} size="A4" style={styles.page}>
          <PageHeader title={`Low Priority Finding ${i + 1} of ${lowFindings.length}`} />
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Low Priority Findings</Text>
            <CompactFindingCard finding={finding} index={findings.indexOf(finding)} />
          </View>
          <PageFooter auditName={audit.name} pageNum={String(5 + criticalFindings.length + highFindings.length + mediumFindings.length + i)} />
        </Page>
      ))}

      {/* ══════════════════════════════════════════════════════
          COMPLETE FINDINGS REGISTER (table)
      ══════════════════════════════════════════════════════ */}
      <Page size="A4" style={styles.page}>
        <PageHeader title="Complete Findings Register" />
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Findings — Quick Reference Table</Text>
          <Text style={{ fontSize: 8, color: "#6b7280", marginBottom: 8 }}>
            Use this table for project tracking, sprint planning, and handoff to development teams.
            Priority score = Impact (1–5) × Frequency (1–5). Maximum: 25.
          </Text>

          {/* Table header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCellBold, { width: "4%" }]}>#</Text>
            <Text style={[styles.tableCellBold, { width: "30%" }]}>Finding</Text>
            <Text style={[styles.tableCellBold, { width: "10%" }]}>Severity</Text>
            <Text style={[styles.tableCellBold, { width: "22%" }]}>Category</Text>
            <Text style={[styles.tableCellBold, { width: "8%" }]}>Check</Text>
            <Text style={[styles.tableCellBold, { width: "10%" }]}>Priority</Text>
            <Text style={[styles.tableCellBold, { width: "10%" }]}>Status</Text>
            <Text style={[styles.tableCellBold, { width: "6%" }]}>WCAG</Text>
          </View>

          {findings.map((f, i) => (
            <View key={i} style={[styles.tableRow, i % 2 !== 0 ? styles.tableRowAlt : {}]}>
              <Text style={[styles.tableCell, { width: "4%" }]}>{i + 1}</Text>
              <Text style={[styles.tableCell, { width: "30%" }]}>{truncate(f.title, 45)}</Text>
              <Text style={[styles.tableCell, { width: "10%", textTransform: "capitalize" }]}>{f.severity}</Text>
              <Text style={[styles.tableCell, { width: "22%" }]}>{truncate(f.heuristic_category ?? "—", 30)}</Text>
              <Text style={[styles.tableCell, { width: "8%" }]}>{f.heuristic_item_id ?? "—"}</Text>
              <Text style={[styles.tableCell, { width: "10%" }]}>
                {f.impact_score && f.frequency_score ? `${f.impact_score * f.frequency_score}/25` : "—"}
              </Text>
              <Text style={[styles.tableCell, { width: "10%", textTransform: "capitalize" }]}>
                {f.verification_status === "verified" || f.verification_status === "edited" ? "Verified" : "AI"}
              </Text>
              <Text style={[styles.tableCell, { width: "6%" }]}>
                {f.wcag_criteria && f.wcag_criteria.length > 0 ? `${f.wcag_criteria.length}` : "—"}
              </Text>
            </View>
          ))}
        </View>

        {/* Summary stats */}
        <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
          {[
            { label: "Total findings",    value: String(findings.length) },
            { label: "Human verified",    value: String(verifiedFindings.length) },
            { label: "With WCAG mapping", value: String(findings.filter(f => f.wcag_criteria && f.wcag_criteria.length > 0).length) },
            { label: "With AI fix",       value: String(findings.filter(f => f.ai_suggestion).length) },
          ].map(({ label, value }) => (
            <View key={label} style={{ flex: 1, backgroundColor: "#f9fafb", borderRadius: 6, padding: 8, alignItems: "center" }}>
              <Text style={{ fontSize: 14, fontFamily: "Helvetica-Bold", color: "#4f46e5" }}>{value}</Text>
              <Text style={{ fontSize: 6, color: "#6b7280", textAlign: "center" }}>{label}</Text>
            </View>
          ))}
        </View>

        <PageFooter auditName={audit.name} pageNum={String(5 + findings.length)} />
      </Page>

      {/* ══════════════════════════════════════════════════════
          ROI ANALYSIS & ROADMAP
      ══════════════════════════════════════════════════════ */}
      <Page size="A4" style={styles.page}>
        <PageHeader title="ROI Analysis & Improvement Roadmap" />

        {roi_analysis && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ROI & Business Impact Analysis</Text>
            <View style={styles.infoBox}>
              <Text style={styles.infoBoxText}>{roi_analysis}</Text>
            </View>
            <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
              {[
                { label: "Critical Issues",  value: audit.critical_count, desc: "Immediate action required",  color: "#fef2f2", textColor: "#dc2626" },
                { label: "High Risk Issues", value: audit.high_count,     desc: "Revenue impact risk",       color: "#fff7ed", textColor: "#ea580c" },
                { label: "Human Verified",   value: verifiedFindings.length, desc: "Ready for dev team",    color: "#f0fdf4", textColor: "#16a34a" },
                { label: "With WCAG Breach", value: findings.filter(f => f.wcag_criteria && f.wcag_criteria.length > 0).length, desc: "Compliance exposure", color: "#eef2ff", textColor: "#4f46e5" },
              ].map(({ label, value, desc, color, textColor }) => (
                <View key={label} style={{ flex: 1, backgroundColor: color, borderRadius: 8, padding: 10 }}>
                  <Text style={{ fontSize: 18, fontFamily: "Helvetica-Bold", color: textColor }}>{value}</Text>
                  <Text style={{ fontSize: 7, fontFamily: "Helvetica-Bold", color: textColor, marginBottom: 2 }}>{label}</Text>
                  <Text style={{ fontSize: 6, color: "#6b7280" }}>{desc}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {roadmap && roadmap.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Report-Level Improvement Roadmap</Text>
            {roadmap.map((item, i) => {
              const badges = [
                { label: "30-Day",  style: styles.roadmapBadge1 },
                { label: "60-Day",  style: styles.roadmapBadge2 },
                { label: "90-Day",  style: styles.roadmapBadge3 },
              ];
              const badge = badges[i] ?? badges[2];
              return (
                <View key={i} style={styles.roadmapItem}>
                  <Text style={[styles.roadmapBadge, badge.style]}>{badge.label}</Text>
                  <Text style={styles.roadmapText}>{item}</Text>
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended Next Steps</Text>
          {[
            `Address ${audit.critical_count} critical issues immediately — these block users or create legal/accessibility compliance risk`,
            `Schedule a UX design sprint within 30 days to address ${audit.high_count} high-priority friction points`,
            `Assign ${findings.filter(f => f.wcag_criteria && f.wcag_criteria.length > 0).length} WCAG-mapped findings to development with acceptance criteria for each`,
            `Re-run Fusion UX audit after each sprint to measure score improvement and track regression`,
            "Present executive summary (Pages 3–4) to leadership to secure remediation budget",
            "Use the checklist coverage pages (Pages 9–10) as QA sign-off criteria before next release",
          ].map((step, i) => (
            <View key={i} style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
              <Text style={{ fontSize: 9, color: "#4f46e5", fontFamily: "Helvetica-Bold", width: 14 }}>{i + 1}.</Text>
              <Text style={{ fontSize: 9, color: "#374151", flex: 1, lineHeight: 1.5 }}>{step}</Text>
            </View>
          ))}
        </View>

        <PageFooter auditName={audit.name} pageNum={String(6 + findings.length)} />
      </Page>

      {/* ══════════════════════════════════════════════════════
          HEURISTIC CHECKLIST COVERAGE (2 pages)
      ══════════════════════════════════════════════════════ */}
      {checklistHalves.map((cats, halfIdx) => {
        const totalChecks = cats.reduce((sum, c) => sum + c.item_count, 0);
        const flaggedChecks = cats.reduce(
          (sum, c) => sum + c.items.filter((item) => findingMap.has(item.id)).length, 0
        );
        return (
          <Page key={halfIdx} size="A4" style={styles.page}>
            <PageHeader title={`Heuristic Checklist — ${halfIdx === 0 ? "Categories 01–06" : "Categories 07–12"}`} />

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {halfIdx === 0 ? "Full Checklist Coverage — Part 1 of 2" : "Full Checklist Coverage — Part 2 of 2"}
              </Text>

              {/* How-to-read — first page only */}
              {halfIdx === 0 && (
                <View style={styles.howToReadBox}>
                  <Text style={styles.howToReadTitle}>How to read this section</Text>
                  <View style={styles.howToReadGrid}>
                    <View style={styles.howToReadCol}>
                      {[
                        { role: "QA",  color: getRoleStyle("QA"),  text: "Test every FLAGGED row against the live product. Raise a defect if the issue persists." },
                        { role: "Dev", color: getRoleStyle("Dev"), text: "Implement fixes for [Dev] or [All] FLAGGED rows. Refer to Pages 5+ for AI recommendations." },
                      ].map(({ role, color, text }) => (
                        <View key={role} style={styles.howToReadRow}>
                          <Text style={[styles.howToReadRolePill, { backgroundColor: color.bg, color: color.color }]}>{role}</Text>
                          <Text style={styles.howToReadText}>{text}</Text>
                        </View>
                      ))}
                    </View>
                    <View style={styles.howToReadCol}>
                      {[
                        { role: "UX",  color: getRoleStyle("UX"),  text: "Review [UX]-tagged FLAGGED rows — these are heuristic violations requiring redesign." },
                        { role: "BA",  color: getRoleStyle("BA"),  text: "Validate [BA] FLAGGED items against requirements. May indicate missing acceptance criteria." },
                        { role: "PM",  color: getRoleStyle("All"), text: "Use Pages 3–4 for the executive view. This section is the evidence record." },
                      ].map(({ role, color, text }) => (
                        <View key={role} style={styles.howToReadRow}>
                          <Text style={[styles.howToReadRolePill, { backgroundColor: color.bg, color: color.color }]}>{role}</Text>
                          <Text style={styles.howToReadText}>{text}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              )}

              {/* Stats bar */}
              <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
                {[
                  { label: "Checks in section", value: String(totalChecks),                  bg: "#eef2ff", color: "#4f46e5" },
                  { label: "Flagged by AI",      value: String(flaggedChecks),               bg: "#fef9c3", color: "#b45309" },
                  { label: "Evaluated clean",    value: String(totalChecks - flaggedChecks), bg: "#f0fdf4", color: "#16a34a" },
                ].map((s) => (
                  <View key={s.label} style={{ flex: 1, backgroundColor: s.bg, borderRadius: 5, padding: 7, alignItems: "center" }}>
                    <Text style={{ fontSize: 13, fontFamily: "Helvetica-Bold", color: s.color }}>{s.value}</Text>
                    <Text style={{ fontSize: 6, color: s.color }}>{s.label}</Text>
                  </View>
                ))}
              </View>

              {/* Column header */}
              <View style={styles.checkColHeader}>
                <Text style={[styles.checkColHeaderText, { width: 26 }]}>ID</Text>
                <Text style={[styles.checkColHeaderText, { flex: 1 }]}>Check / Evaluation Criterion</Text>
                <Text style={[styles.checkColHeaderText, { width: 28 }]}>Role</Text>
                <Text style={[styles.checkColHeaderText, { width: 55, textAlign: "center" }]}>AI Result</Text>
              </View>

              {cats.map((cat) => {
                const catFlagged = cat.items.filter((item) => findingMap.has(item.id)).length;
                return (
                  <View key={cat.number}>
                    <View style={styles.catHeader}>
                      <Text style={styles.catHeaderText}>{cat.number}. {cat.name}</Text>
                      <Text style={styles.catHeaderCount}>{cat.item_count} checks</Text>
                      {catFlagged === 0
                        ? <Text style={styles.catAllClearBadge}>All Clear</Text>
                        : <Text style={[styles.catAllClearBadge, { backgroundColor: "rgba(251,191,36,0.35)" }]}>{catFlagged} Flagged</Text>
                      }
                    </View>
                    {cat.items.map((item, itemIdx) => {
                      const flagged = findingMap.get(item.id);
                      const sevColors = flagged ? getCheckBadgeColors(flagged.severity) : null;
                      const roleColors = getRoleStyle(item.role);
                      const isAlt = itemIdx % 2 !== 0;
                      return (
                        <View
                          key={item.id}
                          style={[styles.checkRow, flagged ? styles.checkRowFlagged : isAlt ? styles.checkRowAlt : {}]}
                        >
                          <Text style={styles.checkId}>{item.id}</Text>
                          <View style={styles.checkTextCol}>
                            <Text style={styles.checkText}>{item.text}</Text>
                            {flagged && (
                              <Text style={styles.checkFindingNote}>
                                Finding: {truncate(flagged.title, 72)}
                              </Text>
                            )}
                          </View>
                          <Text style={[styles.roleBadge, { backgroundColor: roleColors.bg, color: roleColors.color }]}>
                            {item.role}
                          </Text>
                          {flagged && sevColors ? (
                            <Text style={[styles.checkBadge, { backgroundColor: sevColors.bg, color: sevColors.color }]}>
                              {flagged.severity.toUpperCase()}
                            </Text>
                          ) : (
                            <Text style={styles.checkPass}>Pass</Text>
                          )}
                        </View>
                      );
                    })}
                  </View>
                );
              })}

              {/* Role legend */}
              <View style={[styles.divider, { marginTop: 10, marginBottom: 6 }]} />
              <View style={styles.roleLegendRow}>
                <Text style={{ fontSize: 6, color: "#9ca3af", fontFamily: "Helvetica-Bold" }}>ROLE KEY:</Text>
                {[
                  { role: "UX",  label: "UX Designer" },
                  { role: "Dev", label: "Developer" },
                  { role: "BA",  label: "Business Analyst" },
                  { role: "QA",  label: "QA Engineer" },
                  { role: "All", label: "All Roles" },
                ].map(({ role, label }) => {
                  const c = getRoleStyle(role);
                  return (
                    <View key={role} style={styles.roleLegendItem}>
                      <Text style={[styles.howToReadRolePill, { backgroundColor: c.bg, color: c.color }]}>{role}</Text>
                      <Text style={styles.roleLegendLabel}>{label}</Text>
                    </View>
                  );
                })}
                <Text style={[styles.roleLegendLabel, { marginLeft: 6 }]}>
                  STATUS: CRITICAL/HIGH/MEDIUM/LOW = AI flagged  ·  Pass = evaluated clean
                </Text>
              </View>
            </View>

            <PageFooter auditName={audit.name} pageNum={String(7 + findings.length + halfIdx)} />
          </Page>
        );
      })}

      {/* ══════════════════════════════════════════════════════
          METHODOLOGY PAGE
      ══════════════════════════════════════════════════════ */}
      <Page size="A4" style={styles.page}>
        <PageHeader title="Methodology & Framework" />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How This Audit Was Conducted</Text>
          <Text style={{ fontSize: 9, color: "#374151", lineHeight: 1.6 }}>
            This report was produced by the Fusion UX platform using a multi-layer AI analysis pipeline.
            The interface was captured as a full-page screenshot and analysed by Claude Sonnet, a large language
            model with expert-level knowledge of UX heuristics, WCAG accessibility standards, and enterprise
            product design patterns. The AI was guided by the Fusion UX 12-category heuristic framework
            comprising 153 expert evaluation checks across usability, accessibility, information architecture,
            and trust dimensions.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Evaluation Standards Applied</Text>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.subsectionTitle}>Heuristic Frameworks</Text>
              {[
                "Nielsen's 10 Usability Heuristics",
                "Shneiderman's 8 Golden Rules",
                "Gestalt Principles of Visual Perception",
                "Fitts's Law (interaction target sizing)",
                "Cognitive Load Theory (Miller's Law)",
                "Baymard Institute UX Research Patterns",
              ].map((item, i) => (
                <View key={i} style={{ flexDirection: "row", gap: 6, marginBottom: 5 }}>
                  <Text style={{ fontSize: 8, color: "#4f46e5" }}>•</Text>
                  <Text style={{ fontSize: 8, color: "#374151", flex: 1 }}>{item}</Text>
                </View>
              ))}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.subsectionTitle}>Accessibility Standards</Text>
              {[
                "WCAG 2.1 Level A / AA / AAA criteria",
                "WCAG 2.2 (new Success Criteria)",
                "ARIA Authoring Practices Guide (APG)",
                "ADA (Americans with Disabilities Act)",
                "EAA (European Accessibility Act)",
                "EN 301 549 (EU accessibility standard)",
              ].map((item, i) => (
                <View key={i} style={{ flexDirection: "row", gap: 6, marginBottom: 5 }}>
                  <Text style={{ fontSize: 8, color: "#4f46e5" }}>•</Text>
                  <Text style={{ fontSize: 8, color: "#374151", flex: 1 }}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>The 12-Category Heuristic Framework</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            {Object.entries(CATEGORY_NAMES).map(([num, name]) => (
              <View key={num} style={{
                width: "47%", flexDirection: "row", alignItems: "center", gap: 6,
                backgroundColor: "#f9fafb", borderRadius: 5, padding: 7,
              }}>
                <Text style={{ fontSize: 8, color: "#4f46e5", fontFamily: "Helvetica-Bold", width: 20 }}>{num}</Text>
                <Text style={{ fontSize: 8, color: "#374151", flex: 1 }}>{name}</Text>
              </View>
            ))}
          </View>
          <Text style={{ fontSize: 8, color: "#6b7280", marginTop: 8 }}>
            153 checks total across 12 categories. Each check is tagged by responsible role (UX Designer, Developer,
            Business Analyst, QA Engineer, or All). Severity is determined by user impact, task completion risk,
            and WCAG compliance level.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Severity Classification</Text>
          {[
            { sev: "CRITICAL", bg: "#fee2e2", color: "#dc2626", desc: "Blocks task completion, WCAG Level A/AA failure, legal accessibility risk, or data loss. Requires immediate remediation." },
            { sev: "HIGH",     bg: "#ffedd5", color: "#ea580c", desc: "Significant usability friction, measurable conversion or abandonment impact, major inconsistency. Address within 30 days." },
            { sev: "MEDIUM",   bg: "#fef9c3", color: "#ca8a04", desc: "Noticeable friction, moderate cognitive load increase, design inconsistency. Address within 60 days." },
            { sev: "LOW",      bg: "#dcfce7", color: "#16a34a", desc: "Polish issue, minor inconsistency, or minor cognitive load. Improvements will enhance brand quality." },
          ].map(({ sev, bg, color, desc }) => (
            <View key={sev} style={{ flexDirection: "row", gap: 10, marginBottom: 7 }}>
              <Text style={[styles.findingBadge, { backgroundColor: bg, color, width: 58, textAlign: "center" }]}>{sev}</Text>
              <Text style={{ fontSize: 8, color: "#374151", flex: 1, lineHeight: 1.5 }}>{desc}</Text>
            </View>
          ))}
        </View>

        <View style={styles.divider} />
        <Text style={{ fontSize: 7, color: "#9ca3af", textAlign: "center", lineHeight: 1.7 }}>
          {"This report was generated by the Fusion UX platform. Findings were produced by AI analysis and may be enhanced by human review.\n"}
          {"Report generated: "}{new Date().toLocaleString()}{"  ·  Confidential — not for external distribution without authorisation."}
        </Text>

        <PageFooter auditName={audit.name} pageNum={String(9 + findings.length)} />
      </Page>

    </Document>
  );
}
