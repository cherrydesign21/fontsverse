"use client";
import { useState } from "react";
import ParticleCanvas from "./ParticleCanvas";
import Header from "./Header";
import AuthModal from "./AuthModal";
import UploadModal from "./UploadModal";
import AdModal from "./AdModal";
import AccountModal from "./AccountModal";
import AdminModal from "./AdminModal";
import { useAuth } from "@/context/AuthContext";

type ModalType = "auth" | "upload" | "ad" | "account" | "admin" | null;

const TEAM = [
  { name: "Aria Lenz", role: "Founder & Design", avatar: "AL", color: "#7c6af7" },
  { name: "Dev Nair", role: "Engineering Lead", avatar: "DN", color: "#f72585" },
  { name: "Kira Moss", role: "Font Curator", avatar: "KM", color: "#06b6d4" },
  { name: "Sam Park", role: "Community", avatar: "SP", color: "#10b981" },
];

const STATS = [
  { val: "12,000+", label: "Fonts Hosted" },
  { val: "500K+", label: "Monthly Users" },
  { val: "8", label: "Frameworks Supported" },
  { val: "99.9%", label: "CDN Uptime" },
];

export default function AboutPageClient() {
  const { user } = useAuth();
  const [modal, setModal] = useState<ModalType>(null);
  const close = () => setModal(null);

  return (
    <div className="min-h-screen bg-[#f5f4ff] text-gray-900">
      <ParticleCanvas />
      <Header
        onSearch={() => {}}
        onLoginClick={() => setModal("auth")}
        onUploadClick={() => user ? setModal("upload") : setModal("auth")}
        onAdClick={() => setModal("ad")}
        onAdminClick={() => setModal("admin")}
        onAccountClick={() => setModal("account")}
      />

      <main className="relative z-10 max-w-[900px] mx-auto px-6 pt-28 pb-20">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/25
            rounded-full px-4 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
            <span className="text-violet-600 text-[11px] tracking-[1.5px] font-semibold uppercase">Our Story</span>
          </div>
          <h1 className="text-5xl font-black tracking-tight mb-5">
            Fonts for the{" "}
            <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
              open web
            </span>
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed max-w-[600px] mx-auto">
            FontsVerse was built to give designers and developers a free, fast, and
            framework-agnostic way to host, manage, and integrate custom typography.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-20">
          {STATS.map((s) => (
            <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-5 text-center shadow-sm">
              <p className="text-3xl font-black text-gray-900 mb-1">{s.val}</p>
              <p className="text-gray-400 text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-violet-50 border border-violet-200 rounded-2xl p-8 mb-16">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Our Mission</h2>
          <p className="text-gray-500 leading-relaxed mb-4">
            Typography is one of the most powerful design tools, yet hosting and integrating
            custom fonts remains fragmented. FontsVerse solves this by providing a single
            platform where fonts are uploaded once and deployed everywhere.
          </p>
          <p className="text-gray-500 leading-relaxed">
            Every font on FontsVerse is automatically converted to TTF, WOFF, WOFF2, and SVG,
            then served from a global CDN with zero tracking, zero ads in the delivery path,
            and zero vendor lock-in.
          </p>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">The Team</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {TEAM.map((m) => (
              <div key={m.name} className="bg-white border border-gray-200 rounded-xl p-5 text-center
                hover:-translate-y-1 transition-transform duration-200 shadow-sm">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center
                    text-xl font-bold mx-auto mb-3"
                  style={{ background: m.color + "22", border: `2px solid ${m.color}44` }}
                >
                  <span style={{ color: m.color }}>{m.avatar}</span>
                </div>
                <p className="text-gray-900 font-semibold text-sm">{m.name}</p>
                <p className="text-gray-400 text-xs mt-0.5">{m.role}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center border border-gray-200 rounded-2xl p-10 bg-white shadow-sm">
          <h2 className="text-2xl font-bold mb-3">Start hosting your fonts today</h2>
          <p className="text-gray-400 text-sm mb-6">Free forever for public fonts. No credit card required.</p>
          <a href="/" className="inline-block bg-gradient-to-r from-violet-600 to-indigo-600
            text-white px-8 py-3 rounded-xl font-semibold text-sm hover:opacity-85 transition-opacity">
            Get Started →
          </a>
        </div>
      </main>

      {modal === "auth"    && <AuthModal onClose={close} />}
      {modal === "upload"  && <UploadModal onClose={close} onAuthRequired={() => setModal("auth")} />}
      {modal === "ad"      && <AdModal onClose={close} />}
      {modal === "account" && <AccountModal onClose={close} />}
      {modal === "admin"   && <AdminModal onClose={close} />}
    </div>
  );
}
