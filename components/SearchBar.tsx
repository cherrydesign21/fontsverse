"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useFonts } from "@/context/FontsContext";
import { DBFont } from "@/lib/supabase";

interface Props { onSearch: (q: string) => void; compact?: boolean; }

export default function SearchBar({ onSearch, compact }: Props) {
  const { fonts } = useFonts();
  const [query, setQuery]           = useState("");
  const [suggestions, setSuggestions] = useState<DBFont[]>([]);
  const [open, setOpen]             = useState(false);
  const [hi, setHi]                 = useState(-1);
  const inputRef   = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleChange = useCallback((val: string) => {
    setQuery(val);
    const q = val.trim().toLowerCase();
    if (!q) { setSuggestions([]); setOpen(false); setHi(-1); onSearch(""); return; }
    const matches = fonts.filter(f =>
      f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q)
    ).slice(0, 8);
    setSuggestions(matches);
    setOpen(matches.length > 0);
    setHi(-1);
    onSearch(val.trim());
  }, [fonts, onSearch]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const pick = useCallback((name: string) => {
    setQuery(name); setOpen(false); setHi(-1); onSearch(name);
  }, [onSearch]);

  const clear = useCallback(() => {
    setQuery(""); setSuggestions([]); setOpen(false); setHi(-1); onSearch("");
    inputRef.current?.focus();
  }, [onSearch]);

  const keyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setHi(h => Math.min(h+1, suggestions.length-1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHi(h => Math.max(h-1, -1)); }
    else if (e.key === "Enter") { e.preventDefault(); if (hi>=0 && suggestions[hi]) pick(suggestions[hi].name); else setOpen(false); }
    else if (e.key === "Escape") { setOpen(false); setHi(-1); }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <svg className="absolute left-5 w-4 h-4 text-[#999] pointer-events-none shrink-0"
          fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input ref={inputRef} value={query}
          onChange={e => handleChange(e.target.value)}
          onKeyDown={keyDown}
          onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
          placeholder="Find your font"
          className="w-full pl-11 pr-8 h-[50px] rounded-full outline-none text-[15px] font-light text-gray-800 placeholder-[#666] transition-all focus:ring-1 focus:ring-[#FFB703]/60"
          style={{ background: "#f9f9f9", border: "1px solid #ddd", fontFamily: "Outfit, system-ui, sans-serif" }}
          autoComplete="off" spellCheck={false} />
        {query && (
          <button onClick={clear}
            className="absolute right-2.5 text-gray-400 hover:text-gray-600 transition-colors text-xs"
            tabIndex={-1}>✕</button>
        )}
      </div>

      {open && suggestions.length > 0 && (
        <div className="absolute top-full mt-1.5 left-0 right-0 z-9999
          bg-white border border-gray-200 rounded-xl overflow-hidden
          shadow-[0_8px_24px_rgba(0,0,0,0.10)]">
          <div className="px-3 py-2 border-b border-gray-100">
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
              {suggestions.length} font{suggestions.length!==1?"s":""} found
            </span>
          </div>
          {suggestions.map((font, i) => (
            <button key={font.id}
              onMouseDown={e => { e.preventDefault(); pick(font.name); }}
              onMouseEnter={() => setHi(i)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors
                ${hi===i ? "bg-amber-50/60" : "hover:bg-gray-50"}`}>
              <div className="w-8 h-8 rounded-md shrink-0 flex items-center justify-center"
                style={{ background: font.bg_color }}>
                <span className="text-[11px] font-bold" style={{ color: font.text_color }}>
                  {font.name.slice(0,2)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-gray-900 font-medium truncate">
                  <Hl text={font.name} q={query} />
                </p>
                <p className="text-[11px] text-gray-400">{font.category}</p>
              </div>
              <span className={`text-amber-500 text-xs transition-opacity ${hi===i?"opacity-100":"opacity-0"}`}>↵</span>
            </button>
          ))}
          {query.trim() && (
            <button onMouseDown={e => { e.preventDefault(); setOpen(false); onSearch(query.trim()); }}
              className="w-full px-3 py-2.5 text-left text-[12px] text-amber-600
                hover:bg-amber-50/40 border-t border-gray-100 transition-colors">
              See all results for &ldquo;{query}&rdquo; →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Hl({ text, q }: { text: string; q: string }) {
  const qt = q.trim();
  if (!qt) return <>{text}</>;
  const i = text.toLowerCase().indexOf(qt.toLowerCase());
  if (i === -1) return <>{text}</>;
  return <>{text.slice(0,i)}<mark className="bg-amber-100 text-amber-700 rounded px-0.5 not-italic">{text.slice(i,i+qt.length)}</mark>{text.slice(i+qt.length)}</>;
}
