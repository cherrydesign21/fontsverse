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
import { useNotif } from "@/context/NotifContext";

type ModalType = "auth" | "upload" | "ad" | "account" | "admin" | null;

const TOPICS = ["General Inquiry", "Font Upload Help", "Bug Report", "Partnership", "Advertising", "Other"];

export default function ContactPageClient() {
  const { user } = useAuth();
  const { notify } = useNotif();
  const [modal, setModal] = useState<ModalType>(null);
  const [form, setForm] = useState({ name: "", email: "", topic: "General Inquiry", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const close = () => setModal(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.message) { notify("Please fill in all required fields", "error"); return; }
    setSubmitted(true);
    notify("Message sent! We'll get back to you soon. ✓");
  };

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

      <main className="relative z-10 max-w-[680px] mx-auto px-6 pt-28 pb-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black tracking-tight mb-3">Get in Touch</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Have a question, bug report, or just want to say hello?<br />We usually respond within 24 hours.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-10">
          {[
            { icon: "📧", label: "Email", value: "hello@fontsverse.app", href: "mailto:hello@fontsverse.app" },
            { icon: "💬", label: "Discord", value: "discord.gg/fontsverse", href: "https://discord.gg/fontsverse" },
            { icon: "🐦", label: "Twitter", value: "@fontsverse", href: "https://twitter.com/fontsverse" },
          ].map((c) => (
            <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer"
              className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm hover:border-amber-300 hover:shadow-md transition-all block">
              <div className="text-2xl mb-2">{c.icon}</div>
              <p className="text-gray-400 text-[10px] uppercase tracking-widest mb-1">{c.label}</p>
              <p className="text-amber-600 text-xs font-medium">{c.value}</p>
            </a>
          ))}
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-7 space-y-4 shadow-sm">
            <h2 className="text-lg font-bold mb-1">Send a message</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-xs block mb-1.5">Name</label>
                <input className="fv-input w-full" placeholder="Your name"
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="text-gray-400 text-xs block mb-1.5">Email *</label>
                <input className="fv-input w-full" type="email" placeholder="you@example.com"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>

            <div>
              <label className="text-gray-400 text-xs block mb-1.5">Topic</label>
              <select className="fv-input w-full" value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}>
                {TOPICS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="text-gray-400 text-xs block mb-1.5">Message *</label>
              <textarea className="fv-input w-full resize-none" rows={5}
                placeholder="Tell us what's on your mind…"
                value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
            </div>

            <button type="submit" className="fv-btn-primary w-full">Send Message</button>
          </form>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-12 text-center">
            <div className="text-5xl mb-4">✉️</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Message sent!</h2>
            <p className="text-gray-500 text-sm mb-6">We'll get back to you at {form.email} within 24 hours.</p>
            <button onClick={() => { setSubmitted(false); setForm({ name: "", email: "", topic: "General Inquiry", message: "" }); }}
              className="fv-btn-primary !w-auto px-8">Send Another</button>
          </div>
        )}
      </main>

      {modal === "auth"    && <AuthModal onClose={close} />}
      {modal === "upload"  && <UploadModal onClose={close} onAuthRequired={() => setModal("auth")} />}
      {modal === "ad"      && <AdModal onClose={close} />}
      {modal === "account" && <AccountModal onClose={close} />}
      {modal === "admin"   && <AdminModal onClose={close} />}
    </div>
  );
}
