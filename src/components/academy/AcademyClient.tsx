"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import {
  ArrowLeft, Search, BookOpen, Users, Zap, GraduationCap,
  ChevronDown, ChevronRight, AlertTriangle, CheckCircle2,
  TrendingUp, Code2, BarChart3, Lightbulb, Play, Star,
  Shield, Eye, FileText, Globe,
} from "lucide-react";

// ── ACADEMY DATA ────────────────────────────────────────────────

const CATEGORIES = [
  {
    number: "01", icon: "👁️", color: "blue",
    name: "Visibility of System State",
    tagline: "Users must always know what is happening",
    description: "Every interface must continuously inform users about its current state through appropriate feedback within a reasonable time. When users can't see what the system is doing, they feel lost, anxious, and abandon tasks.",
    wcag: "4.1.3 Status Messages (AA)",
    nielsen: "H1: Visibility of System Status",
    checkCount: 18,
    roles: ["UX", "Dev"],
    before: { label: "❌ Bad UX", text: "Checkout button clicked — screen freezes silently for 8 seconds with no feedback. User clicks again, causing duplicate payment." },
    after: { label: "✅ Fixed", text: "Button shows spinner + 'Processing payment…' message. Progress bar appears. User sees exactly what's happening." },
    roi: { severity: "critical", usd: "$50K – $250K", reason: "Duplicate transactions & chargebacks. Baymard Institute: silent loading causes 28% checkout abandonment." },
    proTip: "Add optimistic UI updates so actions feel instant. Pair with a toast notification for confirmation.",
  },
  {
    number: "02", icon: "🌍", color: "green",
    name: "Match Between System and Real World",
    tagline: "Speak the user's language, not the system's",
    description: "The system should speak users' language — words, phrases, and concepts familiar to the user, rather than system-oriented terms. Follow real-world conventions to make information appear natural and logical.",
    wcag: "3.1.3 Unusual Words (AAA)",
    nielsen: "H2: Match Between System and Real World",
    checkCount: 14,
    roles: ["UX", "BA"],
    before: { label: "❌ Bad UX", text: "Error: 'HTTP 422 Unprocessable Entity — validation constraint violation on field: usr_email_addr'." },
    after: { label: "✅ Fixed", text: "Error: 'Please enter a valid email address like name@company.com'." },
    roi: { severity: "high", usd: "$12K – $62K", reason: "Technical jargon causes 22% form abandonment (NNG Research). Support ticket costs surge." },
    proTip: "Run a 5-second test with non-technical stakeholders. If they can't explain the screen, rewrite the copy.",
  },
  {
    number: "03", icon: "🔙", color: "orange",
    name: "User Control and Freedom",
    tagline: "Support undo and clear emergency exits",
    description: "Users often choose system functions by mistake and need clearly marked 'emergency exits' to leave unwanted states. Support undo and redo so users feel safe to explore without fear of consequences.",
    wcag: "2.1.2 No Keyboard Trap (A)",
    nielsen: "H3: User Control and Freedom",
    checkCount: 15,
    roles: ["Dev", "UX"],
    before: { label: "❌ Bad UX", text: "User accidentally deletes a project. No undo available. Support required to restore from backup — 2 hour delay." },
    after: { label: "✅ Fixed", text: "Soft-delete with 30-day recovery. Immediate 'Undo' toast for 10 seconds. Confirmation dialog for permanent delete." },
    roi: { severity: "high", usd: "$19K – $94K", reason: "Data loss incidents trigger enterprise contract termination. Average recovery cost: $7,500 per incident." },
    proTip: "Implement soft deletes at the database level. All destructive actions should require 2 confirmations.",
  },
  {
    number: "04", icon: "🎨", color: "purple",
    name: "Consistency and Standards",
    tagline: "Follow platform conventions users already know",
    description: "Users should not have to wonder whether different words, situations, or actions mean the same thing. Follow platform conventions. Inconsistency forces users to re-learn and creates cognitive load.",
    wcag: "3.2.4 Consistent Identification (AA)",
    nielsen: "H4: Consistency and Standards",
    checkCount: 14,
    roles: ["UX", "Dev", "BA"],
    before: { label: "❌ Bad UX", text: "Save button in modal says 'Confirm'. Same action in settings says 'Apply'. In export wizard it's 'Done'. Three words, one action." },
    after: { label: "✅ Fixed", text: "All save actions use 'Save' with a consistent blue primary button. Design tokens enforced via Storybook." },
    roi: { severity: "medium", usd: "$6K – $31K", reason: "Inconsistency increases training time by 40% for enterprise teams (IBM Research). Onboarding cost impact." },
    proTip: "Maintain a component library (Storybook / Figma tokens). Every new component must be design-system approved.",
  },
  {
    number: "05", icon: "🛡️", color: "red",
    name: "Error Prevention",
    tagline: "Design to eliminate errors before they happen",
    description: "Even better than good error messages is a careful design which prevents a problem from occurring in the first place. Eliminate error-prone conditions or check for them and present users with a confirmation option.",
    wcag: "3.3.4 Error Prevention (Legal/Financial) (AA)",
    nielsen: "H5: Error Prevention",
    checkCount: 16,
    roles: ["Dev", "BA", "QA"],
    before: { label: "❌ Bad UX", text: "Payment form accepts any 16-digit number. Server rejects after full form submission. User must start over." },
    after: { label: "✅ Fixed", text: "Inline Luhn algorithm validation highlights card errors as user types. Format auto-applied (XXXX XXXX XXXX XXXX)." },
    roi: { severity: "critical", usd: "$62K – $312K", reason: "WCAG Level AA legal compliance under ADA/EAA. Financial form errors cost avg 35% abandonment (Baymard 2023)." },
    proTip: "Validate at the field level, not the form level. Use the GOV.UK error message pattern: label → error → input.",
  },
  {
    number: "06", icon: "🧠", color: "indigo",
    name: "Recognition Rather Than Recall",
    tagline: "Minimise the user's memory load",
    description: "Minimise the user's memory load by making objects, actions, and options visible. The user should not have to remember information from one part of the dialogue to another. Instructions should be visible or easily retrievable.",
    wcag: "3.3.2 Labels or Instructions (A)",
    nielsen: "H6: Recognition Rather Than Recall",
    checkCount: 12,
    roles: ["UX", "BA"],
    before: { label: "❌ Bad UX", text: "Multi-step form: Step 3 asks for 'the code from step 1'. User must scroll back or remember a 8-character token." },
    after: { label: "✅ Fixed", text: "Step 3 shows a summary card of inputs from steps 1–2 inline. One-click copy for the code. No memory needed." },
    roi: { severity: "high", usd: "$15K – $78K", reason: "Poor recall UX increases task completion time by 47% (Nielsen Norman Group). Directly impacts enterprise user adoption." },
    proTip: "Apply progressive disclosure. Show only what's needed now. Use inline summaries for multi-step flows.",
  },
  {
    number: "07", icon: "⚡", color: "yellow",
    name: "Flexibility and Efficiency of Use",
    tagline: "Serve both novice and expert users",
    description: "Accelerators — unseen by the novice user — may speed up interaction for the expert so the system can cater to both inexperienced and experienced users. Allow users to tailor frequent actions.",
    wcag: "2.1.1 Keyboard Accessible (A)",
    nielsen: "H7: Flexibility and Efficiency of Use",
    checkCount: 11,
    roles: ["Dev", "UX"],
    before: { label: "❌ Bad UX", text: "Power users must click through 5 screens to run their daily report. No keyboard shortcuts. No saved templates." },
    after: { label: "✅ Fixed", text: "⌘+R runs report. Saved filter templates. Bulk actions for 50+ items. Expert users save 45 min/day." },
    roi: { severity: "medium", usd: "$9K – $47K", reason: "Power user productivity loss: enterprise teams report 23% efficiency gain after keyboard shortcuts are added." },
    proTip: "Audit your top 5 user journeys by click count. Any journey over 4 clicks needs an accelerator path.",
  },
  {
    number: "08", icon: "🎯", color: "teal",
    name: "Aesthetic and Minimalist Design",
    tagline: "Remove irrelevant information ruthlessly",
    description: "Dialogues should not contain irrelevant or rarely needed information. Every extra unit of information in a dialogue competes with relevant information and diminishes their relative visibility.",
    wcag: "1.3.3 Sensory Characteristics (A)",
    nielsen: "H8: Aesthetic and Minimalist Design",
    checkCount: 10,
    roles: ["UX"],
    before: { label: "❌ Bad UX", text: "Dashboard shows 14 metric cards, 3 charts, 2 alerts, a news feed, and a team chat widget simultaneously." },
    after: { label: "✅ Fixed", text: "Progressive disclosure: 4 key metrics. Users expand to see detail. Cognitive load score drops from 78 to 31." },
    roi: { severity: "medium", usd: "$9K – $37K", reason: "Visual clutter increases decision fatigue. Forrester Research: 37% of users leave overcrowded dashboards within 30 sec." },
    proTip: "Use the 'squint test': blur your screen. If you can't identify the primary action, the page needs simplification.",
  },
  {
    number: "09", icon: "🚨", color: "red",
    name: "Help Users Recognise, Diagnose, and Recover from Errors",
    tagline: "Error messages must be plain language solutions",
    description: "Error messages should be expressed in plain language (no codes), precisely indicate the problem, and constructively suggest a solution. Users should be able to fix errors without external help.",
    wcag: "3.3.1 Error Identification (A) + 3.3.3 Error Suggestion (AA)",
    nielsen: "H9: Help Users Recognise and Recover from Errors",
    checkCount: 13,
    roles: ["Dev", "BA", "QA"],
    before: { label: "❌ Bad UX", text: "500 Internal Server Error. Contact your administrator. Error ID: #af342b." },
    after: { label: "✅ Fixed", text: "'We couldn't save your changes — our servers are busy. Your work is saved locally. Try again in 30 seconds.' [Retry button]" },
    roi: { severity: "critical", usd: "$31K – $156K", reason: "Unhelpful errors generate 40% of support tickets (Zendesk 2023). Enterprise SLA breaches trigger penalty clauses." },
    proTip: "Write error messages in this format: [What happened] + [Why] + [How to fix]. Never show stack traces in production.",
  },
  {
    number: "10", icon: "❓", color: "cyan",
    name: "Help and Documentation",
    tagline: "Provide searchable, contextual help",
    description: "Even though it is better if the system can be used without documentation, it may be necessary to provide help and documentation. Help should be easy to search, focused on the user's task, and actionable.",
    wcag: "3.3.5 Help (AAA)",
    nielsen: "H10: Help and Documentation",
    checkCount: 9,
    roles: ["BA", "UX"],
    before: { label: "❌ Bad UX", text: "PDF manual linked from a footer. 'Help' opens a new tab with a 200-page document. No search. No contextual links." },
    after: { label: "✅ Fixed", text: "Contextual '?' tooltip beside every complex field. In-app searchable knowledge base. Video walkthroughs per feature." },
    roi: { severity: "medium", usd: "$6K – $25K", reason: "Poor documentation increases onboarding time 60% (Pendo 2023). Support cost per enterprise: $3,750/year." },
    proTip: "Add a '?' icon to every form field and complex action. Link directly to the relevant help article — not the homepage.",
  },
  {
    number: "11", icon: "♿", color: "violet",
    name: "Inclusivity and Accessibility",
    tagline: "Build for every user, no exceptions",
    description: "Design must be usable by people with diverse abilities — visual, motor, cognitive, and auditory. WCAG 2.1 AA compliance is a legal requirement in most enterprise markets and a moral imperative.",
    wcag: "WCAG 2.1/2.2 AA Full Compliance",
    nielsen: "WCAG + Universal Design Principles",
    checkCount: 20,
    roles: ["Dev", "UX", "QA"],
    before: { label: "❌ Bad UX", text: "Dashboard uses red/green only to show pass/fail. No alt text on charts. Form has no keyboard navigation. Contrast ratio 2.8:1." },
    after: { label: "✅ Fixed", text: "WCAG AA contrast (4.5:1+). Screen-reader labels on all interactive elements. Icons + text for colour-blind users. ARIA live regions." },
    roi: { severity: "critical", usd: "$50K – $250K", reason: "ADA/EAA legal liability. 15% of users have a disability (WHO). Enterprise clients include accessibility in procurement RFPs." },
    proTip: "Run axe DevTools on every page before merge. Block PRs with WCAG A violations. AA is your legal floor.",
  },
  {
    number: "12", icon: "🔒", color: "slate",
    name: "Trust, Privacy, and Security",
    tagline: "Users must feel safe giving you their data",
    description: "Users must trust the system with their personal and financial data. Clear privacy communication, security signals, and transparent data handling are non-negotiable in enterprise and consumer products.",
    wcag: "2.4.2 Page Titled (A) + GDPR/CCPA compliance",
    nielsen: "Trust & Credibility Heuristics (Fogg)",
    checkCount: 13,
    roles: ["Dev", "BA", "QA"],
    before: { label: "❌ Bad UX", text: "Payment page has no SSL padlock in URL. Privacy policy is 40 pages of legalese. Data retention period not stated." },
    after: { label: "✅ Fixed", text: "SSL + trust badges on payment page. Plain-language privacy summary (3 bullet points). Explicit consent toggles. Audit trail visible to users." },
    roi: { severity: "critical", usd: "$78K – $625K", reason: "GDPR fines up to 4% of global revenue. 81% of users abandon purchases on sites they don't trust (Baymard 2023)." },
    proTip: "Add a security badge, last-login timestamp, and active session list to every account settings page.",
  },
];

