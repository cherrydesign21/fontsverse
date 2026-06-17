"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useFonts } from "@/context/FontsContext";
import { useAuth } from "@/context/AuthContext";
import { useNotif } from "@/context/NotifContext";
import AuthModal from "./AuthModal";
import UploadModal from "./UploadModal";

type Section = "overview" | "fonts" | "users" | "ads" | "messages" | "packs";
type Modal    = "auth" | "upload" | null;

interface UserRow { id: string; name: string; email: string; role: string; plan: string; created_at: string; }
interface MsgRow  { id: string; name: string; email: string; topic: string; message: string; created_at: string; }
interface Ad { id: string; title: string; tagline?: string; destination_url: string; contact_email: string; budget?: number; status: string; impressions: number; clicks: number; created_at: string; }
interface Pack { id: string; name: string; description?: string; created_at: string; font1: { id:string; name:string; }; font2: { id:string; name:string; }; }

const AMBER_GRAD = "linear-gradient(122deg, #FFB703 5%, #FB8500 105%)";
const NAVY = "#023047";

const NAV_ITEMS: { id: Section; icon: string; label: string }[] = [
  { id: "overview",  icon: "📊", label: "Overview"   },
  { id: "fonts",     icon: "🔤", label: "Fonts"       },
  { id: "users",     icon: "👥", label: "Users"       },
  { id: "ads",       icon: "📢", label: "Ads"         },
  { id: "messages",  icon: "💬", label: "Messages"    },
  { id: "packs",     icon: "📦", label: "Font Packs"  },
];

