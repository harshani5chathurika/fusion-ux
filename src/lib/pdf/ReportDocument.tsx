import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// ============================================================
// PDF STYLES
// ============================================================
const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    paddingTop: 40,
    paddingBottom: 50,
    paddingHorizontal: 50,
    backgroundColor: "#ffffff",
    color: "#111827",
  },
  coverPage: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4f46e5",
  },

  // Header / Footer
  pageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  pageFooter: {
    position: "absolute",
    bottom: 20,
    left: 50,
    right: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: "#9ca3af",
  },

  // Cover
  coverLogo: {
    width: 60,
    height: 60,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  coverTitle: {
    fontSize: 32,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 8,
  },
  coverSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    marginBottom: 40,
  },
  coverMeta: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    padding: 24,
    width: "80%",
  },
  coverMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  coverMetaLabel: { color: "rgba(255,255,255,0.6)", fontSize: 10 },
  coverMetaValue: { color: "#ffffff", fontFamily: "Helvetica-Bold", fontSize: 10 },

  // Section
  section: { marginBottom: 28 },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: "#4f46e5",
  },

  // Score cards
  scoreGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  scoreCard: {
    flex: 1,
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  scoreCardPrimary: { backgroundColor: "#eef2ff" },
  scoreCardGood: { backgroundColor: "#f0fdf4" },
  scoreCardWarn: { backgroundColor: "#fffbeb" },
  scoreNumber: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  scoreLabel: { fontSize: 8, color: "#6b7280" },

  // Executive summary box
  summaryBox: {
    backgroundColor: "#f8f7ff",
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#4f46e5",
    marginBottom: 16,
  },
  summaryText: {
    fontSize: 10,
    color: "#374151",
    lineHeight: 1.6,
  },

  // Severity matrix
  severityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  severityBar: {
    height: 14,
    borderRadius: 4,
  },
  severityLabel: { fontSize: 9, width: 50, color: "#374151" },
  severityCount: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#111827" },

  // Finding card
  findingCard: {
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  findingCritical: { backgroundColor: "#fef2f2", borderColor: "#fecaca" },
  findingHigh: { backgroundColor: "#fff7ed", borderColor: "#fed7aa" },
  findingMedium: { backgroundColor: "#fefce8", borderColor: "#fef08a" },
  findingLow: { backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" },
  findingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  findingTitle: { fontSize: 10, fontFamily: "Helvetica-Bold", flex: 1 },
  findingBadge: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    textTransform: "uppercase",
  },
  badgeCritical: { backgroundColor: "#fee2e2", color: "#dc2626" },
  badgeHigh: { backgroundColor: "#ffedd5", color: "#ea580c" },
  badgeMedium: { backgroundColor: "#fef9c3", color: "#ca8a04" },
  badgeLow: { backgroundColor: "#dcfce7", color: "#16a34a" },
  findingBody: { fontSize: 9, color: "#4b5563", lineHeight: 1.5, marginBottom: 6 },
  findingMeta: { flexDirection: "row", gap: 16 },
  findingMetaItem: { fontSize: 8, color: "#6b7280" },
  findingMetaBold: { fontFamily: "Helvetica-Bold" },
  aiBox: {
    marginTop: 6,
    backgroundColor: "#f5f3ff",
    borderRadius: 4,
    padding: 8,
  },
  aiBoxLabel: { fontSize: 7, color: "#7c3aed", fontFamily: "Helvetica-Bold", marginBottom: 3 },
  aiBoxText: { fontSize: 8, color: "#4c1d95", lineHeight: 1.4 },

  // Impact box
  impactBox: {
    marginTop: 6,
    backgroundColor: "#fff7ed",
    borderRadius: 4,
    padding: 8,
  },
  impactLabel: { fontSize: 7, color: "#c2410c", fontFamily: "Helvetica-Bold", marginBottom: 3 },
  impactText: { fontSize: 8, color: "#7c2d12", lineHeight: 1.4 },

  // Roadmap
  roadmapItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
    gap: 10,
  },
  roadmapBadge: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    minWidth: 55,
    textAlign: "center",
  },
  roadmapBadge1: { backgroundColor: "#dcfce7", color: "#166534" },
  roadmapBadge2: { backgroundColor: "#dbeafe", color: "#1d4ed8" },
  roadmapBadge3: { backgroundColor: "#f3e8ff", color: "#7e22ce" },
  roadmapText: { fontSize: 9, color: "#374151", flex: 1, lineHeight: 1.5 },

  // Category scores
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 8,
  },
  categoryName: { fontSize: 8, color: "#374151", width: 150 },
  categoryBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: "#f3f4f6",
    borderRadius: 4,
    overflow: "hidden",
  },
  categoryBarFill: { height: 8, borderRadius: 4 },
  categoryScore: { fontSize: 8, fontFamily: "Helvetica-Bold", width: 25, textAlign: "right" },

  // Table
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },
  tableCell: { fontSize: 8, color: "#374151" },
  tableCellBold: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#111827" },

  // Divider
  divider: { borderBottomWidth: 1, borderBottomColor: "#e5e7eb", marginVertical: 16 },
});

