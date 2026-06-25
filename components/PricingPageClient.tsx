"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNotif } from "@/context/NotifContext";
import Header from "./Header";
import Footer from "./Footer";
import AuthModal from "./AuthModal";
import UploadModal from "./UploadModal";
import AdModal from "./AdModal";
import AccountModal from "./AccountModal";
import AdminModal from "./AdminModal";
import Reveal from "./Reveal";

type Modal = "auth" | "upload" | "ad" | "account" | "admin" | null;

const AMBER_GRAD  = "linear-gradient(145.93deg, #FFB703 5.03%, #FB8500 105.22%)";
const NAVY_GRAD   = "linear-gradient(136.52deg, #023047 5%, #011f2f 105%)";

const FREE_FEATURES = [
  "Upload & host unlimited fonts",
  "Share fonts with embed code",
  "Download fonts in all formats",
  "Manage fonts in projects",
  "Public font gallery",
];

const PRO_FEATURES = [
  "Everything in Free",
  "Embed ALL fonts from FontsVerse",
  "Priority CDN delivery",
  "Early access to new features",
  "Support indie font hosting",
];

const FAQS = [
  {
    q: "What does 'embed all fonts' mean?",
    a: "Free users can embed fonts they personally uploaded. Pro users can embed any font from the entire FontsVerse library in their projects — including fonts uploaded by other users.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. You can cancel your subscription anytime from your account settings. You'll keep Pro access until the end of your billing period.",
  },
  {
    q: "What payment methods are accepted?",
    a: "All major credit and debit cards via Stripe. Secure, no data stored on our servers.",
  },
  {
    q: "Is there a free trial?",
    a: "The Free plan is free forever — you can use it as long as you need. Upgrade to Pro when you want access to the full font library.",
  },
];

