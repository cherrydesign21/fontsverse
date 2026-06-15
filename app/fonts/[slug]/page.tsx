import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { DBFont } from "@/lib/supabase";
import FontSinglePageClient from "@/components/FontSinglePageClient";

type PageProps = { params: Promise<{ slug: string }> };

async function getFont(slug: string): Promise<DBFont | null> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  const { data } = await supabase
    .from("fonts")
    .select("*")
    .eq("slug", slug)
    .eq("is_public", true)
    .single();
  return (data as DBFont) ?? null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const font = await getFont(slug);
  if (!font) return { title: "Font not found — FontsVerse" };
  return {
    title: `${font.name} Font — FontsVerse`,
    description: `${font.name} is a ${font.category} font. Download in TTF, WOFF, or WOFF2 — or embed directly in HTML, CSS, React, Next.js, Vue, Angular, Flutter, and Android.`,
    openGraph: {
      title: `${font.name} — FontsVerse`,
      description: `${font.category} font · ${font.downloads} downloads`,
      type: "website",
    },
  };
}

export default async function FontPage({ params }: PageProps) {
  const { slug } = await params;
  const font = await getFont(slug);
  if (!font) notFound();
  return <FontSinglePageClient font={font} />;
}
