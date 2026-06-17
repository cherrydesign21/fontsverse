"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNotif } from "@/context/NotifContext";
import { useFonts } from "@/context/FontsContext";
import { Ad } from "@/lib/supabase";
import { Overlay } from "./AuthModal";

interface Props { onClose: () => void }

interface UserRow { id: string; name: string; email: string; role: string; plan: string; created_at: string; }
interface MsgRow  { id: string; name: string; email: string; topic: string; message: string; created_at: string; }

type Tab = "fonts" | "ads" | "users" | "msgs" | "stats";

export default function AdminModal({ onClose }: Props) {
  const { user, isAdmin, profile } = useAuth();
  const { fonts, removeFont, updateFont } = useFonts();
  const { notify }   = useNotif();
  const [tab, setTab]       = useState<Tab>("fonts");
  const [ads, setAds]       = useState<Ad[]>([]);
  const [stats, setStats]   = useState({ totalFonts:0, totalUsers:0, totalDownloads:0, pendingAds:0, activeAds:0, publicFonts:0, adminUsers:0 });
  const [userList, setUserList]   = useState<UserRow[]>([]);
  const [messages, setMessages]   = useState<MsgRow[]>([]);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCat, setNewCat]   = useState("Sans-Serif");
  const [adLoading, setAdLoading] = useState(false);
  const [usersLoaded, setUsersLoaded]   = useState(false);
  const [msgsLoaded, setMsgsLoaded]     = useState(false);

  if (!isAdmin) return (
    <Overlay onClose={onClose}>
      <div className="text-center py-8">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Admin Only</h2>
        <p className="text-gray-400 text-sm">You need an admin account to access this.</p>
        <button onClick={onClose} className="fv-btn-primary w-auto! px-8 mt-5">Close</button>
      </div>
    </Overlay>
  );

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    fetch("/api/admin").then(r => r.json()).then(d => setStats(d)).catch(() => {});
    fetch("/api/ads?admin=1").then(r => r.json()).then(d => setAds(d.ads || [])).catch(() => {});
  }, []);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (tab === "users" && !usersLoaded) {
      fetch("/api/admin?type=users").then(r => r.json())
        .then(d => { setUserList(d.users || []); setUsersLoaded(true); })
        .catch(() => {});
    }
    if (tab === "msgs" && !msgsLoaded) {
      fetch("/api/admin?type=messages").then(r => r.json())
        .then(d => { setMessages(d.messages || []); setMsgsLoaded(true); })
        .catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

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

  const TABS: { id: Tab; label: string }[] = [
    { id: "fonts", label: `Fonts (${fonts.length})` },
    { id: "ads",   label: `Ads (${ads.length})` },
    { id: "users", label: `Users (${usersLoaded ? userList.length : stats.totalUsers || "…"})` },
    { id: "msgs",  label: `Messages (${msgsLoaded ? messages.length : "…"})` },
    { id: "stats", label: "Stats" },
  ];

  return (
    <Overlay onClose={onClose} wide>
      <div className="flex items-start justify-between mb-5 gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h2 className="text-xl font-bold text-gray-900">Admin Dashboard</h2>
            <span className="text-[10px] bg-amber-100 text-amber-600 border border-amber-200 px-2 py-0.5 rounded font-bold">ADMIN</span>
          </div>
          <p className="text-gray-400 text-xs">Logged in as {profile?.name}</p>
        </div>
        {tab === "fonts" && (
          <button onClick={() => setAdding(!adding)} className="fv-btn-primary w-auto! px-4 py-2 text-[13px]">
            + Add Font
          </button>
        )}
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-5 flex-wrap">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-2 rounded-md text-[12px] font-medium transition-all min-w-[70px]
              ${tab===t.id ? "bg-amber-100 text-amber-700" : "text-gray-400 hover:text-gray-600"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "fonts" && (
        <>
          {adding && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
              <p className="text-gray-900 font-semibold text-sm mb-3">Add Font to Platform</p>
              <input className="fv-input mb-2" placeholder="Font name" value={newName}
                onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key==="Enter" && notify("Use Upload to add real font files")} />
              <select className="fv-input mb-3" value={newCat} onChange={e => setNewCat(e.target.value)}>
                {["Sans-Serif","Serif","Monospace","Display","Handwriting","Condensed"].map(c=><option key={c}>{c}</option>)}
              </select>
              <p className="text-gray-400 text-xs mb-3">Note: Use the Upload button to add real font files with storage.</p>
              <div className="flex gap-2">
                <button onClick={() => { setAdding(false); setNewName(""); }}
                  className="px-4 py-2 rounded-lg bg-gray-100 border border-gray-200 text-gray-500 text-sm">Cancel</button>
              </div>
            </div>
          )}
          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
            {fonts.slice(0, 50).map(f => (
              <div key={f.id} className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center" style={{ background: f.bg_color }}>
                  <span className="text-[11px] font-bold" style={{ color: f.text_color }}>{f.name.slice(0,2)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 font-semibold text-sm truncate">{f.name}</p>
                  <p className="text-gray-400 text-xs">{f.category} · {f.downloads.toLocaleString()} ↓</p>
                </div>
                <div className="flex gap-2 items-center shrink-0">
                  <button onClick={() => updateFont(f.id, { is_public: !f.is_public })}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all
                      ${f.is_public ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-gray-100 text-gray-400 border-gray-200"}`}>
                    {f.is_public ? "Public" : "Private"}
                  </button>
                  <button onClick={() => { removeFont(f.id); notify(`"${f.name}" removed`); }}
                    className="px-2.5 py-1 rounded-md bg-red-50 border border-red-200 text-red-500 text-[11px]">✕</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "ads" && (
        <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
          {ads.length === 0 && <p className="text-center text-gray-400 py-8">No ad submissions yet.</p>}
          {ads.map(ad => (
            <div key={ad.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="text-gray-900 font-semibold text-sm">{ad.title}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{ad.tagline}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0
                  ${ad.status==="active"   ? "bg-emerald-50 text-emerald-600" :
                    ad.status==="pending"  ? "bg-amber-50 text-amber-600" :
                    ad.status==="rejected" ? "bg-red-50 text-red-500" : "bg-gray-100 text-gray-400"}`}>
                  {ad.status.toUpperCase()}
                </span>
              </div>
              <p className="text-gray-400 text-xs truncate mb-1">{ad.destination_url}</p>
              <p className="text-gray-400 text-xs mb-3">
                {ad.contact_email} {ad.budget ? `· $${ad.budget}/mo` : ""}
                {" · "}{new Date(ad.created_at).toLocaleDateString()}
              </p>
              {ad.status === "pending" && (
                <div className="flex gap-2">
                  <button onClick={() => approveAd(ad.id, "active")} disabled={adLoading}
                    className="fv-btn-primary w-auto! px-4 py-1.5 text-xs">✓ Approve</button>
                  <button onClick={() => approveAd(ad.id, "rejected", "Does not meet guidelines")} disabled={adLoading}
                    className="px-4 py-1.5 rounded-md bg-red-50 border border-red-200 text-red-500 text-xs">✕ Reject</button>
                </div>
              )}
              {ad.status === "active" && (
                <p className="text-emerald-500 text-xs">{ad.impressions} impressions · {ad.clicks} clicks</p>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "users" && (
        <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
          {!usersLoaded && <p className="text-center text-gray-400 py-8">Loading users…</p>}
          {usersLoaded && userList.length === 0 && <p className="text-center text-gray-400 py-8">No users found.</p>}
          {userList.map(u => (
            <div key={u.id} className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold text-white shrink-0"
                style={{ background: u.role === "admin" ? "linear-gradient(135deg,#f59e0b,#f97316)" : "linear-gradient(135deg,#219EBC,#023047)" }}>
                {(u.name || u.email || "?")[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 font-semibold text-sm truncate">{u.name || "—"}</p>
                <p className="text-gray-400 text-xs truncate">{u.email}</p>
              </div>
              <div className="flex gap-1.5 shrink-0">
                {u.role === "admin" && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200">ADMIN</span>
                )}
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border
                  ${u.plan === "pro" ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-gray-100 text-gray-400 border-gray-200"}`}>
                  {u.plan?.toUpperCase() || "FREE"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "msgs" && (
        <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
          {!msgsLoaded && <p className="text-center text-gray-400 py-8">Loading messages…</p>}
          {msgsLoaded && messages.length === 0 && <p className="text-center text-gray-400 py-8">No messages yet.</p>}
          {messages.map(m => (
            <div key={m.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="text-gray-900 font-semibold text-sm">{m.name || m.email}</p>
                  <p className="text-gray-400 text-xs">{m.email} · {new Date(m.created_at).toLocaleDateString()}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200 shrink-0">
                  {m.topic}
                </span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{m.message}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "stats" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { val: stats.totalFonts,     label: "Total Fonts" },
            { val: stats.publicFonts,    label: "Public Fonts" },
            { val: stats.totalUsers,     label: "Registered Users" },
            { val: stats.adminUsers,     label: "Admin Users" },
            { val: stats.totalDownloads, label: "Total Downloads" },
            { val: stats.pendingAds,     label: "Pending Ads" },
            { val: stats.activeAds,      label: "Active Ads" },
            { val: "Supabase",           label: "Database" },
          ].map(s => (
            <div key={s.label} className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
              <p className="text-xl font-black text-gray-900">{s.val}</p>
              <p className="text-gray-400 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}
    </Overlay>
  );
}
