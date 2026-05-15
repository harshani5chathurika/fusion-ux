"use client";

import { createContext, useContext, useState, useCallback } from "react";
import type { SeverityLevel, BoundingBox } from "@/types";

// ── Types ────────────────────────────────────────────────────────

export interface ResolvableFinding {
  id: string;
  title: string;
  description: string | null;
  severity: SeverityLevel;
  heuristic_category: string | null;
  heuristic_item_id: string | null;
  location: string | null;
  wcag_criteria: string[] | null;
  tags: string[];
  ai_suggestion: string | null;
  bounding_box: BoundingBox | null;
  financial_risk: string | null;
  before_screenshot_url: string | null;
  after_screenshot_url: string | null;
}

export interface ValidationResult {
  validated: boolean;
  confidence: number;
  explanation: string;
  remaining_issues: string[];
  passed_checks: string[];
}

export interface ROIImpactUSD {
  type: "legal" | "revenue" | "efficiency";
  label: string;
  amount: string;
  description: string;
  mitigated?: boolean;
}

// ── ROI Helper (USD) ─────────────────────────────────────────────

export function getROIImpactUSD(finding: ResolvableFinding): ROIImpactUSD | null {
  const cat = (finding.heuristic_category ?? "").toLowerCase();
  const tags = finding.tags.map((t) => t.toLowerCase());
  const loc = (finding.location ?? "").toLowerCase();
  const hasWcag = (finding.wcag_criteria?.length ?? 0) > 0;

  if (cat.includes("accessibility") || cat.includes("trust") || cat.includes("privacy") || hasWcag) {
    return {
      type: "legal",
      label: "Legal / Compliance Exposure",
      amount: "$50,000 – $250,000",
      description: "ADA/EAA/WCAG AA non-compliance carries direct legal liability in enterprise markets. Closing this finding eliminates the exposure.",
    };
  }

  const checkoutKeywords = ["checkout", "payment", "cart", "purchase", "billing", "order", "registration", "signup", "sign up", "subscribe", "onboard"];
  const isCheckout = checkoutKeywords.some((k) => tags.includes(k) || loc.includes(k));
  if (isCheckout || finding.severity === "critical") {
    return {
      type: "revenue",
      label: "Revenue Opportunity",
      amount: "$100,000+ / year",
      description: "Baymard Institute (2023): reducing friction at this funnel stage recovers 15–35% of lost conversions annually.",
    };
  }

  if (finding.severity === "high") {
    return {
      type: "efficiency",
      label: "Productivity Recovery",
      amount: "$10,000 – $50,000 / year",
      description: "Reducing user friction at this touchpoint decreases support tickets and task completion time at enterprise scale.",
    };
  }

  return null;
}

// ── Context ──────────────────────────────────────────────────────

interface ResolutionContextValue {
  isComparing: boolean;
  comparingFinding: ResolvableFinding | null;
  auditScreenshotUrl: string | null;
  validationResult: ValidationResult | null;
  openComparison: (finding: ResolvableFinding, screenshotUrl: string | null) => void;
  closeComparison: () => void;
  setValidationResult: (r: ValidationResult | null) => void;
}

const ResolutionContext = createContext<ResolutionContextValue | null>(null);

export function ResolutionProvider({ children }: { children: React.ReactNode }) {
  const [isComparing, setIsComparing] = useState(false);
  const [comparingFinding, setComparingFinding] = useState<ResolvableFinding | null>(null);
  const [auditScreenshotUrl, setAuditScreenshotUrl] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  const openComparison = useCallback((finding: ResolvableFinding, screenshotUrl: string | null) => {
    setComparingFinding(finding);
    setAuditScreenshotUrl(screenshotUrl);
    setValidationResult(null);
    setIsComparing(true);
  }, []);

  const closeComparison = useCallback(() => {
    setIsComparing(false);
    setComparingFinding(null);
    setValidationResult(null);
  }, []);

  return (
    <ResolutionContext.Provider value={{
      isComparing, comparingFinding, auditScreenshotUrl,
      validationResult, openComparison, closeComparison, setValidationResult,
    }}>
      {children}
    </ResolutionContext.Provider>
  );
}

export function useResolution() {
  const ctx = useContext(ResolutionContext);
  if (!ctx) throw new Error("useResolution must be used inside ResolutionProvider");
  return ctx;
}
