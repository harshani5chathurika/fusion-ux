"use client";

import { useState } from "react";
import { ExternalLink, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface Integration {
  id: string;
  name: string;
  logo: string;
  tagline: string;
  description: string;
  bestFor: string[];
  plan: string;
  features: string[];
  setupSteps: Array<{ step: number; title: string; detail: string; code?: string }>;
  docsUrl: string;
  signupUrl: string;
  color: string;
  bg: string;
  border: string;
  status: "available" | "coming_soon";
}

const INTEGRATIONS: Integration[] = [
  {
    id: "clarity",
    name: "Microsoft Clarity",
    logo: "📊",
    tagline: "Free heatmaps, session recordings & rage click detection",
    description:
      "Microsoft Clarity provides free, unlimited session recordings, heatmaps, and behavioural analytics. Pair it with your Fusion UX audit to see exactly where users struggle — combining AI findings with real interaction data.",
    bestFor: ["Rage click detection", "Scroll depth heatmaps", "Session replay", "Dead click analysis", "Free unlimited usage"],
    plan: "Free forever",
    features: [
      "Unlimited session recordings",
      "Click, scroll, and area heatmaps",
      "Rage click & dead click detection",
      "Insights dashboard with AI summaries",
      "GDPR compliant, no sampling",
    ],
    setupSteps: [
      {
        step: 1,
        title: "Create a Clarity project",
        detail: "Go to clarity.microsoft.com, sign in with your Microsoft account, and create a new project for your website.",
      },
      {
        step: 2,
        title: "Copy your Project ID",
        detail: "In your Clarity dashboard → Settings → get your Project ID (e.g. abc123xyz).",
      },
      {
        step: 3,
        title: "Add the tracking script",
        detail: "Paste this snippet into the <head> of your site (or use the Next.js Script component in your layout.tsx):",
        code: `<script type="text/javascript">
  (function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window,document,"clarity","script","YOUR_PROJECT_ID");
</script>`,
      },
      {
        step: 4,
        title: "Verify data is flowing",
        detail: "Visit your site, then check the Clarity dashboard. Data typically appears within a few minutes. Cross-reference rage-click locations with your Fusion UX findings.",
      },
    ],
    docsUrl: "https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-setup",
    signupUrl: "https://clarity.microsoft.com",
    color: "text-blue-700",
    bg: "bg-blue-50 dark:bg-blue-950/20",
    border: "border-blue-200 dark:border-blue-800",
    status: "available",
  },
  {
    id: "hotjar",
    name: "Hotjar",
    logo: "🔥",
    tagline: "Heatmaps, recordings & user surveys in one platform",
    description:
      "Hotjar combines visual analytics with qualitative research tools. Use recordings and heatmaps to validate Fusion UX findings, and run on-site surveys to hear directly from users about the pain points your audit identified.",
    bestFor: ["Form analytics", "Funnel analysis", "On-site surveys & NPS", "Session recordings with console logs", "Conversion rate optimisation"],
    plan: "Free (35 sessions/day) · Plus from $32/mo",
    features: [
      "Heatmaps (click, move, scroll)",
      "Session recordings with event timeline",
      "Conversion funnels",
      "Form field analytics (drop-off per field)",
      "On-site surveys, polls & NPS",
    ],
    setupSteps: [
      {
        step: 1,
        title: "Create a Hotjar account",
        detail: "Sign up at hotjar.com and create a site. Hotjar will assign you a Site ID.",
      },
      {
        step: 2,
        title: "Install the tracking code",
        detail: "Add the Hotjar snippet to the <head> of every page. In Next.js, add it to your root layout:",
        code: `<!-- Hotjar Tracking Code -->
<script>
  (function(h,o,t,j,a,r){
    h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
    h._hjSettings={hjid:YOUR_SITE_ID,hjsv:6};
    a=o.getElementsByTagName('head')[0];
    r=o.createElement('script');r.async=1;
    r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
    a.appendChild(r);
  })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
</script>`,
      },
      {
        step: 3,
        title: "Create heatmaps for audited pages",
        detail: "In Hotjar → Heatmaps → New Heatmap, enter the URL of each page you audited. Heatmaps start collecting clicks immediately.",
      },
      {
        step: 4,
        title: "Set up a survey on friction points",
        detail: "Use Hotjar Surveys to ask users about the specific pain points your Fusion UX audit flagged. Trigger a micro-survey on exit or after a failed interaction.",
      },
    ],
    docsUrl: "https://help.hotjar.com/hc/en-us/categories/115001323967",
    signupUrl: "https://www.hotjar.com",
    color: "text-orange-700",
    bg: "bg-orange-50 dark:bg-orange-950/20",
    border: "border-orange-200 dark:border-orange-800",
    status: "available",
  },
  {
    id: "maze",
    name: "Maze",
    logo: "🧩",
    tagline: "Rapid usability testing with AI-powered insights",
    description:
      "Maze runs unmoderated usability tests, prototype tests, and card sorts at scale. Use it to validate your Fusion UX audit findings with real users — confirm which issues cause the most task failure and prioritise fixes with confidence.",
    bestFor: ["Prototype usability testing", "Task success rate measurement", "Tree testing & card sorting", "First click testing", "AI-generated insights summaries"],
    plan: "Free (1 study/mo) · Professional from $99/mo",
    features: [
      "Unmoderated usability tests",
      "Prototype testing (Figma, InVision, Marvel)",
      "Heatmaps on prototype clicks",
      "Task success rate & time-on-task",
      "AI insights summary per study",
    ],
    setupSteps: [
      {
        step: 1,
        title: "Create a Maze workspace",
        detail: "Sign up at maze.co. Connect your Figma account for direct prototype imports.",
      },
      {
        step: 2,
        title: "Create a study from your audit findings",
        detail: "For each critical/high severity finding, create a task in Maze. For example: 'Find the checkout button' for a visibility finding, or 'Complete the contact form' for a form usability finding.",
      },
      {
        step: 3,
        title: "Set success criteria",
        detail: "Define what a successful task completion looks like. Maze will automatically calculate success rates, mis-click rates, and time-on-task.",
      },
      {
        step: 4,
        title: "Share & collect responses",
        detail: "Send the Maze study link to 5–10 users for qualitative insight, or 30+ for statistical significance. Results appear in real-time in the Maze dashboard.",
      },
      {
        step: 5,
        title: "Cross-reference with Fusion UX findings",
        detail: "Compare task failure rates with finding severity. High task failure + critical severity = top priority fix. Use Maze data to quantify the ROI of each fix in your report.",
      },
    ],
    docsUrl: "https://help.maze.co/hc/en-us",
    signupUrl: "https://maze.co",
    color: "text-purple-700",
    bg: "bg-purple-50 dark:bg-purple-950/20",
    border: "border-purple-200 dark:border-purple-800",
    status: "available",
  },
];

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative mt-2 rounded-lg bg-gray-900 dark:bg-gray-950 border border-gray-700">
      <button
        onClick={copy}
        className="absolute top-2 right-2 w-7 h-7 rounded flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-gray-300"
        title="Copy code"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
      <pre className="p-4 text-[11px] text-gray-300 overflow-x-auto leading-relaxed whitespace-pre-wrap">
        {code}
      </pre>
    </div>
  );
}

