"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Header from "./Header";
import Footer from "./Footer";
import AuthModal from "./AuthModal";
import UploadModal from "./UploadModal";
import AdModal from "./AdModal";
import AccountModal from "./AccountModal";
import AdminModal from "./AdminModal";

type Modal = "auth" | "upload" | "ad" | "account" | "admin" | null;

const SECTIONS = [
  {
    title: "1. Information We Collect",
    body: `When you create an account, we collect your email address and optional display name. When you upload fonts, we store the font files in Supabase Storage and related metadata (name, category, colors, etc.) in our database. We do not collect payment information directly — all payments are processed by Stripe.`,
  },
  {
    title: "2. How We Use Your Information",
    body: `We use your information to operate FontsVerse — authenticating you, storing your uploaded fonts, generating embed code, and managing your subscription. We do not sell your personal information to third parties, ever.`,
  },
  {
    title: "3. Font Files & Storage",
    body: `Font files you upload are stored in Supabase Storage. Public fonts are accessible via a public URL to anyone who has that URL. Private fonts are only accessible to you when authenticated. You can delete your fonts at any time from your account page.`,
  },
  {
    title: "4. Cookies & Local Storage",
    body: `FontsVerse uses Supabase Auth which stores a session token in localStorage and cookies to keep you signed in. We also use localStorage to store your favorites and project data client-side. We do not use third-party tracking cookies.`,
  },
  {
    title: "5. Third-Party Services",
    body: `We use Supabase (database and storage), Stripe (payments), and Vercel (hosting). Each has its own privacy policy. We do not share your personal data beyond what is necessary to operate these services.`,
  },
  {
    title: "6. Data Retention",
    body: `Your account data and uploaded fonts are retained until you delete your account or request deletion. You may contact us at any time to request deletion of your data.`,
  },
  {
    title: "7. Security",
    body: `All data is transmitted over HTTPS. Supabase enforces Row-Level Security (RLS) so your private fonts are only accessible to your authenticated session. We take reasonable measures to protect your data but cannot guarantee absolute security.`,
  },
  {
    title: "8. Changes to This Policy",
    body: `We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated date. Continued use of FontsVerse after changes constitutes acceptance of the new policy.`,
  },
  {
    title: "9. Contact",
    body: `If you have questions about this Privacy Policy, please contact us via the Contact page.`,
  },
];

export default function PrivacyPageClient() {
  const { user } = useAuth();
  const [modal, setModal] = useState<Modal>(null);
  const close = () => setModal(null);

  return (
    <div className="min-h-screen bg-white text-gray-900" style={{ fontFamily: "Outfit, system-ui, sans-serif" }}>
      <Header onSearch={() => {}} onLoginClick={() => setModal("auth")}
        onUploadClick={() => user ? setModal("upload") : setModal("auth")}
        onAdClick={() => setModal("ad")} onAdminClick={() => setModal("admin")}
        onAccountClick={() => setModal("account")} />

      <main className="max-w-[760px] mx-auto px-6 pt-28 pb-20">
        <div className="mb-12">
          <p className="text-[13px] font-semibold tracking-[3px] uppercase text-gray-400 mb-4">Legal</p>
          <h1 className="text-4xl font-black tracking-tight mb-3">Privacy Policy</h1>
          <p className="text-gray-400 text-sm">Last updated: June 2026</p>
        </div>

        <p className="text-gray-600 leading-relaxed mb-10">
          FontsVerse ("we", "us", "our") is committed to protecting your privacy.
          This policy explains what data we collect, why we collect it, and how we handle it.
        </p>

        <div className="space-y-8">
          {SECTIONS.map(s => (
            <div key={s.title} className="border-b border-gray-100 pb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-3">{s.title}</h2>
              <p className="text-gray-500 leading-relaxed text-sm">{s.body}</p>
            </div>
          ))}
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
