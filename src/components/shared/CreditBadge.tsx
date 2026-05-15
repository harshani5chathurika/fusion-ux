"use client";

import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";

export function CreditBadge() {
  const [credits, setCredits] = useState<number | null>(null);
  const [plan, setPlan] = useState<string>("free");
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("organization_members")
        .select("organizations(ai_credits, plan)")
        .eq("user_id", user.id)
        .single();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const org = (data as any)?.organizations;
      setCredits(org?.ai_credits ?? 0);
      setPlan(org?.plan ?? "free");
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (plan === "pro") {
    return (
      <div className="rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-3 py-2 flex items-center gap-2">
        <Zap className="h-3.5 w-3.5 text-white flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-white">Pro Plan</p>
          <p className="text-[10px] text-violet-200">Unlimited AI fixes</p>
        </div>
      </div>
    );
  }

  if (credits === null) return null;

  const isEmpty = credits <= 0;
  const isLow = credits === 1;

  return (
    <div className={cn(
      "rounded-lg border px-3 py-2 space-y-1.5",
      isEmpty
        ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
        : isLow
        ? "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800"
        : "bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800"
    )}>
      <div className="flex items-center gap-2">
        <Zap className={cn(
          "h-3.5 w-3.5 flex-shrink-0",
          isEmpty ? "text-red-500" : isLow ? "text-orange-500" : "text-violet-500"
        )} />
        <p className={cn(
          "text-[11px] font-bold",
          isEmpty ? "text-red-700 dark:text-red-300" : isLow ? "text-orange-700 dark:text-orange-300" : "text-violet-700 dark:text-violet-300"
        )}>
          AI Fix Credits
        </p>
        <span className={cn(
          "ml-auto text-[11px] font-bold px-1.5 py-0.5 rounded-full",
          isEmpty ? "bg-red-500 text-white" : isLow ? "bg-orange-500 text-white" : "bg-violet-500 text-white"
        )}>
          {credits}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            isEmpty ? "bg-red-500" : isLow ? "bg-orange-500" : "bg-violet-500"
          )}
          style={{ width: `${Math.min(100, (credits / 2) * 100)}%` }}
        />
      </div>

      <p className="text-[10px] text-muted-foreground">
        {isEmpty ? "No credits left — " : isLow ? "Almost out — " : "Free tier · "}
        <button className={cn(
          "font-semibold underline",
          isEmpty ? "text-red-600 dark:text-red-400" : isLow ? "text-orange-600 dark:text-orange-400" : "text-violet-600 dark:text-violet-400"
        )}>
          Upgrade to Pro
        </button>
      </p>
    </div>
  );
}
