"use client";
import { useState } from "react";
import { DBFont } from "@/lib/supabase";

interface Props { font: DBFont; onClick: (f: DBFont) => void; }

export default function FontCard({ font, onClick }: Props) {
  const [hovered, setHovered] = useState(false);
  return (
    <div className="rounded-xl overflow-hidden cursor-pointer border border-gray-200
      flex flex-col min-h-40 transition-all duration-300"
      style={{
        background: font.bg_color,
        transform: hovered ? "translateY(-7px) scale(1.025)" : "translateY(0) scale(1)",
        boxShadow: hovered ? `0 22px 50px ${font.bg_color}88` : "0 2px 12px rgba(0,0,0,0.08)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onClick(font)}>
      <div className="flex-1 flex items-center justify-center px-3 py-4">
        <span className="text-center leading-tight block transition-transform duration-300"
          style={{
            color: font.text_color,
            fontFamily: font.font_family,
            fontWeight: font.font_weight,
            fontStyle: font.font_style,
            letterSpacing: font.letter_spacing,
            fontSize: "clamp(17px, 3vw, 27px)",
            transform: hovered ? "scale(1.04)" : "scale(1)",
          }}>
          {font.name}
        </span>
      </div>
      <div className="px-3.5 py-2.5 flex justify-between items-center"
        style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <span className="text-[10px] tracking-widest text-white/40">{font.category.toUpperCase()}</span>
        <span className="text-[10px] tracking-tight transition-opacity duration-200"
          style={{ color: font.text_color, opacity: hovered ? 1 : 0 }}>
          Get Code →
        </span>
      </div>
    </div>
  );
}
