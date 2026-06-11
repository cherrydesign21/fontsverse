"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useUserFonts } from "@/context/UserFontsContext";
import { useNotif } from "@/context/NotifContext";
import ParticleCanvas from "./ParticleCanvas";
import Header from "./Header";
import AuthModal from "./AuthModal";
import UploadModal from "./UploadModal";
import AdModal from "./AdModal";
import AdminModal from "./AdminModal";

type Modal = "auth" | "upload" | "ad" | "admin" | null;

export default function AccountPageClient() {
  const { user, profile, isAdmin, updateProfile, signOut } = useAuth();
  const { fonts, removeFont } = useUserFonts();
  const { notify } = useNotif();
  const router = useRouter();
  const [modal, setModal] = useState<Modal>(null);
  const [name, setName]   = useState("");
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState(false);
  const [tab, setTab]     = useState<"profile" | "fonts" | "projects">("profile");
  const close = () => setModal(null);

  useEffect(() => {
    if (profile) { setName(profile.name); setEmail(profile.email); }
  }, [profile]);

  if (!user) return (
    <div className="min-h-screen bg-[#07070f] text-white flex items-center justify-center">
      <ParticleCanvas />
      <div className="relative z-10 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-bold mb-2">Sign in required</h2>
        <p className="text-white/40 text-sm mb-6">Please sign in to view your account.</p>
        <button onClick={() => setModal("auth")} className="fv-btn-primary !w-auto px-8">Sign In</button>
      </div>
      {modal === "auth" && <AuthModal onClose={close} />}
    </div>
  );

  const save = () => {
    if (!name.trim()) return;
    updateProfile({ name: name.trim(), email: email.trim() || user.email });
    setSaved(true); notify("Profile updated ✓");
    setTimeout(() => setSaved(false), 2000);
  };

  const TABS = [
    { id: "profile",  label: "Profile" },
    { id: "fonts",    label: `My Fonts (${fonts.length})` },
    { id: "projects", label: "Projects" },
  ] as const;

  return (
    <div className="min-h-screen bg-[#07070f] text-white">
      <ParticleCanvas />
      <Header onSearch={() => {}} onLoginClick={() => setModal("auth")}
        onUploadClick={() => setModal("upload")} onAdClick={() => setModal("ad")}
        onAdminClick={() => setModal("admin")} onAccountClick={() => {}} />

      <main className="relative z-10 max-w-[760px] mx-auto px-6 pt-24 pb-20">
        {/* Profile header */}
        <div className="flex items-center gap-5 mb-8">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white shrink-0
            ${isAdmin ? "bg-gradient-to-br from-amber-400 to-orange-500" : "bg-gradient-to-br from-violet-500 to-pink-500"}`}>
            {(profile?.name||"U")[0].toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black">{profile?.name}</h1>
              {isAdmin && <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-bold">ADMIN</span>}
            </div>
            <p className="text-white/40 text-sm">{user?.email}</p>
          </div>
          <button onClick={async () => { await signOut(); router.push("/"); }}
            className="ml-auto px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20
              text-red-400 hover:bg-red-500/20 text-sm transition-all">
            Sign Out
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/4 rounded-xl p-1 mb-7 w-fit">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm transition-all
                ${tab === t.id ? "bg-violet-500/25 text-violet-300 font-medium" : "text-white/40 hover:text-white/70"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Profile */}
        {tab === "profile" && (
          <div className="bg-white/2 border border-white/7 rounded-2xl p-7 space-y-4">
            <h2 className="text-lg font-bold">Account Settings</h2>
            <div>
              <label className="text-white/40 text-xs block mb-1.5">Display Name</label>
              <input className="fv-input" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label className="text-white/40 text-xs block mb-1.5">Email Address</label>
              <input className="fv-input" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { val: fonts.length,   label: "Fonts" },
                { val: fonts.filter(f => f.is_public).length, label: "Public" },
                { val: profile?.role,      label: "Role" },
              ].map(s => (
                <div key={s.label} className="bg-white/4 border border-white/7 rounded-lg p-3 text-center">
                  <p className="text-lg font-black text-white capitalize">{s.val}</p>
                  <p className="text-white/35 text-[11px] mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
            {isAdmin && (
              <div className="bg-amber-500/8 border border-amber-500/18 rounded-lg px-3 py-2">
                <p className="text-amber-300 text-xs">👑 Admin account — <a href="/admin" className="underline">Open Admin Dashboard →</a></p>
              </div>
            )}
            <button onClick={save} className={`fv-btn-primary w-full ${saved ? "!bg-emerald-700" : ""}`}>
              {saved ? "✓ Saved" : "Save Changes"}
            </button>
          </div>
        )}

        {/* Fonts */}
        {tab === "fonts" && (
          fonts.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🔤</div>
              <p className="text-white/40 mb-4">No fonts uploaded yet</p>
              <button onClick={() => setModal("upload")} className="fv-btn-primary !w-auto px-8">Upload First Font</button>
            </div>
          ) : (
            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))" }}>
              {fonts.map(f => (
                <div key={f.id} className="rounded-xl border border-white/8 overflow-hidden flex flex-col" style={{ background: f.bg_color }}>
                  <div className="flex-1 flex items-center justify-center p-5 min-h-[100px]">
                    <span className="text-xl font-bold" style={{ color: f.text_color }}>{f.name}</span>
                  </div>
                  <div className="px-3.5 py-2 border-t border-white/5 flex justify-between items-center">
                    <span className="text-[10px] tracking-widest text-white/25">{f.category.toUpperCase()}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] ${f.is_public ? "text-emerald-400" : "text-white/25"}`}>
                        {f.is_public ? "● PUBLIC" : "○ PRIVATE"}
                      </span>
                      <button onClick={() => { removeFont(f.id); notify(`"${f.name}" removed`); }}
                        className="text-red-400/50 hover:text-red-400 text-xs">✕</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Projects */}
        {tab === "projects" && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📁</div>
            <p className="text-white/40 mb-1">Projects coming soon</p>
            <p className="text-white/25 text-sm">Group fonts into projects for team integration.</p>
          </div>
        )}
      </main>

      {modal === "auth"   && <AuthModal onClose={close} />}
      {modal === "upload" && <UploadModal onClose={close} onAuthRequired={() => setModal("auth")} />}
      {modal === "ad"     && <AdModal onClose={close} />}
      {modal === "admin"  && <AdminModal onClose={close} />}
    </div>
  );
}
