"use client";
import { useState, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useUserFonts } from "@/context/UserFontsContext";
import { useNotif } from "@/context/NotifContext";
import { Overlay } from "./AuthModal";

interface Props { onClose: () => void; onAuthRequired: () => void; }
interface Project { id: string; name: string; fontIds: string[]; }

function loadProjects(userId: string): Project[] {
  try { return JSON.parse(localStorage.getItem(`fv_projects_${userId}`) || "[]"); } catch { return []; }
}
function saveProjects(userId: string, projects: Project[]) {
  localStorage.setItem(`fv_projects_${userId}`, JSON.stringify(projects));
}

export default function UploadModal({ onClose, onAuthRequired }: Props) {
  const { user }    = useAuth();
  const { refetch } = useUserFonts();
  const { notify }  = useNotif();
  const fileRef     = useRef<HTMLInputElement>(null);

  const [step, setStep]               = useState<1|2|3>(1);
  const [files, setFiles]             = useState<File[]>([]);
  const [fontName, setFontName]       = useState("");
  const [category, setCategory]       = useState("Sans-Serif");
  const [isPublic, setIsPublic]       = useState(false);
  const [dragging, setDragging]       = useState(false);
  const [uploading, setUploading]     = useState(false);
  const [currentIdx, setCurrentIdx]   = useState(0);
  const [uploadError, setUploadError] = useState("");

  const [projects, setProjects]           = useState<Project[]>([]);
  const [selectedProjs, setSelectedProjs] = useState<string[]>([]);
  const [newProjName, setNewProjName]     = useState("");

  const beginSelect = useCallback((picked: File[]) => {
    if (!user) { onClose(); onAuthRequired(); return; }
    const valid = picked.filter(f => /\.(ttf|otf|woff|woff2)$/i.test(f.name));
    if (!valid.length) return;
    const ps = loadProjects(user.id);
    setProjects(ps);
    setFiles(valid);
    setFontName(valid[0].name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "));
    setSelectedProjs([]);
    setNewProjName("");
    setUploadError("");
    setCurrentIdx(0);
    setStep(2);
  }, [user, onClose, onAuthRequired]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    beginSelect(Array.from(e.dataTransfer.files));
  }, [beginSelect]);

  const toggleProject = (id: string) =>
    setSelectedProjs(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const save = async () => {
    if (!files.length || !user) return;
    setUploading(true);
    setUploadError("");

    let projIds = [...selectedProjs];

    if (newProjName.trim()) {
      const newId = `proj_${Date.now()}`;
      const newProj: Project = { id: newId, name: newProjName.trim(), fontIds: [] };
      const updated = [...projects, newProj];
      saveProjects(user.id, updated);
      setProjects(updated);
      projIds = [...projIds, newId];
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setCurrentIdx(i);

      const name = files.length === 1
        ? (fontName.trim() || file.name.replace(/\.[^.]+$/, ""))
        : file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");

      const form = new FormData();
      form.append("file", file);
      form.append("userId", user.id);
      form.append("fontName", name);
      form.append("category", category);
      form.append("isPublic", String(isPublic));

      const res  = await fetch("/api/upload", { method: "POST", body: form });
      const json = await res.json();

      if (!res.ok || json.error) {
        setUploadError(`"${file.name}": ${json.error || "Upload failed"}`);
        setUploading(false);
        return;
      }

      if (projIds.length > 0 && json.font?.id) {
        const stored: Project[] = JSON.parse(localStorage.getItem(`fv_projects_${user.id}`) || "[]");
        const updated = stored.map(p =>
          projIds.includes(p.id) && !p.fontIds.includes(json.font.id)
            ? { ...p, fontIds: [...p.fontIds, json.font.id] }
            : p
        );
        saveProjects(user.id, updated);
      }
    }

    await refetch();
    setUploading(false);
    setStep(3);
    notify(files.length > 1 ? `${files.length} fonts uploaded!` : `"${fontName || files[0].name}" saved!`);
    setTimeout(onClose, 1400);
  };

  return (
    <Overlay onClose={onClose} wide>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Upload Font</h2>
      <p className="text-gray-400 text-sm mb-5">Real file storage · TTF, OTF, WOFF, WOFF2 · Multiple files OK</p>

      {/* ── Step 1: file picker ── */}
      {step === 1 && (
        <>
          {uploadError && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
              <p className="text-red-500 text-[12px]">⚠ {uploadError}</p>
            </div>
          )}
          <div
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all
              ${dragging ? "border-amber-400 bg-amber-50" : "border-gray-300 hover:border-amber-400/60 hover:bg-amber-50/40"}`}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}>
            <input ref={fileRef} type="file" accept=".ttf,.otf,.woff,.woff2" multiple className="hidden"
              onChange={e => beginSelect(Array.from(e.target.files || []))} />
            <div className="text-4xl mb-3">📂</div>
            <p className="text-gray-700 font-medium mb-1.5">Click or drag font file(s) here</p>
            <p className="text-gray-400 text-xs">TTF · OTF · WOFF · WOFF2 · Max 10 MB each · Multiple files supported</p>
          </div>
        </>
      )}

      {/* ── Step 2: details + upload ── */}
      {step === 2 && (
        <div className="space-y-3">
          {/* File summary */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <span className="text-emerald-500 text-xl shrink-0">✓</span>
            <div className="flex-1 min-w-0">
              {files.length === 1 ? (
                <p className="text-emerald-700 text-sm font-medium truncate">{files[0].name}</p>
              ) : (
                <>
                  <p className="text-emerald-700 text-sm font-medium">{files.length} files selected</p>
                  <p className="text-emerald-500 text-xs truncate">{files.map(f => f.name).join(", ")}</p>
                </>
              )}
            </div>
            <button onClick={() => { setStep(1); setFiles([]); }}
              className="text-gray-400 hover:text-gray-600 text-xs shrink-0">Change</button>
          </div>

          {uploadError && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <p className="text-red-500 text-[12px]">⚠ {uploadError}</p>
            </div>
          )}

          {/* Name — single file only */}
          {files.length === 1 && (
            <div>
              <label className="text-gray-400 text-xs block mb-1">Font Name</label>
              <input className="fv-input" value={fontName} onChange={e => setFontName(e.target.value)} />
            </div>
          )}

          {/* Category */}
          <div>
            <label className="text-gray-400 text-xs block mb-1">Category</label>
            <select className="fv-input" value={category} onChange={e => setCategory(e.target.value)}>
              {["Sans-Serif","Serif","Monospace","Display","Handwriting","Condensed"].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* Project picker */}
          <div>
            <label className="text-gray-400 text-xs block mb-2">Add to Project</label>
            {projects.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {projects.map(p => (
                  <button key={p.id} type="button" onClick={() => toggleProject(p.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
                      ${selectedProjs.includes(p.id)
                        ? "bg-amber-50 border-amber-400 text-amber-700"
                        : "bg-gray-50 border-gray-200 text-gray-500 hover:border-amber-300 hover:text-amber-600"}`}>
                    {selectedProjs.includes(p.id) ? "✓ " : ""}{p.name}
                  </button>
                ))}
              </div>
            )}
            <input className="fv-input" placeholder={projects.length > 0 ? "Or create a new project…" : "Project name (optional)"}
              value={newProjName} onChange={e => setNewProjName(e.target.value)} />
          </div>

          {/* Public toggle */}
          <label className="flex items-center gap-3 text-gray-500 text-sm select-none">
            <div className={`w-10 h-[22px] rounded-full relative transition-colors shrink-0 cursor-pointer
              ${isPublic ? "bg-amber-500" : "bg-gray-300"}`}
              onClick={() => setIsPublic(!isPublic)}>
              <div className={`absolute top-[3px] w-4 h-4 rounded-full bg-white transition-all
                ${isPublic ? "left-[22px]" : "left-[3px]"}`} />
            </div>
            Make font{files.length > 1 ? "s" : ""} public (visible to all users)
          </label>

          {/* Upload progress */}
          {uploading && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
              <p className="text-amber-700 text-sm font-medium">
                Uploading{files.length > 1 ? ` ${currentIdx + 1} of ${files.length}: ` : " "}{files[currentIdx]?.name}…
              </p>
              <div className="h-1.5 bg-amber-100 rounded-full overflow-hidden mt-2">
                <div className="h-full w-full rounded-full animate-pulse bg-amber-400" />
              </div>
            </div>
          )}

          <button onClick={save} disabled={uploading} className="fv-btn-primary w-full disabled:opacity-60">
            {uploading ? "Uploading…" : files.length > 1 ? `Upload ${files.length} Fonts` : "Save Font to Database"}
          </button>
        </div>
      )}

      {/* ── Step 3: success ── */}
      {step === 3 && (
        <div className="text-center py-8">
          <div className="text-5xl mb-4">✅</div>
          <p className="text-emerald-600 text-lg font-bold mb-1">
            {files.length > 1 ? `${files.length} fonts saved!` : "Font saved!"}
          </p>
          <p className="text-gray-400 text-sm">Stored in Supabase · Available immediately</p>
        </div>
      )}
    </Overlay>
  );
}
