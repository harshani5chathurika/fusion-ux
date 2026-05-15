import { Metadata } from "next";
import { NewAuditForm } from "@/components/audit/NewAuditForm";

export const metadata: Metadata = { title: "New Audit" };

export default function NewAuditPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create New Audit</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Upload screenshots or enter a URL to run an AI-powered UX audit against your 12-category heuristic framework.
        </p>
      </div>
      <NewAuditForm />
    </div>
  );
}
