"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useUserFonts } from "@/context/UserFontsContext";
import { useNotif } from "@/context/NotifContext";
import { DBFont } from "@/lib/supabase";
import { PROJECT_FRAMEWORKS, ProjectFW, getProjectSnippet } from "@/lib/fonts";
import ParticleCanvas from "./ParticleCanvas";
import Header from "./Header";
import AuthModal from "./AuthModal";
import UploadModal from "./UploadModal";
import AdModal from "./AdModal";
import AdminModal from "./AdminModal";

type Modal = "auth" | "upload" | "ad" | "admin" | null;

interface Project { id: string; name: string; fontIds: string[]; createdAt: string; }

function loadProjects(userId: string): Project[] {
  try { return JSON.parse(localStorage.getItem(`fv_projects_${userId}`) || "[]"); } catch { return []; }
}
function saveProjects(userId: string, projects: Project[]) {
  localStorage.setItem(`fv_projects_${userId}`, JSON.stringify(projects));
}

export default function AccountPageClient() {
  const { user, profile, isAdmin, updateProfile, updatePassword, signOut } = useAuth();
  const { fonts, removeFont } = useUserFonts();
  const { notify } = useNotif();
  const router = useRouter();
  const [modal, setModal]       = useState<Modal>(null);
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [saved, setSaved]         = useState(false);
  const [newPass, setNewPass]     = useState("");
  const [confPass, setConfPass]   = useState("");
  const [passError, setPassError] = useState("");
  const [passSaved, setPassSaved] = useState(false);
  const [tab, setTab]           = useState<"profile" | "fonts" | "projects">("profile");
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjName, setNewProjName] = useState("");
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [embedProject, setEmbedProject]   = useState<string | null>(null);
  const close = () => setModal(null);

  useEffect(() => {
    if (profile) { setName(profile.name); setEmail(profile.email); }
  }, [profile]);

  useEffect(() => {
    if (user) setProjects(loadProjects(user.id));
  }, [user]);

  if (!user) return (
    <div className="min-h-screen bg-[#f5f4ff] text-gray-900 flex items-center justify-center">
      <ParticleCanvas />
      <div className="relative z-10 text-center">
        <img src="/logo.svg" alt="FontsVerse" width={140} height={24} className="mx-auto mb-8" />
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-bold mb-2">Sign in required</h2>
        <p className="text-gray-500 text-sm mb-6">Please sign in to view your account.</p>
        <button onClick={() => setModal("auth")} className="fv-btn-primary w-auto! px-8">Sign In</button>
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

  const changePassword = async () => {
    setPassError("");
    if (!newPass) { setPassError("Enter a new password"); return; }
    if (newPass.length < 6) { setPassError("Password must be at least 6 characters"); return; }
    if (newPass !== confPass) { setPassError("Passwords do not match"); return; }
    const result = await updatePassword(newPass);
    if (result?.error) { setPassError(result.error); return; }
    setNewPass(""); setConfPass("");
    setPassSaved(true); notify("Password changed ✓");
    setTimeout(() => setPassSaved(false), 2000);
  };

  const createProject = () => {
    const n = newProjName.trim();
    if (!n) return;
    const proj: Project = { id: `proj_${Date.now()}`, name: n, fontIds: [], createdAt: new Date().toISOString() };
    const updated = [...projects, proj];
    setProjects(updated);
    saveProjects(user.id, updated);
    setNewProjName("");
    notify(`Project "${n}" created`);
  };

  const deleteProject = (id: string) => {
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    saveProjects(user.id, updated);
    if (activeProject === id) setActiveProject(null);
    notify("Project deleted");
  };

  const toggleFontInProject = (projId: string, fontId: string) => {
    const updated = projects.map(p => {
      if (p.id !== projId) return p;
      const has = p.fontIds.includes(fontId);
      return { ...p, fontIds: has ? p.fontIds.filter(id => id !== fontId) : [...p.fontIds, fontId] };
    });
    setProjects(updated);
    saveProjects(user.id, updated);
  };

  const TABS = [
    { id: "profile",  label: "Profile" },
    { id: "fonts",    label: `My Fonts (${fonts.length})` },
    { id: "projects", label: `Projects (${projects.length})` },
  ] as const;

  return (
    <div className="min-h-screen bg-[#f5f4ff] text-gray-900">
      <ParticleCanvas />
      <Header onSearch={() => {}} onLoginClick={() => setModal("auth")}
        onUploadClick={() => setModal("upload")} onAdClick={() => setModal("ad")}
        onAdminClick={() => setModal("admin")} onAccountClick={() => {}} />

      <main className="relative z-10 max-w-[760px] mx-auto px-6 pt-24 pb-20">
        {/* Profile header */}
        <div className="flex items-center gap-5 mb-8">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white shrink-0
            ${isAdmin ? "bg-linear-to-br from-amber-400 to-orange-500" : ""}`}
            style={!isAdmin ? { background: "linear-gradient(135deg,#FFB703,#FB8500)" } : {}}>
            {(profile?.name?.trim() || user?.email || "U")[0].toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black">{profile?.name?.trim() || user?.email}</h1>
              {isAdmin && <span className="text-[10px] bg-amber-100 text-amber-600 border border-amber-200 px-2 py-0.5 rounded font-bold">ADMIN</span>}
            </div>
            <p className="text-gray-400 text-sm">{user?.email}</p>
          </div>
          <button onClick={async () => { await signOut(); router.push("/"); }}
            className="ml-auto px-4 py-2 rounded-lg bg-red-50 border border-red-200 text-red-500 hover:bg-red-100 text-sm transition-all">
            Sign Out
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-7 w-fit">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm transition-all
                ${tab === t.id ? "text-white font-medium" : "text-gray-400 hover:text-gray-600"}`}
              style={tab === t.id ? { background: "linear-gradient(135deg,#FFB703,#FB8500)" } : {}}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Profile tab ── */}
        {tab === "profile" && (
          <div className="bg-white border border-gray-200 rounded-2xl p-7 space-y-4 shadow-sm">
            <h2 className="text-lg font-bold">Account Settings</h2>
            <div>
              <label className="text-gray-400 text-xs block mb-1.5">Display Name</label>
              <input className="fv-input" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label className="text-gray-400 text-xs block mb-1.5">Email Address</label>
              <input className="fv-input" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { val: fonts.length, label: "Fonts" },
                { val: fonts.filter(f => f.is_public).length, label: "Public" },
                { val: profile?.role, label: "Role" },
              ].map(s => (
                <div key={s.label} className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                  <p className="text-lg font-black text-gray-900 capitalize">{s.val}</p>
                  <p className="text-gray-400 text-[11px] mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
            {isAdmin && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <p className="text-amber-700 text-xs">👑 Admin account — <a href="/admin" className="underline">Open Admin Dashboard →</a></p>
              </div>
            )}
            <button onClick={save}
              className="fv-btn-primary w-full"
              style={saved ? { background: "#059669" } : {}}>
              {saved ? "✓ Saved" : "Save Changes"}
            </button>

            {/* Password change */}
            <div className="border-t border-gray-100 pt-4">
              <h3 className="text-sm font-semibold text-gray-500 mb-3">Change Password</h3>
              <div className="space-y-2">
                <input className="fv-input" type="password" placeholder="New password (min. 6 characters)"
                  value={newPass} onChange={e => setNewPass(e.target.value)} />
                <input className="fv-input" type="password" placeholder="Confirm new password"
                  value={confPass} onChange={e => setConfPass(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && changePassword()} />
                {passError && <p className="text-red-500 text-xs">{passError}</p>}
                <button onClick={changePassword}
                  className="w-full py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 text-sm
                    hover:bg-gray-100 hover:border-gray-300 transition-all font-medium"
                  style={passSaved ? { background: "#d1fae5", borderColor: "#6ee7b7", color: "#059669" } : {}}>
                  {passSaved ? "✓ Password Updated" : "Update Password"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Fonts tab ── */}
        {tab === "fonts" && (
          fonts.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🔤</div>
              <p className="text-gray-400 mb-4">No fonts uploaded yet</p>
              <button onClick={() => setModal("upload")} className="fv-btn-primary w-auto! px-8">Upload First Font</button>
            </div>
          ) : (
            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))" }}>
              {fonts.map(f => (
                <div key={f.id} className="rounded-xl border border-gray-200 overflow-hidden flex flex-col shadow-sm" style={{ background: f.bg_color }}>
                  <div className="flex-1 flex items-center justify-center p-5 min-h-[100px]">
                    <span className="text-xl font-bold" style={{ color: f.text_color }}>{f.name}</span>
                  </div>
                  <div className="px-3.5 py-2 border-t border-white/10 flex justify-between items-center">
                    <span className="text-[10px] tracking-widest" style={{ color: f.text_color, opacity: 0.5 }}>{f.category.toUpperCase()}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] ${f.is_public ? "text-emerald-400" : "text-white/30"}`}>
                        {f.is_public ? "● PUBLIC" : "○ PRIVATE"}
                      </span>
                      <button onClick={() => { removeFont(f.id); notify(`"${f.name}" removed`); }}
                        className="text-red-400/60 hover:text-red-400 text-xs">✕</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* ── Projects tab ── */}
        {tab === "projects" && (
          <div>
            {/* Create new project */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6 shadow-sm">
              <h3 className="text-sm font-bold text-gray-700 mb-3">Create New Project</h3>
              <div className="flex gap-2">
                <input className="fv-input flex-1" placeholder="Project name…"
                  value={newProjName} onChange={e => setNewProjName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && createProject()} />
                <button onClick={createProject} className="fv-btn-primary w-auto! px-5 shrink-0">Create</button>
              </div>
            </div>

            {projects.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">📁</div>
                <p className="text-gray-400 mb-1">No projects yet</p>
                <p className="text-gray-300 text-sm">Create a project above to group your fonts.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map(proj => (
                  <div key={proj.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                    {/* Project header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                      <div>
                        <h3 className="font-bold text-gray-900">{proj.name}</h3>
                        <p className="text-gray-400 text-xs mt-0.5">{proj.fontIds.length} font{proj.fontIds.length !== 1 ? "s" : ""}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {proj.fontIds.length > 0 && (
                          <button
                            onClick={() => {
                              setEmbedProject(embedProject === proj.id ? null : proj.id);
                              setActiveProject(null);
                            }}
                            className={`text-xs px-3 py-1.5 rounded-lg border transition-all
                              ${embedProject === proj.id
                                ? "border-amber-400 bg-amber-50 text-amber-700"
                                : "border-amber-200 text-amber-600 hover:bg-amber-50"}`}>
                            {embedProject === proj.id ? "✕ Hide Code" : "⟨/⟩ Embed Code"}
                          </button>
                        )}
                        <button
                          onClick={() => { setActiveProject(activeProject === proj.id ? null : proj.id); setEmbedProject(null); }}
                          className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all">
                          {activeProject === proj.id ? "Done" : "Assign Fonts"}
                        </button>
                        <button onClick={() => deleteProject(proj.id)}
                          className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-all">
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Embed code panel */}
                    {embedProject === proj.id && (
                      <ProjectEmbedPanel
                        project={proj}
                        fonts={fonts.filter(f => proj.fontIds.includes(f.id))} />
                    )}

                    {/* Fonts assigned to project */}
                    {embedProject !== proj.id && activeProject !== proj.id && (
                      <div className="px-5 py-4">
                        {proj.fontIds.length === 0 ? (
                          <p className="text-gray-300 text-sm">No fonts assigned — click "Assign Fonts" to add some.</p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {proj.fontIds.map(fid => {
                              const f = fonts.find(x => x.id === fid);
                              if (!f) return null;
                              return (
                                <div key={fid} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                                  style={{ background: f.bg_color, color: f.text_color }}>
                                  {f.name}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Font picker */}
                    {activeProject === proj.id && (
                      <div className="px-5 py-4">
                        <p className="text-xs text-gray-400 mb-3">Select fonts to add or remove from this project:</p>
                        {fonts.length === 0 ? (
                          <p className="text-gray-300 text-sm">Upload fonts first to assign them to projects.</p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {fonts.map(f => {
                              const assigned = proj.fontIds.includes(f.id);
                              return (
                                <button key={f.id}
                                  onClick={() => toggleFontInProject(proj.id, f.id)}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
                                    ${assigned ? "border-transparent" : "border-gray-200 bg-gray-50 text-gray-600"}`}
                                  style={assigned ? { background: f.bg_color, color: f.text_color } : {}}>
                                  {assigned ? "✓ " : ""}{f.name}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
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

function ProjectEmbedPanel({ project, fonts }: { project: { name: string }; fonts: DBFont[] }) {
  const [fw, setFw]       = useState<ProjectFW>("HTML");
  const [copied, setCopied] = useState(false);

  const code = getProjectSnippet(fw, project.name, fonts);

  const copy = async () => {
    try { await navigator.clipboard.writeText(code); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="px-5 py-4 border-t border-amber-100 bg-amber-50/40">
      <p className="text-xs font-semibold text-amber-700 mb-3">
        Embed {fonts.length} font{fonts.length !== 1 ? "s" : ""} from "{project.name}"
      </p>

      {/* Framework tabs */}
      <div className="flex gap-1.5 flex-wrap mb-3">
        {PROJECT_FRAMEWORKS.map(f => (
          <button key={f} onClick={() => { setFw(f); setCopied(false); }}
            className={`px-2.5 py-1 rounded-md text-[11px] border transition-all
              ${fw === f
                ? "bg-amber-500 border-amber-500 text-white"
                : "bg-white border-gray-200 text-gray-500 hover:border-amber-300 hover:text-amber-600"}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Code block */}
      <div className="relative">
        <pre className="bg-gray-900 rounded-xl p-4 text-[11px] text-emerald-400 overflow-x-auto
          leading-relaxed font-mono whitespace-pre-wrap wrap-break-word max-h-64 overflow-y-auto">
          {code}
        </pre>
        <button onClick={copy}
          className={`absolute top-2.5 right-2.5 px-2.5 py-1 rounded text-[11px] border transition-all
            ${copied
              ? "bg-emerald-50 border-emerald-300 text-emerald-600"
              : "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"}`}>
          {copied ? "✓ Copied!" : "Copy"}
        </button>
      </div>

      <p className="text-gray-400 text-[10px] mt-2">
        These URLs are direct Supabase storage links — no external CDN required.
      </p>
    </div>
  );
}