function IntegrationCard({ integration }: { integration: Integration }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={cn("rounded-2xl border bg-card overflow-hidden transition-all", integration.border)}>
      {/* Card header */}
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0", integration.bg, integration.border, "border")}>
              {integration.logo}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold">{integration.name}</h3>
                <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", integration.bg, integration.color)}>
                  {integration.plan}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{integration.tagline}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href={integration.signupUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors",
                integration.bg, integration.color, integration.border, "border hover:opacity-80"
              )}
            >
              Connect <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mt-4 leading-relaxed">{integration.description}</p>

        {/* Best for tags */}
        <div className="flex flex-wrap gap-1.5 mt-4">
          {integration.bestFor.map((tag) => (
            <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>

        {/* Features list */}
        <div className="mt-4 grid grid-cols-2 gap-1.5">
          {integration.features.map((f) => (
            <div key={f} className="flex items-start gap-1.5">
              <CheckCircle2 className={cn("h-3.5 w-3.5 flex-shrink-0 mt-0.5", integration.color)} />
              <span className="text-xs text-muted-foreground">{f}</span>
            </div>
          ))}
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className={cn(
            "mt-5 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-colors",
            expanded ? cn(integration.bg, integration.color, integration.border) : "border-border hover:bg-accent"
          )}
        >
          {expanded ? (
            <>Hide Setup Guide <ChevronUp className="h-4 w-4" /></>
          ) : (
            <>View Setup Guide <ChevronDown className="h-4 w-4" /></>
          )}
        </button>
      </div>

      {/* Setup guide — collapsible */}
      {expanded && (
        <div className={cn("border-t px-6 pb-6 pt-5 space-y-5", integration.border)}>
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <AlertCircle className={cn("h-4 w-4", integration.color)} />
            Setup Guide
          </h4>
          <ol className="space-y-5">
            {integration.setupSteps.map((s) => (
              <li key={s.step} className="flex gap-4">
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5",
                  integration.bg, integration.color
                )}>
                  {s.step}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{s.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{s.detail}</p>
                  {s.code && <CodeBlock code={s.code} />}
                </div>
              </li>
            ))}
          </ol>
          <a
            href={integration.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
          >
            Read official documentation <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}
    </div>
  );
}

export function AnalyticsIntegrations() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics & Integrations</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Connect real user behaviour tools to validate and enrich your AI audit findings.
        </p>
      </div>

      {/* How it works banner */}
      <div className="rounded-2xl bg-primary/5 border border-primary/20 p-5 flex items-start gap-4">
        <div className="text-3xl">💡</div>
        <div>
          <p className="text-sm font-semibold">Fusion UX + Real User Data = Unbeatable Insight</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-2xl">
            Your AI audit identifies <strong>what</strong> is wrong and <strong>why</strong>. Analytics integrations tell you <strong>how often</strong> it happens and <strong>who</strong> is affected. Use Clarity for rage clicks, Hotjar for form abandonment, and Maze to validate fixes with real users before shipping.
          </p>
        </div>
      </div>

      {/* Integration cards */}
      <div className="space-y-6">
        {INTEGRATIONS.map((integration) => (
          <IntegrationCard key={integration.id} integration={integration} />
        ))}
      </div>

      {/* Coming soon */}
      <div className="rounded-2xl border border-dashed border-border p-6">
        <p className="text-sm font-semibold text-center text-muted-foreground mb-3">More integrations coming soon</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {["Google Analytics 4", "Mixpanel", "FullStory", "LogRocket", "Amplitude", "PostHog"].map((tool) => (
            <span key={tool} className="text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground">
              {tool}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
