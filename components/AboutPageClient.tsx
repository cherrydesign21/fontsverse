"use client";
import { useState, useEffect } from "react";
import Header from "./Header";
import AuthModal from "./AuthModal";
import UploadModal from "./UploadModal";
import AdModal from "./AdModal";
import AccountModal from "./AccountModal";
import AdminModal from "./AdminModal";
import { useAuth } from "@/context/AuthContext";

type ModalType = "auth" | "upload" | "ad" | "account" | "admin" | null;

interface Stats { totalFonts: number; totalDownloads: number; }

export default function AboutPageClient() {
  const { user } = useAuth();
  const [modal, setModal] = useState<ModalType>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const close = () => setModal(null);

  useEffect(() => {
    fetch("/api/stats").then(r => r.json()).then(d => setStats(d)).catch(() => {});
  }, []);

  const fmt = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

  const STATS = [
    { val: stats ? fmt(stats.totalFonts)     : "…", label: "Fonts Hosted" },
    { val: stats ? fmt(stats.totalDownloads) : "…", label: "Total Downloads" },
    { val: "8",                                       label: "Frameworks Supported" },
    { val: "$0",                                      label: "Cost to Upload" },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header
        onSearch={() => {}}
        onLoginClick={() => setModal("auth")}
        onUploadClick={() => user ? setModal("upload") : setModal("auth")}
        onAdClick={() => setModal("ad")}
        onAdminClick={() => setModal("admin")}
        onAccountClick={() => setModal("account")}
      />

      <main className="max-w-[900px] mx-auto px-6 pt-28 pb-20">

        {/* Hero */}
        <div className="mb-20">
          <p className="text-[13px] font-semibold tracking-[3px] uppercase text-gray-400 mb-6">Our Story</p>
          <h1 className="text-5xl font-black tracking-tight mb-5">
            Fonts for the{" "}
            <span className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg,#8ECAE6,#219EBC,#023047,#FFB703,#FB8500)" }}>
              open web
            </span>
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed max-w-[600px]">
            FontsVerse was built to give designers and developers a fast, framework-agnostic way
            to host, manage, and integrate custom typography — without vendor lock-in.
          </p>
        </div>

        {/* Real stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-20">
          {STATS.map((s) => (
            <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-5 text-center shadow-sm">
              <p className="text-3xl font-black text-gray-900 mb-1">{s.val}</p>
              <p className="text-gray-400 text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Mission */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 mb-16">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">What FontsVerse does</h2>
          <p className="text-gray-500 leading-relaxed mb-4">
            Typography is one of the most powerful design tools, yet hosting custom fonts remains
            fragmented. FontsVerse solves this with a single platform where you upload once and
            get working embed code for any framework — HTML, CSS, React, Next.js, Vue, Angular,
            Flutter, and Android.
          </p>
          <p className="text-gray-500 leading-relaxed">
            Fonts are stored in your original format and served directly from Supabase Storage.
            No lock-in, no tracking in the delivery path, and the embed code always points to
            your actual file URL.
          </p>
        </div>

        {/* Honest builder section */}
        <div className="mb-16 border border-gray-100 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4">Built independently</h2>
          <p className="text-gray-500 leading-relaxed">
            FontsVerse is an independent project — not a corporate product or a funded startup.
            It exists because the problem of hosting and integrating custom fonts is genuinely
            annoying to solve, and nothing out there felt right. If it's useful to you, that's
            the whole point.
          </p>
          <p className="text-gray-400 text-sm mt-4">
            Have feedback or a bug to report?{" "}
            <a href="/contact" className="text-amber-600 hover:underline">Reach out →</a>
          </p>
        </div>

        {/* CTA */}
        <div className="text-center border border-gray-200 rounded-2xl p-10 bg-white shadow-sm">
          <h2 className="text-2xl font-bold mb-3">Start hosting your fonts today</h2>
          <p className="text-gray-400 text-sm mb-6">Free forever for public fonts. No credit card required.</p>
          <a href="/"
            className="inline-block text-white px-8 py-3 rounded-xl font-semibold text-sm hover:opacity-85 transition-opacity"
            style={{ background: "linear-gradient(135deg,#FFB703,#FB8500)" }}>
            Browse Fonts →
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
