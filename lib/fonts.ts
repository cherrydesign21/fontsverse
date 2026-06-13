import type { DBFont } from "@/lib/supabase";

// Resolve a storage path or full URL to a public HTTPS URL
export function getFontFileUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/fonts/${path}`;
}

// Generate a @font-face block for one DBFont
export function getFontFaceCSS(font: DBFont): string {
  const srcs: string[] = [];
  const woff2 = getFontFileUrl(font.file_woff2);
  const woff  = getFontFileUrl(font.file_woff);
  const ttf   = getFontFileUrl(font.file_ttf) ?? getFontFileUrl(font.file_original);
  if (woff2) srcs.push(`url('${woff2}') format('woff2')`);
  if (woff)  srcs.push(`url('${woff}') format('woff')`);
  if (ttf)   srcs.push(`url('${ttf}') format('truetype')`);
  if (!srcs.length) return "";
  return `@font-face {\n  font-family: '${font.name}';\n  src: ${srcs.join(",\n       ")};\n  font-weight: ${font.font_weight};\n  font-style: ${font.font_style};\n  font-display: swap;\n}`;
}

const PROJECT_FRAMEWORKS = ["HTML","CSS","React","Next.js","Vue"] as const;
export type ProjectFW = typeof PROJECT_FRAMEWORKS[number];
export { PROJECT_FRAMEWORKS };

export function getProjectSnippet(fw: ProjectFW, projectName: string, fonts: DBFont[]): string {
  const faces = fonts.map(getFontFaceCSS).filter(Boolean).join("\n\n");
  const slug  = projectName.toLowerCase().replace(/\s+/g, "-");
  const first = fonts[0]?.name ?? "MyFont";
  const all   = fonts.map(f => `'${f.name}'`).join(", ");

  switch (fw) {
    case "HTML":
      return `<style>\n${faces}\n</style>\n\n<!-- Usage -->\n<p style="font-family: ${all}, sans-serif;">\n  Your text here\n</p>`;
    case "CSS":
      return `${faces}\n\n/* Usage */\n.my-element {\n  font-family: ${all}, sans-serif;\n}`;
    case "React":
      return `/* src/styles/${slug}-fonts.css */\n${faces}\n\n// In your component:\nimport './styles/${slug}-fonts.css';\n\nexport default function App() {\n  return (\n    <p style={{ fontFamily: "'${first}', sans-serif" }}>\n      Your text\n    </p>\n  );\n}`;
    case "Next.js":
      return `/* app/${slug}-fonts.css */\n${faces}\n\n// app/layout.tsx\nimport './${slug}-fonts.css';\n\nexport default function Layout({ children }) {\n  return (\n    <html>\n      <body style={{ fontFamily: "'${first}', sans-serif" }}>\n        {children}\n      </body>\n    </html>\n  );\n}`;
    case "Vue":
      return `/* assets/${slug}-fonts.css */\n${faces}\n\n<!-- Component.vue -->\n<template>\n  <p :style="{ fontFamily: \`'${first}', sans-serif\` }">Your text</p>\n</template>\n\n<script setup>\n// In main.js: import './${slug}-fonts.css'\n</script>`;
    default:
      return faces;
  }
}

export const FRAMEWORKS = [
  { id: "html",    label: "HTML"    },
  { id: "css",     label: "CSS"     },
  { id: "react",   label: "React"   },
  { id: "nextjs",  label: "Next.js" },
  { id: "vue",     label: "Vue"     },
  { id: "angular", label: "Angular" },
  { id: "flutter", label: "Flutter" },
  { id: "android", label: "Android" },
];
