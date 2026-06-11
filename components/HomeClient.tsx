"use client";
import { useState, useCallback, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useUserFonts } from "@/context/UserFontsContext";
import { useFonts } from "@/context/FontsContext";
import { useNotif } from "@/context/NotifContext";
import { DBFont } from "@/lib/supabase";
import { FRAMEWORKS, getSnippet } from "@/lib/fonts";

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

export default function HomeClient() {
  const { user }               = useAuth();
  const { fonts: dbFonts, loading } = useFonts();
  const { fonts: userFonts }   = useUserFonts();
  const { notify }             = useNotif();

  const [modal, setModal]           = useState<ModalType>(null);
  const [selectedFont, setSelectedFont] = useState<DBFont|null>(null);
  const [searchQuery, setSearchQuery]   = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredFonts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return dbFonts.filter(f => {
      const matchSearch = !q || f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q);
      const matchFilter = activeFilter === "All" || f.category === activeFilter;
      return matchSearch && matchFilter;
    });
  }, [dbFonts, searchQuery, activeFilter]);

  const handleSearch   = useCallback((q: string) => setSearchQuery(q), []);
  const handleUpload   = () => { if (!user) { setModal("auth"); return; } setModal("upload"); };
  const handleHeroDrop = (e: React.DragEvent) => { e.preventDefault(); handleUpload(); };
  const openFont       = (font: DBFont) => { setSelectedFont(font); setModal("fontDetail"); };
  const close          = () => { setModal(null); setSelectedFont(null); };

  const CATEGORIES = ["All","Sans-Serif","Serif","Monospace","Display","Condensed","Handwriting"];

  return (
    <div className="min-h-screen bg-[#07070f] text-white overflow-x-hidden">
      <ParticleCanvas />

      <Header onSearch={handleSearch} onLoginClick={() => setModal("auth")}
        onUploadClick={handleUpload} onAdClick={() => setModal("ad")}
        onAdminClick={() => setModal("admin")} onAccountClick={() => setModal("account")} />

      {/* ── Hero ── */}
      <section className="relative z-10 min-h-screen flex items-center justify-center pt-[60px]">
        <div className="text-center px-6 max-w-[700px] w-full">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/25
            rounded-full px-4 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            <span className="text-violet-300 text-[11px] tracking-[1.5px] font-semibold uppercase">The Open Font Platform</span>
          </div>
          <h1 className="font-black leading-[1.04] tracking-[-2.5px] mb-5 text-white text-[clamp(42px,9vw,78px)]">
            Your fonts.<br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
              Everywhere.
            </span>
          </h1>
          <p className="text-white/45 leading-relaxed mb-9 text-[clamp(14px,2vw,17px)]">
            Upload, host &amp; integrate custom fonts into any framework—<br className="hidden sm:block" />
            HTML, React, Vue, Angular, Android, Flutter, and more.
          </p>
          <div className="border-2 border-dashed border-violet-500/30 rounded-2xl px-8 py-10
            cursor-pointer transition-all duration-250 bg-violet-500/3 group
            hover:border-violet-500/70 hover:bg-violet-500/8 hover:scale-[1.01]"
            onClick={handleUpload} onDragOver={e=>e.preventDefault()} onDrop={handleHeroDrop}>
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🔤</div>
            <h3 className="text-white/80 text-base font-semibold mb-1.5">Drop your font file here to upload</h3>
            <p className="text-white/30 text-xs">TTF · OTF · WOFF · WOFF2 · Stored in Supabase</p>
            {!user && <p className="text-violet-400 text-xs mt-3">Sign in to upload your fonts →</p>}
          </div>
          <div className="flex flex-wrap gap-2 justify-center mt-5">
            {["HTML","CSS","React","Angular","Vue","Next.js","Android","Flutter"].map(fw => (
              <span key={fw} className="bg-white/4 border border-white/8 text-white/40 rounded-full px-3 py-1 text-[11px]">{fw}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Live Ad Strip ── */}
      <AdStrip />

      {/* ── Category Filter ── */}
      <div className="sticky top-[60px] z-50 bg-[#07070f]/95 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-[1160px] mx-auto px-6 py-3 flex gap-2 overflow-x-auto scrollbar-none">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap border transition-all flex-shrink-0
                ${activeFilter===cat
                  ? "bg-violet-500 text-white border-violet-500 shadow-[0_0_12px_rgba(124,106,247,0.4)]"
                  : "bg-white/4 border-white/10 text-white/50 hover:border-violet-500/40 hover:text-white/80"}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Fonts Grid ── */}
      <section className="relative z-10 max-w-[1160px] mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-black tracking-tight text-[clamp(20px,3vw,28px)]">
              {activeFilter === "All" ? "Browse Fonts" : activeFilter}
            </h2>
            <p className="text-white/35 text-sm mt-1">
              {loading ? "Loading from database…" :
                searchQuery.trim()
                  ? `${filteredFonts.length} result${filteredFonts.length!==1?"s":""} for "${searchQuery.trim()}"`
                  : `${filteredFonts.length} font${filteredFonts.length!==1?"s":""} · Click any to get integration code`}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-3.5" style={{ gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))" }}>
            {Array.from({length:8}).map((_,i) => (
              <div key={i} className="rounded-xl bg-white/3 animate-pulse min-h-[160px]" />
            ))}
          </div>
        ) : filteredFonts.length > 0 ? (
          <div className="grid gap-3.5" style={{ gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))" }}>
            {filteredFonts.map(font => (
              <FontCard key={font.id} font={font} onClick={openFont} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-white/40 text-base">No fonts match &ldquo;{searchQuery}&rdquo;</p>
            <button onClick={() => { setSearchQuery(""); setActiveFilter("All"); }}
              className="mt-4 text-violet-400 text-sm hover:text-violet-300 underline underline-offset-2">
              Clear filter
            </button>
          </div>
        )}

        {/* User's own fonts */}
        {userFonts.length > 0 && (
          <div className="mt-16">
            <h3 className="text-white font-bold text-lg mb-5">Your Uploaded Fonts</h3>
            <div className="grid gap-3.5" style={{ gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))" }}>
              {userFonts.map(uf => (
                <div key={uf.id} className="rounded-xl overflow-hidden border border-violet-500/18
                  flex flex-col min-h-[140px]" style={{ background: uf.bg_color }}>
                  <div className="flex-1 flex items-center justify-center px-3 py-4">
                    <span className="text-xl font-bold" style={{ color: uf.text_color }}>{uf.name}</span>
                  </div>
                  <div className="px-3.5 py-2 border-t border-white/5 flex justify-between">
                    <span className="text-[10px] tracking-widest text-white/25">{uf.category.toUpperCase()}</span>
                    <span className={`text-[10px] ${uf.is_public?"text-emerald-400":"text-white/25"}`}>
                      {uf.is_public ? "● PUBLIC" : "○ PRIVATE"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/5 py-8 px-6">
        <div className="max-w-[1100px] mx-auto flex flex-wrap justify-between items-center gap-5">
          <span className="text-[18px] font-black bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">FontsVerse</span>
          <div className="flex flex-wrap gap-6">
            {["About","Contact","Privacy","Terms"].map(l => (
              <a key={l} href={`/${l.toLowerCase()}`} className="text-white/25 hover:text-white/60 text-xs transition-colors">{l}</a>
            ))}
          </div>
        </div>
        <p className="text-center text-white/15 text-[11px] mt-6">© 2026 FontsVerse · Powered by Supabase</p>
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

// Fetches live active ads from DB
function AdStrip() {
  const [ad, setAd] = useState<{title:string;tagline?:string;destination_url:string}|null>(null);

  useState(() => {
    fetch("/api/ads").then(r=>r.json()).then(d => {
      if (d.ads?.length > 0) setAd(d.ads[0]);
    }).catch(() => {});
  });

  if (!ad) return (
    <div className="relative z-10 bg-white/[0.015] border-y border-white/4 py-3 px-6
      flex items-center justify-center gap-3 flex-wrap">
      <span className="bg-yellow-400/12 text-yellow-300 border border-yellow-400/22 rounded px-2 py-0.5 text-[10px] font-bold tracking-widest">AD</span>
      <p className="text-white/50 text-sm">
        <strong className="text-white">Your ad here</strong> — reach thousands of designers &amp; developers.{" "}
        <button className="text-violet-400 hover:text-violet-300 transition-colors"
          onClick={() => document.dispatchEvent(new CustomEvent("openAdModal"))}>
          Post an Ad →
        </button>
      </p>
    </div>
  );

  return (
    <div className="relative z-10 bg-white/[0.015] border-y border-white/4 py-3 px-6
      flex items-center justify-center gap-3 flex-wrap">
      <span className="bg-yellow-400/12 text-yellow-300 border border-yellow-400/22 rounded px-2 py-0.5 text-[10px] font-bold tracking-widest">AD</span>
      <p className="text-white/50 text-sm">
        <strong className="text-white">{ad.title}</strong>
        {ad.tagline && ` — ${ad.tagline} `}
        <a href={ad.destination_url} target="_blank" rel="noopener noreferrer"
          className="text-violet-400 hover:text-violet-300 transition-colors ml-1">
          Learn more →
        </a>
      </p>
    </div>
  );
}
