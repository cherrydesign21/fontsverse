"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useFonts } from "@/context/FontsContext";
import { getFontFaceCSS } from "@/lib/fonts";
import Header from "./Header";
import Footer from "./Footer";
import AuthModal from "./AuthModal";
import UploadModal from "./UploadModal";
import AdModal from "./AdModal";
import AccountModal from "./AccountModal";
import AdminModal from "./AdminModal";

type Modal = "auth" | "upload" | "ad" | "account" | "admin" | null;

interface PackFont {
  id: string; name: string; slug: string;
  bg_color: string; text_color: string;
  font_family: string; font_weight: string; font_style: string;
  file_woff2?: string; file_woff?: string; file_ttf?: string;
}
interface Pack {
  id: string; name: string; description?: string; created_at: string;
  font1: PackFont; font2: PackFont;
}

const AMBER_GRAD = "linear-gradient(122deg, #FFB703 5%, #FB8500 105%)";

function PackCard({ pack }: { pack: Pack }) {
  const [copied, setCopied]   = useState(false);
  const [showCode, setShowCode] = useState(false);

  useEffect(() => {
    [pack.font1, pack.font2].forEach(f => {
      const id = `fv-ff-${f.id}`;
      if (!document.getElementById(id)) {
        const raw = f.file_woff2 || f.file_woff || f.file_ttf;
        if (!raw) return;
        const s = document.createElement("style");
        s.id = id;
        s.textContent = getFontFaceCSS(f as Parameters<typeof getFontFaceCSS>[0]);
        document.head.appendChild(s);
      }
    });
  }, [pack.font1.id, pack.font2.id]);

  const embedCode = [
    `<link rel="stylesheet" href="https://fontsverse.vercel.app/api/css/${pack.font1.slug}">`,
    `<link rel="stylesheet" href="https://fontsverse.vercel.app/api/css/${pack.font2.slug}">`,
    ``,
    `<!-- Heading font -->`,
    `<h1 style="font-family: '${pack.font1.name}', sans-serif;">${pack.font1.name}</h1>`,
    `<!-- Body font -->`,
    `<p style="font-family: '${pack.font2.name}', sans-serif;">${pack.font2.name}</p>`,
  ].join("\n");

  const copy = async () => {
    try { await navigator.clipboard.writeText(embedCode); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Font preview pair */}
      <div className="grid grid-cols-2 h-[140px]">
        <div className="flex items-center justify-center p-5 overflow-hidden"
          style={{ background: pack.font1.bg_color }}>
          <span className="text-[28px] leading-none font-bold truncate max-w-full"
            style={{ fontFamily: pack.font1.font_family, color: pack.font1.text_color }}>
            {pack.font1.name}
          </span>
        </div>
        <div className="flex items-center justify-center p-5 overflow-hidden"
          style={{ background: pack.font2.bg_color }}>
          <span className="text-[28px] leading-none font-bold truncate max-w-full"
            style={{ fontFamily: pack.font2.font_family, color: pack.font2.text_color }}>
            {pack.font2.name}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-5">
        <h3 className="font-bold text-gray-900 text-base mb-1">{pack.name}</h3>
        {pack.description && <p className="text-gray-400 text-sm mb-3">{pack.description}</p>}

        <div className="flex items-center gap-2 mb-4 text-xs text-gray-400">
          <Link href={`/fonts/${pack.font1.slug}`} className="hover:text-[#023047] transition-colors font-medium text-gray-600">
            {pack.font1.name}
          </Link>
          <span>+</span>
          <Link href={`/fonts/${pack.font2.slug}`} className="hover:text-[#023047] transition-colors font-medium text-gray-600">
            {pack.font2.name}
          </Link>
        </div>

        <div className="flex gap-2">
          <button onClick={() => setShowCode(!showCode)}
            className="flex-1 py-2 rounded-lg border border-[#023047] text-[#023047] text-[13px] font-medium hover:bg-[#023047] hover:text-white transition-colors">
            {showCode ? "Hide Code" : "Get Embed Code"}
          </button>
          {showCode && (
            <button onClick={copy}
              className={`px-4 py-2 rounded-lg text-[13px] font-medium border transition-all
                ${copied ? "bg-emerald-50 border-emerald-300 text-emerald-600" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
              {copied ? "✓" : "Copy"}
            </button>
          )}
        </div>

        {showCode && (
          <pre className="mt-3 bg-gray-900 rounded-xl p-4 text-[11px] text-emerald-400 overflow-x-auto leading-relaxed font-mono whitespace-pre-wrap">
            {embedCode}
          </pre>
        )}
      </div>
    </div>
  );
}

export default function FontPacksPageClient() {
  const { user, isAdmin } = useAuth();
  const { fonts }         = useFonts();
  const [modal, setModal] = useState<Modal>(null);
  const [packs, setPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);
  const [setupRequired, setSetupRequired] = useState(false);

  // Admin create pack state
  const [creating, setCreating] = useState(false);
  const [packName, setPackName] = useState("");
  const [packDesc, setPackDesc] = useState("");
  const [font1Id, setFont1Id]   = useState("");
  const [font2Id, setFont2Id]   = useState("");
  const [saving, setSaving]     = useState(false);
  const close = () => setModal(null);

  useEffect(() => {
    fetch("/api/packs")
      .then(r => r.json())
      .then(d => { setPacks(d.packs || []); setSetupRequired(!!d.setup_required); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const createPack = async () => {
    if (!packName.trim() || !font1Id || !font2Id) return;
    setSaving(true);
    const res = await fetch("/api/packs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: packName.trim(), description: packDesc.trim() || null, font1_id: font1Id, font2_id: font2Id }),
    });
    const data = await res.json();
    setSaving(false);
    if (data.pack) {
      // Re-fetch packs to get the joined font data
      fetch("/api/packs").then(r => r.json()).then(d => setPacks(d.packs || [])).catch(() => {});
      setCreating(false); setPackName(""); setPackDesc(""); setFont1Id(""); setFont2Id("");
    }
  };

  const deletePack = async (id: string) => {
    await fetch(`/api/packs?id=${id}`, { method: "DELETE" });
    setPacks(p => p.filter(x => x.id !== id));
  };

  return (
    <div className="min-h-screen bg-white text-gray-900" style={{ fontFamily: "Outfit, system-ui, sans-serif" }}>
      <Header onSearch={() => {}} onLoginClick={() => setModal("auth")}
        onUploadClick={() => user ? setModal("upload") : setModal("auth")}
        onAdClick={() => setModal("ad")} onAdminClick={() => setModal("admin")}
        onAccountClick={() => setModal("account")} />

      <main className="max-w-[1100px] mx-auto px-6 pt-28 pb-20">
        {/* Header */}
        <div className="mb-12">
          <p className="text-[13px] font-semibold tracking-[3px] uppercase text-gray-400 mb-4">Curated Pairings</p>
          <h1 className="font-bold leading-none text-[#111] mb-5" style={{ fontSize: "clamp(36px,5vw,64px)" }}>
            Font Packs
          </h1>
          <p className="text-gray-500 text-lg max-w-[540px] leading-relaxed">
            Ready-made font pairs for headings and body text. Get embed code for both fonts in one click.
          </p>
        </div>

        {/* Admin: create pack */}
        {isAdmin && (
          <div className="mb-10 bg-amber-50 border border-amber-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-amber-700 font-semibold text-sm">Admin — Create Font Pack</p>
              <button onClick={() => setCreating(!creating)}
                className="px-4 py-1.5 rounded-lg text-[13px] font-medium"
                style={{ background: creating ? "#e5e7eb" : AMBER_GRAD, color: creating ? "#374151" : "#000" }}>
                {creating ? "Cancel" : "+ New Pack"}
              </button>
            </div>
            {creating && (
              <div className="space-y-3">
                <input className="fv-input" placeholder="Pack name (e.g. Editorial Duo)"
                  value={packName} onChange={e => setPackName(e.target.value)} />
                <input className="fv-input" placeholder="Description (optional)"
                  value={packDesc} onChange={e => setPackDesc(e.target.value)} />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Font 1 (Heading)</label>
                    <select className="fv-input" value={font1Id} onChange={e => setFont1Id(e.target.value)}>
                      <option value="">Select font…</option>
                      {fonts.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Font 2 (Body)</label>
                    <select className="fv-input" value={font2Id} onChange={e => setFont2Id(e.target.value)}>
                      <option value="">Select font…</option>
                      {fonts.filter(f => f.id !== font1Id).map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                  </div>
                </div>
                <button onClick={createPack} disabled={saving || !packName || !font1Id || !font2Id}
                  className="fv-btn-primary w-full disabled:opacity-60">
                  {saving ? "Creating…" : "Create Pack"}
                </button>
              </div>
            )}
            {setupRequired && (
              <p className="text-amber-600 text-sm mt-3 bg-amber-100 rounded-lg px-3 py-2">
                ⚠ The <code className="font-mono">font_packs</code> table doesn&apos;t exist yet.
                Run the SQL in <code className="font-mono">app/api/packs/route.ts</code> in your Supabase dashboard to enable this feature.
              </p>
            )}
          </div>
        )}

        {/* Packs grid */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1,2,3].map(i => <div key={i} className="rounded-2xl bg-gray-100 animate-pulse h-64" />)}
          </div>
        ) : packs.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-gray-200 rounded-2xl">
            <div className="text-5xl mb-4">📦</div>
            <p className="text-gray-400 mb-2">No font packs yet</p>
            {isAdmin
              ? <p className="text-gray-300 text-sm">Create the first pack using the admin panel above.</p>
              : <p className="text-gray-300 text-sm">Check back soon — curated packs are coming.</p>
            }
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {packs.map(pack => (
              <div key={pack.id} className="relative">
                <PackCard pack={pack} />
                {isAdmin && (
                  <button onClick={() => deletePack(pack.id)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity z-10"
                    title="Delete pack">✕</button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />

      {modal === "auth"    && <AuthModal onClose={close} />}
      {modal === "upload"  && <UploadModal onClose={close} onAuthRequired={() => setModal("auth")} />}
      {modal === "ad"      && <AdModal onClose={close} />}
      {modal === "account" && <AccountModal onClose={close} />}
      {modal === "admin"   && <AdminModal onClose={close} />}
    </div>
  );
}
