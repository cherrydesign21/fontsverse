"use client";
import { useFonts } from "@/context/FontsContext";
import { getFontFaceCSS } from "@/lib/fonts";

// Injects @font-face for every public font so FontCard renders the actual typeface
export default function FontLoader() {
  const { fonts } = useFonts();
  // Only pre-load the first 20 fonts (above-fold + marquee); cards lazy-load the rest
  const css = fonts.slice(0, 20).map(getFontFaceCSS).filter(Boolean).join("\n");
  if (!css) return null;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
