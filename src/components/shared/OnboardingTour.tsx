"use client";

import { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft, CheckCircle2, Edit3, XCircle, RotateCcw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const TOUR_STEPS = [
  {
    title: "Welcome to Fusion UX 👋",
    description: "Your AI-powered UX intelligence platform. Let's walk you through the key features so you can get the most out of every audit.",
    icon: "🚀",
    tip: null,
  },
  {
    title: "Creating an Audit",
    description: "Go to Audits → New Audit. You can audit a live website URL, upload screenshots, or connect a Figma file. The AI will automatically capture screenshots and run a 153-point heuristic evaluation.",
    icon: "🔍",
    tip: "For URL audits, a screenshot is auto-captured and visual annotations are placed on the exact problem areas.",
  },
  {
    title: "Reviewing Findings",
    description: "After analysis, you'll see numbered red/orange/yellow boxes on the screenshot — each highlights a UX problem. Click any box or finding card to see the full analysis.",
    icon: "📍",
    tip: "Findings include WCAG criteria, UX research references, and critical design thinking — not just surface observations.",
  },
  {
    title: "Verify, Edit, or Reject",
    description: "Every AI finding needs your expert review. Use the three actions to quality-control the audit:",
    icon: "✅",
    tip: null,
    actions: [
      { icon: CheckCircle2, color: "text-green-600", label: "Verify", desc: "AI finding is correct — include in report" },
      { icon: Edit3, color: "text-blue-600", label: "Edit & Verify", desc: "Modify the AI suggestion with your expert insight" },
      { icon: XCircle, color: "text-red-500", label: "Reject", desc: "Finding is incorrect or not applicable" },
    ],
  },
  {
    title: "Reset & Reassign",
    description: "Made a mistake? Every finding has a 'Reset to pending' link below the status. This returns the finding to its original unreviewed state so you can re-evaluate it.",
    icon: "🔄",
    tip: "Use the comments section at the bottom of each finding to leave notes for your team or future self.",
  },
  {
    title: "Generating Reports",
    description: "Once you've verified your findings, go to Reports → Generate PDF. The AI writes an executive summary, ROI analysis, and 90-day roadmap automatically. The PDF downloads directly.",
    icon: "📄",
    tip: "Complete your audit (mark it as 'Complete') to unlock the Generate Report button.",
  },
  {
    title: "Analytics Integrations",
    description: "Connect Microsoft Clarity, Hotjar, or Maze to bring in real user behavior data alongside your AI audit. Each integration provides different insights — use them together for a complete picture.",
    icon: "📊",
    tip: "Fusion UX synthesizes AI analysis + real user data. The combination is far more powerful than either alone.",
  },
];

export function OnboardingTour() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const seen = localStorage.getItem("fusion_tour_seen");
    if (!seen) setVisible(true);
  }, []);

  function close() {
    localStorage.setItem("fusion_tour_seen", "1");
    setVisible(false);
  }

  function next() {
    if (step < TOUR_STEPS.length - 1) setStep((s) => s + 1);
    else close();
  }

  function prev() {
    if (step > 0) setStep((s) => s - 1);
  }

  if (!visible) return (
    <button
      onClick={() => { setStep(0); setVisible(true); }}
      className="fixed bottom-5 right-5 z-40 w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
      title="Open getting started guide"
    >
      <Sparkles className="h-5 w-5" />
    </button>
  );

  const current = TOUR_STEPS[step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-xl">{current.icon}</span>
            <span className="text-xs font-medium text-muted-foreground">
              Step {step + 1} of {TOUR_STEPS.length}
            </span>
          </div>
          <button onClick={close} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-accent text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((step + 1) / TOUR_STEPS.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <h2 className="text-lg font-bold">{current.title}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{current.description}</p>

          {current.actions && (
            <div className="space-y-2">
              {current.actions.map((action) => {
                const Icon = action.icon;
                return (
                  <div key={action.label} className="flex items-center gap-3 rounded-xl border border-border p-3">
                    <Icon className={cn("h-5 w-5 flex-shrink-0", action.color)} />
                    <div>
                      <p className="text-sm font-semibold">{action.label}</p>
                      <p className="text-xs text-muted-foreground">{action.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {current.tip && (
            <div className="rounded-xl bg-primary/5 border border-primary/20 p-3">
              <p className="text-xs text-primary font-medium">💡 Pro tip</p>
              <p className="text-xs text-muted-foreground mt-1">{current.tip}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 pb-5">
          <button
            onClick={prev}
            disabled={step === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-accent disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex gap-1">
            {TOUR_STEPS.map((_, i) => (
              <button key={i} onClick={() => setStep(i)}
                className={cn("w-2 h-2 rounded-full transition-all", i === step ? "bg-primary w-4" : "bg-muted-foreground/30")} />
            ))}
          </div>
          <button
            onClick={next}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
          >
            {step === TOUR_STEPS.length - 1 ? "Get Started" : "Next"}
            {step < TOUR_STEPS.length - 1 && <ChevronRight className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
