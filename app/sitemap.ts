import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const BASE = "https://fontsverse.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const static_: MetadataRoute.Sitemap = [
    { url: BASE,              lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE}/fonts`,   lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/pricing`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/about`,   lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    const { data } = await supabase
      .from("fonts")
      .select("slug, updated_at")
      .eq("is_public", true)
      .order("downloads", { ascending: false });

    const fontPages: MetadataRoute.Sitemap = (data ?? []).map(f => ({
      url: `${BASE}/fonts/${f.slug}`,
      lastModified: new Date(f.updated_at ?? Date.now()),
      changeFrequency: "weekly" as const,
      priority: 0.75,
    }));

    return [...static_, ...fontPages];
  } catch {
    return static_;
  }
}
