"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNotif } from "@/context/NotifContext";
import { useFonts } from "@/context/FontsContext";
import { Ad } from "@/lib/supabase";
import { Overlay } from "./AuthModal";

interface Props { onClose: () => void }

export default function AdminModal({ onClose }: Props) {
  const { user, isAdmin, profile } = useAuth();
  const { fonts, removeFont, updateFont } = useFonts();
  const { notify }   = useNotif();
  const [tab, setTab]       = useState<"fonts"|"ads"|"users">("fonts");
  const [ads, setAds]       = useState<Ad[]>([]);
  const [stats, setStats]   = useState({ totalFonts:0, totalUsers:0, totalDownloads:0, pendingAds:0, activeAds:0 });
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCat, setNewCat]   = useState("Sans-Serif");
  const [adLoading, setAdLoading] = useState(false);

  if (!isAdmin) return (
    <Overlay onClose={onClose}>
      <div className="text-center py-8">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-bold text-white mb-2">Admin Only</h2>
        <p className="text-white/40 text-sm">You need an admin account to access this.</p>
        <button onClick={onClose} className="fv-btn-primary !w-auto px-8 mt-5">Close</button>
      </div>
    </Overlay>
  );

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    fetch("/api/admin").then(r => r.json()).then(d => setStats(d)).catch(() => {});
    fetch("/api/ads?admin=1").then(r => r.json()).then(d => setAds(d.ads || [])).catch(() => {});
  }, []);

  const approveAd = async (id: string, status: "active"|"rejected", note?: string) => {
    setAdLoading(true);
    const res = await fetch("/api/ads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, review_note: note, reviewed_by: user?.id }),
    });
    const json = await res.json();
    setAdLoading(false);
    if (json.success) {
      setAds(p => p.map(a => a.id === id ? json.ad : a));
      notify(`Ad ${status === "active" ? "approved ✓" : "rejected"}`);
    }
  };

  const TABS = [
    { id: "fonts", label: `Fonts (${fonts.length})` },
    { id: "ads",   label: `Ads (${ads.length})` },
    { id: "users", label: "Stats" },
  ] as const;

  return (
    <Overlay onClose={onClose} wide>
      <div className="flex items-start justify-between mb-5 gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h2 className="text-xl font-bold text-white">Admin Dashboard</h2>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-bold">ADMIN</span>
          </div>
          <p className="text-white/30 text-xs">Logged in as {profile?.name}</p>
        </div>
        {tab === "fonts" && (
          <button onClick={() => setAdding(!adding)} className="fv-btn-primary !w-auto px-4 py-2 text-[13px]">
            + Add Font
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/4 rounded-lg p-1 mb-5">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-2 rounded-md text-[12px] font-medium transition-all
              ${tab===t.id ? "bg-violet-500/25 text-violet-300" : "text-white/40 hover:text-white/60"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── FONTS TAB ── */}
      {tab === "fonts" && (
        <>
          {adding && (
            <div className="bg-white/4 border border-white/10 rounded-xl p-4 mb-4">
              <p className="text-white font-semibold text-sm mb-3">Add Font to Platform</p>
              <input className="fv-input mb-2" placeholder="Font name" value={newName}
                onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key==="Enter" && notify("Use Upload to add real font files")} />
              <select className="fv-input mb-3" value={newCat} onChange={e => setNewCat(e.target.value)}>
                {["Sans-Serif","Serif","Monospace","Display","Handwriting","Condensed"].map(c=><option key={c}>{c}</option>)}
              </select>
              <p className="text-white/30 text-xs mb-3">Note: Use the Upload button to add real font files with storage.</p>
              <div className="flex gap-2">
                <button onClick={() => { setAdding(false); setNewName(""); }}
                  className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/50 text-sm">Cancel</button>
              </div>
            </div>
          )}
          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
            {fonts.slice(0,20).map(f => (
              <div key={f.id} className="bg-white/3 border border-white/6 rounded-lg px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center"
                  style={{ background: f.bg_color }}>
                  <span className="text-[11px] font-bold" style={{ color: f.text_color }}>{f.name.slice(0,2)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{f.name}</p>
                  <p className="text-white/30 text-xs">{f.category} · {f.downloads.toLocaleString()} ↓</p>
                </div>
                <div className="flex gap-2 items-center shrink-0">
                  <button onClick={() => updateFont(f.id, { is_public: !f.is_public })}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all
                      ${f.is_public ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/25" : "bg-white/5 text-white/30 border-white/10"}`}>
                    {f.is_public ? "Public" : "Private"}
                  </button>
                  <button onClick={() => { removeFont(f.id); notify(`"${f.name}" removed`); }}
                    className="px-2.5 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-[11px]">✕</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── ADS TAB ── */}
      {tab === "ads" && (
        <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
          {ads.length === 0 && <p className="text-center text-white/30 py-8">No ad submissions yet.</p>}
          {ads.map(ad => (
            <div key={ad.id} className="bg-white/3 border border-white/6 rounded-xl p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="text-white font-semibold text-sm">{ad.title}</p>
                  <p className="text-white/40 text-xs mt-0.5">{ad.tagline}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0
                  ${ad.status==="active"  ? "bg-emerald-500/20 text-emerald-300" :
                    ad.status==="pending" ? "bg-amber-500/20 text-amber-300" :
                    ad.status==="rejected"? "bg-red-500/20 text-red-300" : "bg-white/10 text-white/40"}`}>
                  {ad.status.toUpperCase()}
                </span>
              </div>
              <p className="text-violet-400 text-xs truncate mb-1">{ad.destination_url}</p>
              <p className="text-white/30 text-xs mb-3">
                {ad.contact_email} {ad.budget ? `· $${ad.budget}/mo` : ""}
                {" · "}{new Date(ad.created_at).toLocaleDateString()}
              </p>
              {ad.status === "pending" && (
                <div className="flex gap-2">
                  <button onClick={() => approveAd(ad.id, "active")} disabled={adLoading}
                    className="fv-btn-primary !w-auto px-4 py-1.5 text-xs">
                    ✓ Approve
                  </button>
                  <button onClick={() => approveAd(ad.id, "rejected", "Does not meet guidelines")}
                    disabled={adLoading}
                    className="px-4 py-1.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                    ✕ Reject
                  </button>
                </div>
              )}
              {ad.status === "active" && (
                <p className="text-emerald-400/60 text-xs">
                  {ad.impressions} impressions · {ad.clicks} clicks
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── STATS TAB ── */}
      {tab === "users" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { val: stats.totalFonts,     label: "Total Fonts" },
            { val: stats.totalUsers,     label: "Registered Users" },
            { val: stats.totalDownloads, label: "Total Downloads" },
            { val: stats.pendingAds,     label: "Pending Ads" },
            { val: stats.activeAds,      label: "Active Ads" },
            { val: "Supabase",           label: "Database" },
          ].map(s => (
            <div key={s.label} className="bg-violet-500/7 border border-violet-500/13 rounded-xl p-4 text-center">
              <p className="text-xl font-black text-white">{s.val}</p>
              <p className="text-white/30 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}
    </Overlay>
  );
}
