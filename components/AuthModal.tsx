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

      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-4">
        {(["login","register"] as const).map(t => (
          <button key={t} onClick={() => switchTab(t)}
            className={`flex-1 py-2 rounded-md text-[13px] font-medium transition-all
              ${tab===t ? "bg-violet-500/20 text-violet-600" : "text-gray-400 hover:text-gray-600"}`}>
            {t === "login" ? "Sign In" : "Create Account"}
          </button>
        ))}
      </div>

      {tab === "login" && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4 text-center">
          <p className="text-amber-700 text-[11px]">
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
        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
          <p className="text-red-500 text-[12px]">⚠ {err}</p>
        </div>
      )}

      {tab === "register" && (
        <p className="text-gray-400 text-[11px] mb-3 text-center">
          You'll receive a confirmation email before you can sign in.
        </p>
      )}

      <button onClick={submit} disabled={loading}
        className="fv-btn-primary w-full mt-1 disabled:opacity-50">
        {loading ? "Please wait…" : tab === "login" ? "Sign In" : "Create Account"}
      </button>

      <p className="text-center text-gray-400 text-[12px] mt-3">
        {tab === "login" ? "No account? " : "Have an account? "}
        <span className="text-violet-500 cursor-pointer hover:underline"
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
    <div className="fixed inset-0 z-300 flex items-center justify-center p-4
      bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className={`relative bg-white border border-gray-200 rounded-2xl p-7
        w-full max-h-[92vh] overflow-y-auto shadow-[0_8px_40px_rgba(0,0,0,0.12)]
        animate-modal-in ${wide?"max-w-[640px]":"max-w-[400px]"}`}
        onClick={e => e.stopPropagation()}>
        <button onClick={onClose}
          className="absolute top-3.5 right-3.5 w-7 h-7 rounded-md bg-gray-100
            text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-all text-[12px]
            flex items-center justify-center">✕</button>
        {children}
      </div>
    </div>
  );
}
