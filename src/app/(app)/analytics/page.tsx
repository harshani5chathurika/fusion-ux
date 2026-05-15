import { Metadata } from "next";
import { AnalyticsIntegrations } from "@/components/analytics/AnalyticsIntegrations";

export const metadata: Metadata = { title: "Analytics & Integrations" };

export default function AnalyticsPage() {
  return <AnalyticsIntegrations />;
}
