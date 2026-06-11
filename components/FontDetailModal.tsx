"use client";
import { useState } from "react";
import { DBFont } from "@/lib/supabase";
import { FRAMEWORKS, getSnippet } from "@/lib/fonts";
import { useFonts } from "@/context/FontsContext";
import { Overlay } from "./AuthModal";

interface Props { font: DBFont; onClose: () => void }

export default function FontDetailModal({ font, onClose }: Props) {
  const { incrementDownload } = useFonts();
  const [fw, setFw]       = useState("html");
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try { await navigator.clipboard.writeText(getSnippet(fw, font.name)); } catch {}
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const download = async (format: string) => {
    await incrementDownload(font.id);
    const fileUrl = format === "ttf"   ? font.file_ttf :
                    format === "woff"  ? font.file_woff :
                    format === "woff2" ? font.file_woff2 :
                    format === "svg"   ? font.file_svg  : font.file_original;
    if (fileUrl) {
      const a = document.createElement("a");
      a.href = fileUrl.startsWith("http") ? fileUrl : `https://jgwwnvlvzpvupivmlopj.supabase.co/storage/v1/object/public/fonts/${fileUrl}`;
      a.download = `${font.slug}.${format}`;
      a.click();
    }
  };

  return (
    <Overlay onClose={onClose} wide>
      <div className="h-24 rounded-xl flex items-center justify-center mb-5 overflow-hidden"
        style={{ background: font.bg_color }}>
        <span style={{
          color: font.text_color, fontFamily: font.font_family,
          fontWeight: font.font_weight, fontStyle: font.font_style,
          letterSpacing: font.letter_spacing, fontSize: "clamp(22px,4vw,34px)",
        }}>{font.name}</span>
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-0.5">{font.name}</h2>
      <p className="text-gray-400 text-xs mb-2">{font.category} · {font.downloads.toLocaleString()} downloads</p>
      <p className="text-xs text-gray-400 mb-4">
        CDN: <code className="text-violet-500 bg-violet-50 px-2 py-0.5 rounded font-mono text-[11px]">
          https://fontsverse.app/fonts/{font.slug}/
        </code>
      </p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {FRAMEWORKS.map(f => (
          <button key={f.id} onClick={() => { setFw(f.id); setCopied(false); }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] border transition-all
              ${fw===f.id ? "bg-violet-50 border-violet-300 text-violet-600"
                          : "bg-gray-50 border-gray-200 text-gray-500 hover:text-gray-700"}`}>
            <span>{f.icon}</span>{f.label}
          </button>
        ))}
      </div>
      <div className="relative">
        <pre className="bg-gray-900 border border-gray-200 rounded-lg p-4 text-[11px]
          text-emerald-400 overflow-x-auto leading-relaxed font-mono whitespace-pre-wrap
          break-words max-h-56 overflow-y-auto">{getSnippet(fw, font.name)}</pre>
        <button onClick={copy}
          className={`absolute top-2.5 right-2.5 px-2.5 py-1 rounded text-[11px] border transition-all
            ${copied ? "bg-emerald-50 border-emerald-300 text-emerald-600"
                     : "bg-violet-50 border-violet-200 text-violet-600 hover:bg-violet-100"}`}>
          {copied ? "✓ Copied!" : "Copy"}
        </button>
      </div>
      <div className="flex gap-2 flex-wrap mt-4">
        {["ttf","woff","woff2","svg"].map(fmt => (
          <button key={fmt} onClick={() => download(fmt)}
            className={`px-3 py-1.5 rounded-md text-xs border transition-all
              ${font[`file_${fmt}` as keyof DBFont]
                ? "bg-violet-50 border-violet-200 text-violet-600 hover:bg-violet-100"
                : "bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed"}`}>
            ↓ {fmt.toUpperCase()}
          </button>
        ))}
      </div>
    </Overlay>
  );
}