const COLOR_MAP: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  blue:   { bg: "bg-blue-50 dark:bg-blue-950/30",   text: "text-blue-700 dark:text-blue-300",   border: "border-blue-200 dark:border-blue-800",   badge: "bg-blue-500" },
  green:  { bg: "bg-green-50 dark:bg-green-950/30", text: "text-green-700 dark:text-green-300", border: "border-green-200 dark:border-green-800", badge: "bg-green-500" },
  orange: { bg: "bg-orange-50 dark:bg-orange-950/30", text: "text-orange-700 dark:text-orange-300", border: "border-orange-200 dark:border-orange-800", badge: "bg-orange-500" },
  purple: { bg: "bg-purple-50 dark:bg-purple-950/30", text: "text-purple-700 dark:text-purple-300", border: "border-purple-200 dark:border-purple-800", badge: "bg-purple-500" },
  red:    { bg: "bg-red-50 dark:bg-red-950/30",     text: "text-red-700 dark:text-red-300",     border: "border-red-200 dark:border-red-800",     badge: "bg-red-500" },
  indigo: { bg: "bg-indigo-50 dark:bg-indigo-950/30", text: "text-indigo-700 dark:text-indigo-300", border: "border-indigo-200 dark:border-indigo-800", badge: "bg-indigo-500" },
  yellow: { bg: "bg-yellow-50 dark:bg-yellow-950/30", text: "text-yellow-700 dark:text-yellow-300", border: "border-yellow-200 dark:border-yellow-800", badge: "bg-yellow-500" },
  teal:   { bg: "bg-teal-50 dark:bg-teal-950/30",   text: "text-teal-700 dark:text-teal-300",   border: "border-teal-200 dark:border-teal-800",   badge: "bg-teal-500" },
  cyan:   { bg: "bg-cyan-50 dark:bg-cyan-950/30",   text: "text-cyan-700 dark:text-cyan-300",   border: "border-cyan-200 dark:border-cyan-800",   badge: "bg-cyan-500" },
  violet: { bg: "bg-violet-50 dark:bg-violet-950/30", text: "text-violet-700 dark:text-violet-300", border: "border-violet-200 dark:border-violet-800", badge: "bg-violet-500" },
  slate:  { bg: "bg-slate-50 dark:bg-slate-950/30", text: "text-slate-700 dark:text-slate-300", border: "border-slate-200 dark:border-slate-800", badge: "bg-slate-500" },
};

