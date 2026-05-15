"use client";

import { useState, useEffect } from "react";
import { X, Zap, Check, CreditCard, Loader2, Lock, ShieldCheck } from "lucide-react";
import {
  PayPalScriptProvider,
  PayPalButtons,
  PayPalHostedFieldsProvider,
  PayPalHostedField,
  usePayPalHostedFields,
} from "@paypal/react-paypal-js";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";

type Plan = "credits_10" | "pro_monthly" | "pro_yearly";
type PayMethod = "card" | "paypal";
type Billing = "monthly" | "yearly";

interface UpgradeModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

// ── Card brand icons ─────────────────────────────────────────────
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
    <svg viewBox="0 0 40 24" className="h-4 w-auto" fill="none">
      <rect width="40" height="24" rx="3" fill="#016FD0" />
      <text x="4" y="17" fontFamily="Arial" fontWeight="bold" fontSize="9" fill="white">AMEX</text>
    </svg>
  );
}

// ── Card submit (must live inside PayPalHostedFieldsProvider) ────
function CardSubmitButton({ onSuccess, onError, plan, amount, cardholderName }: {
  onSuccess: () => void;
  onError: () => void;
  plan: Plan;
  amount: string;
  cardholderName: string;
}) {
  const hostedFields = usePayPalHostedFields();
  const [submitting, setSubmitting] = useState(false);

  async function handlePay() {
    if (!hostedFields?.cardFields) return;
    setSubmitting(true);
    try {
      const order = await hostedFields.cardFields.submit({ cardholderName });
      const res = await fetch("/api/billing/paypal-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "capture", order_id: order.orderId, plan }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Payment successful!");
        onSuccess();
      } else throw new Error("Capture failed");
    } catch {
      onError();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <button
      onClick={handlePay}
      disabled={submitting}
      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-violet-500/25"
    >
      {submitting
        ? <><Loader2 className="h-4 w-4 animate-spin" />Processing…</>
        : <><Lock className="h-4 w-4" />Pay {amount} Securely</>
      }
    </button>
  );
}

const HOSTED_FIELD_STYLES = {
  input: { "font-size": "14px", "font-family": "inherit", color: "inherit" },
};

// ── Plan data ────────────────────────────────────────────────────
const CREDITS_PLAN = {
  id: "credits_10" as Plan,
  name: "10 AI Designs",
  price: "$10",
  per: "one-time",
  badge: null as string | null,
  yearlyNote: null as string | null,
  features: ["10 AI-generated design fixes", "Download as PNG", "Figma AI prompt export", "No expiry"],
};

const PRO_MONTHLY = {
  id: "pro_monthly" as Plan,
  name: "Unlimited Pro",
  price: "$25",
  per: "/ month",
  badge: "BEST VALUE" as string | null,
  yearlyNote: null as string | null,
  features: ["Unlimited AI design fixes", "Priority generation", "All export formats", "Cancel anytime"],
};

const PRO_YEARLY = {
  id: "pro_yearly" as Plan,
  name: "Unlimited Pro",
  price: "$20",
  per: "/ month",
  badge: "SAVE $60" as string | null,
  yearlyNote: "billed $240 / year",
  features: ["Unlimited AI design fixes", "Priority generation", "All export formats", "2 months free"],
};

