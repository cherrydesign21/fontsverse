"use client";
import { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useNotif } from "@/context/NotifContext";

interface Props { onClose: () => void }

export default function AuthModal({ onClose }: Props) {
  const [tab, setTab]         = useState<"login"|"register">("login");
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [pass, setPass]       = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr]         = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp }    = useAuth();
  const { notify }            = useNotif();

  const clear = () => setErr("");

  const submit = async () => {
    clear();
    if (!email.trim() || !pass.trim()) { setErr("Email and password are required."); return; }

    if (tab === "register") {
      if (!name.trim()) { setErr("Name is required."); return; }
      if (pass.length < 6) { setErr("Password must be at least 6 characters."); return; }
      if (pass !== confirm) { setErr("Passwords do not match."); return; }
    }

    setLoading(true);
    if (tab === "register") {
      const { error } = await signUp(email.trim(), pass, name.trim());
      setLoading(false);
      if (error) { setErr(error); return; }
      notify("Account created! Check your email to confirm, then sign in. 🎉");
      setTab("login");
    } else {
      const { error } = await signIn(email.trim(), pass);
      setLoading(false);
      if (error) { setErr(error); return; }
      notify("Welcome back! 👋");
      onClose();
    }
  };

  const switchTab = (t: "login"|"register") => { setTab(t); clear(); };

  return (
    <Overlay onClose={onClose}>
      <div className="flex justify-center mb-5">
        <Image src="/logo.svg" alt="FontsVerse" width={148} height={24} priority />
      </div>

      <div className="flex gap-1 bg-white/4 rounded-lg p-1 mb-4">
        {(["login","register"] as const).map(t => (
          <button key={t} onClick={() => switchTab(t)}
            className={`flex-1 py-2 rounded-md text-[13px] font-medium transition-all
              ${tab===t ? "bg-violet-500/25 text-violet-300" : "text-white/40 hover:text-white/60"}`}>
            {t === "login" ? "Sign In" : "Create Account"}
          </button>
        ))}
      </div>

      {tab === "login" && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 mb-4 text-center">
          <p className="text-amber-300 text-[11px]">
            👑 Admin demo: <span className="font-mono">admin@fontsverse.app</span> / <span className="font-mono">admin123</span>
          </p>
        </div>
      )}

      {tab === "register" && (
        <input className="fv-input mb-2.5" placeholder="Full Name *"
          value={name} onChange={e => { setName(e.target.value); clear(); }} />
      )}
      <input className="fv-input mb-2.5" placeholder="Email address *" type="email"
        value={email} onChange={e => { setEmail(e.target.value); clear(); }}
        onKeyDown={e => e.key === "Enter" && submit()} />
      <input className="fv-input mb-2.5" placeholder={`Password *${tab==="register"?" (min 6 chars)":""}`}
        type="password" value={pass} onChange={e => { setPass(e.target.value); clear(); }}
        onKeyDown={e => e.key === "Enter" && submit()} />
      {tab === "register" && (
        <input className="fv-input mb-2.5" placeholder="Confirm Password *" type="password"
          value={confirm} onChange={e => { setConfirm(e.target.value); clear(); }}
          onKeyDown={e => e.key === "Enter" && submit()} />
      )}

      {err && (
        <div className="bg-red-500/10 border border-red-500/25 rounded-lg px-3 py-2 mb-3">
          <p className="text-red-400 text-[12px]">⚠ {err}</p>
        </div>
      )}

      {tab === "register" && (
        <p className="text-white/25 text-[11px] mb-3 text-center">
          You'll receive a confirmation email before you can sign in.
        </p>
      )}

      <button onClick={submit} disabled={loading}
        className="fv-btn-primary w-full mt-1 disabled:opacity-50">
        {loading ? "Please wait…" : tab === "login" ? "Sign In" : "Create Account"}
      </button>

      <p className="text-center text-white/30 text-[12px] mt-3">
        {tab === "login" ? "No account? " : "Have an account? "}
        <span className="text-violet-400 cursor-pointer hover:underline"
          onClick={() => switchTab(tab==="login"?"register":"login")}>
          {tab === "login" ? "Create one free" : "Sign in"}
        </span>
      </p>
    </Overlay>
  );
}

export function Overlay({ children, onClose, wide }: {
  children: React.ReactNode; onClose: () => void; wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4
      bg-black/75 backdrop-blur-[10px]" onClick={onClose}>
      <div className={`relative bg-[#0d0d1a] border border-white/8 rounded-2xl p-7
        w-full max-h-[92vh] overflow-y-auto shadow-[0_32px_80px_rgba(0,0,0,0.8)]
        animate-modal-in ${wide?"max-w-[640px]":"max-w-[400px]"}`}
        onClick={e => e.stopPropagation()}>
        <button onClick={onClose}
          className="absolute top-3.5 right-3.5 w-7 h-7 rounded-md bg-white/6
            text-white/40 hover:text-white hover:bg-white/12 transition-all text-[12px]
            flex items-center justify-center">✕</button>
        {children}
      </div>
    </div>
  );
}
