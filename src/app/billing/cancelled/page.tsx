"use client";

import { useRouter } from "next/navigation";
import { XCircle } from "lucide-react";

export default function BillingCancelledPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-5 max-w-sm px-6">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
          <XCircle className="h-10 w-10 text-muted-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Payment cancelled</h1>
          <p className="text-muted-foreground mt-2 text-sm">No charges were made.</p>
        </div>
        <button
          onClick={() => router.back()}
          className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
        >
          Go back
        </button>
      </div>
    </div>
  );
}
