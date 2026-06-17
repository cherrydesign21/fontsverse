"use client";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { useFonts } from "@/context/FontsContext";
import { useAuth } from "@/context/AuthContext";
import { getFontFaceCSS } from "@/lib/fonts";
import type { DBFont } from "@/lib/supabase";
import Header from "./Header";
import Footer from "./Footer";
import AuthModal from "./AuthModal";
import UploadModal from "./UploadModal";
import AdModal from "./AdModal";
import AccountModal from "./AccountModal";
import AdminModal from "./AdminModal";

type Modal  = "auth"|"upload"|"ad"|"account"|"admin"|null;
type SortKey = "downloads"|"newest"|"az";

const AMBER_GRAD = "linear-gradient(122deg, #FFB703 5%, #FB8500 105%)";
const CATS = ["All","Sans-Serif","Serif","Monospace","Display","Condensed","Handwriting"];

const CLASSIFICATION = [
  { label: "Sans Serif", font: "system-ui, sans-serif",              cat: "Sans-Serif"  },
  { label: "Serif",      font: "'Playfair Display', Georgia, serif",  cat: "Serif"       },
  { label: "Slab Serif", font: "'Slabo 27px', Georgia, serif",        cat: "Display"     },
  { label: "Script",     font: "'Dancing Script', cursive",            cat: "Handwriting" },
  { label: "Mono",       font: "'Roboto Mono', monospace",             cat: "Monospace"   },
  { label: "Hand",       font: "'Dancing Script', cursive",            cat: "Handwriting" },
];

/* ─── per-row component with lazy @font-face injection ─── */
function FontListRow({
  font, previewText, previewSize,
}: { font: DBFont; previewText: string; previewSize: number }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = rowRef.current;
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
      setReady(true);
      obs.disconnect();
    }, { rootMargin: "200px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, [font.id]);

  return (
    <div ref={rowRef} className="mb-4">
      {/* label row */}
      <div className="flex items-center gap-3 mb-2 px-0.5">
        <Link href={`/fonts/${font.slug}`}
          className="text-[30px] font-normal text-[#333] hover:text-[#023047] transition-colors leading-none"
          style={{ fontFamily: "Outfit, system-ui, sans-serif" }}>
          {font.name}
        </Link>
        <div className="w-px h-3 bg-[#999] shrink-0" />
        <span className="text-[14px] tracking-[1.12px] uppercase text-[#333]"
          style={{ fontFamily: "system-ui, sans-serif" }}>
          {font.category}
        </span>
      </div>

      {/* preview card */}
      <Link href={`/fonts/${font.slug}`} className="block">
        <div className="bg-white rounded-[8px] h-[100px] flex items-center px-5 overflow-hidden cursor-pointer
          hover:shadow-md transition-shadow">
          <span style={{
            fontFamily:    font.font_family,
            fontWeight:    font.font_weight,
            fontStyle:     font.font_style,
            fontSize:      previewSize,
            lineHeight:    1.2,
            whiteSpace:    "nowrap",
            display:       "block",
            background:    "linear-gradient(to right, #111 50%, rgba(17,17,17,0) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            opacity: ready ? 1 : 0.35,
            transition: "opacity 0.3s",
          }}>
            {previewText || "The quick brown fox jumps over the lazy dog"}
          </span>
        </div>
      </Link>

      {/* divider */}
      <div className="h-px bg-[#e1e1e1] mt-4" />
    </div>
  );
}

