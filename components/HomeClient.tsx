"use client";
import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useUserFonts } from "@/context/UserFontsContext";
import { useFonts } from "@/context/FontsContext";
import Header from "@/components/Header";
import FontCard from "@/components/FontCard";
import FontLoader from "@/components/FontLoader";
import AuthModal from "@/components/AuthModal";
import UploadModal from "@/components/UploadModal";
import AdModal from "@/components/AdModal";
import AccountModal from "@/components/AccountModal";
import AdminModal from "@/components/AdminModal";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";

type ModalType = "auth"|"upload"|"ad"|"account"|"admin"|null;
type SortKey   = "downloads"|"newest"|"az";

const AMBER_GRAD = "linear-gradient(122deg, #FFB703 5%, #FB8500 105%)";
const CATS = ["All","Sans-Serif","Serif","Monospace","Display","Condensed","Handwriting"];

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

  const [modal, setModal]           = useState<ModalType>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [sortBy, setSortBy]         = useState<SortKey>("downloads");
  const [showFavs, setShowFavs]     = useState(false);
  const [showSort, setShowSort]     = useState(false);
  const sortRef                     = useRef<HTMLDivElement>(null);

  // close sort dropdown on outside click
  useEffect(() => {
    if (!showSort) return;
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setShowSort(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showSort]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = dbFonts.filter(f => {
      const mq = !q || f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q);
      const mc = activeFilter === "All" || f.category === activeFilter;
      const mf = !showFavs || favs.includes(f.id);
      return mq && mc && mf;
    });
    if (sortBy === "downloads") list = [...list].sort((a,b) => b.downloads - a.downloads);
    else if (sortBy === "newest") list = [...list].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    else list = [...list].sort((a,b) => a.name.localeCompare(b.name));
    return list;
  }, [dbFonts, searchQuery, activeFilter, sortBy, showFavs, favs]);

  const newest = useMemo(() =>
    [...dbFonts].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 8),
    [dbFonts]
  );

  const handleSearch = useCallback((q: string) => setSearchQuery(q), []);
  const handleUpload = () => user ? setModal("upload") : setModal("auth");
  const close = () => setModal(null);

  const SORT_LABELS: [SortKey, string][] = [["downloads","Popular"],["newest","Newest"],["az","A–Z"]];

  return (
    <div className="min-h-screen bg-white text-gray-900" style={{ fontFamily: "Outfit, system-ui, sans-serif" }}>
      <FontLoader />
      <Header onSearch={handleSearch} onLoginClick={() => setModal("auth")}
        onUploadClick={handleUpload} onAdClick={() => setModal("ad")}
        onAdminClick={() => setModal("admin")} onAccountClick={() => setModal("account")} />

      {/* ── Hero ── */}
      <section className="relative pt-[180px] pb-[100px] text-center overflow-hidden bg-white">
        {/* Watercolor background */}
        <img src="/hero-bg.png" alt="" aria-hidden
          className="absolute inset-0 w-full h-full object-cover object-top pointer-events-none select-none"
          style={{ opacity: 0.8 }} />
        <div className="relative z-10">
        {/* badge */}
        <Reveal animation="up" delay={0}>
          <div className="inline-flex items-center gap-2 border border-[#111] rounded-full px-5 py-3 mb-10">
            <div className="w-1.5 h-1.5 rounded-full bg-[#111]" />
            <span className="text-[16px] font-semibold tracking-[1.6px] uppercase text-[#111]">
              Open Font Platform
            </span>
          </div>
        </Reveal>

        <Reveal animation="up" delay={120}>
          <h1 className="font-bold leading-none text-[#111] mb-[45px]"
            style={{ fontSize: "clamp(48px,7vw,80px)" }}>
            Fonts that work<br />everywhere.
          </h1>
        </Reveal>

        <Reveal animation="up" delay={220}>
          <p className="text-[20px] leading-[30px] text-[#333] mb-[60px] mx-auto max-w-[540px]">
            Upload and host your own fonts. Get integration code for any framework in seconds.
          </p>
        </Reveal>

        <Reveal animation="up" delay={320}>
        <div className="flex items-center gap-4 justify-center flex-wrap">
          <button onClick={handleUpload}
            className="inline-flex items-center gap-2 px-[30px] py-[18px] rounded-[8px] text-[14px] font-semibold uppercase tracking-[1.4px] text-black transition-all hover:scale-[1.03] hover:shadow-lg"
            style={{ backgroundImage: AMBER_GRAD }}>
            Upload Fonts
            <svg width="18" height="16" viewBox="0 0 18 16" fill="none">
              <path d="M9 11V2M9 2L5 6M9 2l4 4M2 13h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <Link href="/fonts"
            className="inline-flex items-center gap-2 px-[30px] py-[18px] rounded-[8px] border border-black text-[14px] font-semibold uppercase tracking-[1.4px] text-black hover:bg-black hover:text-white transition-colors">
            Browse Fonts
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
        </Reveal>
        </div>{/* end relative z-10 */}
      </section>

      {/* ── Browse / Font Grid ── */}
      <section id="browse" className="max-w-[1280px] mx-auto px-6 py-16">

        {/* Filter + Sort bar */}
        <Reveal animation="up" delay={0}>
        <div className="flex items-start justify-between gap-4 mb-10 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            {CATS.map(cat => (
              <button key={cat} onClick={() => { setActiveFilter(cat); setShowFavs(false); }}
                className="px-5 py-3 rounded-[6px] text-[16px] border transition-all"
                style={{
                  backgroundColor: activeFilter === cat && !showFavs ? "#023047" : "transparent",
                  color:           activeFilter === cat && !showFavs ? "#fff" : "#666",
                  borderColor:     "#023047",
                }}>
                {cat}
              </button>
            ))}
            <button onClick={() => { setShowFavs(!showFavs); setActiveFilter("All"); }}
              className="px-5 py-3 rounded-[6px] text-[16px] border transition-all"
              style={{
                backgroundColor: showFavs ? "#023047" : "transparent",
                color:           showFavs ? "#fff"     : "#666",
                borderColor:     "#023047",
              }}>
              ♥ Saved
            </button>
          </div>

          <div className="flex gap-2 relative" ref={sortRef}>
            <button onClick={() => setShowSort(!showSort)}
              className="flex items-center gap-2 px-[18px] h-[40px] rounded-[6px] border border-[#999] text-[#666] text-[16px] font-light bg-white">
              <svg width="19" height="11" viewBox="0 0 19 11" fill="none">
                <path d="M1 1h17M4 5.5h11M7.5 10h4" stroke="#666" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              Sorting
            </button>
            {showSort && (
              <div className="absolute top-11 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 min-w-[130px]">
                {SORT_LABELS.map(([key, label]) => (
                  <button key={key} onClick={() => { setSortBy(key); setShowSort(false); }}
                    className={`w-full text-left px-4 py-2 text-[14px] hover:bg-gray-50 transition-colors ${sortBy===key?"text-[#023047] font-semibold":"text-[#333]"}`}>
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        </Reveal>

        {/* Grid */}
        {loading ? (
          <div className="grid gap-[30px]" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))" }}>
            {Array.from({length: 8}).map((_,i) => (
              <div key={i} className="rounded-[8px] bg-gray-100 animate-pulse" style={{ aspectRatio: "1/1" }} />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid gap-[30px]" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))" }}>
            {filtered.map((font, i) => (
              <Reveal key={font.id} animation="up" delay={Math.min(i, 7) * 70}>
                <FontCard font={font}
                  isFav={favs.includes(font.id)} onToggleFav={() => toggleFav(font.id)} />
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 border border-dashed border-gray-200 rounded-2xl">
            <p className="text-gray-400 mb-1">
              {showFavs ? "No saved fonts yet" : `No fonts match "${searchQuery}"`}
            </p>
            <p className="text-gray-300 text-sm mb-4">
              {showFavs ? "Click ♥ on any font to save it" : "Try a different search or category"}
            </p>
            <button onClick={() => { setSearchQuery(""); setActiveFilter("All"); setShowFavs(false); }}
              className="text-sm text-[#023047] underline underline-offset-2">
              Clear filters
            </button>
          </div>
        )}
      </section>

      {/* ── New Release ── */}
      {newest.length > 0 && (
        <section className="py-16" style={{ background: "#f3f3f3" }}>
          <div className="max-w-[1280px] mx-auto px-6">
            <Reveal animation="left">
              <div className="flex items-end justify-between mb-12">
                <div>
                  <p className="text-[26px] font-light text-[#023047] mb-2">New Release</p>
                  <div className="w-10 h-px bg-[#023047]" />
                </div>
                <Link href="/fonts" className="text-[18px] font-light text-[#777] hover:text-[#023047] transition-colors">
                  View all
                </Link>
              </div>
            </Reveal>
            <div className="grid gap-[30px]" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))" }}>
              {newest.map((font, i) => (
                <Reveal key={font.id} animation="up" delay={Math.min(i, 7) * 70}>
                  <FontCard font={font}
                    isFav={favs.includes(font.id)} onToggleFav={() => toggleFav(font.id)} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* User's own fonts */}
      {userFonts.length > 0 && (
        <section className="py-16">
          <div className="max-w-[1280px] mx-auto px-6">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-[26px] font-light text-[#023047] mb-2">Your Fonts</p>
                <div className="w-10 h-px bg-[#023047]" />
              </div>
            </div>
            <div className="grid gap-[30px]" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))" }}>
              {userFonts.map(font => (
                <FontCard key={font.id} font={font}
                  isFav={favs.includes(font.id)} onToggleFav={() => toggleFav(font.id)} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA Banner ── */}
      <section className="relative overflow-hidden py-24" style={{ background: "#023047" }}>
        {/* Floating font names — decorative */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden>
          {[
            { name: "Space\nGrotesk", x: "62%", y: "2%",  rotate: "-30deg", size: 50 },
            { name: "Lato",           x: "90%", y: "0%",  rotate: "-15deg", size: 60 },
            { name: "Outfit",         x: "78%", y: "42%", rotate: "0deg",   size: 70 },
            { name: "Bebas Neue",     x: "59%", y: "65%", rotate: "-15deg", size: 60 },
            { name: "Open\nSans",     x: "73%", y: "78%", rotate: "-15deg", size: 50 },
            { name: "Montserrat",     x: "87%", y: "68%", rotate: "-15deg", size: 50 },
          ].map((item, i) => (
            <div key={i} style={{
              position: "absolute", left: item.x, top: item.y,
              transform: `rotate(${item.rotate})`,
              color: "rgba(255,255,255,0.6)",
              fontSize: item.size, fontWeight: 700,
              lineHeight: 1.1, whiteSpace: "pre-line",
            }}>{item.name}</div>
          ))}
        </div>

        <div className="relative z-10 max-w-[1280px] mx-auto px-6">
          <div className="max-w-[600px]">
            <Reveal animation="up" delay={0}>
              <h2 className="font-semibold text-white mb-[45px]"
                style={{ fontSize: "clamp(40px,6vw,80px)", lineHeight: 1 }}>
                Over {dbFonts.length > 10 ? `${dbFonts.length}+` : "1,000+"} fonts
              </h2>
            </Reveal>
            <Reveal animation="up" delay={120}>
              <p className="text-[20px] leading-[30px] mb-[60px]" style={{ color: "rgba(255,255,255,0.8)" }}>
                Still haven't found what you are looking for? Quickly find the fonts you need with our classification and language support filters.
              </p>
            </Reveal>
            <Reveal animation="up" delay={220}>
              <Link href="/fonts"
                className="inline-flex items-center gap-2 px-[30px] py-[18px] rounded-[8px] text-[14px] font-semibold uppercase tracking-[1.4px] text-black transition-opacity hover:opacity-90"
                style={{ backgroundImage: AMBER_GRAD }}>
                Browse Fonts
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      <Footer />

      {modal==="auth"    && <AuthModal onClose={close} />}
      {modal==="upload"  && <UploadModal onClose={close} onAuthRequired={() => setModal("auth")} />}
      {modal==="ad"      && <AdModal onClose={close} />}
      {modal==="account" && <AccountModal onClose={close} />}
      {modal==="admin"   && <AdminModal onClose={close} />}
    </div>
  );
}
