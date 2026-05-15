"use client";

import { useState, useEffect } from "react";
import { X, Zap, Check, Loader2, Crown, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";

type Billing = "monthly" | "yearly";

interface UpgradeModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

declare global {
  interface Window {
    createLemonSqueezy?: () => void;
    LemonSqueezy?: {
      Setup: (config: { eventHandler: (event: { event: string }) => void }) => void;
      Url: { Open: (url: string) => void };
    };
  }
}

// ── Trust badge icons ─────────────────────────────────────────────
function VisaIcon() {
  return (
    <svg viewBox="0 0 48 16" className="h-4 w-auto" fill="none">
      <text x="0" y="13" fontFamily="Arial" fontWeight="bold" fontSize="14" fill="#1A1F71">VISA</text>
    </svg>
  );
}
function MastercardIcon() {
  return (
    <svg viewBox="0 0 38 24" className="h-4 w-auto">
      <circle cx="15" cy="12" r="10" fill="#EB001B" />
      <circle cx="23" cy="12" r="10" fill="#F79E1B" />
      <path d="M19 4.8a10 10 0 0 1 0 14.4A10 10 0 0 1 19 4.8z" fill="#FF5F00" />
    </svg>
  );
}
function AmexIcon() {
  return (
    <svg viewBox="0 0 42 24" className="h-4 w-auto" fill="none">
      <rect width="42" height="24" rx="3" fill="#016FD0" />
      <text x="4" y="17" fontFamily="Arial" fontWeight="bold" fontSize="9" fill="white">AMEX</text>
    </svg>
  );
}
function ApplePayIcon() {
  return (
    <svg viewBox="0 0 54 24" className="h-5 w-auto" fill="none">
      <rect width="54" height="24" rx="4" fill="#000" />
      <text x="6" y="17" fontFamily="-apple-system,system-ui" fontWeight="600" fontSize="10" fill="white"> Pay</text>
    </svg>
  );
}
function GooglePayIcon() {
  return (
    <svg viewBox="0 0 60 24" className="h-5 w-auto" fill="none">
      <rect width="60" height="24" rx="4" fill="white" stroke="#E0E0E0" strokeWidth="1" />
      <text x="6" y="16" fontFamily="Arial" fontWeight="500" fontSize="9">
        <tspan fill="#4285F4">G</tspan>
        <tspan fill="#EA4335">o</tspan>
        <tspan fill="#FBBC05">o</tspan>
        <tspan fill="#4285F4">g</tspan>
        <tspan fill="#34A853">l</tspan>
        <tspan fill="#EA4335">e</tspan>
        <tspan fill="#555" dx="1">Pay</tspan>
      </text>
    </svg>
  );
}
function PayPalIcon() {
  return (
    <svg viewBox="0 0 54 24" className="h-5 w-auto" fill="none">
      <rect width="54" height="24" rx="4" fill="#F5F7FA" stroke="#E0E0E0" strokeWidth="1" />
      <text x="8" y="16" fontFamily="Arial" fontWeight="bold" fontSize="10">
        <tspan fill="#003087">Pay</tspan><tspan fill="#009cde">Pal</tspan>
      </text>
    </svg>
  );
}

// ── Confetti ──────────────────────────────────────────────────────
async function fireConfetti() {
  try {
    const { default: confetti } = await import("canvas-confetti");
    confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 }, colors: ["#7c3aed", "#a855f7", "#c084fc", "#ffffff", "#f3e8ff"] });
    setTimeout(() => confetti({ particleCount: 60, spread: 100, origin: { y: 0.65 } }), 350);
  } catch { /* silently ignore */ }
}

