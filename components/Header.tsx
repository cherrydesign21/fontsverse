"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const displayName = profile?.name || user?.email?.split("@")[0] || "User";

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] bg-white border-b border-[#e1e1e1]"
      style={{ height: 80 }}>
      <div className="max-w-[1440px] mx-auto px-8 h-full flex items-center relative">
        <Link href="/" className="shrink-0 flex items-center">
          <Image src="/logo.svg" alt="FontsVerse" width={130} height={22} priority />
        </Link>
        <div className="absolute left-1/2 -translate-x-1/2" style={{ width: 520 }}>
          <SearchBar onSearch={onSearch} compact />
        </div>
        <nav className="flex items-center gap-7 ml-auto" style={{ fontFamily: "Outfit, system-ui, sans-serif" }}>
          <Link href="/about"   className="text-[#333] hover:text-black text-[16px] font-medium transition-colors hidden md:block">About</Link>
          <Link href="/pricing" className="text-[#333] hover:text-black text-[16px] font-medium transition-colors hidden md:block">Pricing</Link>
          <Link href="/contact" className="text-[#333] hover:text-black text-[16px] font-medium transition-colors hidden md:block">Contact</Link>
          <button onClick={onAdClick}
            className="text-[#333] hover:text-black text-[16px] font-medium transition-colors hidden md:block">
            Post an Ad
          </button>

          {user ? (
            <div className="relative" ref={ref}>
              <button onClick={() => setOpen(!open)}
                className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full
                  border border-gray-200 hover:border-gray-300 transition-all ml-1">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold text-white"
                  style={{ background: isAdmin ? "linear-gradient(135deg,#f59e0b,#f97316)" : "linear-gradient(135deg,#219EBC,#023047)" }}>
                  {displayName[0].toUpperCase()}
                </div>
                {isAdmin && <span className="text-amber-500 text-[10px] font-bold tracking-wide hidden sm:block">ADMIN</span>}
                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </button>

              {open && (
                <div className="absolute top-11 right-0 w-[220px] bg-white
                  border border-gray-200 rounded-xl overflow-hidden
                  shadow-[0_8px_32px_rgba(0,0,0,0.12)] z-[200]">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-gray-900 text-[13px] font-semibold truncate">{displayName}</p>
                      {isAdmin && <span className="text-[9px] bg-amber-100 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded font-bold">ADMIN</span>}
                    </div>
                    <p className="text-gray-400 text-[11px] truncate">{user.email}</p>
                  </div>

                  <DdBtn icon="↑" label="Upload Font"      onClick={() => { setOpen(false); onUploadClick(); }} />
                  <button onClick={() => { setOpen(false); router.push("/account"); }}
                    className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-[13px] text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                    <span className="w-4 text-center text-gray-400">⚙</span> Account Settings
                  </button>
                  <Link href="/account" onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-gray-500 hover:bg-gray-50 hover:text-gray-900 text-[13px] transition-colors">
                    <span className="w-4 text-center text-gray-400">👤</span> My Fonts
                  </Link>

                  {isAdmin && (
                    <>
                      <div className="h-px bg-amber-200/60 mx-3 my-1" />
                      <p className="px-4 py-1 text-[10px] text-amber-500 uppercase tracking-widest font-semibold">Admin</p>
                      <DdBtn icon="🛡" label="Admin Panel" onClick={() => { setOpen(false); onAdminClick(); }} admin />
                      <Link href="/admin" onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-amber-600/80 hover:bg-amber-50 hover:text-amber-700 text-[13px] transition-colors">
                        <span className="w-4 text-center text-amber-400/60">📊</span> Admin Dashboard
                      </Link>
                    </>
                  )}

                  <div className="h-px bg-gray-100 mx-3 my-1" />
                  <button onClick={() => { signOut(); setOpen(false); notify("Signed out"); }}
                    className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-red-50 text-[13px] transition-colors">
                    <span className="w-4 text-center opacity-60">←</span> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={onLoginClick}
              className="inline-flex items-center gap-2 px-[26px] py-[14px] rounded-[8px] text-[14px] font-semibold uppercase tracking-[1.4px] text-black hover:opacity-90 transition-opacity cursor-pointer"
              style={{ background: "linear-gradient(114deg,#FFB703 5%,#FB8500 105%)", fontFamily: "Outfit, system-ui, sans-serif" }}>
              Login
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M1 12L12 1M12 1H5M12 1v7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
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
        ${admin ? "text-amber-600/80 hover:bg-amber-50 hover:text-amber-700" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>
      <span className={`w-4 text-center ${admin?"text-amber-400":"text-gray-400"}`}>{icon}</span>
      {label}
    </button>
  );
}
