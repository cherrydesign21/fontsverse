"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFonts } from "@/context/FontsContext";
import { useAuth } from "@/context/AuthContext";
import { useNotif } from "@/context/NotifContext";
import ParticleCanvas from "./ParticleCanvas";
import Header from "./Header";
import AuthModal from "./AuthModal";
import UploadModal from "./UploadModal";
import AdModal from "./AdModal";
import AccountModal from "./AccountModal";
import AdminModal from "./AdminModal";

type Modal = "auth"|"upload"|"ad"|"account"|"adminModal"|null;

export default function AdminPageClient() {
  const { user, isAdmin, profile } = useAuth();
  const { fonts, updateFont, removeFont } = useFonts();
  const { notify } = useNotif();
  const router = useRouter();
  const [modal, setModal] = useState<Modal>(null);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCat, setNewCat] = useState("Sans-Serif");
  const [search, setSearch] = useState("");
  const [filterPub, setFilterPub] = useState<"all"|"public"|"private">("all");
  const [stats, setStats] = useState({ totalFonts:0, totalUsers:0, totalDownloads:0, pendingAds:0, activeAds:0 });
  const close = () => setModal(null);

  useEffect(() => {
    if (isAdmin) {
      fetch("/api/admin").then(r=>r.json()).then(d=>setStats(d)).catch(()=>{});
    }
  }, [isAdmin]);

  const filtered = fonts.filter(f => {
    const q = search.toLowerCase();
    const matchT = f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q);
    const matchP = filterPub==="all" || (filterPub==="public" ? f.is_public : !f.is_public);
    return matchT && matchP;
  });

  if (!user) return (
    <div className="min-h-screen bg-[#07070f] text-white flex items-center justify-center">
      <ParticleCanvas />
      <div className="relative z-10 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-bold mb-2">Sign in required</h2>
        <p className="text-white/40 text-sm mb-6">Please sign in to continue.</p>
        <button onClick={() => setModal("auth")} className="fv-btn-primary !w-auto px-8">Sign In</button>
      </div>
      {modal==="auth" && <AuthModal onClose={close} />}
    </div>
  );

  if (!isAdmin) return (
    <div className="min-h-screen bg-[#07070f] text-white flex items-center justify-center">
      <ParticleCanvas />
      <div className="relative z-10 text-center">
        <div className="text-5xl mb-4">🚫</div>
        <h2 className="text-xl font-bold mb-2">Admin Access Only</h2>
        <p className="text-white/40 text-sm mb-6">Your account does not have admin privileges.</p>
        <button onClick={() => router.push("/")} className="fv-btn-primary !w-auto px-8">Go Home</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#07070f] text-white">
      <ParticleCanvas />
      <Header onSearch={() => {}} onLoginClick={() => setModal("auth")}
        onUploadClick={() => setModal("upload")} onAdClick={() => setModal("ad")}
        onAdminClick={() => setModal("adminModal")} onAccountClick={() => setModal("account")} />

      <main className="relative z-10 max-w-[1100px] mx-auto px-6 pt-24 pb-20">
        <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-black tracking-tight">Admin Dashboard</h1>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-1 rounded font-bold">ADMIN ONLY</span>
            </div>
            <p className="text-white/40 text-sm">Signed in as {profile?.name} · {profile?.email}</p>
          </div>
          <button onClick={() => setAdding(!adding)} className="fv-btn-primary !w-auto px-5">+ Add Font</button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { val: String(stats.totalFonts||fonts.length), label: "Total Fonts", color:"violet" },
            { val: String(stats.totalUsers||"—"),           label: "Users",       color:"blue" },
            { val: String(stats.totalDownloads||"—"),       label: "Downloads",   color:"emerald" },
            { val: String(stats.pendingAds||"—"),           label: "Pending Ads", color:"amber" },
          ].map(s => (
            <div key={s.label} className="bg-white/4 border border-white/8 rounded-xl p-5 text-center">
              <p className="text-2xl font-black text-white">{s.val}</p>
              <p className="text-white/30 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Add form */}
        {adding && (
          <div className="bg-white/4 border border-white/10 rounded-2xl p-6 mb-6">
            <h3 className="text-white font-bold mb-4">Add Font (metadata only — use Upload for real files)</h3>
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[200px]">
                <input className="fv-input" placeholder="Font name" value={newName}
                  onChange={e => setNewName(e.target.value)} />
              </div>
              <div className="min-w-[160px]">
                <select className="fv-input" value={newCat} onChange={e => setNewCat(e.target.value)}>
                  {["Sans-Serif","Serif","Monospace","Display","Handwriting","Condensed"].map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setAdding(false); setModal("upload"); }} className="fv-btn-primary !w-auto px-5">Upload Real Font</button>
                <button onClick={() => setAdding(false)} className="px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white/50 text-sm">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30"
              fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input className="fv-input pl-10" placeholder="Search fonts…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-1 bg-white/4 rounded-lg p-1">
            {(["all","public","private"] as const).map(v => (
              <button key={v} onClick={() => setFilterPub(v)}
                className={`px-3 py-1.5 rounded-md text-[12px] font-medium capitalize transition-all
                  ${filterPub===v ? "bg-white/12 text-white" : "text-white/40 hover:text-white/70"}`}>
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {filtered.map(f => (
            <div key={f.id} className="bg-white/3 border border-white/6 rounded-xl px-5 py-3.5
              flex items-center gap-4 flex-wrap hover:bg-white/4 transition-colors">
              <div className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ background: f.bg_color }}>
                <span className="text-xs font-bold" style={{ color: f.text_color }}>{f.name.slice(0,2)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">{f.name}</p>
                <p className="text-white/30 text-xs mt-0.5">{f.category} · {f.downloads.toLocaleString()} downloads</p>
              </div>
              <div className="flex items-center gap-2 ml-auto flex-shrink-0">
                <button onClick={() => updateFont(f.id, { is_public: !f.is_public })}
                  className={`px-3 py-1 rounded-full text-[10px] font-semibold border transition-all
                    ${f.is_public
                      ? "bg-emerald-500/15 border-emerald-500/25 text-emerald-300"
                      : "bg-white/5 border-white/10 text-white/30 hover:bg-emerald-500/12 hover:text-emerald-300"}`}>
                  {f.is_public ? "Public ✓" : "Make Public"}
                </button>
                <button onClick={() => { removeFont(f.id); notify(`"${f.name}" removed`); }}
                  className="px-3 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                  Remove
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="text-center py-16 text-white/30">No fonts match your filter.</div>}
        </div>

        {/* Admin vs User */}
        <div className="mt-12 bg-amber-500/6 border border-amber-500/15 rounded-2xl p-6">
          <h3 className="text-amber-300 font-bold text-sm mb-3">👑 Admin vs Regular User</h3>
          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-white/60 font-semibold mb-2">Admin 👑</p>
              <ul className="space-y-1.5 text-white/45">
                <li>✅ Add/remove any font on the platform</li>
                <li>✅ Toggle any font public/private</li>
                <li>✅ Approve or reject ad submissions</li>
                <li>✅ See all users &amp; download stats</li>
                <li>✅ Access /admin page</li>
                <li>✅ Upload &amp; manage own fonts</li>
              </ul>
            </div>
            <div>
              <p className="text-white/60 font-semibold mb-2">Regular User 👤</p>
              <ul className="space-y-1.5 text-white/45">
                <li>✅ Upload &amp; manage own fonts</li>
                <li>✅ Set own fonts public/private</li>
                <li>✅ Get integration code for any font</li>
                <li>✅ Download fonts</li>
                <li>🚫 Cannot access /admin</li>
                <li>🚫 Cannot manage other fonts or ads</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {modal==="auth"       && <AuthModal onClose={close} />}
      {modal==="upload"     && <UploadModal onClose={close} onAuthRequired={() => setModal("auth")} />}
      {modal==="ad"         && <AdModal onClose={close} />}
      {modal==="account"    && <AccountModal onClose={close} />}
      {modal==="adminModal" && <AdminModal onClose={close} />}
    </div>
  );
}
