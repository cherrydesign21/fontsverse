"use client";
import { useState } from "react";
import Image from "next/image";
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

const AMBER_GRAD = "linear-gradient(145.93deg, #FFB703 5.03%, #FB8500 105.22%)";

const TOPICS = ["General Inquiry", "Font Upload Help", "Bug Report", "Partnership", "Advertising", "Other"];

const FLOAT_NAMES = [
  { t: "Montserrat",    top: "22%", left: "6%",   s: 28, op: 0.55 },
  { t: "Lato",          top: "35%", left: "5%",   s: 36, op: 0.45 },
  { t: "Outfit",        top: "55%", left: "7%",   s: 24, op: 0.50 },
  { t: "Space Grotesk", top: "68%", left: "4%",   s: 22, op: 0.40 },
  { t: "Bebas Neue",    top: "20%", right: "5%",  s: 30, op: 0.50 },
  { t: "Open Sans",     top: "45%", right: "4%",  s: 26, op: 0.45 },
  { t: "Raleway",       top: "65%", right: "6%",  s: 28, op: 0.40 },
] as const;

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
    <div className="min-h-screen" style={{ background: "#f9f5ec", fontFamily: "Outfit, system-ui, sans-serif" }}>
      <Header
        onSearch={() => {}}
        onLoginClick={() => setModal("auth")}
        onUploadClick={() => user ? setModal("upload") : setModal("auth")}
        onAdClick={() => setModal("ad")}
        onAdminClick={() => setModal("admin")}
        onAccountClick={() => setModal("account")}
      />

      {/* ── Dark hero with floating font names ── */}
      <div className="relative w-full overflow-hidden" style={{ height: 500, marginTop: 80 }}>
        <Image src="/contact-bg.jpg" alt="" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/60" />
        {FLOAT_NAMES.map((f, i) => (
          <span key={i} style={{
            position:   "absolute",
            top:        f.top,
            left:       "left" in f ? f.left : undefined,
            right:      "right" in f ? (f as { right: string }).right : undefined,
            fontSize:   f.s,
            fontWeight: 700,
            color:      `rgba(255,255,255,${f.op})`,
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}>{f.t}</span>
        ))}
      </div>

      {/* ── Contact card pulled up over the dark section ── */}
      <div className="relative z-10 max-w-[680px] mx-auto px-6 -mt-48 pb-24">
        <Reveal animation="up" delay={0}>
          <div className="bg-white rounded-2xl shadow-xl p-10">

            {/* Badge + heading */}
            <div className="text-center mb-8">
              <span className="inline-block px-4 py-1.5 rounded-full border border-gray-200 text-[13px] text-gray-500 font-medium mb-4">
                Get in Touch
              </span>
              <h1 className="text-[40px] font-bold leading-tight text-gray-900">
                We&apos;d{" "}
                <span className="bg-clip-text text-transparent" style={{ backgroundImage: AMBER_GRAD }}>
                  love
                </span>{" "}
                to hear from you
              </h1>
            </div>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[14px] font-medium text-[#101928] mb-1.5">Name</label>
                    <input
                      type="text"
                      placeholder="Your name"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      className="w-full h-[52px] px-4 rounded-[12px] text-[14px] outline-none"
                      style={{ border: "1px solid #e3e3e3", borderBottomWidth: 2 }}
                    />
                  </div>
                  <div>
                    <label className="block text-[14px] font-medium text-[#101928] mb-1.5">Email *</label>
                    <input
                      type="email" required
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      className="w-full h-[52px] px-4 rounded-[12px] text-[14px] outline-none"
                      style={{ border: "1px solid #e3e3e3", borderBottomWidth: 2 }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[14px] font-medium text-[#101928] mb-1.5">Topic</label>
                  <select
                    value={form.topic}
                    onChange={e => setForm({ ...form, topic: e.target.value })}
                    className="w-full h-[52px] px-4 rounded-[12px] text-[14px] outline-none bg-white"
                    style={{ border: "1px solid #e3e3e3", borderBottomWidth: 2 }}>
                    {TOPICS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[14px] font-medium text-[#101928] mb-1.5">Message *</label>
                  <textarea
                    required rows={5}
                    placeholder="Tell us what's on your mind…"
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-[12px] text-[14px] outline-none resize-none"
                    style={{ border: "1px solid #e3e3e3", borderBottomWidth: 2 }}
                  />
                </div>

                <button
                  type="submit" disabled={sending}
                  className="w-full h-[56px] rounded-[10px] text-[14px] font-semibold uppercase tracking-[1.4px] text-black transition-opacity hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundImage: AMBER_GRAD }}>
                  {sending ? "Sending…" : "Send Message"}
                </button>
              </form>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-5">
                  <svg className="w-7 h-7 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Message sent!</h2>
                <p className="text-gray-500 text-sm mb-6">
                  We&apos;ll get back to you at <strong>{form.email}</strong> within 24 hours.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: "", email: "", topic: "General Inquiry", message: "" }); }}
                  className="px-8 py-3 rounded-[10px] text-[14px] font-semibold uppercase tracking-wider text-black"
                  style={{ backgroundImage: AMBER_GRAD }}>
                  Send Another
                </button>
              </div>
            )}
          </div>
        </Reveal>
      </div>

      <Footer />

      {modal === "auth"    && <AuthModal onClose={close} />}
      {modal === "upload"  && <UploadModal onClose={close} onAuthRequired={() => setModal("auth")} />}
      {modal === "ad"      && <AdModal onClose={close} />}
      {modal === "account" && <AccountModal onClose={close} />}
      {modal === "admin"   && <AdminModal onClose={close} />}
    </div>
  );
}
