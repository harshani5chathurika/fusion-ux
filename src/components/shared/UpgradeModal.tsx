"use client";

import { useState, useEffect } from "react";
import { X, Zap, Check, Globe, CreditCard, Loader2 } from "lucide-react";
import {
  PayPalScriptProvider,
  PayPalButtons,
  PayPalHostedFieldsProvider,
  PayPalHostedField,
  usePayPalHostedFields,
} from "@paypal/react-paypal-js";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";

type Plan = "credits_5" | "pro_monthly";
type PayMethod = "card" | "paypal";

interface UpgradeModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const PLANS = [
  {
    id: "credits_5" as Plan,
    name: "5 AI Fix Credits",
    price: "$50",
    per: "one-time",
    badge: null,
    features: ["5 AI-generated design fixes", "Download as PNG", "Figma AI prompt export", "No expiry"],
  },
  {
    id: "pro_monthly" as Plan,
    name: "Pro Plan",
    price: "$99",
    per: "/ month",
    badge: "BEST VALUE",
    features: ["Unlimited AI fixes", "Priority generation", "All export formats", "Cancel anytime"],
  },
];

// Card icons as inline SVG paths
function VisaIcon() {
  return (
    <svg viewBox="0 0 48 16" className="h-5 w-auto" fill="none">
      <text x="0" y="13" fontFamily="Arial" fontWeight="bold" fontSize="14" fill="#1A1F71">VISA</text>
    </svg>
  );
}
function MastercardIcon() {
  return (
    <svg viewBox="0 0 38 24" className="h-5 w-auto">
      <circle cx="15" cy="12" r="10" fill="#EB001B" />
      <circle cx="23" cy="12" r="10" fill="#F79E1B" />
      <path d="M19 4.8a10 10 0 0 1 0 14.4A10 10 0 0 1 19 4.8z" fill="#FF5F00" />
    </svg>
  );
}

// Hosted fields submit button — must be inside PayPalHostedFieldsProvider
function CardSubmitButton({ onSuccess, onError, plan }: { onSuccess: () => void; onError: () => void; plan: Plan }) {
  const hostedFields = usePayPalHostedFields();
  const [submitting, setSubmitting] = useState(false);

  async function handlePay() {
    if (!hostedFields?.cardFields) return;
    setSubmitting(true);
    try {
      const order = await hostedFields.cardFields.submit({
        // billing address optional
      });
      // Capture on server
      const res = await fetch("/api/billing/paypal-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "capture", order_id: order.orderId, plan }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Payment successful! Credits added.");
        onSuccess();
      } else {
        throw new Error("Capture failed");
      }
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
      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {submitting
        ? <><Loader2 className="h-4 w-4 animate-spin" />Processing…</>
        : <><CreditCard className="h-4 w-4" />Pay Now</>
      }
    </button>
  );
}

const HOSTED_FIELD_STYLES = {
  input: {
    "font-size": "14px",
    "font-family": "inherit",
    color: "inherit",
  },
};

export function UpgradeModal({ onClose, onSuccess }: UpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<Plan>("credits_5");
  const [payMethod, setPayMethod] = useState<PayMethod>("card");
  const [clientToken, setClientToken] = useState<string | null>(null);
  const [tokenLoading, setTokenLoading] = useState(true);

  useEffect(() => {
    if (payMethod !== "card") return;
    setTokenLoading(true);
    fetch("/api/billing/paypal-client-token")
      .then((r) => r.json())
      .then((d) => { if (d.client_token) setClientToken(d.client_token); })
      .catch(() => {})
      .finally(() => setTokenLoading(false));
  }, [payMethod]);

  const selectedPrice = PLANS.find((p) => p.id === selectedPlan);

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
      toast.success("Payment successful! Credits added.");
      onSuccess?.();
      onClose();
    } else {
      throw new Error("Capture failed");
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Upgrade Fusion UX</h2>
              <p className="text-xs text-muted-foreground">Get more AI-powered design fixes</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-accent flex items-center justify-center text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* Plan selector */}
          <div className="grid grid-cols-2 gap-3">
            {PLANS.map((plan) => (
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
                <p className="font-semibold text-sm">{plan.name}</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold text-violet-600 dark:text-violet-400">{plan.price}</span>
                  <span className="text-xs text-muted-foreground">{plan.per}</span>
                </div>
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

          {/* Payment method tabs */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Payment Method</p>
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
                <div className="flex items-center gap-1 ml-1">
                  <VisaIcon />
                  <MastercardIcon />
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
                <Globe className="h-4 w-4 text-[#009cde]" />
                <span className="font-bold text-[#003087] dark:text-[#009cde]">Pay</span>
                <span className="font-bold text-[#009cde] -ml-1.5">Pal</span>
              </button>
            </div>
          </div>

          {/* Order summary */}
          <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{selectedPrice?.name}</span>
            <span className="font-bold">{selectedPrice?.price} <span className="text-muted-foreground font-normal">{selectedPrice?.per}</span></span>
          </div>

          {/* Card payment via PayPal Hosted Fields */}
          {payMethod === "card" && (
            tokenLoading ? (
              <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading secure payment form…
              </div>
            ) : !clientToken ? (
              <div className="rounded-xl border border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                Card payment unavailable — PayPal is not configured yet.
              </div>
            ) :
            <PayPalScriptProvider options={{
              clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "",
              dataClientToken: clientToken,
              currency: "USD",
              components: "hosted-fields",
              intent: "capture",
            }}>
              <PayPalHostedFieldsProvider
                createOrder={createOrder}
                styles={HOSTED_FIELD_STYLES}
              >
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Card number</label>
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-input bg-background focus-within:ring-2 focus-within:ring-ring">
                      <CreditCard className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 h-5">
                        <PayPalHostedField id="card-number" hostedFieldType="number"
                          className="w-full h-full outline-none bg-transparent text-sm"
                          options={{ selector: "#card-number", placeholder: "1234 5678 9012 3456" }}
                        />
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <VisaIcon />
                        <MastercardIcon />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Expiry date</label>
                      <div className="px-3 py-2.5 rounded-xl border border-input bg-background focus-within:ring-2 focus-within:ring-ring h-11">
                        <PayPalHostedField id="expiration-date" hostedFieldType="expirationDate"
                          className="w-full h-full outline-none bg-transparent text-sm"
                          options={{ selector: "#expiration-date", placeholder: "MM / YY" }}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">CVV</label>
                      <div className="px-3 py-2.5 rounded-xl border border-input bg-background focus-within:ring-2 focus-within:ring-ring h-11">
                        <PayPalHostedField id="cvv" hostedFieldType="cvv"
                          className="w-full h-full outline-none bg-transparent text-sm"
                          options={{ selector: "#cvv", placeholder: "CVV" }}
                        />
                      </div>
                    </div>
                  </div>

                  <CardSubmitButton
                    plan={selectedPlan}
                    onSuccess={() => { onSuccess?.(); onClose(); }}
                    onError={() => toast.error("Payment failed. Please check your card details.")}
                  />

                  <p className="text-xs text-center text-muted-foreground">
                    🔒 Secured by PayPal · Visa, Mastercard, Debit & Credit cards accepted
                  </p>
                </div>
              </PayPalHostedFieldsProvider>
            </PayPalScriptProvider>
          )}

          {/* PayPal buttons */}
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