// ============================================================
// TYPES
// ============================================================
interface ReportFinding {
  title: string;
  description: string | null;
  severity: "critical" | "high" | "medium" | "low";
  heuristic_category: string | null;
  location: string | null;
  ai_suggestion: string | null;
  business_impact: string | null;
  financial_risk: string | null;
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

function getFindingStyle(severity: string) {
  switch (severity) {
    case "critical": return { card: styles.findingCritical, badge: styles.badgeCritical };
    case "high": return { card: styles.findingHigh, badge: styles.badgeHigh };
    case "medium": return { card: styles.findingMedium, badge: styles.badgeMedium };
    default: return { card: styles.findingLow, badge: styles.badgeLow };
  }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
}

// ============================================================
// PAGE COMPONENTS
// ============================================================

function PageFooter({ auditName, pageNum }: { auditName: string; pageNum: string }) {
  return (
    <View style={styles.pageFooter}>
      <Text>Fusion UX — {auditName}</Text>
      <Text>Page {pageNum} · Confidential</Text>
      <Text>Generated {new Date().toLocaleDateString()}</Text>
    </View>
  );
}

function PageHeader({ title }: { title: string }) {
  return (
    <View style={styles.pageHeader}>
      <Text style={{ fontSize: 11, fontFamily: "Helvetica-Bold", color: "#4f46e5" }}>
        FUSION UX AUDIT REPORT
      </Text>
      <Text style={{ fontSize: 9, color: "#9ca3af" }}>{title}</Text>
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
  const highFindings = findings.filter((f) => f.severity === "high");
  const mediumFindings = findings.filter((f) => f.severity === "medium");

  return (
    <Document
      title={`Fusion UX Report — ${audit.name}`}
      author="Fusion UX Platform"
      subject="UX Audit Report"
    >
      {/* ============ COVER PAGE ============ */}
      <Page size="A4" style={[styles.page, styles.coverPage]}>
        <View style={styles.coverLogo}>
          <Text style={{ fontSize: 24, color: "#ffffff", fontFamily: "Helvetica-Bold" }}>F</Text>
        </View>
        <Text style={styles.coverTitle}>UX Audit Report</Text>
        <Text style={styles.coverSubtitle}>{audit.name}</Text>

        <View style={styles.coverMeta}>
          {[
            ["Organization", organization_name ?? "—"],
            ["Prepared by", preparer_name ?? "Fusion UX Platform"],
            ["Audit type", audit.audit_type.toUpperCase()],
            ["Device", audit.device_type.toUpperCase()],
            ["Date", formatDate(audit.created_at)],
            ["Target URL", audit.target_url ?? "Screenshot-based audit"],
          ].map(([label, value]) => (
            <View key={label} style={styles.coverMetaRow}>
              <Text style={styles.coverMetaLabel}>{label}</Text>
              <Text style={styles.coverMetaValue}>{value}</Text>
            </View>
          ))}
        </View>
      </Page>

      {/* ============ PAGE 2 — EXECUTIVE SUMMARY + SCORES ============ */}
      <Page size="A4" style={styles.page}>
        <PageHeader title="Executive Summary" />

        {/* Score cards */}
        <View style={styles.scoreGrid}>
          <View style={[styles.scoreCard, styles.scoreCardPrimary]}>
            <Text style={[styles.scoreNumber, { color: getScoreColor(audit.overall_score) }]}>
              {audit.overall_score ?? "—"}
            </Text>
            <Text style={styles.scoreLabel}>Overall UX Score</Text>
          </View>
          <View style={[styles.scoreCard, styles.scoreCardGood]}>
            <Text style={[styles.scoreNumber, { color: getScoreColor(audit.heuristic_score) }]}>
              {audit.heuristic_score ?? "—"}
            </Text>
            <Text style={styles.scoreLabel}>Heuristic Score</Text>
          </View>
          <View style={[styles.scoreCard, styles.scoreCardWarn]}>
            <Text style={[styles.scoreNumber, { color: getScoreColor(audit.accessibility_score) }]}>
              {audit.accessibility_score ?? "—"}
            </Text>
            <Text style={styles.scoreLabel}>Accessibility Score</Text>
          </View>
          <View style={[styles.scoreCard, { backgroundColor: "#fef2f2" }]}>
            <Text style={[styles.scoreNumber, { color: "#dc2626" }]}>
              {audit.critical_count}
            </Text>
            <Text style={styles.scoreLabel}>Critical Issues</Text>
          </View>
        </View>

        {/* AI Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Analysis Summary</Text>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryText}>
              {audit.ai_summary ?? "Analysis summary not available."}
            </Text>
          </View>
        </View>

        {/* Executive summary */}
        {executive_summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Executive Summary</Text>
            <Text style={styles.summaryText}>{executive_summary}</Text>
          </View>
        )}

        {/* Severity matrix */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Severity Distribution</Text>
          {[
            { label: "Critical", count: audit.critical_count, color: "#ef4444", pct: totalIssues ? (audit.critical_count / totalIssues) * 100 : 0 },
            { label: "High", count: audit.high_count, color: "#f97316", pct: totalIssues ? (audit.high_count / totalIssues) * 100 : 0 },
            { label: "Medium", count: audit.medium_count, color: "#eab308", pct: totalIssues ? (audit.medium_count / totalIssues) * 100 : 0 },
            { label: "Low", count: audit.low_count, color: "#22c55e", pct: totalIssues ? (audit.low_count / totalIssues) * 100 : 0 },
          ].map((item) => (
            <View key={item.label} style={styles.severityRow}>
              <Text style={styles.severityLabel}>{item.label}</Text>
              <View style={{ flex: 1, height: 14, backgroundColor: "#f3f4f6", borderRadius: 4, overflow: "hidden" }}>
                <View style={[styles.severityBar, { width: `${item.pct}%`, backgroundColor: item.color }]} />
              </View>
              <Text style={styles.severityCount}>{item.count}</Text>
            </View>
          ))}
          <Text style={{ fontSize: 8, color: "#9ca3af", marginTop: 6 }}>
            Total issues identified: {totalIssues} · Human-verified: {verifiedFindings.length}
          </Text>
        </View>

        <PageFooter auditName={audit.name} pageNum="2" />
      </Page>

      {/* ============ PAGE 3 — CRITICAL & HIGH FINDINGS ============ */}
      {(criticalFindings.length > 0 || highFindings.length > 0) && (
        <Page size="A4" style={styles.page}>
          <PageHeader title="Critical & High Priority Findings" />

          {[...criticalFindings, ...highFindings].slice(0, 8).map((finding, i) => {
            const sev = getFindingStyle(finding.severity);
            return (
              <View key={i} style={[styles.findingCard, sev.card]}>
                <View style={styles.findingHeader}>
                  <Text style={styles.findingTitle}>{finding.title}</Text>
                  <Text style={[styles.findingBadge, sev.badge]}>
                    {finding.severity.toUpperCase()}
                  </Text>
                </View>
                {finding.description && (
                  <Text style={styles.findingBody}>{finding.description}</Text>
                )}
                <View style={styles.findingMeta}>
                  {finding.heuristic_category && (
                    <Text style={styles.findingMetaItem}>
                      <Text style={styles.findingMetaBold}>Category: </Text>
                      {finding.heuristic_category}
                    </Text>
                  )}
                  {finding.location && (
                    <Text style={styles.findingMetaItem}>
                      <Text style={styles.findingMetaBold}>Location: </Text>
                      {finding.location}
                    </Text>
                  )}
                </View>
                {finding.ai_suggestion && (
                  <View style={styles.aiBox}>
                    <Text style={styles.aiBoxLabel}>AI RECOMMENDATION</Text>
                    <Text style={styles.aiBoxText}>{finding.ai_suggestion}</Text>
                  </View>
                )}
                {finding.business_impact && (
                  <View style={styles.impactBox}>
                    <Text style={styles.impactLabel}>BUSINESS IMPACT</Text>
                    <Text style={styles.impactText}>{finding.business_impact}</Text>
                  </View>
                )}
              </View>
            );
          })}

          <PageFooter auditName={audit.name} pageNum="3" />
        </Page>
      )}

      {/* ============ PAGE 4 — ALL FINDINGS TABLE ============ */}
      <Page size="A4" style={styles.page}>
        <PageHeader title="All Findings Summary" />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Complete Findings Register</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCellBold, { width: "35%" }]}>Finding</Text>
            <Text style={[styles.tableCellBold, { width: "12%" }]}>Severity</Text>
            <Text style={[styles.tableCellBold, { width: "25%" }]}>Category</Text>
            <Text style={[styles.tableCellBold, { width: "15%" }]}>Priority</Text>
            <Text style={[styles.tableCellBold, { width: "13%" }]}>Status</Text>
          </View>
          {findings.slice(0, 20).map((finding, i) => (
            <View key={i} style={[styles.tableRow, i % 2 === 0 ? {} : { backgroundColor: "#f9fafb" }]}>
              <Text style={[styles.tableCell, { width: "35%" }]} numberOfLines={2}>
                {finding.title}
              </Text>
              <Text style={[styles.tableCell, { width: "12%", textTransform: "capitalize" }]}>
                {finding.severity}
              </Text>
              <Text style={[styles.tableCell, { width: "25%" }]} numberOfLines={1}>
                {finding.heuristic_category ?? "—"}
              </Text>
              <Text style={[styles.tableCell, { width: "15%" }]}>
                {finding.impact_score && finding.frequency_score
                  ? `${finding.impact_score * finding.frequency_score}/25`
                  : "—"}
              </Text>
              <Text style={[styles.tableCell, { width: "13%", textTransform: "capitalize" }]}>
                {finding.verification_status}
              </Text>
            </View>
          ))}
          {findings.length > 20 && (
            <Text style={{ fontSize: 8, color: "#9ca3af", marginTop: 6 }}>
              + {findings.length - 20} more findings not shown in this table.
            </Text>
          )}
        </View>

        <PageFooter auditName={audit.name} pageNum="4" />
      </Page>

      {/* ============ PAGE 5 — ROI & ROADMAP ============ */}
      <Page size="A4" style={styles.page}>
        <PageHeader title="ROI Analysis & Improvement Roadmap" />

        {roi_analysis && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ROI & Business Impact Analysis</Text>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryText}>{roi_analysis}</Text>
            </View>

            {/* Quick stats */}
            <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
              {[
                { label: "Critical Issues", value: `${audit.critical_count}`, desc: "Immediate action required", color: "#fef2f2", textColor: "#dc2626" },
                { label: "High Risk Issues", value: `${audit.high_count}`, desc: "Revenue impact risk", color: "#fff7ed", textColor: "#ea580c" },
                { label: "Human Verified", value: `${verifiedFindings.length}`, desc: "Ready for dev team", color: "#f0fdf4", textColor: "#16a34a" },
              ].map((stat) => (
                <View key={stat.label} style={{ flex: 1, backgroundColor: stat.color, borderRadius: 8, padding: 12 }}>
                  <Text style={{ fontSize: 20, fontFamily: "Helvetica-Bold", color: stat.textColor }}>{stat.value}</Text>
                  <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: stat.textColor, marginBottom: 2 }}>{stat.label}</Text>
                  <Text style={{ fontSize: 7, color: "#6b7280" }}>{stat.desc}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {roadmap && roadmap.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Improvement Roadmap</Text>
            {roadmap.map((item, i) => {
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

        {/* Recommended next steps */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended Next Steps</Text>
          {[
            `Fix ${audit.critical_count} critical issues immediately — these block users or create legal/compliance risk`,
            `Schedule a design sprint to address ${audit.high_count} high-priority usability issues within 30 days`,
            `Re-run Fusion UX audit after fixes to measure improvement and validate score changes`,
            "Share this report with your development team and assign issues with priority tags",
            "Consider a quarterly UX audit cycle to track long-term product health",
          ].map((step, i) => (
            <View key={i} style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
              <Text style={{ fontSize: 9, color: "#4f46e5", fontFamily: "Helvetica-Bold", width: 14 }}>{i + 1}.</Text>
              <Text style={{ fontSize: 9, color: "#374151", flex: 1, lineHeight: 1.5 }}>{step}</Text>
            </View>
          ))}
        </View>

        <PageFooter auditName={audit.name} pageNum="5" />
      </Page>

      {/* ============ PAGE 6 — APPENDIX ============ */}
      <Page size="A4" style={styles.page}>
        <PageHeader title="Appendix — Heuristic Framework" />
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fusion UX 12-Category Evaluation Framework</Text>
          <Text style={{ fontSize: 9, color: "#6b7280", marginBottom: 12, lineHeight: 1.5 }}>
            This audit was conducted against the Fusion UX proprietary 12-category heuristic evaluation
            framework comprising 153 expert checks across UX, accessibility, IA, and trust dimensions.
          </Text>
          {[
            { num: "01", name: "Visibility of System State", items: 18 },
            { num: "02", name: "Match Between System and the Real World", items: 14 },
            { num: "03", name: "User Control and Freedom", items: 15 },
            { num: "04", name: "Consistency and Standards", items: 14 },
            { num: "05", name: "Error Prevention and Recovery", items: 18 },
            { num: "06", name: "Recognition Over Recall", items: 12 },
            { num: "07", name: "Flexibility, Aesthetics and Minimalism", items: 16 },
            { num: "08", name: "Adaptability and User Efficiency", items: 16 },
            { num: "09", name: "Inclusivity and Accessibility", items: 18 },
            { num: "10", name: "Information Architecture", items: 12 },
            { num: "11", name: "Content and Microcopy", items: 12 },
            { num: "12", name: "Trust, Privacy and Data UX", items: 8 },
          ].map((cat) => (
            <View key={cat.num} style={[styles.categoryRow, { marginBottom: 8 }]}>
              <Text style={{ fontSize: 8, color: "#9ca3af", width: 20 }}>{cat.num}</Text>
              <Text style={{ fontSize: 9, color: "#374151", flex: 1 }}>{cat.name}</Text>
              <Text style={{ fontSize: 8, color: "#6b7280", width: 60, textAlign: "right" }}>
                {cat.items} checks
              </Text>
            </View>
          ))}
        </View>
        <View style={styles.divider} />
        <Text style={{ fontSize: 8, color: "#9ca3af", textAlign: "center", lineHeight: 1.6 }}>
          This report was generated by the Fusion UX platform. All findings were produced by AI analysis
          and reviewed through a human-in-the-loop verification process.{"\n"}
          Report generated: {new Date().toLocaleString()} · Confidential — not for external distribution.
        </Text>
        <PageFooter auditName={audit.name} pageNum="6" />
      </Page>
    </Document>
  );
}
