"use client";

import { useState } from "react";
import { X, Zap, Check, Building2, ExternalLink, Globe } from "lucide-react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";

type Plan = "credits_5" | "pro_monthly";
type PayMethod = "paypal" | "bank";

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

const BANK_DETAILS = {
  bankName: "Bank of Ceylon",
  accountName: "Fusion UX Ltd",
  accountNumber: "1234567890",
  branch: "Colombo 07",
  swiftCode: "BCEYLKLX",
  reference: `FUXPAY-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
};

export function UpgradeModal({ onClose, onSuccess }: UpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<Plan>("credits_5");
  const [payMethod, setPayMethod] = useState<PayMethod>("paypal");
  const [copied, setCopied] = useState(false);

  async function handlePayPalCapture(orderId: string) {
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

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const selectedPrice = PLANS.find((p) => p.id === selectedPlan);

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
                onClick={() => setPayMethod("paypal")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all",
                  payMethod === "paypal"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                    : "border-border hover:border-blue-300 text-muted-foreground hover:text-foreground"
                )}
              >
                <Globe className="h-4 w-4 text-[#009cde]" />
                <span>
                  <span className="font-bold text-[#003087] dark:text-[#009cde]">Pay</span>
                  <span className="font-bold text-[#009cde]">Pal</span>
                </span>
                <span className="text-[10px] text-muted-foreground">(cards accepted)</span>
              </button>
              <button
                onClick={() => setPayMethod("bank")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all",
                  payMethod === "bank"
                    ? "border-violet-500 bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300"
                    : "border-border hover:border-violet-300 text-muted-foreground hover:text-foreground"
                )}
              >
                <Building2 className="h-4 w-4" />
                Bank Transfer
              </button>
            </div>
          </div>

          {/* PayPal */}
          {payMethod === "paypal" && (
            <div className="space-y-3">
              <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20 p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{selectedPrice?.name}</span>
                  <span className="font-bold">{selectedPrice?.price} {selectedPrice?.per}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Pay with PayPal or debit/credit card — no PayPal account required for card payments
                </p>
              </div>
              <PayPalScriptProvider options={{
                clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "test",
                currency: "USD",
              }}>
                <PayPalButtons
                  style={{ layout: "vertical", color: "blue", shape: "rect", label: "pay" }}
                  createOrder={async () => {
                    const res = await fetch("/api/billing/paypal-order", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ action: "create", plan: selectedPlan }),
                    });
                    const data = await res.json();
                    return data.id;
                  }}
                  onApprove={async (data) => {
                    await handlePayPalCapture(data.orderID);
                  }}
                  onError={() => toast.error("PayPal payment failed. Please try again.")}
                />
              </PayPalScriptProvider>
            </div>
          )}

          {/* Bank Transfer */}
          {payMethod === "bank" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4">
                <p className="text-xs font-bold text-amber-700 dark:text-amber-300 mb-1">Manual bank transfer</p>
                <p className="text-xs text-amber-700/80 dark:text-amber-300/80">
                  Transfer to our bank account and email your receipt to{" "}
                  <a href="mailto:billing@fusionux.app" className="font-semibold underline">billing@fusionux.app</a>.
                  Credits will be added within 1–2 business days.
                </p>
              </div>

              <div className="rounded-xl border border-border divide-y divide-border text-sm overflow-hidden">
                {[
                  { label: "Bank", value: BANK_DETAILS.bankName },
                  { label: "Account Name", value: BANK_DETAILS.accountName },
                  { label: "Account No.", value: BANK_DETAILS.accountNumber },
                  { label: "Branch", value: BANK_DETAILS.branch },
                  { label: "SWIFT / BIC", value: BANK_DETAILS.swiftCode },
                  { label: "Amount", value: `${selectedPrice?.price} USD` },
                  { label: "Reference", value: BANK_DETAILS.reference },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-muted-foreground text-xs">{label}</span>
                    <span className="font-mono font-medium text-xs">{value}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => copyToClipboard(
                  `Bank: ${BANK_DETAILS.bankName}\nAccount Name: ${BANK_DETAILS.accountName}\nAccount No.: ${BANK_DETAILS.accountNumber}\nBranch: ${BANK_DETAILS.branch}\nSWIFT: ${BANK_DETAILS.swiftCode}\nAmount: ${selectedPrice?.price} USD\nReference: ${BANK_DETAILS.reference}`
                )}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border bg-background text-sm font-medium hover:bg-accent transition-colors"
              >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <ExternalLink className="h-4 w-4" />}
                {copied ? "Copied!" : "Copy bank details"}
              </button>

              <p className="text-xs text-center text-muted-foreground">
                Include reference <span className="font-mono font-bold">{BANK_DETAILS.reference}</span> in your transfer
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