const ROLE_TRACKS = [
  {
    role: "Business Analyst",
    icon: BarChart3,
    color: "blue",
    emoji: "📊",
    focus: ["01", "02", "04", "07", "10"],
    description: "BAs bridge user needs and business requirements. Your focus is on workflow logic, terminology clarity, and ensuring every screen serves a documented business goal.",
    steps: [
      "Start with Category 02 (Real World Match) — review all user-facing copy for jargon",
      "Audit Category 01 (Visibility) — map every system state to a business process step",
      "Use the Collaborative Review Lab to tag findings with 'BA: Business Rule Conflict'",
      "Export findings as a Requirements Gap Report for the dev team",
      "Use the ROI Risk Engine to prioritise fixes by business impact (USD risk)",
    ],
    tips: ["Focus on error message copy — you own plain-language standards", "Document every terminology decision in the Audit Notes for developer handoff"],
  },
  {
    role: "Developer",
    icon: Code2,
    color: "purple",
    emoji: "💻",
    focus: ["01", "03", "05", "09", "11"],
    description: "Developers own the technical implementation of UX quality. Your focus is on ARIA implementation, keyboard accessibility, error handling patterns, and performance feedback.",
    steps: [
      "Run axe DevTools on every page — fix all WCAG A violations before starting UX review",
      "Audit Category 03 (User Control) — verify every destructive action has an undo",
      "Check Category 09 (Error Recovery) — every API error must show a user-facing message",
      "Tag code-level findings with 'Dev: Implementation Bug' in the Review Lab",
      "Use the Figma Sync feature to receive fix prototypes for confirmed violations",
    ],
    tips: ["WCAG AA is your PR merge gate — automate axe in CI/CD", "Every form field needs aria-label, aria-describedby for errors, and keyboard tab order"],
  },
  {
    role: "QA Engineer",
    icon: Shield,
    color: "red",
    emoji: "🧪",
    focus: ["04", "05", "09", "11", "12"],
    description: "QA Engineers are the final quality gate. Your focus is systematic coverage across all 12 categories, regression testing UX fixes, and documenting reproducible failure scenarios.",
    steps: [
      "Create a test matrix: 12 categories × device types × user roles",
      "Focus Category 05 (Error Prevention) — test every edge case and boundary condition",
      "Use the Playground Audit to calibrate your severity judgement before real projects",
      "In Review Lab: use 'QA: Cannot Reproduce' and 'QA: Confirmed Regression' tags",
      "Generate the PDF Compliance Report after every sprint for stakeholder sign-off",
    ],
    tips: ["Test with actual assistive technology (VoiceOver, NVDA) monthly", "Document every finding with a screen recording — saves 80% of dev debug time"],
  },
];

