"use client";

import { useEffect, useState, useCallback } from "react";
import { Zap, Crown } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { UpgradeModal } from "./UpgradeModal";

interface UsageData {
  fixes_today: number;
  plan_status: "free" | "pro";
  remaining: number | null;
  limit: number;
}

export function CreditBadge() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/usage");
      if (res.ok) setUsage(await res.json());
    } catch { /* silent */ }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (!usage) return null;

  // Pro plan badge
  if (usage.plan_status === "pro") {
    return (
      <div className="rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-3 py-2 flex items-center gap-2">
        <Crown className="h-3.5 w-3.5 text-white flex-shrink-0" />
        <div>
          <p className="text-[11px] font-bold text-white">Pro Plan</p>
          <p className="text-[10px] text-violet-200">Unlimited AI fixes</p>
        </div>
      </div>
    );
  }

  const used = usage.fixes_today;
  const limit = usage.limit;
  const isAtLimit = used >= limit;
  const isNearLimit = used === limit - 1;

  return (
    <>
      <div className={cn(
        "rounded-lg border px-3 py-2 space-y-1.5",
        isAtLimit
          ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
          : isNearLimit
          ? "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800"
          : "bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800"
      )}>
        <div className="flex items-center gap-2">
          <Zap className={cn(
            "h-3.5 w-3.5 flex-shrink-0",
            isAtLimit ? "text-red-500" : isNearLimit ? "text-orange-500" : "text-violet-500"
          )} />
          <p className={cn(
            "text-[11px] font-bold",
            isAtLimit ? "text-red-700 dark:text-red-300"
              : isNearLimit ? "text-orange-700 dark:text-orange-300"
              : "text-violet-700 dark:text-violet-300"
          )}>
            Free: {used}/{limit} fixes today
          </p>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              isAtLimit ? "bg-red-500" : isNearLimit ? "bg-orange-500" : "bg-violet-500"
            )}
            style={{ width: `${Math.min(100, (used / limit) * 100)}%` }}
          />
        </div>

        <p className="text-[10px] text-muted-foreground">
          {isAtLimit ? "Daily limit reached — " : isNearLimit ? "Last fix today — " : "Resets every 24h · "}
          <button
            onClick={() => setShowUpgrade(true)}
            className={cn(
              "font-semibold underline",
              isAtLimit ? "text-red-600 dark:text-red-400"
                : isNearLimit ? "text-orange-600 dark:text-orange-400"
                : "text-violet-600 dark:text-violet-400"
            )}
          >
            Upgrade to Pro
          </button>
        </p>
      </div>

      {showUpgrade && (
        <UpgradeModal
          onClose={() => setShowUpgrade(false)}
          onSuccess={() => { setShowUpgrade(false); load(); }}
        />
      )}
    </>
  );
}
