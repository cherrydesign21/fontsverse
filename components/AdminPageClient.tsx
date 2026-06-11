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
    <div className="min-h-screen bg-[#f5f4ff] text-gray-900 flex items-center justify-center">
      <ParticleCanvas />
      <div className="relative z-10 text-center">
        <img src="/logo.svg" alt="FontsVerse" width={140} height={24} className="mx-auto mb-8" />
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-bold mb-2">Sign in required</h2>
        <p className="text-gray-500 text-sm mb-6">Please sign in to continue.</p>
        <button onClick={() => setModal("auth")} className="fv-btn-primary w-auto! px-8">Sign In</button>
      </div>
      {modal==="auth" && <AuthModal onClose={close} />}
    </div>
  );

  if (!isAdmin) return (
    <div className="min-h-screen bg-[#f5f4ff] text-gray-900 flex items-center justify-center">
      <ParticleCanvas />
      <div className="relative z-10 text-center">
        <div className="text-5xl mb-4">🚫</div>
        <h2 className="text-xl font-bold mb-2">Admin Access Only</h2>
        <p className="text-gray-500 text-sm mb-6">Your account does not have admin privileges.</p>
        <button onClick={() => router.push("/")} className="fv-btn-primary w-auto! px-8">Go Home</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f4ff] text-gray-900">
      <ParticleCanvas />
      <Header onSearch={() => {}} onLoginClick={() => setModal("auth")}
        onUploadClick={() => setModal("upload")} onAdClick={() => setModal("ad")}
        onAdminClick={() => setModal("adminModal")} onAccountClick={() => setModal("account")} />

      <main className="relative z-10 max-w-[1100px] mx-auto px-6 pt-24 pb-20">
        <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-black tracking-tight">Admin Dashboard</h1>
              <span className="text-[10px] bg-amber-100 text-amber-600 border border-amber-200 px-2 py-1 rounded font-bold">ADMIN ONLY</span>
            </div>
            <p className="text-gray-400 text-sm">Signed in as {profile?.name} · {profile?.email}</p>
          </div>
          <button onClick={() => setAdding(!adding)} className="fv-btn-primary w-auto! px-5">+ Add Font</button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { val: String(stats.totalFonts||fonts.length), label: "Total Fonts" },
            { val: String(stats.totalUsers||"—"),           label: "Users" },
            { val: String(stats.totalDownloads||"—"),       label: "Downloads" },
            { val: String(stats.pendingAds||"—"),           label: "Pending Ads" },
          ].map(s => (
            <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-5 text-center shadow-sm">
              <p className="text-2xl font-black text-gray-900">{s.val}</p>
              <p className="text-gray-400 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {adding && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
            <h3 className="text-gray-900 font-bold mb-4">Add Font (metadata only — use Upload for real files)</h3>
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[200px]">
                <input className="fv-input" placeholder="Font name" value={newName} onChange={e => setNewName(e.target.value)} />
              </div>
              <div className="min-w-[160px]">
                <select className="fv-input" value={newCat} onChange={e => setNewCat(e.target.value)}>
                  {["Sans-Serif","Serif","Monospace","Display","Handwriting","Condensed"].map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setAdding(false); setModal("upload"); }} className="fv-btn-primary w-auto! px-5">Upload Real Font</button>
                <button onClick={() => setAdding(false)} className="px-4 py-2.5 rounded-lg bg-gray-100 border border-gray-200 text-gray-500 text-sm">Cancel</button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input className="fv-input pl-10" placeholder="Search fonts…" value={search} onChange={e => setSearch(e.target.value)} />
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
          {filtered.map(f => (
            <div key={f.id} className="bg-white border border-gray-200 rounded-xl px-5 py-3.5
              flex items-center gap-4 flex-wrap hover:bg-gray-50 transition-colors shadow-sm">
              <div className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center" style={{ background: f.bg_color }}>
                <span className="text-xs font-bold" style={{ color: f.text_color }}>{f.name.slice(0,2)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 font-semibold text-sm truncate">{f.name}</p>
                <p className="text-gray-400 text-xs mt-0.5">{f.category} · {f.downloads.toLocaleString()} downloads</p>
              </div>
              <div className="flex items-center gap-2 ml-auto shrink-0">
                <button onClick={() => updateFont(f.id, { is_public: !f.is_public })}
                  className={`px-3 py-1 rounded-full text-[10px] font-semibold border transition-all
                    ${f.is_public
                      ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                      : "bg-gray-100 border-gray-200 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600"}`}>
                  {f.is_public ? "Public ✓" : "Make Public"}
                </button>
                <button onClick={() => { removeFont(f.id); notify(`"${f.name}" removed`); }}
                  className="px-3 py-1 rounded-md bg-red-50 border border-red-200 text-red-500 text-xs">
                  Remove
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="text-center py-16 text-gray-400">No fonts match your filter.</div>}
        </div>

        <div className="mt-12 bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <h3 className="text-amber-700 font-bold text-sm mb-3">👑 Admin vs Regular User</h3>
          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-gray-600 font-semibold mb-2">Admin 👑</p>
              <ul className="space-y-1.5 text-gray-500">
                <li>✅ Add/remove any font on the platform</li>
                <li>✅ Toggle any font public/private</li>
                <li>✅ Approve or reject ad submissions</li>
                <li>✅ See all users &amp; download stats</li>
                <li>✅ Access /admin page</li>
                <li>✅ Upload &amp; manage own fonts</li>
              </ul>
            </div>
            <div>
              <p className="text-gray-600 font-semibold mb-2">Regular User 👤</p>
              <ul className="space-y-1.5 text-gray-500">
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
