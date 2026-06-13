"use client";
import { useState, useCallback, useMemo, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useUserFonts } from "@/context/UserFontsContext";
import { useFonts } from "@/context/FontsContext";
import { DBFont } from "@/lib/supabase";

import Header    from "@/components/Header";
import FontCard  from "@/components/FontCard";
import FontLoader from "@/components/FontLoader";
import AuthModal from "@/components/AuthModal";
import UploadModal from "@/components/UploadModal";
import FontDetailModal from "@/components/FontDetailModal";
import AdModal   from "@/components/AdModal";
import AccountModal from "@/components/AccountModal";
import AdminModal from "@/components/AdminModal";

type ModalType = "auth"|"upload"|"fontDetail"|"ad"|"account"|"admin"|null;
type SortKey   = "downloads"|"newest"|"az";

const LOGO_GRADIENT = "linear-gradient(135deg,#8ECAE6,#219EBC,#023047,#FFB703,#FB8500)";

function useFavorites() {
  const [favs, setFavs] = useState<string[]>([]);
  useEffect(() => {
    try { setFavs(JSON.parse(localStorage.getItem("fv_favorites") || "[]")); } catch {}
  }, []);
  const toggle = useCallback((id: string) => {
    setFavs(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem("fv_favorites", JSON.stringify(next));
      return next;
    });
  }, []);
  return { favs, toggle };
}

