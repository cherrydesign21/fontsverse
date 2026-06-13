"use client";
import { useState, useEffect, useRef } from "react";
import { DBFont } from "@/lib/supabase";
import { getFontFaceCSS } from "@/lib/fonts";

interface Props {
  font: DBFont;
  onClick: (f: DBFont) => void;
  isFav?: boolean;
  onToggleFav?: () => void;
}

export default function FontCard({ font, onClick, isFav = false, onToggleFav }: Props) {
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Lazy-inject @font-face when the card enters the viewport
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      const styleId = `fv-ff-${font.id}`;
      if (!document.getElementById(styleId)) {
        const css = getFontFaceCSS(font);
        if (css) {
          const s = document.createElement("style");
          s.id = styleId;
          s.textContent = css;
          document.head.appendChild(s);
        }
      }
      obs.disconnect();
    }, { rootMargin: "300px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, [font.id]);

  return (
    <div
      ref={cardRef}
      className="rounded-2xl overflow-hidden cursor-pointer flex flex-col transition-all duration-300 relative group"
      style={{
        background: font.bg_color,
        aspectRatio: "1 / 1",
        transform: hovered ? "translateY(-6px) scale(1.02)" : "translateY(0) scale(1)",
        boxShadow: hovered
          ? `0 20px 48px ${font.bg_color}99`
          : "0 2px 12px rgba(0,0,0,0.10)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onClick(font)}
    >
      {/* Favorite button — 44×44px touch target */}
      {onToggleFav && (
        <button
          onClick={e => { e.stopPropagation(); onToggleFav(); }}
          className={`absolute top-1 right-1 w-11 h-11 rounded-full flex items-center justify-center
            transition-all duration-200 z-10
            ${isFav
              ? "bg-rose-500 text-white opacity-100"
              : "bg-black/10 text-white/60 opacity-0 group-hover:opacity-100 hover:bg-rose-500 hover:text-white"}`}
          aria-label={isFav ? "Remove from saved" : "Save font"}
          title={isFav ? "Remove from saved" : "Save font"}>
          <span className="text-[13px] leading-none">{isFav ? "♥" : "♡"}</span>
        </button>
      )}

      {/* Font name rendered in its own typeface */}
      <div className="flex-1 flex items-center justify-center px-5 py-5">
        <span
          className="text-center leading-tight block transition-transform duration-300"
          style={{
            color: font.text_color,
            fontFamily: font.font_family,
            fontWeight: font.font_weight,
            fontStyle: font.font_style,
            letterSpacing: font.letter_spacing,
            fontSize: "clamp(18px, 3.5vw, 30px)",
            transform: hovered ? "scale(1.05)" : "scale(1)",
          }}
        >
          {font.name}
        </span>
      </div>

      {/* Category + download count */}
      <div className="px-4 pb-4 flex items-end justify-between">
        <span
          className="text-[9px] tracking-[2px] font-semibold uppercase"
          style={{ color: font.text_color, opacity: 0.5 }}
        >
          {font.category}
        </span>
        {font.downloads > 0 && (
          <span className="text-[9px]" style={{ color: font.text_color, opacity: 0.35 }}>
            ↓ {font.downloads >= 1000 ? `${(font.downloads / 1000).toFixed(1)}k` : font.downloads}
          </span>
        )}
      </div>
    </div>
  );
}
