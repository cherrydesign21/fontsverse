"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useFonts } from "@/context/FontsContext";
import type { DBFont } from "@/lib/supabase";
import { getFontFaceCSS, getFontFileUrl, FRAMEWORKS } from "@/lib/fonts";
import Header from "./Header";
import AuthModal from "./AuthModal";
import UploadModal from "./UploadModal";
import AdModal from "./AdModal";
import AccountModal from "./AccountModal";
import AdminModal from "./AdminModal";

type ModalType = "auth" | "upload" | "ad" | "account" | "admin" | null;

const WATERFALL_SIZES = [14, 18, 24, 32, 48, 64, 96];

const GLYPH_GROUPS = [
  { label: "Uppercase",   chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ" },
  { label: "Lowercase",   chars: "abcdefghijklmnopqrstuvwxyz" },
  { label: "Numbers",     chars: "0123456789" },
  { label: "Punctuation", chars: "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~" },
];

const DEFAULT_PREVIEW = "The quick brown fox jumps over the lazy dog";

interface Project { id: string; name: string; fontIds: string[]; }

function loadProjects(uid: string): Project[] {
  try { return JSON.parse(localStorage.getItem(`fv_projects_${uid}`) || "[]"); } catch { return []; }
}
function saveProjects(uid: string, projects: Project[]) {
  localStorage.setItem(`fv_projects_${uid}`, JSON.stringify(projects));
}

export default function FontSinglePageClient({ font }: { font: DBFont }) {
  const { user } = useAuth();
  const { incrementDownload } = useFonts();

  const [modal, setModal]           = useState<ModalType>(null);
  const [previewText, setPreviewText] = useState(DEFAULT_PREVIEW);
  const [previewSize, setPreviewSize] = useState(48);
  const [darkBg, setDarkBg]         = useState(false);
  const [fw, setFw]                 = useState("html");
  const [copied, setCopied]         = useState(false);
  const [fontFamily, setFontFamily] = useState("");
  const [fontLoaded, setFontLoaded] = useState(false);
  const [projects, setProjects]     = useState<Project[]>([]);
  const [newProjName, setNewProjName] = useState("");
  const close = () => setModal(null);

  // Inject @font-face for live rendering
  useEffect(() => {
    const raw = font.file_woff2 || font.file_woff || font.file_ttf || font.file_original;
    const url = getFontFileUrl(raw);
    if (!url) return;
    const fmt    = font.file_woff2 ? "woff2" : font.file_woff ? "woff" : "truetype";
    const family = `fv-page-${font.id}`;
    const id     = `fv-page-style-${font.id}`;
    if (!document.getElementById(id)) {
      const s = document.createElement("style");
      s.id = id;
      s.textContent = `@font-face{font-family:'${family}';src:url('${url}')format('${fmt}');font-display:swap;}`;
      document.head.appendChild(s);
    }
    setFontFamily(family);
    document.fonts.load(`48px '${family}'`)
      .then(() => setFontLoaded(true))
      .catch(() => setFontLoaded(true));
    return () => { try { const el = document.getElementById(id); if (el) document.head.removeChild(el); } catch {} };
  }, [font.id]);

  // Load projects from localStorage
  useEffect(() => {
    if (user) setProjects(loadProjects(user.id));
  }, [user]);

  const activeFamily = fontFamily || font.font_family;
  const fStyle = {
    fontFamily:    activeFamily,
    fontWeight:    font.font_weight,
    fontStyle:     font.font_style,
    letterSpacing: font.letter_spacing,
    opacity:       fontLoaded || !fontFamily ? 1 : 0.6,
  };

  // Embed code
  const getCode = (framework: string) => {
    const face = getFontFaceCSS(font);
    if (!face) return `/* No font file — upload a TTF/WOFF/WOFF2 file first */`;
    switch (framework) {
      case "html":
        return `<style>\n${face}\n</style>\n\n<!-- Usage -->\n<p style="font-family: '${font.name}', sans-serif;">\n  Your text here\n</p>`;
      case "css":
        return `${face}\n\n.my-element {\n  font-family: '${font.name}', sans-serif;\n  font-weight: ${font.font_weight};\n}`;
      case "react":
        return `/* ${font.slug}-font.css */\n${face}\n\nimport './${font.slug}-font.css';\n\n<p style={{ fontFamily: "'${font.name}', sans-serif" }}>Your text</p>`;
      case "nextjs":
        return `/* app/${font.slug}-font.css */\n${face}\n\n// app/layout.tsx\nimport './${font.slug}-font.css';\n\n<body style={{ fontFamily: "'${font.name}', sans-serif" }}>\n  {children}\n</body>`;
      case "vue":
        return `/* ${font.slug}-font.css */\n${face}\n\n<style>\n@import './${font.slug}-font.css';\n</style>\n<template>\n  <p style="font-family: '${font.name}', sans-serif">Text</p>\n</template>`;
      case "angular":
        return `/* styles.css */\n${face}\n\n.my-text {\n  font-family: '${font.name}', sans-serif;\n}`;
      case "flutter":
        return `# pubspec.yaml\nflutter:\n  fonts:\n    - family: ${font.name.replace(/\s/g, "")}\n      fonts:\n        - asset: assets/fonts/${font.slug}.ttf\n\n# Usage\nText('Hello', style: TextStyle(fontFamily: '${font.name.replace(/\s/g, "")}'))`;
      case "android":
        return `<!-- Download: ${getFontFileUrl(font.file_ttf || font.file_original) ?? "no file"} -->\n\n<TextView\n  android:fontFamily="@font/${font.slug.replace(/-/g, "_")}"\n  android:text="Hello World" />`;
      default:
        return face;
    }
  };

  const copy = async () => {
    try { await navigator.clipboard.writeText(getCode(fw)); } catch {}
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const download = async (format: string) => {
    await incrementDownload(font.id);
    const raw = format === "ttf"   ? font.file_ttf
              : format === "woff"  ? font.file_woff
              : format === "woff2" ? font.file_woff2
              : format === "svg"   ? font.file_svg
              : font.file_original;
    const url = getFontFileUrl(raw);
    if (!url) return;
    const a = document.createElement("a");
    a.href = url; a.download = `${font.slug}.${format}`; a.click();
  };

  const downloadFormats = [
    { fmt: "ttf",   path: font.file_ttf   },
    { fmt: "woff",  path: font.file_woff  },
    { fmt: "woff2", path: font.file_woff2 },
    { fmt: "svg",   path: font.file_svg   },
  ].filter(x => x.path);

  const toggleProject = (projId: string) => {
    if (!user) return;
    const updated = projects.map(p => {
      if (p.id !== projId) return p;
      const has = p.fontIds.includes(font.id);
      return { ...p, fontIds: has ? p.fontIds.filter(id => id !== font.id) : [...p.fontIds, font.id] };
    });
    setProjects(updated);
    saveProjects(user.id, updated);
  };

  const createProject = () => {
    if (!user || !newProjName.trim()) return;
    const proj: Project = { id: `proj_${Date.now()}`, name: newProjName.trim(), fontIds: [font.id] };
    const updated = [...projects, proj];
    setProjects(updated);
    saveProjects(user.id, updated);
    setNewProjName("");
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header onSearch={() => {}} onLoginClick={() => setModal("auth")}
        onUploadClick={() => user ? setModal("upload") : setModal("auth")}
        onAdClick={() => setModal("ad")} onAdminClick={() => setModal("admin")}
        onAccountClick={() => setModal("account")} />

      <main className="max-w-[1100px] mx-auto px-6 pt-24 pb-28">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[12px] text-gray-400 mb-10">
          <Link href="/" className="hover:text-gray-700 transition-colors">Home</Link>
          <span>›</span>
          <Link href="/fonts" className="hover:text-gray-700 transition-colors">Browse</Link>
          <span>›</span>
          <span className="text-gray-700 font-medium">{font.name}</span>
        </nav>

        {/* ── Hero ── */}
        <div className="flex items-start justify-between gap-6 flex-wrap mb-14 pb-14 border-b border-gray-100">
          <div>
            <h1 className="text-5xl font-black tracking-tight mb-2" style={fStyle}>
              {font.name}
            </h1>
            <p className="text-gray-400 text-sm mt-3" style={{ fontFamily: "system-ui" }}>
              {font.category} · {font.downloads.toLocaleString()} downloads · Weight {font.font_weight}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            {downloadFormats.map(({ fmt }) => (
              <button key={fmt} onClick={() => download(fmt)}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200
                  bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all">
                ↓ {fmt.toUpperCase()}
              </button>
            ))}
            {downloadFormats.length === 0 && (
              <span className="text-gray-300 text-sm self-center">No files uploaded yet</span>
            )}
          </div>
        </div>

        {/* ── Live Preview ── */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[11px] font-bold tracking-[3px] uppercase text-gray-400">Preview</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2.5">
                <span className="text-[11px] text-gray-400 w-8 text-right">{previewSize}px</span>
                <input type="range" min={12} max={120} value={previewSize}
                  onChange={e => setPreviewSize(Number(e.target.value))}
                  className="w-32 accent-amber-500" />
              </div>
              <button onClick={() => setDarkBg(!darkBg)}
                className="px-3 py-1.5 rounded-lg text-[11px] font-medium border border-gray-200
                  text-gray-500 hover:border-gray-400 transition-all">
                {darkBg ? "Light" : "Dark"}
              </button>
            </div>
          </div>
          <div
            className="rounded-2xl p-8 transition-colors duration-200 flex items-center justify-center min-h-[160px]"
            style={{ background: darkBg ? "#111" : font.bg_color }}>
            <textarea
              value={previewText}
              onChange={e => setPreviewText(e.target.value)}
              className="w-full bg-transparent border-none outline-none resize-none text-center leading-tight"
              rows={3}
              placeholder="Type to preview…"
              style={{
                ...fStyle,
                fontSize: previewSize,
                color: darkBg ? "#f5f5f5" : font.text_color,
              }}
            />
          </div>
        </section>

        {/* ── Waterfall ── */}
        <section className="mb-16">
          <h2 className="text-[11px] font-bold tracking-[3px] uppercase text-gray-400 mb-5">Waterfall</h2>
          <div className="border border-gray-100 rounded-2xl divide-y divide-gray-50 overflow-hidden">
            {WATERFALL_SIZES.map(size => (
              <div key={size} className="flex items-baseline gap-5 px-7 py-4">
                <span className="text-[10px] text-gray-300 w-7 shrink-0 font-mono tabular-nums">{size}</span>
                <span className="text-gray-900 leading-tight flex-1 truncate"
                  style={{ ...fStyle, fontSize: size }}>
                  {previewText || DEFAULT_PREVIEW}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Glyph Grid ── */}
        <section className="mb-16">
          <h2 className="text-[11px] font-bold tracking-[3px] uppercase text-gray-400 mb-5">Glyphs</h2>
          <div className="border border-gray-100 rounded-2xl p-7 space-y-8">
            {GLYPH_GROUPS.map(group => (
              <div key={group.label}>
                <p className="text-[10px] text-gray-300 uppercase tracking-widest mb-3 font-semibold">
                  {group.label}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {group.chars.split("").map(ch => (
                    <span key={ch}
                      title={`U+${ch.charCodeAt(0).toString(16).toUpperCase().padStart(4, "0")}`}
                      className="w-10 h-10 flex items-center justify-center rounded-lg
                        bg-gray-50 hover:bg-amber-50 text-gray-900 transition-colors cursor-default text-sm"
                      style={{ ...fStyle, fontSize: 18 }}>
                      {ch}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Embed Code ── */}
        <section className="mb-16">
          <h2 className="text-[11px] font-bold tracking-[3px] uppercase text-gray-400 mb-5">Embed</h2>
          <div className="border border-gray-100 rounded-2xl p-6">
            <div className="flex flex-wrap gap-1.5 mb-4">
              {FRAMEWORKS.map(f => (
                <button key={f.id} onClick={() => { setFw(f.id); setCopied(false); }}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-medium border transition-all
                    ${fw === f.id
                      ? "bg-amber-50 border-amber-300 text-amber-700"
                      : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                  {f.label}
                </button>
              ))}
            </div>
            <div className="relative">
              <pre className="bg-gray-950 rounded-xl p-5 text-[12px] text-emerald-400
                overflow-x-auto leading-relaxed font-mono whitespace-pre-wrap max-h-72 overflow-y-auto">
                {getCode(fw)}
              </pre>
              <button onClick={copy}
                className={`absolute top-3 right-3 px-3 py-1.5 rounded-lg text-[11px] border font-medium transition-all
                  ${copied
                    ? "bg-emerald-50 border-emerald-300 text-emerald-600"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            {!getFontFaceCSS(font) && (
              <p className="text-amber-600 text-xs mt-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                Upload a font file (TTF / WOFF / WOFF2) to generate real embed code.
              </p>
            )}
          </div>
        </section>

        {/* ── Projects ── */}
        <section>
          <h2 className="text-[11px] font-bold tracking-[3px] uppercase text-gray-400 mb-5">Add to Project</h2>
          {!user ? (
            <div className="border border-dashed border-gray-200 rounded-2xl p-10 text-center">
              <p className="text-gray-400 text-sm mb-4">Sign in to organise fonts into projects</p>
              <button onClick={() => setModal("auth")} className="fv-btn-primary px-8 w-auto!">Sign In</button>
            </div>
          ) : (
            <div className="border border-gray-100 rounded-2xl p-6">
              {projects.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {projects.map(p => {
                    const assigned = p.fontIds.includes(font.id);
                    return (
                      <button key={p.id} onClick={() => toggleProject(p.id)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all
                          ${assigned
                            ? "bg-amber-50 border-amber-400 text-amber-700"
                            : "bg-white border-gray-200 text-gray-500 hover:border-gray-400"}`}>
                        {assigned ? "✓ " : ""}{p.name}
                      </button>
                    );
                  })}
                </div>
              )}
              <div className="flex gap-2">
                <input className="fv-input flex-1" placeholder="Create new project…"
                  value={newProjName} onChange={e => setNewProjName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && createProject()} />
                <button onClick={createProject} disabled={!newProjName.trim()}
                  className="fv-btn-primary px-5 w-auto! shrink-0 disabled:opacity-40">
                  Create
                </button>
              </div>
              {projects.length === 0 && !newProjName && (
                <p className="text-gray-300 text-xs mt-2">Create a project to group related fonts</p>
              )}
            </div>
          )}
        </section>
      </main>

      {modal === "auth"    && <AuthModal onClose={close} />}
      {modal === "upload"  && <UploadModal onClose={close} onAuthRequired={() => setModal("auth")} />}
      {modal === "ad"      && <AdModal onClose={close} />}
      {modal === "account" && <AccountModal onClose={close} />}
      {modal === "admin"   && <AdminModal onClose={close} />}
    </div>
  );
}