// ── Main modal ────────────────────────────────────────────────────
export function UpgradeModal({ onClose, onSuccess }: UpgradeModalProps) {
  const [billing, setBilling] = useState<Billing>("monthly");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Load Lemon Squeezy overlay script on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.LemonSqueezy) return;

    const existing = document.querySelector('script[src*="lemon.js"]');
    if (existing) {
      existing.addEventListener("load", () => window.createLemonSqueezy?.());
      return;
    }
    const s = document.createElement("script");
    s.src = "https://app.lemonsqueezy.com/js/lemon.js";
    s.defer = true;
    s.onload = () => window.createLemonSqueezy?.();
    document.head.appendChild(s);
  }, []);

  async function handleSubscribe() {
    setLoading(true);
    setCheckoutError(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billing }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "Failed to create checkout");

      window.LemonSqueezy?.Setup({
        eventHandler: (e) => {
          if (e.event === "Checkout.Success") {
            setSuccess(true);
            fireConfetti();
            onSuccess?.();
          }
        },
      });
      window.LemonSqueezy?.Url.Open(data.url);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      setCheckoutError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  // ── Success screen ────────────────────────────────────────────
  if (success) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-background rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center space-y-6">
          <div className="w-24 h-24 bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/40 dark:to-purple-900/40 rounded-full flex items-center justify-center mx-auto animate-bounce-slow">
            <Crown className="h-12 w-12 text-violet-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Welcome to Pro! 🎉</h2>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Unlimited AI design fixes are now unlocked. The Generate AI Fix button is always active.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold text-sm hover:opacity-90 transition-opacity"
          >
            Back to Fusion UX →
          </button>
        </div>
      </div>
    );
  }

  // ── Upgrade modal ────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-md">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base">Upgrade to Pro</h2>
              <p className="text-xs text-muted-foreground">Unlimited AI-powered design fixes</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-accent flex items-center justify-center text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">

          {/* Billing toggle */}
          <div className="flex justify-center">
            <div className="flex items-center gap-1 p-1 bg-muted rounded-xl">
              <button
                onClick={() => setBilling("monthly")}
                className={cn(
                  "px-5 py-1.5 rounded-lg text-xs font-semibold transition-all",
                  billing === "monthly" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setBilling("yearly")}
                className={cn(
                  "flex items-center gap-1.5 px-5 py-1.5 rounded-lg text-xs font-semibold transition-all",
                  billing === "yearly" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Yearly
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400">
                  SAVE $60
                </span>
              </button>
            </div>
          </div>

          {/* Plan card */}
          <div className="rounded-2xl border-2 border-violet-500 bg-violet-50 dark:bg-violet-950/30 p-5">
            <div className="flex items-start justify-between mb-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">
                Unlimited Pro
              </p>
              <span className="text-[9px] font-bold px-2 py-0.5 bg-violet-500 text-white rounded-full">
                {billing === "yearly" ? "SAVE $60/YR" : "BEST VALUE"}
              </span>
            </div>

            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-4xl font-extrabold tracking-tight">
                {billing === "yearly" ? "$20" : "$25"}
              </span>
              <span className="text-sm text-muted-foreground">/ month</span>
            </div>
            {billing === "yearly" && (
              <p className="text-xs text-muted-foreground mt-0.5">billed $240 / year · save $60</p>
            )}

            <ul className="mt-4 space-y-2">
              {[
                "Unlimited AI design fixes per day",
                "Apple Pay & Google Pay accepted",
                "3D Secure & OTP protection",
                "Priority DALL·E 3 generation",
                "All export formats (PNG, Figma)",
                "Advanced analytics dashboard",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Check className="h-3.5 w-3.5 text-violet-500 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Error state */}
          {checkoutError && (
            <div className="flex items-start gap-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3">
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-red-700 dark:text-red-300">Checkout failed</p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">{checkoutError}</p>
              </div>
              <button
                onClick={handleSubscribe}
                className="flex items-center gap-1 text-xs font-semibold text-red-700 dark:text-red-300 hover:underline flex-shrink-0"
              >
                <RefreshCw className="h-3 w-3" />Retry
              </button>
            </div>
          )}

          {/* Subscribe button */}
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-violet-500/25"
          >
            {loading
              ? <><Loader2 className="h-4 w-4 animate-spin" />Opening secure checkout…</>
              : <><Crown className="h-4 w-4" />Subscribe — {billing === "yearly" ? "$240 / year" : "$25 / month"}</>
            }
          </button>

          {/* Trust footer */}
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <ApplePayIcon />
              <GooglePayIcon />
              <PayPalIcon />
              <MastercardIcon />
              <VisaIcon />
              <AmexIcon />
            </div>
            <p className="text-[11px] text-center text-muted-foreground">
              🔒 Secured by Lemon Squeezy · Global USD payments · 3D Secure enabled
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