function Check({ pro }: { pro?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0 mt-0.5">
      <circle cx="10" cy="10" r="10" fill={pro ? "#FB8500" : "#E8F5E9"} />
      <path d="M6 10.5l3 3 5-6" stroke={pro ? "#fff" : "#2E7D32"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function PricingPageClient() {
  const { user, profile } = useAuth();
  const { notify }        = useNotif();
  const [modal, setModal] = useState<Modal>(null);
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const close = () => setModal(null);

  const isPro = (profile as { plan?: string } | null)?.plan === "pro";

  const handleUpgrade = async () => {
    if (!user || !profile) { setModal("auth"); return; }
    if (isPro) { notify("You already have Pro! 🎉"); return; }
    setLoading(true);
    try {
      const res  = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, email: user.email }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else notify(data.error || "Could not start checkout", "error");
    } catch {
      notify("Payment service unavailable", "error");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen" style={{ background: "#f9f5ec", fontFamily: "Outfit, system-ui, sans-serif" }}>
      <Header onSearch={() => {}} onLoginClick={() => setModal("auth")}
        onUploadClick={() => user ? setModal("upload") : setModal("auth")}
        onAdClick={() => setModal("ad")} onAdminClick={() => setModal("admin")}
        onAccountClick={() => setModal("account")} />

      <main className="pt-28 pb-24 px-6">

        {/* ── Heading ── */}
        <Reveal animation="up" delay={0}>
          <div className="text-center mb-16">
            <h1 className="text-[60px] font-bold tracking-tight leading-tight mb-4">
              Simple, Honest{" "}
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: AMBER_GRAD }}>
                Pricing
              </span>
            </h1>
            <p className="text-gray-500 text-[17px] max-w-[480px] mx-auto leading-relaxed">
              FontsVerse is free to use. Upgrade to Pro to embed the entire font library in any project.
            </p>
          </div>
        </Reveal>

        {/* ── Plan cards ── */}
        <div className="flex flex-col lg:flex-row gap-7 justify-center items-stretch max-w-[1060px] mx-auto mb-20">

          {/* Free */}
          <Reveal animation="up" delay={80} className="flex-1 max-w-[488px]">
            <div className="bg-white rounded-2xl p-9 shadow-sm h-full flex flex-col">
              {/* Icon */}
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                style={{ background: "#ffe3c3" }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M5 8h18M5 14h12M5 20h8" stroke="#FB8500" strokeWidth="2.2" strokeLinecap="round"/>
                </svg>
              </div>

              <p className="text-[16px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Free</p>

              <div className="flex items-end gap-2 mb-1">
                <span className="text-[60px] font-bold leading-none text-gray-900">$0</span>
                <span className="text-gray-400 text-[16px] mb-3">/ forever</span>
              </div>
              <p className="text-gray-400 text-[13px] mb-8">No credit card required</p>

              <ul className="space-y-4 mb-10 flex-1">
                {FREE_FEATURES.map(f => (
                  <li key={f} className="flex items-start gap-3 text-[16px] text-gray-700">
                    <Check />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                disabled
                className="w-full h-[56px] rounded-[10px] border-2 border-gray-900 text-[14px] font-bold uppercase tracking-[1.4px] text-gray-900 cursor-default opacity-60">
                Current Plan
              </button>
            </div>
          </Reveal>

          {/* Pro */}
          <Reveal animation="up" delay={180} className="flex-1 max-w-[488px]">
            <div className="rounded-2xl p-9 shadow-lg h-full flex flex-col relative overflow-hidden"
              style={{ background: NAVY_GRAD }}>
              {/* Subtle dot pattern overlay */}
              <div className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }} />

              {/* Icon */}
              <div className="relative w-14 h-14 rounded-xl flex items-center justify-center mb-6 bg-white/10">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M14 3l2.5 7.5H24l-6.2 4.5 2.5 7.5L14 18l-6.3 4.5 2.5-7.5L4 10.5h7.5z" fill="#FFB703"/>
                </svg>
              </div>

              <div className="relative flex items-center gap-3 mb-3">
                <p className="text-[16px] font-semibold text-amber-400 uppercase tracking-widest">Pro</p>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded text-white bg-amber-500/30 border border-amber-400/40">
                  POPULAR
                </span>
              </div>

              <div className="relative flex items-end gap-2 mb-1">
                <span className="text-[60px] font-bold leading-none text-white">$5</span>
                <span className="text-white/50 text-[16px] mb-3">/ year</span>
              </div>
              <p className="relative text-white/40 text-[13px] mb-8">Less than $0.42 / month</p>

              <ul className="relative space-y-4 mb-10 flex-1">
                {PRO_FEATURES.map((f, i) => (
                  <li key={f} className={`flex items-start gap-3 text-[16px] ${i === 0 ? "text-white/50" : "text-white"}`}>
                    <Check pro={i !== 0} />
                    {f}
                  </li>
                ))}
              </ul>

              {isPro ? (
                <div className="relative w-full h-[56px] rounded-[10px] flex items-center justify-center text-white text-[14px] font-bold bg-amber-500/20 border border-amber-400/30">
                  ✓ You&apos;re on Pro!
                </div>
              ) : (
                <button onClick={handleUpgrade} disabled={loading}
                  className="relative w-full h-[56px] rounded-[10px] text-[13px] font-bold uppercase tracking-[1.2px] text-white hover:opacity-90 transition-opacity disabled:opacity-60"
                  style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}>
                  {loading ? "Redirecting…" : "Upgrade to Pro — $5/Year"}
                </button>
              )}
            </div>
          </Reveal>
        </div>

        {/* ── FAQ ── */}
        <div className="max-w-[680px] mx-auto">
          <Reveal animation="up" delay={0}>
            <h2 className="text-[28px] font-bold text-center text-gray-800 mb-8">Common questions</h2>
          </Reveal>
          <div className="space-y-3">
            {FAQS.map((item, i) => (
              <Reveal key={item.q} animation="up" delay={i * 70}>
                <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-5 text-left">
                    <span className="font-semibold text-gray-900 text-[15px]">{item.q}</span>
                    <span className={`text-gray-400 text-xl ml-3 shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-45" : ""}`}>+</span>
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-5">
                      <p className="text-gray-500 text-[14px] leading-relaxed">{item.a}</p>
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </main>

      <Footer />

      {modal === "auth"    && <AuthModal onClose={close} />}
      {modal === "upload"  && <UploadModal onClose={close} onAuthRequired={() => setModal("auth")} />}
      {modal === "ad"      && <AdModal onClose={close} />}
      {modal === "account" && <AccountModal onClose={close} />}
      {modal === "admin"   && <AdminModal onClose={close} />}
    </div>
  );
}
