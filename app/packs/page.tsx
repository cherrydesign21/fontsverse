import type { Metadata } from "next";
import FontPacksPageClient from "@/components/FontPacksPageClient";

export const metadata: Metadata = {
  title: "Font Packs — FontsVerse",
  description: "Curated font pairings for your projects. Get embed code for two complementary fonts in one click.",
};

export default function FontPacksPage() { return <FontPacksPageClient />; }
