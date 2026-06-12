"use client";
import { useState, useEffect } from "react";
import { DBFont } from "@/lib/supabase";
import { FRAMEWORKS, getFontFaceCSS, getFontFileUrl } from "@/lib/fonts";
import { useFonts } from "@/context/FontsContext";
import { Overlay } from "./AuthModal";

interface Props { font: DBFont; onClose: () => void }

const PREVIEW_SIZES = [14, 18, 24, 32, 48, 64] as const;
const PREVIEW_DEFAULT = "The quick brown fox jumps over the lazy dog";

export default function FontDetailModal({ font, onClose }: Props) {
  const { incrementDownload } = useFonts();
  const [fw, setFw]             = useState("html");
  const [copied, setCopied]     = useState(false);
  const [previewText, setPreviewText] = useState(PREVIEW_DEFAULT);
  const [previewSize, setPreviewSize] = useState<number>(32);
  const [darkBg, setDarkBg]     = useState(false);
  const [previewFamily, setPreviewFamily] = useState<string>("");
  const [fontLoaded, setFontLoaded] = useState(false);

  // Inject @font-face into the document so the preview renders the actual font
  useEffect(() => {
    const fileUrl = getFontFileUrl(font.file_woff2 || font.file_woff || font.file_ttf || font.file_original);
    if (!fileUrl) return;
    const fmt = font.file_woff2 ? "woff2" : font.file_woff ? "woff" : "truetype";
    const family = `fv-preview-${font.id}`;
    const style = document.createElement("style");
    style.textContent = `@font-face { font-family: '${family}'; src: url('${fileUrl}') format('${fmt}'); font-display: swap; }`;
    document.head.appendChild(style);
    setPreviewFamily(family);
    // Check if font loads
    document.fonts.load(`16px '${family}'`).then(() => setFontLoaded(true)).catch(() => {});
    return () => { document.head.removeChild(style); };
  }, [font.id, font.file_woff2, font.file_woff, font.file_ttf, font.file_original]);

  // Generate real embed code per framework
  const getCode = (framework: string) => {
    const face = getFontFaceCSS(font);
    if (!face) return `/* Font file URL not available — upload a font file first */`;
    switch (framework) {
      case "html":
        return `<style>\n${face}\n</style>\n\n<!-- Usage -->\n<p style="font-family: '${font.name}', sans-serif;">\n  Your text here\n</p>`;
      case "css":
        return `${face}\n\n/* Usage */\n.my-element {\n  font-family: '${font.name}', sans-serif;\n  font-weight: ${font.font_weight};\n}`;
      case "react":
        return `/* src/styles/${font.slug}-font.css */\n${face}\n\n// In your component:\nimport './styles/${font.slug}-font.css';\n\n<p style={{ fontFamily: "'${font.name}', sans-serif" }}>\n  Your text\n</p>`;
      case "nextjs":
        return `/* app/${font.slug}-font.css */\n${face}\n\n// app/layout.tsx\nimport './${font.slug}-font.css';\n\n<body style={{ fontFamily: "'${font.name}', sans-serif" }}>\n  {children}\n</body>`;
      case "vue":
        return `/* assets/${font.slug}-font.css */\n${face}\n\n<!-- Component.vue -->\n<style>\n@import './assets/${font.slug}-font.css';\n</style>\n<template>\n  <p style="font-family: '${font.name}', sans-serif">Text</p>\n</template>`;
      case "angular":
        return `/* styles.css or a shared stylesheet */\n${face}\n\n/* Usage in component */\n.my-text {\n  font-family: '${font.name}', sans-serif;\n}`;
      case "flutter":
        return `# 1. Download the font file and place in assets/fonts/\n# 2. pubspec.yaml:\nflutter:\n  fonts:\n    - family: ${font.name.replace(/\s/g,"")}\n      fonts:\n        - asset: assets/fonts/${font.slug}.ttf\n\n# 3. Usage:\nText(\n  'Hello',\n  style: TextStyle(fontFamily: '${font.name.replace(/\s/g,"")}'),\n)`;
      case "android":
        return `<!-- res/font/${font.slug.replace(/-/g,"_")}.xml -->\n<!-- Download font file from the URL below and place in res/font/ -->\n<!-- ${getFontFileUrl(font.file_ttf || font.file_original)} -->\n\n<!-- Usage in layout -->\n<TextView\n  android:fontFamily="@font/${font.slug.replace(/-/g,"_")}"\n  android:text="Hello World" />`;
      default:
        return face;
    }
  };

  const copy = async () => {
    try { await navigator.clipboard.writeText(getCode(fw)); } catch {}
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const download = async (format: string) => {
    await incrementDownload(font.id);
    const raw = format === "ttf"   ? font.file_ttf
              : format === "woff"  ? font.file_woff
              : format === "woff2" ? font.file_woff2
              : format === "svg"   ? font.file_svg
              : font.file_original;
    const url = getFontFileUrl(raw);
    if (!url) return;
    const a = document.createElement("a");
    a.href = url; a.download = `${font.slug}.${format}`; a.click();
  };

  const downloadFormats = [
    { fmt: "ttf",   path: font.file_ttf },
    { fmt: "woff",  path: font.file_woff },
    { fmt: "woff2", path: font.file_woff2 },
    { fmt: "svg",   path: font.file_svg },
  ].filter(x => x.path);

  return (
    <Overlay onClose={onClose} wide>
      {/* ── Live preview ── */}
      <div
        className="rounded-xl overflow-hidden mb-5 transition-colors"
        style={{ background: darkBg ? "#111" : font.bg_color, minHeight: 110 }}>
        <div className="px-5 pt-5 pb-3">
          <textarea
            rows={2}
            value={previewText}
            onChange={e => setPreviewText(e.target.value)}
            className="w-full bg-transparent border-none outline-none resize-none text-center leading-tight"
            style={{
              color: darkBg ? "#f5f5f5" : font.text_color,
              fontFamily: previewFamily || font.font_family,
              fontSize: previewSize,
              fontWeight: font.font_weight,
              fontStyle: font.font_style,
              letterSpacing: font.letter_spacing,
              opacity: fontLoaded || !previewFamily ? 1 : 0.5,
            }}
            placeholder="Type preview text…"
          />
        </div>
        {/* Preview controls */}
        <div className="flex items-center justify-between px-4 pb-3 gap-3">
          <div className="flex items-center gap-1">
            {PREVIEW_SIZES.map(s => (
              <button key={s} onClick={() => setPreviewSize(s)}
                className={`w-6 h-6 rounded text-[9px] font-bold transition-all
                  ${previewSize === s ? "bg-white/30 text-white" : "text-white/40 hover:text-white/70"}`}
                style={{ color: darkBg ? undefined : font.text_color }}>
                {s < 20 ? "S" : s < 36 ? "M" : s < 52 ? "L" : "XL"}
              </button>
            ))}
          </div>
          <button onClick={() => setDarkBg(!darkBg)}
            className="text-[10px] px-2 py-1 rounded-md bg-white/20 hover:bg-white/30 transition-all"
            style={{ color: darkBg ? "#f5f5f5" : font.text_color }}>
            {darkBg ? "☀ Light" : "☾ Dark"}
          </button>
        </div>
      </div>

      {/* Font meta */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{font.name}</h2>
          <p className="text-gray-400 text-xs mt-0.5">
            {font.category} · {font.downloads.toLocaleString()} downloads · {font.font_weight} weight
          </p>
        </div>
        {downloadFormats.length > 0 && (
          <div className="flex gap-1.5 flex-wrap justify-end shrink-0">
            {downloadFormats.map(({ fmt }) => (
              <button key={fmt} onClick={() => download(fmt)}
                className="px-2.5 py-1 rounded-md text-xs border border-violet-200
                  bg-violet-50 text-violet-600 hover:bg-violet-100 transition-all font-medium">
                ↓ {fmt.toUpperCase()}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Embed code */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {FRAMEWORKS.map(f => (
          <button key={f.id} onClick={() => { setFw(f.id); setCopied(false); }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] border transition-all
              ${fw === f.id
                ? "bg-violet-50 border-violet-300 text-violet-600"
                : "bg-gray-50 border-gray-200 text-gray-500 hover:text-gray-700"}`}>
            <span>{f.icon}</span>{f.label}
          </button>
        ))}
      </div>

      <div className="relative">
        <pre className="bg-gray-900 rounded-xl p-4 text-[11px] text-emerald-400 overflow-x-auto
          leading-relaxed font-mono whitespace-pre-wrap wrap-break-word max-h-56 overflow-y-auto">
          {getCode(fw)}
        </pre>
        <button onClick={copy}
          className={`absolute top-2.5 right-2.5 px-2.5 py-1 rounded text-[11px] border transition-all
            ${copied
              ? "bg-emerald-50 border-emerald-300 text-emerald-600"
              : "bg-violet-50 border-violet-200 text-violet-600 hover:bg-violet-100"}`}>
          {copied ? "✓ Copied!" : "Copy"}
        </button>
      </div>

      {!getFontFileUrl(font.file_woff2 || font.file_woff || font.file_ttf || font.file_original) && (
        <p className="text-amber-600 text-xs mt-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          ⚠ No font file stored — embed code requires an uploaded file (TTF/WOFF/WOFF2).
        </p>
      )}
    </Overlay>
  );
}
