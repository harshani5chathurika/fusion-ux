"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Zap } from "lucide-react";

export default function BillingSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.push("/dashboard"), 4000);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-5 max-w-sm px-6">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Payment successful!</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Your AI fix credits have been added to your account. Redirecting to dashboard…
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 text-violet-600 dark:text-violet-400 text-sm font-medium">
          <Zap className="h-4 w-4" />
          Credits activated
        </div>
      </div>
    </div>
  );
}