export default function AdminPageClient() {
  const { user, isAdmin, profile, signOut, loading: authLoading } = useAuth();
  const { fonts, updateFont, removeFont } = useFonts();
  const { notify } = useNotif();
  const router = useRouter();

  const [section, setSection]   = useState<Section>("overview");
  const [modal, setModal]       = useState<Modal>(null);
  const close = () => setModal(null);

  // Data
  const [stats, setStats]       = useState({ totalFonts:0, publicFonts:0, totalUsers:0, adminUsers:0, totalDownloads:0, pendingAds:0, activeAds:0 });
  const [userList, setUserList] = useState<UserRow[]>([]);
  const [messages, setMessages] = useState<MsgRow[]>([]);
  const [ads, setAds]           = useState<Ad[]>([]);
  const [packs, setPacks]       = useState<Pack[]>([]);

  // Fonts tab state
  const [fontSearch, setFontSearch]   = useState("");
  const [filterPub, setFilterPub]     = useState<"all"|"public"|"private">("all");

  // Packs tab state
  const [packName, setPackName] = useState("");
  const [packDesc, setPackDesc] = useState("");
  const [font1Id, setFont1Id]   = useState("");
  const [font2Id, setFont2Id]   = useState("");
  const [savingPack, setSavingPack] = useState(false);
  const [adLoading, setAdLoading]   = useState(false);

  // Load data on mount
  useEffect(() => {
    if (!isAdmin) return;
    fetch("/api/admin").then(r=>r.json()).then(d=>setStats(d)).catch(()=>{});
    fetch("/api/admin?type=users").then(r=>r.json()).then(d=>setUserList(d.users||[])).catch(()=>{});
    fetch("/api/admin?type=messages").then(r=>r.json()).then(d=>setMessages(d.messages||[])).catch(()=>{});
    fetch("/api/ads?admin=1").then(r=>r.json()).then(d=>setAds(d.ads||[])).catch(()=>{});
    fetch("/api/packs").then(r=>r.json()).then(d=>setPacks(d.packs||[])).catch(()=>{});
  }, [isAdmin]);

  const filteredFonts = fonts.filter(f => {
    const q = fontSearch.toLowerCase();
    const mq = f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q);
    const mp = filterPub==="all" || (filterPub==="public" ? f.is_public : !f.is_public);
    return mq && mp;
  });

  const approveAd = async (id: string, status: "active"|"rejected") => {
    setAdLoading(true);
    const res = await fetch("/api/ads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, reviewed_by: user?.id }),
    });
    const json = await res.json();
    setAdLoading(false);
    if (json.success) {
      setAds(p => p.map(a => a.id === id ? json.ad : a));
      notify(`Ad ${status === "active" ? "approved ✓" : "rejected"}`);
    }
  };

  const createPack = async () => {
    if (!packName.trim() || !font1Id || !font2Id) return;
    setSavingPack(true);
    const res = await fetch("/api/packs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: packName.trim(), description: packDesc.trim()||null, font1_id: font1Id, font2_id: font2Id }),
    });
    const data = await res.json();
    setSavingPack(false);
    if (data.pack) {
      fetch("/api/packs").then(r=>r.json()).then(d=>setPacks(d.packs||[])).catch(()=>{});
      setPackName(""); setPackDesc(""); setFont1Id(""); setFont2Id("");
      notify("Font pack created ✓");
    } else {
      notify(data.error || "Could not create pack — run the SQL migration first", "error");
    }
  };

  const deletePack = async (id: string) => {
    await fetch(`/api/packs?id=${id}`, { method: "DELETE" });
    setPacks(p => p.filter(x => x.id !== id));
    notify("Pack deleted");
  };

  // ── Auth gates ───────────────────────────────────────────────────────────
  if (authLoading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-7 h-7 rounded-full border-2 border-gray-200 border-t-amber-500 animate-spin" />
    </div>
  );

  if (!user) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <img src="/logo.svg" alt="FontsVerse" width={140} height={24} className="mx-auto mb-8" />
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-bold mb-2">Sign in required</h2>
        <button onClick={() => setModal("auth")} className="fv-btn-primary w-auto! px-8 mt-4">Sign In</button>
      </div>
      {modal === "auth" && <AuthModal onClose={close} />}
    </div>
  );

  if (!isAdmin) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4">🚫</div>
        <h2 className="text-xl font-bold mb-2">Admin Access Only</h2>
        <p className="text-gray-500 text-sm mb-6">Your account does not have admin privileges.</p>
        <button onClick={() => router.push("/")} className="fv-btn-primary w-auto! px-8">Go Home</button>
      </div>
    </div>
  );

  const pendingAdsCount = ads.filter(a => a.status === "pending").length;

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]" style={{ fontFamily: "Outfit, system-ui, sans-serif" }}>

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-[100] bg-white border-b border-[#e1e1e1] flex items-center px-6 gap-6"
        style={{ height: 64 }}>
        <Link href="/" className="shrink-0">
          <Image src="/logo.svg" alt="FontsVerse" width={110} height={20} priority />
        </Link>
        <span className="text-[11px] font-bold px-2 py-0.5 rounded text-white shrink-0"
          style={{ background: AMBER_GRAD }}>ADMIN</span>

        <div className="flex items-center gap-5 ml-auto text-[14px] font-medium text-gray-500">
          <Link href="/"      className="hover:text-[#023047] transition-colors hidden md:block">← Public Site</Link>
          <Link href="/fonts" className="hover:text-[#023047] transition-colors hidden md:block">Browse Fonts</Link>
          <button onClick={() => setModal("upload")}
            className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold text-black"
            style={{ backgroundImage: AMBER_GRAD }}>
            Upload Font
          </button>
          <button
            onClick={() => { signOut(); notify("Signed out"); router.push("/"); }}
            className="text-red-400 hover:text-red-600 text-[13px] transition-colors">
            Sign Out
          </button>
        </div>
      </header>

      <div className="flex flex-1" style={{ paddingTop: 64 }}>

        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <aside className="shrink-0 overflow-y-auto"
          style={{ width: 240, background: NAVY, position: "sticky", top: 64, height: "calc(100vh - 64px)" }}>

          {/* Profile card */}
          <div className="px-5 py-6 border-b border-white/10">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold text-black mb-3"
              style={{ backgroundImage: AMBER_GRAD }}>
              {(profile?.name || user.email || "A")[0].toUpperCase()}
            </div>
            <p className="text-white font-semibold text-[14px] truncate">{profile?.name || "Admin"}</p>
            <p className="text-white/50 text-[12px] truncate">{user.email}</p>
          </div>

          {/* Nav */}
          <nav className="py-4">
            {NAV_ITEMS.map(item => {
              const badge = item.id === "ads" && pendingAdsCount > 0 ? pendingAdsCount :
                            item.id === "messages" && messages.length > 0 ? messages.length : 0;
              return (
                <button key={item.id} onClick={() => setSection(item.id)}
                  className="w-full flex items-center justify-between px-5 py-3 text-left transition-all"
                  style={{
                    background: section === item.id ? "rgba(255,183,3,0.15)" : "transparent",
                    borderLeft: section === item.id ? "3px solid #FFB703" : "3px solid transparent",
                  }}>
                  <div className="flex items-center gap-3">
                    <span className="text-base w-5">{item.icon}</span>
                    <span className={`text-[14px] font-medium ${section === item.id ? "text-[#FFB703]" : "text-white/70"}`}>
                      {item.label}
                    </span>
                  </div>
                  {badge > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-black"
                      style={{ backgroundImage: AMBER_GRAD }}>{badge}</span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Stats summary */}
          <div className="px-5 pb-6 mt-4 space-y-2">
            {[
              { label: "Total Fonts",  val: stats.totalFonts },
              { label: "Users",        val: stats.totalUsers },
              { label: "Downloads",    val: stats.totalDownloads },
            ].map(s => (
              <div key={s.label} className="flex justify-between items-center">
                <span className="text-white/40 text-[12px]">{s.label}</span>
                <span className="text-white text-[12px] font-semibold">{s.val || "—"}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* ── Main content ────────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 p-8 overflow-auto">

          {/* ── Overview ── */}
          {section === "overview" && (
            <div>
              <h1 className="text-2xl font-black text-gray-900 mb-1">Overview</h1>
              <p className="text-gray-400 text-sm mb-8">Platform-wide stats</p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { val: stats.totalFonts,     label: "Total Fonts",      color: "#023047" },
                  { val: stats.totalUsers,      label: "Registered Users", color: "#219EBC" },
                  { val: stats.totalDownloads,  label: "Downloads",        color: "#FB8500" },
                  { val: stats.pendingAds,      label: "Pending Ads",      color: "#ef4444" },
                ].map(s => (
                  <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <p className="text-3xl font-black mb-1" style={{ color: s.color }}>{s.val || 0}</p>
                    <p className="text-gray-400 text-sm">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <p className="font-bold text-gray-900 mb-3">Font Breakdown</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Total fonts</span><span className="font-semibold">{stats.totalFonts}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Public fonts</span><span className="font-semibold text-emerald-600">{stats.publicFonts}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Private fonts</span><span className="font-semibold text-gray-400">{stats.totalFonts - stats.publicFonts}</span></div>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <p className="font-bold text-gray-900 mb-3">Ads</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Active ads</span><span className="font-semibold text-emerald-600">{stats.activeAds}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Pending review</span><span className="font-semibold text-amber-600">{stats.pendingAds}</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Fonts ── */}
          {section === "fonts" && (
            <div>
              <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
                <div>
                  <h1 className="text-2xl font-black text-gray-900 mb-1">Fonts</h1>
                  <p className="text-gray-400 text-sm">{fonts.length} fonts on platform</p>
                </div>
                <button onClick={() => setModal("upload")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-black"
                  style={{ backgroundImage: AMBER_GRAD }}>
                  + Upload Font
                </button>
              </div>

              {/* Search + filter */}
              <div className="flex gap-3 mb-5 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  <input className="fv-input pl-10" placeholder="Search fonts…" value={fontSearch} onChange={e => setFontSearch(e.target.value)} />
                </div>
                <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                  {(["all","public","private"] as const).map(v => (
                    <button key={v} onClick={() => setFilterPub(v)}
                      className={`px-3 py-1.5 rounded-md text-[12px] font-medium capitalize transition-all
                        ${filterPub===v ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                {filteredFonts.map(f => (
                  <div key={f.id} className="bg-white border border-gray-200 rounded-xl px-5 py-3.5 flex items-center gap-4 hover:bg-gray-50 transition-colors shadow-sm">
                    <div className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center" style={{ background: f.bg_color }}>
                      <span className="text-xs font-bold" style={{ color: f.text_color }}>{f.name.slice(0,2)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 font-semibold text-sm truncate">{f.name}</p>
                      <p className="text-gray-400 text-xs">{f.category} · {f.downloads.toLocaleString()} downloads</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => updateFont(f.id, { is_public: !f.is_public })}
                        className={`px-3 py-1 rounded-full text-[10px] font-semibold border transition-all
                          ${f.is_public ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-gray-100 border-gray-200 text-gray-400"}`}>
                        {f.is_public ? "Public ✓" : "Make Public"}
                      </button>
                      <Link href={`/fonts/${f.slug}`}
                        className="px-3 py-1 rounded-md bg-gray-50 border border-gray-200 text-gray-500 text-[11px] hover:bg-gray-100 transition-colors">
                        View
                      </Link>
                      <button onClick={() => { removeFont(f.id); notify(`"${f.name}" removed`); }}
                        className="px-3 py-1 rounded-md bg-red-50 border border-red-200 text-red-500 text-[11px]">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                {filteredFonts.length === 0 && <p className="text-center text-gray-400 py-16">No fonts match your filter.</p>}
              </div>
            </div>
          )}

          {/* ── Users ── */}
          {section === "users" && (
            <div>
              <h1 className="text-2xl font-black text-gray-900 mb-1">Users</h1>
              <p className="text-gray-400 text-sm mb-6">{userList.length} registered users</p>
              <div className="space-y-2">
                {userList.length === 0 && <p className="text-center text-gray-400 py-16">Loading users…</p>}
                {userList.map(u => (
                  <div key={u.id} className="bg-white border border-gray-200 rounded-xl px-5 py-3.5 flex items-center gap-4 shadow-sm">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                      style={{ background: u.role === "admin" ? "linear-gradient(135deg,#f59e0b,#f97316)" : "linear-gradient(135deg,#219EBC,#023047)" }}>
                      {(u.name || u.email || "?")[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 font-semibold text-sm truncate">{u.name || "—"}</p>
                      <p className="text-gray-400 text-xs truncate">{u.email}</p>
                    </div>
                    <div className="flex gap-2 shrink-0 items-center">
                      <span className="text-gray-400 text-[11px]">{new Date(u.created_at).toLocaleDateString()}</span>
                      {u.role === "admin" && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200">ADMIN</span>}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border
                        ${u.plan === "pro" ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-gray-100 text-gray-400 border-gray-200"}`}>
                        {(u.plan || "free").toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Ads ── */}
          {section === "ads" && (
            <div>
              <h1 className="text-2xl font-black text-gray-900 mb-1">Ads</h1>
              <p className="text-gray-400 text-sm mb-6">{ads.length} total · {pendingAdsCount} pending review</p>
              <div className="space-y-4">
                {ads.length === 0 && <p className="text-center text-gray-400 py-16">No ad submissions yet.</p>}
                {ads.map(ad => (
                  <div key={ad.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="text-gray-900 font-bold">{ad.title}</p>
                        <p className="text-gray-400 text-sm mt-0.5">{ad.tagline}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[11px] font-bold shrink-0
                        ${ad.status==="active" ? "bg-emerald-50 text-emerald-600 border border-emerald-200" :
                          ad.status==="pending" ? "bg-amber-50 text-amber-600 border border-amber-200" :
                          "bg-red-50 text-red-500 border border-red-200"}`}>
                        {ad.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400 space-y-1 mb-4">
                      <p className="truncate">{ad.destination_url}</p>
                      <p>{ad.contact_email}{ad.budget ? ` · $${ad.budget}/mo` : ""} · {new Date(ad.created_at).toLocaleDateString()}</p>
                    </div>
                    {ad.status === "pending" && (
                      <div className="flex gap-2">
                        <button onClick={() => approveAd(ad.id, "active")} disabled={adLoading}
                          className="px-5 py-2 rounded-xl text-[13px] font-semibold text-black disabled:opacity-50"
                          style={{ backgroundImage: AMBER_GRAD }}>✓ Approve</button>
                        <button onClick={() => approveAd(ad.id, "rejected")} disabled={adLoading}
                          className="px-5 py-2 rounded-xl bg-red-50 border border-red-200 text-red-500 text-[13px]">✕ Reject</button>
                      </div>
                    )}
                    {ad.status === "active" && (
                      <p className="text-emerald-600 text-sm font-medium">{ad.impressions} impressions · {ad.clicks} clicks</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Messages ── */}
          {section === "messages" && (
            <div>
              <h1 className="text-2xl font-black text-gray-900 mb-1">Messages</h1>
              <p className="text-gray-400 text-sm mb-6">{messages.length} contact form submissions</p>
              <div className="space-y-4">
                {messages.length === 0 && <p className="text-center text-gray-400 py-16">No messages yet.</p>}
                {messages.map(m => (
                  <div key={m.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="text-gray-900 font-bold">{m.name || m.email}</p>
                        <p className="text-gray-400 text-sm">{m.email} · {new Date(m.created_at).toLocaleDateString()}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-gray-100 text-gray-500 border border-gray-200 shrink-0">
                        {m.topic}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{m.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Font Packs ── */}
          {section === "packs" && (
            <div>
              <h1 className="text-2xl font-black text-gray-900 mb-1">Font Packs</h1>
              <p className="text-gray-400 text-sm mb-6">Curated 2-font pairings shown on /packs</p>

              {/* Create pack form */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
                <p className="font-bold text-gray-900 mb-4">Create New Pack</p>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input className="fv-input" placeholder="Pack name (e.g. Editorial Duo)"
                      value={packName} onChange={e => setPackName(e.target.value)} />
                    <input className="fv-input" placeholder="Description (optional)"
                      value={packDesc} onChange={e => setPackDesc(e.target.value)} />
                  </div>
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
                  <button onClick={createPack} disabled={savingPack || !packName || !font1Id || !font2Id}
                    className="px-6 py-2.5 rounded-xl text-[13px] font-semibold text-black disabled:opacity-50"
                    style={{ backgroundImage: AMBER_GRAD }}>
                    {savingPack ? "Creating…" : "Create Pack"}
                  </button>
                </div>
              </div>

              {/* Existing packs */}
              <div className="space-y-3">
                {packs.length === 0 && (
                  <div className="text-center py-12 border border-dashed border-gray-200 rounded-2xl">
                    <p className="text-gray-400">No packs yet. Create one above.</p>
                    <p className="text-gray-300 text-xs mt-1">Note: requires font_packs table in Supabase.</p>
                  </div>
                )}
                {packs.map(pack => (
                  <div key={pack.id} className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center justify-between gap-4 shadow-sm">
                    <div>
                      <p className="font-bold text-gray-900">{pack.name}</p>
                      <p className="text-gray-400 text-sm">{pack.font1.name} + {pack.font2.name}</p>
                    </div>
                    <button onClick={() => deletePack(pack.id)}
                      className="px-4 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-500 text-[12px] shrink-0">
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>

      {modal === "auth"   && <AuthModal onClose={close} />}
      {modal === "upload" && <UploadModal onClose={close} onAuthRequired={() => setModal("auth")} />}
    </div>
  );
}