// ── Main modal ───────────────────────────────────────────────────
export function UpgradeModal({ onClose, onSuccess }: UpgradeModalProps) {
  const [billing, setBilling] = useState<Billing>("monthly");
  const [selectedPlan, setSelectedPlan] = useState<Plan>("credits_10");
  const [payMethod, setPayMethod] = useState<PayMethod>("card");
  const [cardholderName, setCardholderName] = useState("");
  const [clientToken, setClientToken] = useState<string | null>(null);
  const [tokenLoading, setTokenLoading] = useState(true);

  // Sync plan when billing toggle changes
  useEffect(() => {
    if (selectedPlan === "pro_monthly" && billing === "yearly") setSelectedPlan("pro_yearly");
    if (selectedPlan === "pro_yearly" && billing === "monthly") setSelectedPlan("pro_monthly");
  }, [billing, selectedPlan]);

  // Fetch PayPal client token for hosted card fields
  useEffect(() => {
    if (payMethod !== "card") return;
    setTokenLoading(true);
    setClientToken(null);
    fetch("/api/billing/paypal-client-token")
      .then((r) => r.json())
      .then((d) => { if (d.client_token) setClientToken(d.client_token); })
      .catch(() => {})
      .finally(() => setTokenLoading(false));
  }, [payMethod]);

  const plans = [CREDITS_PLAN, billing === "yearly" ? PRO_YEARLY : PRO_MONTHLY];
  const activePlan = plans.find((p) => p.id === selectedPlan) ?? plans[0];
  const chargeAmount = activePlan.id === "credits_10" ? "$10" : billing === "yearly" ? "$240" : "$25";

  async function createOrder() {
    const res = await fetch("/api/billing/paypal-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", plan: selectedPlan }),
    });
    const data = await res.json();
    return data.id as string;
  }

  async function captureOrder(orderId: string) {
    const res = await fetch("/api/billing/paypal-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "capture", order_id: orderId, plan: selectedPlan }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success("Payment successful!");
      onSuccess?.();
      onClose();
    } else throw new Error("Capture failed");
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base">Upgrade Fusion UX</h2>
              <p className="text-xs text-muted-foreground">Get more AI-powered design fixes</p>
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
                  "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all",
                  billing === "monthly" ? "bg-background shadow text-foreground" : "text-muted-foreground"
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setBilling("yearly")}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all",
                  billing === "yearly" ? "bg-background shadow text-foreground" : "text-muted-foreground"
                )}
              >
                Yearly
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400">
                  SAVE 20%
                </span>
              </button>
            </div>
          </div>

          {/* Plan selector */}
          <div className="grid grid-cols-2 gap-3">
            {plans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={cn(
                  "relative rounded-xl border-2 p-4 text-left transition-all",
                  selectedPlan === plan.id
                    ? "border-violet-500 bg-violet-50 dark:bg-violet-950/30"
                    : "border-border hover:border-violet-300 dark:hover:border-violet-700"
                )}
              >
                {plan.badge && (
                  <span className="absolute top-2.5 right-2.5 text-[9px] font-bold px-2 py-0.5 bg-violet-500 text-white rounded-full">
                    {plan.badge}
                  </span>
                )}
                {selectedPlan === plan.id && (
                  <div className="absolute top-2.5 left-2.5 w-4 h-4 rounded-full bg-violet-500 flex items-center justify-center">
                    <Check className="h-2.5 w-2.5 text-white" />
                  </div>
                )}
                <p className="font-semibold text-sm mt-1">{plan.name}</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold text-violet-600 dark:text-violet-400">{plan.price}</span>
                  <span className="text-xs text-muted-foreground">{plan.per}</span>
                </div>
                {plan.yearlyNote && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">{plan.yearlyNote}</p>
                )}
                <ul className="mt-3 space-y-1.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Check className="h-3 w-3 text-violet-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </button>
            ))}
          </div>

          {/* Order summary */}
          <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{activePlan.name}</span>
            <span className="font-bold">
              {chargeAmount}{" "}
              <span className="text-muted-foreground font-normal text-xs">
                {activePlan.id === "credits_10" ? "one-time" : billing === "yearly" ? "/ year" : "/ month"}
              </span>
            </span>
          </div>

          {/* Payment method tabs */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Payment Method</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPayMethod("card")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all flex-1 justify-center",
                  payMethod === "card"
                    ? "border-violet-500 bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300"
                    : "border-border hover:border-violet-300 text-muted-foreground"
                )}
              >
                <CreditCard className="h-4 w-4" />
                Card
                <div className="flex items-center gap-1">
                  <VisaIcon /><MastercardIcon />
                </div>
              </button>
              <button
                onClick={() => setPayMethod("paypal")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all flex-1 justify-center",
                  payMethod === "paypal"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                    : "border-border hover:border-blue-300 text-muted-foreground"
                )}
              >
                <span className="font-bold text-[#003087] dark:text-[#009cde]">Pay</span>
                <span className="font-bold text-[#009cde] -ml-1.5">Pal</span>
              </button>
            </div>
          </div>

          {/* ── Card payment ── */}
          {payMethod === "card" && (
            tokenLoading ? (
              <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading secure payment form…
              </div>
            ) : !clientToken ? (
              <div className="rounded-xl border border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                Card payment unavailable — PayPal credentials not configured.
              </div>
            ) : (
              <PayPalScriptProvider options={{
                clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "",
                dataClientToken: clientToken,
                currency: "USD",
                components: "hosted-fields",
                intent: "capture",
              }}>
                <PayPalHostedFieldsProvider createOrder={createOrder} styles={HOSTED_FIELD_STYLES}>
                  <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">

                    {/* Secure header */}
                    <div className="flex items-center justify-between pb-2 border-b border-border">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                        <Lock className="h-3.5 w-3.5" />
                        Secure Payment Info
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MastercardIcon /><VisaIcon /><AmexIcon />
                      </div>
                    </div>

                    {/* Name on card */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">
                        Name (as it appears on your card)
                      </label>
                      <input
                        type="text"
                        value={cardholderName}
                        onChange={(e) => setCardholderName(e.target.value)}
                        placeholder="John Smith"
                        className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/50"
                      />
                    </div>

                    {/* Card number */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">
                        Card number (no dashes or spaces)
                      </label>
                      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-input bg-background focus-within:ring-2 focus-within:ring-ring">
                        <CreditCard className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 h-5">
                          <PayPalHostedField
                            id="card-number"
                            hostedFieldType="number"
                            className="w-full h-full outline-none bg-transparent text-sm"
                            options={{ selector: "#card-number", placeholder: "1234567890123456" }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Expiry + CVV */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Expiration date</label>
                        <div className="px-3 py-2.5 rounded-xl border border-input bg-background focus-within:ring-2 focus-within:ring-ring h-11">
                          <PayPalHostedField
                            id="expiration-date"
                            hostedFieldType="expirationDate"
                            className="w-full h-full outline-none bg-transparent text-sm"
                            options={{ selector: "#expiration-date", placeholder: "MM / YY" }}
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Security code (3 on back)</label>
                        <div className="px-3 py-2.5 rounded-xl border border-input bg-background focus-within:ring-2 focus-within:ring-ring h-11">
                          <PayPalHostedField
                            id="cvv"
                            hostedFieldType="cvv"
                            className="w-full h-full outline-none bg-transparent text-sm"
                            options={{ selector: "#cvv", placeholder: "CVV" }}
                          />
                        </div>
                      </div>
                    </div>

                    <CardSubmitButton
                      plan={selectedPlan}
                      amount={chargeAmount}
                      cardholderName={cardholderName}
                      onSuccess={() => { onSuccess?.(); onClose(); }}
                      onError={() => toast.error("Payment failed. Please check your card details.")}
                    />

                    <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
                      Secured by PayPal · Visa, Mastercard, Amex & Debit accepted
                    </p>
                  </div>
                </PayPalHostedFieldsProvider>
              </PayPalScriptProvider>
            )
          )}

          {/* ── PayPal buttons ── */}
          {payMethod === "paypal" && (
            <PayPalScriptProvider options={{
              clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "",
              currency: "USD",
            }}>
              <PayPalButtons
                style={{ layout: "vertical", color: "blue", shape: "rect", label: "pay" }}
                createOrder={createOrder}
                onApprove={async (data) => { await captureOrder(data.orderID); }}
                onError={() => toast.error("PayPal payment failed. Please try again.")}
              />
            </PayPalScriptProvider>
          )}

        </div>
      </div>
    </div>
  );
}