export default function HomeClient() {
  const { user }                    = useAuth();
  const { fonts: dbFonts, loading } = useFonts();
  const { fonts: userFonts }        = useUserFonts();
  const { favs, toggle: toggleFav } = useFavorites();

  const [modal, setModal]               = useState<ModalType>(null);
  const [selectedFont, setSelectedFont] = useState<DBFont|null>(null);
  const [searchQuery, setSearchQuery]   = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [sortBy, setSortBy]             = useState<SortKey>("downloads");
  const [showFavs, setShowFavs]         = useState(false);

  const filteredFonts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = dbFonts.filter(f => {
      const matchSearch = !q || f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q);
      const matchFilter = activeFilter === "All" || f.category === activeFilter;
      const matchFavs   = !showFavs || favs.includes(f.id);
      return matchSearch && matchFilter && matchFavs;
    });
    if (sortBy === "downloads") list = [...list].sort((a,b) => b.downloads - a.downloads);
    else if (sortBy === "newest") list = [...list].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    else if (sortBy === "az")    list = [...list].sort((a,b) => a.name.localeCompare(b.name));
    return list;
  }, [dbFonts, searchQuery, activeFilter, sortBy, showFavs, favs]);

  const handleSearch = useCallback((q: string) => setSearchQuery(q), []);
  const handleUpload = () => { if (!user) { setModal("auth"); return; } setModal("upload"); };
  const openFont     = (font: DBFont) => { setSelectedFont(font); setModal("fontDetail"); };
  const close        = () => { setModal(null); setSelectedFont(null); };

  const CATEGORIES = ["All","Sans-Serif","Serif","Monospace","Display","Condensed","Handwriting"];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <FontLoader />

      <Header onSearch={handleSearch} onLoginClick={() => setModal("auth")}
        onUploadClick={handleUpload} onAdClick={() => setModal("ad")}
        onAdminClick={() => setModal("admin")} onAccountClick={() => setModal("account")} />

      {/* ── Hero ── */}
      <section className="max-w-[1160px] mx-auto px-6 pt-32 pb-16">
        <div className="max-w-[720px]">
          <p className="text-[13px] font-semibold tracking-[3px] uppercase text-gray-400 mb-5">
            Open Font Platform
          </p>
          <h1 className="text-[clamp(48px,8vw,88px)] font-black leading-[0.96] tracking-[-3px] mb-7 text-gray-950">
            Fonts that work<br />
            <span className="bg-clip-text text-transparent"
              style={{ backgroundImage: LOGO_GRADIENT }}>
              everywhere.
            </span>
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed mb-9 max-w-[520px]">
            Upload and host your own fonts. Get integration code for any framework in seconds.
          </p>
          <div className="flex flex-wrap gap-3">
            <button onClick={handleUpload}
              className="px-6 py-3 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-85"
              style={{ background: LOGO_GRADIENT }}>
              Upload a font
            </button>
            <a href="#browse"
              className="px-6 py-3 rounded-xl text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:border-gray-400 transition-colors">
              Browse fonts
            </a>
          </div>
        </div>
      </section>

      {/* ── Font Marquee ── */}
      {dbFonts.length > 0 && (
        <div className="border-y border-gray-100 py-3 overflow-hidden bg-gray-50/50">
          <div className="flex animate-marquee whitespace-nowrap gap-8 w-max">
            {[...dbFonts, ...dbFonts].map((f, i) => (
              <button key={`${f.id}-${i}`}
                onClick={() => openFont(f)}
                className="text-[15px] font-medium text-gray-400 hover:text-gray-900 transition-colors shrink-0"
                style={{ fontFamily: f.font_family }}>
                {f.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Ad Strip ── */}
      <AdStrip onPostAd={() => setModal("ad")} />

      {/* ── Browse ── */}
      <section id="browse" className="max-w-[1160px] mx-auto px-6 pt-16 pb-24">

        {/* Filter + Sort bar */}
        <div className="sticky top-[60px] z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 -mx-6 px-6 py-3 mb-8">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none flex-1">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => { setActiveFilter(cat); setShowFavs(false); }}
                  className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap transition-all shrink-0
                    ${activeFilter===cat && !showFavs
                      ? "bg-gray-900 text-white"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"}`}>
                  {cat}
                </button>
              ))}
              <button onClick={() => { setShowFavs(!showFavs); setActiveFilter("All"); }}
                className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap transition-all shrink-0
                  ${showFavs ? "bg-rose-50 text-rose-600 border border-rose-200" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"}`}>
                ♥ Saved {favs.length > 0 && `(${favs.length})`}
              </button>
            </div>
            <div className="flex gap-0.5 bg-gray-100 rounded-lg p-1 shrink-0">
              {([["downloads","Popular"],["newest","Newest"],["az","A–Z"]] as [SortKey,string][]).map(([s,label]) => (
                <button key={s} onClick={() => setSortBy(s)}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all whitespace-nowrap
                    ${sortBy===s ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid heading */}
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {showFavs ? "Saved fonts" : activeFilter === "All" ? "All fonts" : activeFilter}
          </h2>
          <p className="text-gray-400 text-sm">
            {loading ? "Loading…" :
              searchQuery.trim()
                ? `${filteredFonts.length} result${filteredFonts.length!==1?"s":""} for "${searchQuery.trim()}"`
                : `${filteredFonts.length} font${filteredFonts.length!==1?"s":""}`}
          </p>
        </div>

        {/* Font grid */}
        {loading ? (
          <div className="grid gap-3" style={{ gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))" }}>
            {Array.from({length:12}).map((_,i) => (
              <div key={i} className="rounded-2xl bg-gray-100 animate-pulse" style={{ aspectRatio:"1/1" }} />
            ))}
          </div>
        ) : filteredFonts.length > 0 ? (
          <div className="grid gap-3" style={{ gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))" }}>
            {filteredFonts.map(font => (
              <FontCard key={font.id} font={font} onClick={openFont}
                isFav={favs.includes(font.id)} onToggleFav={() => toggleFav(font.id)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 border border-dashed border-gray-200 rounded-2xl">
            <p className="text-gray-400 mb-1">
              {showFavs ? "No saved fonts yet" : `No fonts match "${searchQuery}"`}
            </p>
            <p className="text-gray-300 text-sm">
              {showFavs ? "Click the heart on any font to save it" : "Try a different search or category"}
            </p>
            <button onClick={() => { setSearchQuery(""); setActiveFilter("All"); setShowFavs(false); }}
              className="mt-4 text-sm text-gray-500 underline underline-offset-2 hover:text-gray-800">
              Clear filters
            </button>
          </div>
        )}

        {/* User's own fonts */}
        {userFonts.length > 0 && (
          <div className="mt-20 pt-12 border-t border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Your fonts</h3>
            <div className="grid gap-3" style={{ gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))" }}>
              {userFonts.map(uf => (
                <FontCard key={uf.id} font={uf} onClick={openFont}
                  isFav={favs.includes(uf.id)} onToggleFav={() => toggleFav(uf.id)} />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 py-10 px-6">
        <div className="max-w-[1160px] mx-auto flex flex-wrap justify-between items-center gap-6">
          <img src="/logo.svg" alt="FontsVerse" width={120} height={20} />
          <div className="flex flex-wrap gap-6 text-[13px] text-gray-400">
            {["About","Pricing","Contact","Privacy","Terms"].map(l => (
              <a key={l} href={`/${l.toLowerCase()}`} className="hover:text-gray-800 transition-colors">{l}</a>
            ))}
          </div>
        </div>
        <p className="text-center text-gray-300 text-[11px] mt-8">© 2026 FontsVerse</p>
      </footer>

      {modal==="auth"       && <AuthModal onClose={close} />}
      {modal==="upload"     && <UploadModal onClose={close} onAuthRequired={() => setModal("auth")} />}
      {modal==="fontDetail" && selectedFont && <FontDetailModal font={selectedFont} onClose={close} />}
      {modal==="ad"         && <AdModal onClose={close} />}
      {modal==="account"    && <AccountModal onClose={close} />}
      {modal==="admin"      && <AdminModal onClose={close} />}
    </div>
  );
}

function AdStrip({ onPostAd }: { onPostAd: () => void }) {
  const [ad, setAd] = useState<{title:string;tagline?:string;destination_url:string}|null>(null);
  useEffect(() => {
    fetch("/api/ads").then(r=>r.json()).then(d => {
      if (d.ads?.length > 0) setAd(d.ads[0]);
    }).catch(() => {});
  }, []);

  return (
    <div className="border-y border-amber-100 bg-amber-50 py-2.5 px-6 flex items-center justify-center gap-3">
      <span className="text-[10px] font-bold tracking-[2px] uppercase text-amber-600 border border-amber-200 bg-white rounded px-2 py-0.5 shrink-0">Ad</span>
      {ad ? (
        <p className="text-[13px] text-gray-600">
          <strong className="text-gray-900 font-semibold">{ad.title}</strong>
          {ad.tagline && ` — ${ad.tagline}`}{" "}
          <a href={ad.destination_url} target="_blank" rel="noopener noreferrer"
            className="text-amber-700 font-medium hover:underline">Learn more →</a>
        </p>
      ) : (
        <p className="text-[13px] text-gray-500">
          <span className="text-gray-800 font-medium">Advertise here</span> — reach designers &amp; developers.{" "}
          <button onClick={onPostAd} className="text-amber-700 font-medium hover:underline">Get in touch →</button>
        </p>
      )}
    </div>
  );
}