// ── PLAYGROUND DATA ──────────────────────────────────────────────

const PLAYGROUND_ISSUES = [
  {
    id: "p1",
    area: "Header / Search",
    title: "Search bar has no visible label or placeholder",
    severity: "critical",
    category: "11",
    feedback: "🎯 Correct! This violates WCAG 3.3.2 (Labels or Instructions). Screen readers can't identify the field, blocking 15% of users. Severity: CRITICAL — directly blocks task completion for users with assistive technology. ROI Risk: $50K–$250K legal exposure.",
  },
  {
    id: "p2",
    area: "Navigation",
    title: "Active page indicator missing — no visual state on nav items",
    severity: "high",
    category: "01",
    feedback: "✅ Well spotted! Category 01 — Visibility of System State (1.2: Selected elements must be visually distinct). Users can't orient themselves. NNG Research: navigation disorientation causes 31% premature exits. Severity: HIGH.",
  },
  {
    id: "p3",
    area: "Form — Submit Button",
    title: "Submit button stays enabled with empty required fields",
    severity: "high",
    category: "05",
    feedback: "🎯 Excellent catch! Category 05 — Error Prevention (5.1). The best error is one that never happens. Baymard Institute: disabling submit until valid reduces form errors by 22%. Severity: HIGH — causes user frustration and server errors.",
  },
  {
    id: "p4",
    area: "Color Palette",
    title: "Red/green only used to show pass/fail — no icon or text alternative",
    severity: "critical",
    category: "11",
    feedback: "♿ Perfect! WCAG 1.4.1 (Use of Color) — colour alone cannot convey meaning. 8% of men have colour-blindness. Enterprise procurement RFPs require WCAG AA compliance. Severity: CRITICAL — legal risk.",
  },
  {
    id: "p5",
    area: "Data Table",
    title: "Delete action has no confirmation dialog",
    severity: "high",
    category: "03",
    feedback: "🔙 Correct! Category 03 — User Control and Freedom (3.4 + 3.7). Irreversible actions require confirmation. Soft-delete recommended. Data loss generates support escalations averaging $7,500 recovery cost per incident. Severity: HIGH.",
  },
  {
    id: "p6",
    area: "Footer",
    title: "Contact links open in same tab, breaking user's workflow",
    severity: "low",
    category: "03",
    feedback: "Good eye! Category 03 — User Control (3.6). External links should open in a new tab with a visual indicator (external link icon). Severity: LOW — minor friction but breaks flow on task-heavy workflows.",
  },
];

