import type { Metadata } from "next";
import PrivacyPageClient from "@/components/PrivacyPageClient";

export const metadata: Metadata = {
  title: "Privacy Policy — FontsVerse",
  description: "FontsVerse privacy policy — how we collect, use, and protect your data.",
};

export default function PrivacyPage() { return <PrivacyPageClient />; }
