"use client";
import { useState, useMemo, useCallback } from "react";
import { useFonts } from "@/context/FontsContext";
import { DBFont } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import ParticleCanvas from "./ParticleCanvas";
import Header from "./Header";
import FontCard from "./FontCard";
import AuthModal from "./AuthModal";
import UploadModal from "./UploadModal";
import AdModal from "./AdModal";
import AccountModal from "./AccountModal";
import AdminModal from "./AdminModal";
import FontDetailModal from "./FontDetailModal";

type Modal = "auth"|"upload"|"ad"|"account"|"admin"|"fontDetail"|null;

export default function FontsPageClient() {
  const { fonts, loading } = useFonts();
  const { user } = useAuth();
  const [modal, setModal]     = useState<Modal>(null);
  const [selectedFont, setSelectedFont] = useState<DBFont|null>(null);
  const [query, setQuery]     = useState("");
  const [category, setCategory] = useState("All");
  const close = () => { setModal(null); setSelectedFont(null); };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return fonts.filter(f => {
      const mq = !q || f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q);
      const mc = category === "All" || f.category === category;
      return mq && mc;
    });
  }, [fonts, query, category]);

  const handleSearch = useCallback((q: string) => setQuery(q), []);
  const openFont = (font: DBFont) => { setSelectedFont(font); setModal("fontDetail"); };

  const CATS = ["All","Sans-Serif","Serif","Monospace","Display","Condensed","Handwriting"];

  return (
    <div className="min-h-screen bg-[#07070f] text-white">
      <ParticleCanvas />
      <Header onSearch={handleSearch} onLoginClick={() => setModal("auth")}
        onUploadClick={() => user ? setModal("upload") : setModal("auth")}
        onAdClick={() => setModal("ad")} onAdminClick={() => setModal("admin")}
        onAccountClick={() => setModal("account")} />

      <main className="relative z-10 max-w-[1160px] mx-auto px-6 pt-24 pb-20">
        <h1 className="text-3xl font-black mb-2">Browse All Fonts</h1>
        <p className="text-white/40 text-sm mb-8">
          {loading ? "Loading…" : `${filtered.length} font${filtered.length!==1?"s":""} available`}
        </p>

        <div className="flex gap-2 flex-wrap mb-8">
          {CATS.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-4 py-1.5 rounded-full text-[12px] font-medium border transition-all
                ${category===c ? "bg-violet-500 text-white border-violet-500" : "bg-white/4 border-white/10 text-white/50 hover:border-violet-500/40"}`}>
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid gap-3.5" style={{ gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))" }}>
            {Array.from({length:12}).map((_,i) => <div key={i} className="rounded-xl bg-white/3 animate-pulse min-h-[160px]" />)}
          </div>
        ) : (
          <div className="grid gap-3.5" style={{ gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))" }}>
            {filtered.map(font => <FontCard key={font.id} font={font} onClick={openFont} />)}
          </div>
        )}
      </main>

      {modal==="auth"       && <AuthModal onClose={close} />}
      {modal==="upload"     && <UploadModal onClose={close} onAuthRequired={() => setModal("auth")} />}
      {modal==="ad"         && <AdModal onClose={close} />}
      {modal==="account"    && <AccountModal onClose={close} />}
      {modal==="admin"      && <AdminModal onClose={close} />}
      {modal==="fontDetail" && selectedFont && <FontDetailModal font={selectedFont} onClose={close} />}
    </div>
  );
}
