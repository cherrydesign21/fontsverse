"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNotif } from "@/context/NotifContext";
import Header from "./Header";
import AuthModal from "./AuthModal";
import UploadModal from "./UploadModal";
import AdModal from "./AdModal";
import AccountModal from "./AccountModal";
import AdminModal from "./AdminModal";

type Modal = "auth" | "upload" | "ad" | "account" | "admin" | null;

const LOGO_GRADIENT = "linear-gradient(135deg,#8ECAE6,#219EBC,#023047,#FFB703,#FB8500)";

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

export default function PricingPageClient() {
  const { user, profile } = useAuth();
  const { notify }        = useNotif();
  const [modal, setModal] = useState<Modal>(null);
  const [loading, setLoading] = useState(false);
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
    <div className="min-h-screen bg-white text-gray-900">
      <Header onSearch={() => {}} onLoginClick={() => setModal("auth")}
        onUploadClick={() => user ? setModal("upload") : setModal("auth")}
        onAdClick={() => setModal("ad")} onAdminClick={() => setModal("admin")}
        onAccountClick={() => setModal("account")} />

      <main className="max-w-[900px] mx-auto px-6 pt-28 pb-24">
        {/* Heading */}
        <div className="text-center mb-14">
          <h1 className="text-4xl font-black tracking-tight mb-3">
            Simple,{" "}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: LOGO_GRADIENT }}>
              honest pricing
            </span>
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed max-w-md mx-auto">
            FontsVerse is free to use. Upgrade to Pro to embed the entire font library in any project.
          </p>
        </div>

        {/* Plan cards */}
        <div className="grid sm:grid-cols-2 gap-6 max-w-[700px] mx-auto">

          {/* Free */}
          <div className="bg-white border border-gray-200 rounded-2xl p-7 shadow-sm">
            <div className="mb-6">
              <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-2">Free</p>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-black text-gray-900">$0</span>
                <span className="text-gray-400 text-sm mb-1">/ forever</span>
              </div>
              <p className="text-gray-400 text-xs mt-1">No credit card required</p>
            </div>
            <ul className="space-y-3 mb-7">
              {FREE_FEATURES.map(f => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>{f}
                </li>
              ))}
            </ul>
            <button className="w-full py-2.5 rounded-xl border border-gray-200 bg-gray-50
              text-gray-500 text-sm font-medium cursor-default">
              Current Plan
            </button>
          </div>

          {/* Pro */}
          <div className="rounded-2xl p-[2px] shadow-lg" style={{ background: LOGO_GRADIENT }}>
            <div className="bg-white rounded-[14px] p-7 h-full flex flex-col">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-xs uppercase tracking-widest font-semibold bg-clip-text text-transparent"
                    style={{ backgroundImage: LOGO_GRADIENT }}>Pro</p>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded text-white"
                    style={{ background: LOGO_GRADIENT }}>POPULAR</span>
                </div>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-black text-gray-900">$5</span>
                  <span className="text-gray-400 text-sm mb-1">/ year</span>
                </div>
                <p className="text-gray-400 text-xs mt-1">Less than $0.42 / month</p>
              </div>
              <ul className="space-y-3 mb-7 flex-1">
                {PRO_FEATURES.map((f, i) => (
                  <li key={f} className={`flex items-start gap-2.5 text-sm ${i === 0 ? "text-gray-400" : "text-gray-700 font-medium"}`}>
                    <span className={`mt-0.5 shrink-0 ${i === 0 ? "text-gray-300" : "text-amber-500"}`}>
                      {i === 0 ? "✓" : "★"}
                    </span>{f}
                  </li>
                ))}
              </ul>
              {isPro ? (
                <div className="w-full py-2.5 rounded-xl text-center text-white text-sm font-bold"
                  style={{ background: LOGO_GRADIENT }}>
                  ✓ You&apos;re on Pro!
                </div>
              ) : (
                <button onClick={handleUpgrade} disabled={loading}
                  className="w-full py-2.5 rounded-xl text-white text-sm font-bold
                    hover:opacity-90 transition-opacity disabled:opacity-60"
                  style={{ background: LOGO_GRADIENT }}>
                  {loading ? "Redirecting to checkout…" : "Upgrade to Pro — $5/yr"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-[600px] mx-auto">
          <h2 className="text-lg font-bold text-center mb-8 text-gray-700">Common questions</h2>
          <div className="space-y-5">
            {[
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
            ].map(item => (
              <div key={item.q} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <p className="font-semibold text-gray-900 text-sm mb-1.5">{item.q}</p>
                <p className="text-gray-400 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
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
