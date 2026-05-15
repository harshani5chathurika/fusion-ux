"use client";

import { useState } from "react";
import { Check, Zap } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { UpgradeModal } from "@/components/shared/UpgradeModal";

type Billing = "monthly" | "yearly";

const PLANS = {
  monthly: [
    {
      id: "free",
      name: "Free",
      price: "$0",
      sub: "forever",
      yearlyNote: null,
      cta: "Current plan",
      ctaDisabled: true,
      badge: null,
      highlight: false,
      features: [
        "3 AI design fixes",
        "Download as PNG",
        "Basic audit reports",
        "1 workspace",
      ],
    },
    {
      id: "credits_10",
      name: "Credits",
      price: "$10",
      sub: "one-time",
      yearlyNote: null,
      cta: "Get started",
      ctaDisabled: false,
      badge: null,
      highlight: false,
      features: [
        "10 AI design fixes",
        "Download as PNG",
        "Figma AI prompt export",
        "No expiry",
      ],
    },
    {
      id: "pro_monthly",
      name: "Unlimited Pro",
      price: "$25",
      sub: "/ month",
      yearlyNote: null,
      cta: "Get started",
      ctaDisabled: false,
      badge: "BEST VALUE",
      highlight: true,
      features: [
        "Unlimited AI design fixes",
        "Priority generation",
        "All export formats",
        "Advanced analytics",
        "Priority support",
        "Cancel anytime",
      ],
    },
  ],
  yearly: [
    {
      id: "free",
      name: "Free",
      price: "$0",
      sub: "forever",
      yearlyNote: null,
      cta: "Current plan",
      ctaDisabled: true,
      badge: null,
      highlight: false,
      features: [
        "3 AI design fixes",
        "Download as PNG",
        "Basic audit reports",
        "1 workspace",
      ],
    },
    {
      id: "credits_10",
      name: "Credits",
      price: "$10",
      sub: "one-time",
      yearlyNote: null,
      cta: "Get started",
      ctaDisabled: false,
      badge: null,
      highlight: false,
      features: [
        "10 AI design fixes",
        "Download as PNG",
        "Figma AI prompt export",
        "No expiry",
      ],
    },
    {
      id: "pro_yearly",
      name: "Unlimited Pro",
      price: "$20",
      sub: "/ month",
      yearlyNote: "billed $240 / year",
      cta: "Get started",
      ctaDisabled: false,
      badge: "SAVE $60",
      highlight: true,
      features: [
        "Unlimited AI design fixes",
        "Priority generation",
        "All export formats",
        "Advanced analytics",
        "Priority support",
        "2 months free",
      ],
    },
  ],
};

export default function PricingPage() {
  const [billing, setBilling] = useState<Billing>("monthly");
  const [showUpgrade, setShowUpgrade] = useState(false);

  const plans = PLANS[billing];

  return (
    <div className="min-h-screen bg-background">

      {/* ── Hero ── */}
      <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-violet-800 px-6 pt-16 pb-28 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="text-white/80 text-sm font-medium">Fusion UX Pricing</span>
        </div>
        <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight">Choose your plan</h1>
        <p className="text-violet-200 text-base mb-10">
          Start free, pay only when you need more AI design power
        </p>

        {/* Billing toggle */}
        <div className="inline-flex items-center gap-1 p-1 bg-white/20 rounded-2xl">
          <button
            onClick={() => setBilling("monthly")}
            className={cn(
              "px-6 py-2 rounded-xl text-sm font-semibold transition-all",
              billing === "monthly" ? "bg-white text-violet-700 shadow" : "text-white/80 hover:text-white"
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling("yearly")}
            className={cn(
              "flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-semibold transition-all",
              billing === "yearly" ? "bg-white text-violet-700 shadow" : "text-white/80 hover:text-white"
            )}
          >
            Yearly
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-400 text-green-900">
              SAVE 20%
            </span>
          </button>
        </div>
      </div>

      {/* ── Plan cards ── */}
      <div className="max-w-5xl mx-auto px-6 -mt-16 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "bg-background rounded-2xl border overflow-hidden flex flex-col",
                plan.highlight
                  ? "border-violet-300 dark:border-violet-700 shadow-xl shadow-violet-100 dark:shadow-violet-900/20"
                  : "border-border shadow-sm"
              )}
            >
              {/* Card header */}
              <div className="p-6 border-b border-border">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    {plan.name}
                  </p>
                  {plan.badge && (
                    <span className="text-[9px] font-bold px-2 py-1 bg-violet-500 text-white rounded-full flex-shrink-0">
                      {plan.badge}
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-extrabold tracking-tight">{plan.price}</span>
                  <span className="text-sm text-muted-foreground ml-1">{plan.sub}</span>
                </div>
                {plan.yearlyNote && (
                  <p className="text-xs text-muted-foreground mt-1">{plan.yearlyNote}</p>
                )}
                <button
                  disabled={plan.ctaDisabled}
                  onClick={() => !plan.ctaDisabled && setShowUpgrade(true)}
                  className={cn(
                    "mt-5 w-full py-3 rounded-xl text-sm font-bold transition-all",
                    plan.highlight
                      ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:opacity-90 shadow-lg shadow-violet-500/25"
                      : plan.ctaDisabled
                      ? "bg-muted text-muted-foreground cursor-default"
                      : "bg-foreground text-background hover:opacity-80"
                  )}
                >
                  {plan.cta}
                </button>
              </div>

              {/* Features */}
              <div className="p-6 flex-1">
                <ul className="space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-violet-500 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-10">
          All new accounts start with{" "}
          <strong className="text-foreground">3 free AI design fixes</strong> — no credit card required.
        </p>
      </div>

      {showUpgrade && (
        <UpgradeModal
          onClose={() => setShowUpgrade(false)}
          onSuccess={() => setShowUpgrade(false)}
        />
      )}
    </div>
  );
}
