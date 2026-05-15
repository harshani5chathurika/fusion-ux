"use client";

import { useState } from "react";
import { Check, Zap, Crown } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { UpgradeModal } from "@/components/shared/UpgradeModal";

type Billing = "monthly" | "yearly";

const FREE_FEATURES = [
  "2 AI design fixes per day",
  "Download as PNG",
  "Basic audit reports",
  "1 workspace",
];

const PRO_FEATURES = [
  "Unlimited AI design fixes",
  "Apple Pay & Google Pay",
  "Priority DALL·E 3 generation",
  "All export formats (PNG, Figma)",
  "Advanced analytics",
  "3D Secure payments",
  "Cancel anytime",
];

const CREDITS_FEATURES = [
  "10 AI design fixes",
  "Download as PNG",
  "Figma AI prompt export",
  "No expiry",
];

export default function PricingPage() {
  const [billing, setBilling] = useState<Billing>("monthly");
  const [showUpgrade, setShowUpgrade] = useState(false);

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
          Start free · pay only when you need more AI design power · all prices in USD
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

          {/* Free */}
          <div className="bg-background rounded-2xl border border-border shadow-sm flex flex-col">
            <div className="p-6 border-b border-border">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Free</p>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-extrabold tracking-tight">$0</span>
                <span className="text-sm text-muted-foreground ml-1">forever</span>
              </div>
              <button
                disabled
                className="mt-5 w-full py-3 rounded-xl text-sm font-bold bg-muted text-muted-foreground cursor-default"
              >
                Current plan
              </button>
            </div>
            <div className="p-6 flex-1">
              <ul className="space-y-3">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-violet-500 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Credits */}
          <div className="bg-background rounded-2xl border border-border shadow-sm flex flex-col">
            <div className="p-6 border-b border-border">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Credits</p>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-extrabold tracking-tight">$10</span>
                <span className="text-sm text-muted-foreground ml-1">one-time</span>
              </div>
              <button
                onClick={() => setShowUpgrade(true)}
                className="mt-5 w-full py-3 rounded-xl text-sm font-bold bg-foreground text-background hover:opacity-80 transition-opacity"
              >
                Get started
              </button>
            </div>
            <div className="p-6 flex-1">
              <ul className="space-y-3">
                {CREDITS_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-violet-500 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Pro */}
          <div className="bg-background rounded-2xl border-2 border-violet-300 dark:border-violet-700 shadow-xl shadow-violet-100 dark:shadow-violet-900/20 flex flex-col">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">
                  Unlimited Pro
                </p>
                <span className="text-[9px] font-bold px-2 py-1 bg-violet-500 text-white rounded-full">
                  {billing === "yearly" ? "SAVE $60" : "BEST VALUE"}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-extrabold tracking-tight">
                  {billing === "yearly" ? "$20" : "$25"}
                </span>
                <span className="text-sm text-muted-foreground ml-1">/ month</span>
              </div>
              {billing === "yearly" && (
                <p className="text-xs text-muted-foreground mt-1">billed $240 / year</p>
              )}
              <button
                onClick={() => setShowUpgrade(true)}
                className="mt-5 w-full py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:opacity-90 transition-opacity shadow-lg shadow-violet-500/25 flex items-center justify-center gap-2"
              >
                <Crown className="h-4 w-4" />
                Get started
              </button>
            </div>
            <div className="p-6 flex-1">
              <ul className="space-y-3">
                {PRO_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-violet-500 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>

        {/* Footer note */}
        <p className="text-center text-sm text-muted-foreground mt-10">
          All new accounts start with{" "}
          <strong className="text-foreground">2 free AI design fixes per day</strong> — no credit card required.
          <br />
          🔒 Payments secured by Lemon Squeezy · Apple Pay · Google Pay · PayPal accepted
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