const PRO_TIPS = [
  {
    icon: "🔍",
    title: "Pattern Finder — Automated Research Synthesis",
    color: "violet",
    content: "After completing 3+ audits on the same product, use the Findings page to filter by category and sort by ROI Risk. Recurring patterns (same category, multiple audits) indicate systemic design debt — these are your highest-value fixes. Export as a Pattern Report to present to leadership.",
    action: "Go to Findings → Group by Category",
    href: "/findings",
  },
  {
    icon: "🎨",
    title: "Figma Sync — Send Violations to Design",
    color: "orange",
    content: "When you verify a finding in the Review Lab, click 'Sync to Figma'. This sends the bounding box coordinates, severity, and AI recommendation directly to a Figma annotation layer. Designers receive a ready-to-act brief — no copy-pasting, no ambiguity, no miscommunication.",
    action: "Open any Audit → Verify a Finding",
    href: "/audits",
  },
  {
    icon: "🔐",
    title: "Localhost Auditing — Secure Internal Staging",
    color: "slate",
    content: "To audit internal staging sites: (1) Use the Screenshot Upload audit type — take screenshots locally. (2) Never enter localhost URLs in the URL audit type — they won't resolve from our servers. (3) For sensitive enterprise data, blur PII before uploading. (4) All screenshots are encrypted at rest in your private Supabase bucket.",
    action: "New Audit → Screenshots type",
    href: "/audits/new",
  },
  {
    icon: "📊",
    title: "ROI Risk Engine — Build Your Business Case",
    color: "red",
    content: "Every finding has an ROI Risk Score (Impact × Frequency × Severity Weight). Sort your findings by ROI Risk before stakeholder meetings. A Critical score of 80+ with $150K+ USD exposure gets engineering resources approved instantly. The numbers do the persuasion for you.",
    action: "Open any Audit → Sort by ROI Risk",
    href: "/audits",
  },
];

// ── WIZARD STEPS ─────────────────────────────────────────────────

const WIZARD_STEPS = [
  {
    number: 1, label: "Connect", icon: Globe, color: "blue",
    title: "Connect Your Interface",
    description: "Paste a live URL, upload screenshots, or sync your Figma file. Fusion UX captures a full-page screenshot automatically using Microlink — no browser extension needed.",
    points: ["Live URL → auto full-page screenshot", "Upload up to 5 screenshots (PNG/JPG/WebP)", "Figma token → fetches up to 6 frames", "Localhost? Use Screenshot upload mode"],
  },
  {
    number: 2, label: "Scan", icon: Eye, color: "violet",
    title: "AI Scans All 153 Checks",
    description: "Claude Sonnet 4.6 evaluates your interface against all 153 checks across 12 heuristic categories simultaneously. Findings are distributed across the full page — header, body, footer — with bounding box coordinates.",
    points: ["153 checks across 12 categories", "WCAG 2.1/2.2 criteria mapped per finding", "ROI Risk score calculated (Impact × Frequency × Severity)", "Bounding boxes pinned to exact locations"],
  },
  {
    number: 3, label: "Review", icon: CheckCircle2, color: "orange",
    title: "Review and Verify Findings",
    description: "In the Audit Workspace, review each AI finding. Use the WCAG overlay to see accessibility violations highlighted in blue. Switch to Lab mode for full-height side-by-side review. Verify, edit, or reject each finding.",
    points: ["Verify / Edit & Verify / Reject each finding", "WCAG overlay shows accessibility violations in blue", "Lab mode: full-page screenshot + finding detail side-by-side", "Assign findings to team members"],
  },
  {
    number: 4, label: "Report", icon: FileText, color: "green",
    title: "Export the Executive Report",
    description: "Generate a branded PDF report with your executive summary, ROI analysis, and 30/60/90-day roadmap. Share with stakeholders as a compliance document or project brief.",
    points: ["PDF export with Fusion UX branding", "Executive summary for C-suite", "ROI analysis with USD risk estimates", "30/60/90-day improvement roadmap"],
  },
];

// ── COMPONENT ────────────────────────────────────────────────────

type Tab = "overview" | "categories" | "tracks" | "playground" | "tips";

