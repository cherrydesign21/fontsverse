"use client";
import { useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import AuthModal from "./AuthModal";
import UploadModal from "./UploadModal";
import AdModal from "./AdModal";
import AccountModal from "./AccountModal";
import AdminModal from "./AdminModal";
import { useAuth } from "@/context/AuthContext";
import { useNotif } from "@/context/NotifContext";
import Reveal from "./Reveal";

type ModalType = "auth" | "upload" | "ad" | "account" | "admin" | null;

const TOPICS = ["General Inquiry", "Font Upload Help", "Bug Report", "Partnership", "Advertising", "Other"];

export default function ContactPageClient() {
  const { user } = useAuth();
  const { notify } = useNotif();
  const [modal, setModal] = useState<ModalType>(null);
  const [form, setForm] = useState({ name: "", email: "", topic: "General Inquiry", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending]     = useState(false);
  const close = () => setModal(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.message) { notify("Please fill in all required fields", "error"); return; }
    setSending(true);
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } catch {}
    setSending(false);
    setSubmitted(true);
    notify("Message sent — we'll get back to you soon.");
  };

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

      <main className="max-w-[640px] mx-auto px-6 pt-28 pb-20">
        <Reveal animation="up" delay={0}>
          <div className="mb-10">
            <p className="text-[13px] font-semibold tracking-[3px] uppercase text-gray-400 mb-4">Get in Touch</p>
            <h1 className="text-4xl font-black tracking-tight mb-3">We&apos;d love to hear from you</h1>
            <p className="text-gray-500 text-sm leading-relaxed">
              Bug report, partnership inquiry, or just want to say hello — use the form below.
              We typically respond within 24 hours.
            </p>
          </div>
        </Reveal>

        {!submitted ? (
          <Reveal animation="up" delay={120}>
          <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-7 space-y-4 shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-xs block mb-1.5">Name</label>
                <input className="fv-input" placeholder="Your name"
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="text-gray-400 text-xs block mb-1.5">Email *</label>
                <input className="fv-input" type="email" placeholder="you@example.com"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>

            <div>
              <label className="text-gray-400 text-xs block mb-1.5">Topic</label>
              <select className="fv-input" value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}>
                {TOPICS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="text-gray-400 text-xs block mb-1.5">Message *</label>
              <textarea className="fv-input resize-none" rows={5}
                placeholder="Tell us what's on your mind…"
                value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
            </div>

            <button type="submit" disabled={sending} className="fv-btn-primary w-full disabled:opacity-60">
              {sending ? "Sending…" : "Send Message"}
            </button>
          </form>
          </Reveal>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-12 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Message sent</h2>
            <p className="text-gray-500 text-sm mb-6">
              We&apos;ll get back to you at <strong>{form.email}</strong> within 24 hours.
            </p>
            <button
              onClick={() => { setSubmitted(false); setForm({ name: "", email: "", topic: "General Inquiry", message: "" }); }}
              className="fv-btn-primary px-8 w-auto!">
              Send Another
            </button>
          </div>
        )}
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
