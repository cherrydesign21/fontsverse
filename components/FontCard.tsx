"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { DBFont } from "@/lib/supabase";
import { getFontFaceCSS } from "@/lib/fonts";

interface Props {
  font: DBFont;
  isFav?: boolean;
  onToggleFav?: () => void;
}

export default function FontCard({ font, isFav = false, onToggleFav }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Lazy-inject @font-face when card enters viewport
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      const id = `fv-ff-${font.id}`;
      if (!document.getElementById(id)) {
        const css = getFontFaceCSS(font);
        if (css) {
          const s = document.createElement("style");
          s.id = id; s.textContent = css;
          document.head.appendChild(s);
        }
      }
      obs.disconnect();
    }, { rootMargin: "300px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, [font.id]);

  return (
    <div ref={cardRef} className="relative group">
      <Link
        href={`/fonts/${font.slug}`}
        className="block rounded-[8px] overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.02]"
        style={{
          background: font.bg_color,
          aspectRatio: "1 / 1",
          boxShadow: "0 2px 12px rgba(0,0,0,0.10)",
        }}>

        {/* Font name — bottom-left, large, matching Figma */}
        <span
          className="absolute leading-none"
          style={{
            top: "55%",
            left: "8%",
            right: "5%",
            fontSize: "clamp(28px, 6.5vw, 80px)",
            fontFamily:    font.font_family,
            fontWeight:    font.font_weight,
            fontStyle:     font.font_style,
            letterSpacing: font.letter_spacing,
            color:         font.text_color,
            whiteSpace:    "nowrap",
            overflow:      "hidden",
            textOverflow:  "ellipsis",
          }}>
          {font.name}
        </span>

        {/* Category — bottom */}
        <span
          className="absolute"
          style={{
            bottom:        "7%",
            left:          "8%",
            fontSize:      "11px",
            letterSpacing: "1.12px",
            textTransform: "uppercase",
            color:         font.text_color,
            opacity:       0.5,
            fontFamily:    "system-ui, sans-serif",
          }}>
          {font.category}
        </span>

        {/* Download count — bottom right */}
        {font.downloads > 0 && (
          <span
            className="absolute"
            style={{
              bottom:     "7%",
              right:      "7%",
              fontSize:   "10px",
              color:      font.text_color,
              opacity:    0.35,
              fontFamily: "system-ui, sans-serif",
            }}>
            ↓ {font.downloads >= 1000 ? `${(font.downloads / 1000).toFixed(1)}k` : font.downloads}
          </span>
        )}
      </Link>

      {/* Fav button — outside Link so click doesn't navigate */}
      {onToggleFav && (
        <button
          onClick={e => { e.preventDefault(); onToggleFav(); }}
          className={`absolute top-2 right-2 w-9 h-9 rounded-full flex items-center justify-center
            transition-all duration-200 z-10
            ${isFav
              ? "bg-rose-500 text-white opacity-100"
              : "bg-black/10 text-white/70 opacity-0 group-hover:opacity-100 hover:bg-rose-500 hover:text-white"}`}
          aria-label={isFav ? "Remove from saved" : "Save font"}>
          <span className="text-[13px] leading-none">{isFav ? "♥" : "♡"}</span>
        </button>
      )}
    </div>
  );
}