export function AcademyClient() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [search, setSearch] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<number>(0);
  const [solvedIssues, setSolvedIssues] = useState<Set<string>>(new Set());
  const [coachFeedback, setCoachFeedback] = useState<Record<string, string>>({});

  const filteredCategories = CATEGORIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.tagline.toLowerCase().includes(search.toLowerCase()) ||
      c.number.includes(search)
  );

  function handlePlaygroundClick(issue: typeof PLAYGROUND_ISSUES[0]) {
    setSolvedIssues((prev) => new Set(Array.from(prev).concat(issue.id)));
    setCoachFeedback((prev) => ({ ...prev, [issue.id]: issue.feedback }));
  }

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: "overview", label: "4-Step Wizard", icon: "🗺️" },
    { id: "categories", label: "12 Categories", icon: "📚" },
    { id: "tracks", label: "Role Tracks", icon: "👥" },
    { id: "playground", label: "Playground", icon: "🎮" },
    { id: "tips", label: "Pro Tips", icon: "💡" },
  ];

  return (
    <div className="min-h-screen">
      {/* ── HERO ── */}
      <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-violet-500/10 to-indigo-500/10 border border-primary/20 p-8 mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <Image src="/logo.png" alt="Fusion UX" width={56} height={56} className="h-14 w-14 object-contain" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <GraduationCap className="h-5 w-5 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-widest">Fusion Academy</span>
              </div>
              <h1 className="text-2xl font-bold">1-Month UX Audit Intensive</h1>
              <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                Master enterprise UX auditing with Fusion's proprietary 12-category heuristic framework.
                Learn to identify, quantify, and fix UX failures — from WCAG violations to ROI-breaking friction.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-6 mt-6 flex-wrap">
          {[
            { label: "Heuristic Categories", value: "12" },
            { label: "Checks in Framework", value: "153+" },
            { label: "Role Tracks", value: "3" },
            { label: "Max ROI Risk", value: "$625K+ USD" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-xl font-bold text-primary">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap",
              activeTab === tab.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* TAB: OVERVIEW — 4-Step Wizard                             */}
      {/* ══════════════════════════════════════════════════════════ */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {WIZARD_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const colors: Record<string, string> = {
                blue: "from-blue-500/10 to-blue-600/5 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300",
                violet: "from-violet-500/10 to-violet-600/5 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300",
                orange: "from-orange-500/10 to-orange-600/5 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300",
                green: "from-green-500/10 to-green-600/5 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300",
              };
              return (
                <div key={step.number} className={cn("rounded-2xl border bg-gradient-to-br p-5 space-y-3", colors[step.color])}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/60 dark:bg-black/20 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Step {step.number}</p>
                      <p className="text-base font-bold">{step.label}</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold">{step.title}</p>
                  <p className="text-xs opacity-80 leading-relaxed">{step.description}</p>
                  <ul className="space-y-1.5">
                    {step.points.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-xs opacity-90">
                        <CheckCircle2 className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                  {idx < WIZARD_STEPS.length - 1 && (
                    <div className="hidden xl:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10">
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Start CTA */}
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="font-semibold text-lg">Ready to run your first audit?</p>
              <p className="text-sm text-muted-foreground mt-1">You've seen the 4 steps. Now apply them on a real interface in under 5 minutes.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setActiveTab("playground")}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-medium hover:bg-accent transition-colors">
                <Play className="h-4 w-4" />
                Try the Playground
              </button>
              <Link href="/audits/new"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
                Start Real Audit
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* TAB: 12 CATEGORIES                                        */}
      {/* ══════════════════════════════════════════════════════════ */}
      {activeTab === "categories" && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories, principles, WCAG criteria…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs">
                Clear
              </button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{filteredCategories.length} of 12 categories</p>

          <div className="space-y-3">
            {filteredCategories.map((cat) => {
              const c = COLOR_MAP[cat.color] ?? COLOR_MAP.blue;
              const isOpen = expandedCategory === cat.number;
              const roiColor = cat.roi.severity === "critical" ? "text-red-600" : cat.roi.severity === "high" ? "text-orange-600" : "text-yellow-600";
              const roiBg = cat.roi.severity === "critical" ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800" : cat.roi.severity === "high" ? "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800" : "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800";

              return (
                <div key={cat.number} className={cn("rounded-2xl border transition-all", c.border, isOpen ? c.bg : "bg-card hover:bg-accent/30")}>
                  {/* Header row — always visible */}
                  <button
                    onClick={() => setExpandedCategory(isOpen ? null : cat.number)}
                    className="w-full flex items-center gap-4 p-4 text-left"
                  >
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0", c.bg, c.border, "border")}>
                      {cat.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn("text-[10px] font-bold uppercase tracking-widest", c.text)}>{cat.number}</span>
                        <h3 className="font-semibold text-sm">{cat.name}</h3>
                        <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", c.bg, c.text)}>
                          {cat.checkCount} checks
                        </span>
                        <div className="flex gap-1">
                          {cat.roles.map((r) => (
                            <span key={r} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{r}</span>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{cat.tagline}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={cn("text-xs font-bold px-2 py-1 rounded-lg border", roiBg, roiColor)}>
                        {cat.roi.usd}
                      </span>
                      {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </button>

                  {/* Expanded content */}
                  {isOpen && (
                    <div className="px-4 pb-5 space-y-4 border-t border-border/50 pt-4">
                      <p className="text-sm leading-relaxed">{cat.description}</p>

                      {/* Metadata pills */}
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-mono">
                          ♿ {cat.wcag}
                        </span>
                        <span className="text-xs px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          {cat.nielsen}
                        </span>
                      </div>

                      {/* Before / After */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-4">
                          <p className="text-xs font-bold text-red-700 dark:text-red-300 mb-2">{cat.before.label}</p>
                          <p className="text-xs text-red-800 dark:text-red-200 leading-relaxed">{cat.before.text}</p>
                        </div>
                        <div className="rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-4">
                          <p className="text-xs font-bold text-green-700 dark:text-green-300 mb-2">{cat.after.label}</p>
                          <p className="text-xs text-green-800 dark:text-green-200 leading-relaxed">{cat.after.text}</p>
                        </div>
                      </div>

                      {/* ROI Risk */}
                      <div className={cn("rounded-xl border p-4", roiBg)}>
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className={cn("h-4 w-4", roiColor)} />
                          <p className={cn("text-xs font-bold uppercase tracking-wider", roiColor)}>
                            ROI Risk — {cat.roi.severity.toUpperCase()} — {cat.roi.usd} USD
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">{cat.roi.reason}</p>
                      </div>

                      {/* Pro Tip */}
                      <div className="rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 p-4 flex items-start gap-3">
                        <Lightbulb className="h-4 w-4 text-violet-600 dark:text-violet-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-violet-700 dark:text-violet-300 mb-1">Pro Tip</p>
                          <p className="text-xs text-violet-700 dark:text-violet-300 leading-relaxed">{cat.proTip}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* TAB: ROLE TRACKS                                          */}
      {/* ══════════════════════════════════════════════════════════ */}
      {activeTab === "tracks" && (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-3">
            {ROLE_TRACKS.map((track, idx) => {
              const Icon = track.icon;
              const c = COLOR_MAP[track.color] ?? COLOR_MAP.blue;
              return (
                <button
                  key={track.role}
                  onClick={() => setSelectedRole(idx)}
                  className={cn(
                    "p-4 rounded-2xl border-2 text-left transition-all",
                    selectedRole === idx ? cn("border-primary bg-primary/5 shadow-sm") : "border-border hover:border-primary/40 hover:bg-accent/50"
                  )}
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="text-2xl">{track.emoji}</span>
                    <div>
                      <p className="font-semibold text-sm">{track.role}</p>
                      <p className="text-[10px] text-muted-foreground">{track.focus.length} key categories</p>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {track.focus.map((n) => (
                      <span key={n} className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded", c.bg, c.text)}>
                        {n}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected track detail */}
          {(() => {
            const track = ROLE_TRACKS[selectedRole];
            const Icon = track.icon;
            const c = COLOR_MAP[track.color] ?? COLOR_MAP.blue;
            return (
              <div className={cn("rounded-2xl border-2 p-6 space-y-5", c.border, c.bg)}>
                <div className="flex items-center gap-4">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-2xl", "bg-white/60 dark:bg-black/20")}>
                    {track.emoji}
                  </div>
                  <div>
                    <h2 className={cn("text-lg font-bold", c.text)}>{track.role} Quick-Start Guide</h2>
                    <p className="text-sm text-muted-foreground">{track.description}</p>
                  </div>
                </div>

                {/* Focus categories */}
                <div>
                  <p className={cn("text-xs font-bold uppercase tracking-wider mb-2", c.text)}>Your Priority Categories</p>
                  <div className="flex flex-wrap gap-2">
                    {track.focus.map((num) => {
                      const cat = CATEGORIES.find((c) => c.number === num);
                      if (!cat) return null;
                      return (
                        <button
                          key={num}
                          onClick={() => { setActiveTab("categories"); setExpandedCategory(num); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/60 dark:bg-black/20 border border-white/80 dark:border-white/10 text-xs font-medium hover:scale-105 transition-transform"
                        >
                          <span>{cat.icon}</span>
                          <span>{cat.number} {cat.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Steps */}
                <div>
                  <p className={cn("text-xs font-bold uppercase tracking-wider mb-3", c.text)}>Your 5-Step Audit Process</p>
                  <div className="space-y-2.5">
                    {track.steps.map((step, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-0.5", c.badge)}>
                          {i + 1}
                        </span>
                        <p className="text-sm leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tips */}
                <div className="grid grid-cols-2 gap-3">
                  {track.tips.map((tip, i) => (
                    <div key={i} className="rounded-xl bg-white/50 dark:bg-black/20 p-3 flex items-start gap-2">
                      <Star className={cn("h-3.5 w-3.5 flex-shrink-0 mt-0.5", c.text)} />
                      <p className="text-xs leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>

                <Link href="/audits/new" className={cn("inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90 transition-opacity", c.badge)}>
                  Start a {track.role} Audit
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            );
          })()}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* TAB: PLAYGROUND                                           */}
      {/* ══════════════════════════════════════════════════════════ */}
      {activeTab === "playground" && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🎮</span>
              <div>
                <h2 className="font-bold text-lg">Interactive Playground Audit</h2>
                <p className="text-sm text-muted-foreground">This is a deliberately 'bad' UI. Your task: identify the UX violations. Click each issue to receive AI coach feedback.</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
              <span>✅ {solvedIssues.size} identified</span>
              <span>🎯 {PLAYGROUND_ISSUES.length - solvedIssues.size} remaining</span>
              {solvedIssues.size === PLAYGROUND_ISSUES.length && (
                <span className="text-green-600 font-bold">🏆 All issues found! You're ready for real audits.</span>
              )}
            </div>
          </div>

          {/* Mock bad UI */}
          <div className="rounded-2xl border-2 border-dashed border-orange-300 dark:border-orange-700 bg-orange-50/50 dark:bg-orange-950/10 p-1">
            <div className="text-center py-1 text-[10px] text-orange-600 dark:text-orange-400 font-semibold uppercase tracking-widest">
              🚨 Demo: Intentionally Bad UI — Find the violations
            </div>
            <div className="rounded-xl bg-white dark:bg-gray-900 border border-border overflow-hidden">
              {/* Fake nav */}
              <div className="bg-gray-800 text-white px-4 py-2 flex items-center gap-4">
                <div className="w-6 h-6 rounded bg-gray-600" />
                <div className="flex-1 bg-gray-700 rounded h-5" /> {/* No label on search */}
                <div className="flex gap-2 text-xs">
                  {/* No active indicator on nav */}
                  {["Home","Products","About","Contact"].map((l) => (
                    <span key={l} className="px-2 py-1 text-gray-300 text-xs">{l}</span>
                  ))}
                </div>
              </div>
              {/* Fake content */}
              <div className="p-6 space-y-4">
                <h3 className="text-xl font-bold">Product Dashboard</h3>
                {/* Color only table */}
                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        {["Product","Status","Actions"].map((h) => <th key={h} className="px-3 py-2 text-left text-xs font-medium">{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {[["Widget A","#22c55e"],["Widget B","#ef4444"],["Widget C","#22c55e"]].map(([name, color], i) => (
                        <tr key={i} className="border-t border-border">
                          <td className="px-3 py-2">{name}</td>
                          <td className="px-3 py-2">
                            <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: color }} />
                          </td>
                          <td className="px-3 py-2">
                            <button className="text-xs text-red-600 hover:underline">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Form with always-enabled submit */}
                <div className="rounded-lg border border-border p-4 space-y-3">
                  <input placeholder="Name" className="w-full border border-input rounded px-3 py-1.5 text-sm" />
                  <input placeholder="Email" className="w-full border border-input rounded px-3 py-1.5 text-sm" />
                  <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded">Submit</button>
                </div>
              </div>
            </div>
          </div>

          {/* Issue cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {PLAYGROUND_ISSUES.map((issue) => {
              const solved = solvedIssues.has(issue.id);
              const feedback = coachFeedback[issue.id];
              const sevColor = issue.severity === "critical" ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/20" : issue.severity === "high" ? "border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-950/20" : "border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950/20";
              return (
                <div key={issue.id} className={cn("rounded-xl border-2 p-4 space-y-2 transition-all", solved ? "border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-950/20" : sevColor)}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-muted-foreground mb-1">{issue.area} · Category {issue.category}</p>
                      <p className="text-sm font-semibold">{issue.title}</p>
                    </div>
                    {solved
                      ? <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                      : <AlertTriangle className={cn("h-5 w-5 flex-shrink-0", issue.severity === "critical" ? "text-red-500" : "text-orange-500")} />
                    }
                  </div>
                  {feedback ? (
                    <div className="rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 p-3">
                      <p className="text-xs font-semibold text-violet-700 dark:text-violet-300 mb-1">🤖 AI Coach</p>
                      <p className="text-xs text-violet-800 dark:text-violet-200 leading-relaxed">{feedback}</p>
                    </div>
                  ) : (
                    <button
                      onClick={() => handlePlaygroundClick(issue)}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
                    >
                      <Play className="h-3.5 w-3.5" />
                      I found this issue — get feedback
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {solvedIssues.size === PLAYGROUND_ISSUES.length && (
            <div className="rounded-2xl bg-green-50 dark:bg-green-950/30 border-2 border-green-400 dark:border-green-600 p-6 text-center space-y-3">
              <p className="text-3xl">🏆</p>
              <h3 className="text-lg font-bold text-green-700 dark:text-green-300">Playground Complete!</h3>
              <p className="text-sm text-green-700 dark:text-green-300">You identified all {PLAYGROUND_ISSUES.length} UX violations. You're ready to run real enterprise audits.</p>
              <Link href="/audits/new" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors">
                Start Your First Real Audit
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* TAB: PRO TIPS                                             */}
      {/* ══════════════════════════════════════════════════════════ */}
      {activeTab === "tips" && (
        <div className="space-y-5">
          <p className="text-sm text-muted-foreground">Productivity techniques used by Fusion UX power users to 10× their audit output.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PRO_TIPS.map((tip) => {
              const c = COLOR_MAP[tip.color] ?? COLOR_MAP.blue;
              return (
                <div key={tip.title} className={cn("rounded-2xl border p-5 space-y-3", c.border, c.bg)}>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">{tip.icon}</span>
                    <h3 className={cn("font-bold text-sm leading-snug", c.text)}>{tip.title}</h3>
                  </div>
                  <p className="text-sm leading-relaxed">{tip.content}</p>
                  <Link
                    href={tip.href}
                    className={cn("inline-flex items-center gap-2 text-xs font-semibold hover:underline", c.text)}
                  >
                    <Zap className="h-3.5 w-3.5" />
                    {tip.action}
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Fusion Academy pledge */}
          <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-violet-500/10 to-transparent p-6 text-center space-y-3">
            <Image src="/logo.png" alt="Fusion UX" width={48} height={48} className="h-12 w-12 object-contain mx-auto" />
            <h3 className="font-bold text-lg">The Fusion Auditor's Pledge</h3>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
              I will audit with empathy for all users. I will quantify every finding with evidence and ROI impact.
              I will advocate for users whose voices aren't in the meeting room.
              I will make the invisible, visible — and the tolerable, unacceptable.
            </p>
            <Link href="/audits/new" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
              <GraduationCap className="h-4 w-4" />
              Begin My First Audit
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
