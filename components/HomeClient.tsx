"use client";
import { useState, useCallback, useMemo, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useUserFonts } from "@/context/UserFontsContext";
import { useFonts } from "@/context/FontsContext";
import { DBFont } from "@/lib/supabase";

import ParticleCanvas from "@/components/ParticleCanvas";
import Header from "@/components/Header";
import FontCard from "@/components/FontCard";
import AuthModal from "@/components/AuthModal";
import UploadModal from "@/components/UploadModal";
import FontDetailModal from "@/components/FontDetailModal";
import AdModal from "@/components/AdModal";
import AccountModal from "@/components/AccountModal";
import AdminModal from "@/components/AdminModal";

type ModalType = "auth"|"upload"|"fontDetail"|"ad"|"account"|"admin"|null;
type SortKey  = "downloads"|"newest"|"az";

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
    else if (sortBy === "az")     list = [...list].sort((a,b) => a.name.localeCompare(b.name));
    return list;
  }, [dbFonts, searchQuery, activeFilter, sortBy, showFavs, favs]);

  const trendingFonts = useMemo(() =>
    [...dbFonts].sort((a,b) => b.downloads - a.downloads).slice(0,4),
    [dbFonts]
  );

  const handleSearch   = useCallback((q: string) => setSearchQuery(q), []);
  const handleUpload   = () => { if (!user) { setModal("auth"); return; } setModal("upload"); };
  const handleHeroDrop = (e: React.DragEvent) => { e.preventDefault(); handleUpload(); };
  const openFont       = (font: DBFont) => { setSelectedFont(font); setModal("fontDetail"); };
  const close          = () => { setModal(null); setSelectedFont(null); };

  const CATEGORIES = ["All","Sans-Serif","Serif","Monospace","Display","Condensed","Handwriting"];

  return (
    <div className="min-h-screen bg-[#f5f4ff] text-gray-900 overflow-x-hidden">
      <ParticleCanvas />

      <Header onSearch={handleSearch} onLoginClick={() => setModal("auth")}
        onUploadClick={handleUpload} onAdClick={() => setModal("ad")}
        onAdminClick={() => setModal("admin")} onAccountClick={() => setModal("account")} />

      {/* ── Hero ── */}
      <section className="relative z-10 min-h-screen flex items-center justify-center pt-[60px]">
        <div className="text-center px-6 max-w-[700px] w-full">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/25
            rounded-full px-4 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
            <span className="text-violet-600 text-[11px] tracking-[1.5px] font-semibold uppercase">The Open Font Platform</span>
          </div>
          <h1 className="font-black leading-[1.04] tracking-[-2.5px] mb-5 text-gray-900 text-[clamp(42px,9vw,78px)]">
            Your fonts.<br />
            <span className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg,#8ECAE6,#219EBC,#023047,#FFB703,#FB8500)" }}>
              Everywhere.
            </span>
          </h1>
          <p className="text-gray-500 leading-relaxed mb-9 text-[clamp(14px,2vw,17px)]">
            Upload, host &amp; integrate custom fonts into any framework—<br className="hidden sm:block" />
            HTML, React, Vue, Angular, Android, Flutter, and more.
          </p>
          <div className="border-2 border-dashed border-violet-400/40 rounded-2xl px-8 py-10
            cursor-pointer transition-all duration-250 bg-violet-500/5 group
            hover:border-violet-500/70 hover:bg-violet-500/10 hover:scale-[1.01]"
            onClick={handleUpload} onDragOver={e=>e.preventDefault()} onDrop={handleHeroDrop}>
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🔤</div>
            <h3 className="text-gray-700 text-base font-semibold mb-1.5">Drop your font file here to upload</h3>
            <p className="text-gray-400 text-xs">TTF · OTF · WOFF · WOFF2 · Multiple files supported</p>
            {!user && <p className="text-violet-500 text-xs mt-3">Sign in to upload your fonts →</p>}
          </div>
          <div className="flex flex-wrap gap-2 justify-center mt-5">
            {["HTML","CSS","React","Angular","Vue","Next.js","Android","Flutter"].map(fw => (
              <span key={fw} className="bg-white border border-gray-200 text-gray-500 rounded-full px-3 py-1 text-[11px]">{fw}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Ad Strip ── */}
      <AdStrip onPostAd={() => setModal("ad")} />

      {/* ── Trending ── */}
      {!loading && trendingFonts.length > 0 && (
        <section className="relative z-10 max-w-[1160px] mx-auto px-6 py-10">
          <div className="flex items-center gap-3 mb-5">
            <h2 className="font-black text-lg tracking-tight">🔥 Trending</h2>
            <span className="text-gray-400 text-xs">Most downloaded this week</span>
          </div>
          <div className="grid gap-3" style={{ gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))" }}>
            {trendingFonts.map((font, i) => (
              <div key={font.id} className="relative">
                <span className="absolute top-2 left-2 z-10 text-[10px] font-black text-white/80
                  bg-black/25 rounded px-1.5 py-0.5 backdrop-blur-sm">#{i+1}</span>
                <FontCard font={font} onClick={openFont}
                  isFav={favs.includes(font.id)} onToggleFav={() => toggleFav(font.id)} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Category Filter + Sort ── */}
      <div className="sticky top-[60px] z-50 bg-[#f5f4ff]/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-[1160px] mx-auto px-6 py-3 flex items-center gap-3">
          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none flex-1">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => { setActiveFilter(cat); setShowFavs(false); }}
                className={`px-4 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap border transition-all shrink-0
                  ${activeFilter===cat && !showFavs
                    ? "bg-violet-500 text-white border-violet-500 shadow-[0_0_12px_rgba(124,106,247,0.3)]"
                    : "bg-white border-gray-200 text-gray-500 hover:border-violet-400/60 hover:text-gray-700"}`}>
                {cat}
              </button>
            ))}
            <button onClick={() => { setShowFavs(!showFavs); setActiveFilter("All"); }}
              className={`px-4 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap border transition-all shrink-0
                ${showFavs
                  ? "bg-rose-500 text-white border-rose-500"
                  : "bg-white border-gray-200 text-gray-500 hover:border-rose-400/60 hover:text-gray-700"}`}>
              ♥ Favorites {favs.length > 0 && `(${favs.length})`}
            </button>
          </div>
          {/* Sort */}
          <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1 shrink-0">
            {(["downloads","newest","az"] as SortKey[]).map(s => (
              <button key={s} onClick={() => setSortBy(s)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium capitalize transition-all whitespace-nowrap
                  ${sortBy===s ? "bg-gray-900 text-white" : "text-gray-400 hover:text-gray-600"}`}>
                {s === "downloads" ? "🔥 Popular" : s === "newest" ? "✦ Newest" : "A–Z"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Fonts Grid ── */}
      <section className="relative z-10 max-w-[1160px] mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-black tracking-tight text-[clamp(20px,3vw,28px)]">
              {showFavs ? "Your Favorites" : activeFilter === "All" ? "Browse Fonts" : activeFilter}
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              {loading ? "Loading from database…" :
                searchQuery.trim()
                  ? `${filteredFonts.length} result${filteredFonts.length!==1?"s":""} for "${searchQuery.trim()}"`
                  : `${filteredFonts.length} font${filteredFonts.length!==1?"s":""}${showFavs ? " saved" : " · Click any to get integration code"}`}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-3.5" style={{ gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))" }}>
            {Array.from({length:8}).map((_,i) => (
              <div key={i} className="rounded-xl bg-gray-200 animate-pulse min-h-[220px]" />
            ))}
          </div>
        ) : filteredFonts.length > 0 ? (
          <div className="grid gap-3.5" style={{ gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))" }}>
            {filteredFonts.map(font => (
              <FontCard key={font.id} font={font} onClick={openFont}
                isFav={favs.includes(font.id)} onToggleFav={() => toggleFav(font.id)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">{showFavs ? "♥" : "🔍"}</div>
            <p className="text-gray-400 text-base">
              {showFavs ? "No favorites yet — click ♥ on any font to save it" : `No fonts match "${searchQuery}"`}
            </p>
            <button onClick={() => { setSearchQuery(""); setActiveFilter("All"); setShowFavs(false); }}
              className="mt-4 text-violet-500 text-sm hover:text-violet-600 underline underline-offset-2">
              Clear filter
            </button>
          </div>
        )}

        {/* User's own fonts */}
        {userFonts.length > 0 && (
          <div className="mt-16">
            <h3 className="text-gray-900 font-bold text-lg mb-5">Your Uploaded Fonts</h3>
            <div className="grid gap-3.5" style={{ gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))" }}>
              {userFonts.map(uf => (
                <FontCard key={uf.id} font={uf} onClick={openFont}
                  isFav={favs.includes(uf.id)} onToggleFav={() => toggleFav(uf.id)} />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-gray-200 py-8 px-6">
        <div className="max-w-[1100px] mx-auto flex flex-wrap justify-between items-center gap-5">
          <img src="/logo.svg" alt="FontsVerse" width={120} height={20} />
          <div className="flex flex-wrap gap-6">
            {["About","Pricing","Contact","Privacy","Terms"].map(l => (
              <a key={l} href={`/${l.toLowerCase()}`} className="text-gray-400 hover:text-gray-600 text-xs transition-colors">{l}</a>
            ))}
          </div>
        </div>
        <p className="text-center text-gray-300 text-[11px] mt-6">© 2026 FontsVerse</p>
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
    <div className="relative z-10 bg-amber-50 border-y border-amber-100 py-3 px-6
      flex items-center justify-center gap-3 flex-wrap">
      <span className="bg-amber-100 text-amber-700 border border-amber-200 rounded px-2 py-0.5 text-[10px] font-bold tracking-widest">AD</span>
      {ad ? (
        <p className="text-gray-500 text-sm">
          <strong className="text-gray-800">{ad.title}</strong>
          {ad.tagline && ` — ${ad.tagline} `}
          <a href={ad.destination_url} target="_blank" rel="noopener noreferrer"
            className="text-violet-500 hover:text-violet-600 transition-colors ml-1">Learn more →</a>
        </p>
      ) : (
        <p className="text-gray-500 text-sm">
          <strong className="text-gray-800">Your ad here</strong> — reach thousands of designers &amp; developers.{" "}
          <button className="text-violet-500 hover:text-violet-600 transition-colors" onClick={onPostAd}>Post an Ad →</button>
        </p>
      )}
    </div>
  );
}