/* ─── main component ─── */
export default function FontsPageClient() {
  const { fonts, loading } = useFonts();
  const { user }           = useAuth();

  const [modal, setModal]           = useState<Modal>(null);
  const [category, setCategory]     = useState("All");
  const [previewText, setPreviewText] = useState("Discover thoughtfully crafted products");
  const [previewSize, setPreviewSize] = useState(40);
  const [query, setQuery]           = useState("");
  const [sortBy, setSortBy]         = useState<SortKey>("downloads");
  const [showSort, setShowSort]     = useState(false);
  const [langFilter, setLangFilter] = useState("All Scripts");
  const [techFilter, setTechFilter] = useState("All Formats");
  const [showLang, setShowLang]     = useState(false);
  const [showTech, setShowTech]     = useState(false);
  const sortRef                     = useRef<HTMLDivElement>(null);
  const langRef                     = useRef<HTMLDivElement>(null);
  const techRef                     = useRef<HTMLDivElement>(null);
  const close = () => setModal(null);

  useEffect(() => {
    if (!showLang) return;
    const h = (e: MouseEvent) => { if (langRef.current && !langRef.current.contains(e.target as Node)) setShowLang(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [showLang]);

  useEffect(() => {
    if (!showTech) return;
    const h = (e: MouseEvent) => { if (techRef.current && !techRef.current.contains(e.target as Node)) setShowTech(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [showTech]);

  // close sort dropdown on outside click
  useEffect(() => {
    if (!showSort) return;
    const h = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setShowSort(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [showSort]);

  // load Google Fonts for classification "H" previews
  useEffect(() => {
    const link = document.createElement("link");
    link.rel  = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display&family=Dancing+Script&family=Roboto+Mono&family=Slabo+27px&display=swap";
    document.head.appendChild(link);
    return () => { try { document.head.removeChild(link); } catch {} };
  }, []);

  const LANG_OPTS  = ["All Scripts", "Latin", "Extended Latin", "Cyrillic", "Arabic", "CJK"];
  const TECH_OPTS  = ["All Formats", "Has WOFF2", "Has TTF", "Has WOFF"];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = fonts.filter(f => {
      const mq = !q || f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q);
      const mc = category === "All" || f.category === category;
      const ml = langFilter === "All Scripts" || langFilter === "Latin" || langFilter === "Extended Latin";
      const mt = techFilter === "All Formats"
        || (techFilter === "Has WOFF2" && !!f.file_woff2)
        || (techFilter === "Has TTF"   && !!f.file_ttf)
        || (techFilter === "Has WOFF"  && !!f.file_woff);
      return mq && mc && ml && mt;
    });
    if (sortBy === "downloads") list = [...list].sort((a,b) => b.downloads - a.downloads);
    else if (sortBy === "newest") list = [...list].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    else list = [...list].sort((a,b) => a.name.localeCompare(b.name));
    return list;
  }, [fonts, query, category, sortBy]);

  const handleSearch = useCallback((q: string) => setQuery(q), []);
  const SORT_LABELS: [SortKey, string][] = [["downloads","Popular"],["newest","Newest"],["az","A–Z"]];

  return (
    <div className="min-h-screen bg-[#f5f5f5]" style={{ fontFamily: "Outfit, system-ui, sans-serif" }}>
      <Header onSearch={handleSearch} onLoginClick={() => setModal("auth")}
        onUploadClick={() => user ? setModal("upload") : setModal("auth")}
        onAdClick={() => setModal("ad")} onAdminClick={() => setModal("admin")}
        onAccountClick={() => setModal("account")} />

      <div className="flex" style={{ paddingTop: 80, minHeight: "100vh" }}>

        {/* ── Sidebar ── */}
        <aside
          className="shrink-0 overflow-y-auto"
          style={{
            width: 280, background: "#023047",
            position: "sticky", top: 80,
            height: "calc(100vh - 80px)",
          }}>

          {/* preview textarea */}
          <div className="p-5">
            <textarea
              value={previewText}
              onChange={e => setPreviewText(e.target.value)}
              placeholder="Type Something..."
              rows={3}
              className="w-full text-[16px] font-light resize-none outline-none placeholder:text-white/50 leading-[20px] rounded-[6px] p-4"
              style={{
                fontFamily: "Outfit, system-ui, sans-serif",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "#fff",
              }}
            />
          </div>

          {/* font size */}
          <div className="px-5 pb-5 flex items-center gap-3">
            <div className="flex items-center justify-center rounded-[6px] h-10 px-3 shrink-0"
              style={{ width: 95, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}>
              <span className="text-white text-[16px] font-light">{previewSize}px</span>
            </div>
            <input type="range" min={12} max={96} value={previewSize}
              onChange={e => setPreviewSize(Number(e.target.value))}
              className="flex-1" style={{ accentColor: "#fff" }} />
          </div>

          <div className="h-px bg-white/20" />

          {/* Filter — Language */}
          <div className="p-5 relative" ref={langRef}>
            <p className="text-white text-[16px] font-light mb-4">Language</p>
            <button onClick={() => { setShowLang(!showLang); setShowTech(false); }}
              className="w-full flex items-center justify-between gap-3 h-10 rounded-[6px] px-4 text-white text-[16px] font-light text-left"
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}>
              <span className="truncate">{langFilter}</span>
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className={`shrink-0 transition-transform ${showLang ? "rotate-180" : ""}`}>
                <path d="M1 1l4 4 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {showLang && (
              <div className="absolute left-5 right-5 top-full -mt-2 z-50 bg-white rounded-lg shadow-xl overflow-hidden">
                {LANG_OPTS.map(opt => (
                  <button key={opt} onClick={() => { setLangFilter(opt); setShowLang(false); }}
                    className={`w-full text-left px-4 py-2.5 text-[14px] transition-colors
                      ${langFilter === opt ? "bg-[#023047] text-white font-medium" : "text-gray-700 hover:bg-gray-50"}`}>
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="h-px bg-white/20" />

          {/* Font Technology */}
          <div className="p-5 relative" ref={techRef}>
            <p className="text-white text-[16px] font-light mb-4">Font Technology</p>
            <button onClick={() => { setShowTech(!showTech); setShowLang(false); }}
              className="w-full flex items-center justify-between gap-3 h-10 rounded-[6px] px-4 text-white text-[16px] font-light text-left"
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}>
              <span className="truncate">{techFilter}</span>
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className={`shrink-0 transition-transform ${showTech ? "rotate-180" : ""}`}>
                <path d="M1 1l4 4 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {showTech && (
              <div className="absolute left-5 right-5 top-full -mt-2 z-50 bg-white rounded-lg shadow-xl overflow-hidden">
                {TECH_OPTS.map(opt => (
                  <button key={opt} onClick={() => { setTechFilter(opt); setShowTech(false); }}
                    className={`w-full text-left px-4 py-2.5 text-[14px] transition-colors
                      ${techFilter === opt ? "bg-[#023047] text-white font-medium" : "text-gray-700 hover:bg-gray-50"}`}>
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="h-px bg-white/20" />

          {/* Classification */}
          <div className="p-5 pb-8">
            <p className="text-white text-[16px] font-light mb-5">Classification</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "9px 9px", rowGap: 30 }}>
              {CLASSIFICATION.map(cls => (
                <button key={cls.label} onClick={() => setCategory(cls.cat)}
                  className="flex flex-col items-center gap-2.5">
                  <div className="w-full h-10 flex items-center justify-center rounded-[6px] transition-all"
                    style={{
                      background: category === cls.cat ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)",
                      border:     category === cls.cat ? "1px solid rgba(255,255,255,0.7)" : "1px solid rgba(255,255,255,0.2)",
                    }}>
                    <span className="text-white text-[18px]" style={{ fontFamily: cls.font }}>H</span>
                  </div>
                  <span className="text-white text-[13px] text-center leading-tight" style={{ fontFamily: "Outfit, system-ui, sans-serif" }}>
                    {cls.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 min-w-0 px-6 py-6">

          {/* Top filter + sort */}
          <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
            <div className="flex gap-2 flex-wrap">
              {CATS.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)}
                  className="px-5 py-3 rounded-[6px] text-[16px] border transition-all"
                  style={{
                    background:  category === cat ? "#023047" : "transparent",
                    color:       category === cat ? "#fff"    : "#666",
                    borderColor: "#023047",
                  }}>
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex gap-2 shrink-0 relative" ref={sortRef}>
              <button onClick={() => setShowSort(!showSort)}
                className="flex items-center gap-2 h-10 rounded-[6px] border border-[#999] text-[#666] text-[16px] font-light bg-white px-[18px]">
                <svg width="19" height="11" viewBox="0 0 19 11" fill="none">
                  <path d="M1 1h17M4 5.5h11M7.5 10h4" stroke="#666" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                Sorting
              </button>
              {showSort && (
                <div className="absolute top-11 right-[calc(100%-120px)] bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 min-w-[130px]">
                  {SORT_LABELS.map(([key, label]) => (
                    <button key={key} onClick={() => { setSortBy(key); setShowSort(false); }}
                      className={`w-full text-left px-4 py-2 text-[14px] hover:bg-gray-50 transition-colors ${sortBy===key?"text-[#023047] font-semibold":"text-[#333]"}`}>
                      {label}
                    </button>
                  ))}
                </div>
              )}
              <button className="flex items-center gap-2 h-10 rounded-[6px] border border-[#999] text-[#666] text-[16px] font-light bg-white px-[18px]">
                <svg width="17" height="14" viewBox="0 0 17 14" fill="none">
                  <path d="M1 2h15M1 7h10M1 12h6" stroke="#666" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                Filter
              </button>
            </div>
          </div>

          {/* Font list */}
          {loading ? (
            <div className="space-y-6">
              {Array.from({length: 6}).map((_,i) => (
                <div key={i}>
                  <div className="h-5 bg-gray-200 rounded w-48 mb-2 animate-pulse" />
                  <div className="h-[100px] bg-white rounded-[8px] animate-pulse" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-gray-400 mb-3">No fonts match your selection</p>
              <button onClick={() => setCategory("All")}
                className="text-sm text-[#023047] underline underline-offset-2">
                Clear filters
              </button>
            </div>
          ) : (
            filtered.map(font => (
              <FontListRow key={font.id} font={font} previewText={previewText} previewSize={previewSize} />
            ))
          )}
        </main>
      </div>

      <Footer />

      {modal==="auth"    && <AuthModal onClose={close} />}
      {modal==="upload"  && <UploadModal onClose={close} onAuthRequired={() => setModal("auth")} />}
      {modal==="ad"      && <AdModal onClose={close} />}
      {modal==="account" && <AccountModal onClose={close} />}
      {modal==="admin"   && <AdminModal onClose={close} />}
    </div>
  );
}
