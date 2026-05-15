import type { Metadata } from "next";
import { AcademyClient } from "@/components/academy/AcademyClient";

export const metadata: Metadata = { title: "Fusion Academy" };

export default function AcademyPage() {
  return <AcademyClient />;
}
