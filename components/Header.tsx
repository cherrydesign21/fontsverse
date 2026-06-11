"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useNotif } from "@/context/NotifContext";
import SearchBar from "./SearchBar";

interface Props {
  onSearch: (q: string) => void;
  onLoginClick: () => void;
  onUploadClick: () => void;
  onAdClick: () => void;
  onAdminClick: () => void;
  onAccountClick: () => void;
}

export default function Header({ onSearch, onLoginClick, onUploadClick, onAdClick, onAdminClick, onAccountClick }: Props) {
  const { user, profile, isAdmin, signOut } = useAuth();
  const { notify } = useNotif();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const displayName = profile?.name || user?.email?.split("@")[0] || "User";

  return (
    <header className="fixed top-0 left-0 right-0 h-[60px] z-[100]
      bg-[rgba(7,7,15,0.92)] backdrop-blur-[20px] border-b border-white/6">
      <div className="max-w-[1280px] mx-auto px-5 h-full flex items-center gap-4">
        <Link href="/" className="shrink-0 flex items-center">
          <Image src="/logo.svg" alt="FontsVerse" width={130} height={22} priority />
        </Link>
        <div className="flex-1 max-w-[360px]">
          <SearchBar onSearch={onSearch} compact />
        </div>
        <nav className="flex items-center gap-1 ml-auto">
          <Link href="/about"   className="text-white/45 hover:text-white text-[13px] px-2.5 py-1.5 rounded-md transition-colors hidden sm:block">About</Link>
          <Link href="/contact" className="text-white/45 hover:text-white text-[13px] px-2.5 py-1.5 rounded-md transition-colors hidden sm:block">Contact</Link>
          <button onClick={onAdClick}
            className="text-[#f7706a] border border-[#f7706a]/20 bg-[#f7706a]/8
              hover:bg-[#f7706a]/18 rounded-md px-3 py-1.5 text-[12px] transition-all">
            Post an Ad
          </button>

          {user ? (
            <div className="relative" ref={ref}>
              <button onClick={() => setOpen(!open)}
                className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full
                  border border-white/10 hover:border-white/20 transition-all ml-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold text-white
                  ${isAdmin ? "bg-gradient-to-br from-amber-400 to-orange-500" : "bg-gradient-to-br from-violet-500 to-indigo-600"}`}>
                  {displayName[0].toUpperCase()}
                </div>
                {isAdmin && <span className="text-amber-400 text-[10px] font-bold tracking-wide hidden sm:block">ADMIN</span>}
                <svg className="w-3 h-3 text-white/40" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </button>

              {open && (
                <div className="absolute top-11 right-0 w-[220px] bg-[#0f0f1e]
                  border border-white/10 rounded-xl overflow-hidden
                  shadow-[0_16px_48px_rgba(0,0,0,0.7)] z-[200]">
                  <div className="px-4 py-3 border-b border-white/6">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-white text-[13px] font-semibold truncate">{displayName}</p>
                      {isAdmin && <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-bold">ADMIN</span>}
                    </div>
                    <p className="text-white/30 text-[11px] truncate">{user.email}</p>
                  </div>

                  <DdBtn icon="↑" label="Upload Font"      onClick={() => { setOpen(false); onUploadClick(); }} />
                  <DdBtn icon="⚙" label="Account Settings" onClick={() => { setOpen(false); onAccountClick(); }} />
                  <Link href="/account" onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-white/50 hover:bg-white/5 hover:text-white text-[13px] transition-colors">
                    <span className="w-4 text-center text-white/25">👤</span> My Fonts
                  </Link>

                  {isAdmin && (
                    <>
                      <div className="h-px bg-amber-500/15 mx-3 my-1" />
                      <p className="px-4 py-1 text-[10px] text-amber-400/60 uppercase tracking-widest font-semibold">Admin</p>
                      <DdBtn icon="🛡" label="Admin Panel" onClick={() => { setOpen(false); onAdminClick(); }} admin />
                      <Link href="/admin" onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-amber-300/70 hover:bg-amber-500/8 hover:text-amber-300 text-[13px] transition-colors">
                        <span className="w-4 text-center text-amber-400/40">📊</span> Admin Dashboard
                      </Link>
                    </>
                  )}

                  <div className="h-px bg-white/5 mx-3 my-1" />
                  <button onClick={() => { signOut(); setOpen(false); notify("Signed out"); }}
                    className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-500/10 text-[13px] transition-colors">
                    <span className="w-4 text-center opacity-60">←</span> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={onLoginClick}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white
                rounded-lg px-4 py-1.5 text-[13px] font-semibold hover:opacity-85 transition-opacity ml-1">
              Sign In
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}

function DdBtn({ icon, label, onClick, admin }: { icon:string; label:string; onClick:()=>void; admin?:boolean }) {
  return (
    <button onClick={onClick}
      className={`w-full text-left flex items-center gap-3 px-4 py-2.5 text-[13px] transition-colors
        ${admin ? "text-amber-300/70 hover:bg-amber-500/8 hover:text-amber-300" : "text-white/50 hover:bg-white/5 hover:text-white"}`}>
      <span className={`w-4 text-center ${admin?"text-amber-400/50":"text-white/25"}`}>{icon}</span>
      {label}
    </button>
  );
}
