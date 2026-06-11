"use client";
import { useState, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useUserFonts } from "@/context/UserFontsContext";
import { useNotif } from "@/context/NotifContext";
import { Overlay } from "./AuthModal";

interface Props { onClose: () => void; onAuthRequired: () => void; }

const FORMATS = ["TTF","WOFF","WOFF2","SVG"] as const;

export default function UploadModal({ onClose, onAuthRequired }: Props) {
  const { user }       = useAuth();
  const { refetch }    = useUserFonts();
  const { notify }     = useNotif();
  const fileRef        = useRef<HTMLInputElement>(null);

  const [step, setStep]       = useState<1|2|3>(1);
  const [progress, setProgress] = useState(0);
  const [doneFormats, setDoneFormats] = useState<string[]>([]);
  const [statusMsg, setStatusMsg] = useState("");
  const [fontName, setFontName] = useState("");
  const [category, setCategory] = useState("Sans-Serif");
  const [project, setProject]   = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File|null>(null);
  const [uploadError, setUploadError]   = useState("");

  const beginUpload = useCallback((file: File) => {
    setSelectedFile(file);
    setFontName(file.name.replace(/\.[^.]+$/,"").replace(/[-_]/g," "));
    setStep(2);
    setProgress(0);
    setDoneFormats([]);
    setUploadError("");

    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 8 + 2;
      if (p >= 90) { p = 90; clearInterval(iv); }
      setProgress(Math.round(p));
      setDoneFormats(FORMATS.filter((_,i) => p > (i+1)*22));
      setStatusMsg(`${Math.round(p)}% — Uploading to secure storage…`);
    }, 150);

    (window as unknown as Record<string,unknown>).__fv_upload_iv = iv;
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    if (!user) { onClose(); onAuthRequired(); return; }
    const file = e.dataTransfer.files[0];
    if (file) beginUpload(file);
  }, [user, beginUpload, onClose, onAuthRequired]);

  const save = async () => {
    if (!selectedFile || !user) return;
    setUploadError("");
    setStatusMsg("Uploading to Supabase Storage…");

    const form = new FormData();
    form.append("file", selectedFile);
    form.append("userId", user.id);
    form.append("fontName", fontName || selectedFile.name.replace(/\.[^.]+$/,""));
    form.append("category", category);
    form.append("isPublic", String(isPublic));
    form.append("project", project);

    const res  = await fetch("/api/upload", { method: "POST", body: form });
    const json = await res.json();

    if (!res.ok || json.error) {
      setUploadError(json.error || "Upload failed");
      setStep(1);
      const iv = (window as unknown as Record<string,unknown>).__fv_upload_iv as ReturnType<typeof setInterval>;
      if (iv) clearInterval(iv);
      return;
    }

    setProgress(100);
    setDoneFormats([...FORMATS]);
    setStatusMsg("100% — Done!");
    setTimeout(() => setStep(3), 350);
    const iv = (window as unknown as Record<string,unknown>).__fv_upload_iv as ReturnType<typeof setInterval>;
    if (iv) clearInterval(iv);

    await refetch();
    notify(`"${json.font.name}" uploaded & saved! 🔤`);
    setTimeout(() => onClose(), 1200);
  };

  return (
    <Overlay onClose={onClose} wide>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Upload Font</h2>
      <p className="text-gray-400 text-sm mb-5">Real file storage · TTF, OTF, WOFF, WOFF2 accepted</p>

      {step === 1 && (
        <>
          {uploadError && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
              <p className="text-red-500 text-[12px]">⚠ {uploadError}</p>
            </div>
          )}
          <div className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all
            ${dragging ? "border-violet-500 bg-violet-50" : "border-gray-300 hover:border-violet-400/70 hover:bg-violet-50/50"}`}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}>
            <input ref={fileRef} type="file" accept=".ttf,.otf,.woff,.woff2" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) beginUpload(f); }} />
            <div className="text-4xl mb-3">📂</div>
            <p className="text-gray-700 font-medium mb-1.5">Click or drag font file here</p>
            <p className="text-gray-400 text-xs">TTF · OTF · WOFF · WOFF2 · Max 10MB</p>
          </div>
        </>
      )}

      {step === 2 && (
        <div>
          <div className="bg-violet-50 border border-violet-200 rounded-xl p-6 text-center mb-5">
            <div className="text-3xl mb-3">⚡</div>
            <p className="text-gray-500 text-sm mb-4">{selectedFile?.name}</p>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-2">
              <div className="h-full rounded-full transition-all duration-150"
                style={{ width:`${progress}%`, background:"linear-gradient(90deg,#7c6af7,#f72585)" }} />
            </div>
            <p className="text-violet-500 text-xs mb-4">{statusMsg}</p>
            <div className="flex gap-2 flex-wrap justify-center">
              {FORMATS.map(f => (
                <span key={f} className={`px-3 py-1 rounded-full text-xs border transition-all
                  ${doneFormats.includes(f)
                    ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                    : "bg-gray-100 border-gray-200 text-gray-400"}`}>
                  {f} {doneFormats.includes(f) ? "✓" : "…"}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            <input className="fv-input" placeholder="Font name" value={fontName}
              onChange={e => setFontName(e.target.value)} />
            <select className="fv-input" value={category} onChange={e => setCategory(e.target.value)}>
              {["Sans-Serif","Serif","Monospace","Display","Handwriting","Condensed"].map(c => <option key={c}>{c}</option>)}
            </select>
            <input className="fv-input" placeholder="Project name (optional)" value={project}
              onChange={e => setProject(e.target.value)} />
            <label className="flex items-center gap-3 text-gray-500 text-sm cursor-pointer select-none">
              <div className={`w-10 h-[22px] rounded-full relative transition-colors shrink-0
                ${isPublic ? "bg-violet-500" : "bg-gray-300"}`}
                onClick={() => setIsPublic(!isPublic)}>
                <div className={`absolute top-[3px] w-4 h-4 rounded-full bg-white transition-all
                  ${isPublic ? "left-[22px]" : "left-[3px]"}`} />
              </div>
              Make font public (visible to all users)
            </label>
            <button onClick={save} className="fv-btn-primary w-full">
              Save Font to Database
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="text-center py-6">
          <div className="text-5xl mb-4">✅</div>
          <p className="text-emerald-600 text-lg font-bold mb-1">Font saved!</p>
          <p className="text-gray-400 text-sm">Stored in Supabase · Available immediately</p>
        </div>
      )}
    </Overlay>
  );
}
