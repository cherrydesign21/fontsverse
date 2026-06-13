import type { MetadataRoute } from "next";

const BASE = "https://fontsverse.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE,               lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE}/fonts`,    lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/pricing`,  lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/about`,    lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/contact`,  lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];
}
