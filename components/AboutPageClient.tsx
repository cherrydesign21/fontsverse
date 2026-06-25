"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "./Header";
import Footer from "./Footer";
import AuthModal from "./AuthModal";
import UploadModal from "./UploadModal";
import AdModal from "./AdModal";
import AccountModal from "./AccountModal";
import AdminModal from "./AdminModal";
import { useAuth } from "@/context/AuthContext";
import Reveal from "./Reveal";

type ModalType = "auth" | "upload" | "ad" | "account" | "admin" | null;

const AMBER_GRAD = "linear-gradient(145.93deg, #FFB703 5.03%, #FB8500 105.22%)";

const STATS = [
  { num: "80+",  label: "Fonts Hosted" },
  { num: "550+", label: "Total Downloads" },
  { num: "20+",  label: "Countries" },
  { num: "$0",   label: "Cost to Upload" },
];

const FLOATING_FONTS = [
  { t: "Outfit",        top: "18%", left: "5%",  s: 28, op: 0.18 },
  { t: "Montserrat",    top: "28%", left: "12%", s: 22, op: 0.14 },
  { t: "Space Grotesk", top: "40%", left: "3%",  s: 20, op: 0.16 },
  { t: "Bebas Neue",    top: "55%", left: "8%",  s: 30, op: 0.12 },
  { t: "Raleway",       top: "68%", left: "5%",  s: 24, op: 0.15 },
  { t: "Inter",         top: "22%", right: "6%", s: 26, op: 0.14 },
  { t: "Lato",          top: "35%", right: "4%", s: 32, op: 0.12 },
  { t: "Open Sans",     top: "50%", right: "7%", s: 22, op: 0.16 },
  { t: "Nunito",        top: "65%", right: "5%", s: 28, op: 0.13 },
  { t: "Playfair",      top: "76%", right: "8%", s: 24, op: 0.14 },
] as const;

export default function AboutPageClient() {
  const { user } = useAuth();
  const [modal, setModal] = useState<ModalType>(null);
  const close = () => setModal(null);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "Outfit, system-ui, sans-serif" }}>
      <Header
        onSearch={() => {}}
        onLoginClick={() => setModal("auth")}
        onUploadClick={() => user ? setModal("upload") : setModal("auth")}
        onAdClick={() => setModal("ad")}
        onAdminClick={() => setModal("admin")}
        onAccountClick={() => setModal("account")}
      />

      {/* ── Hero ── */}
      <section className="relative w-full overflow-hidden" style={{ height: 600, marginTop: 80 }}>
        <Image
          src="/about-hero-bg.jpg"
          alt="Colorful typography"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <Reveal animation="scale" delay={0}>
            <span className="inline-block px-5 py-2 rounded-full border border-white/50 text-white/80 text-[13px] font-medium tracking-[2px] uppercase mb-7">
              Our Story
            </span>
          </Reveal>
          <Reveal animation="up" delay={120}>
            <h1 className="text-[64px] sm:text-[80px] font-bold leading-[1.05] text-white mb-5 max-w-[800px]">
              Fonts for the{" "}
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: AMBER_GRAD }}>
                Open Web
              </span>
            </h1>
          </Reveal>
          <Reveal animation="up" delay={240}>
            <p className="text-white/70 text-[18px] leading-relaxed max-w-[580px]">
              A fast, open, and framework-agnostic way to host, manage, and embed custom typography — without vendor lock-in.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-20 bg-white">
        <div className="max-w-[1100px] mx-auto px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {STATS.map((s, i) => (
              <Reveal key={s.label} animation="up" delay={i * 80}>
                <div className="text-center">
                  <p className="text-[60px] font-bold leading-none mb-2" style={{ color: "#FB8500" }}>
                    {s.num}
                  </p>
                  <p className="text-[16px] text-gray-500">{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 1: What FontsVerse does (text left, image right) ── */}
      <section className="py-20 bg-[#f9f5ec]">
        <div className="max-w-[1100px] mx-auto px-8 grid lg:grid-cols-2 gap-16 items-center">
          <Reveal animation="left" delay={0}>
            <div>
              <h2 className="text-[48px] font-bold leading-tight mb-6">
                What FontsVerse{" "}
                <span className="bg-clip-text text-transparent" style={{ backgroundImage: AMBER_GRAD }}>
                  does
                </span>
              </h2>
              <p className="text-gray-600 text-[17px] leading-relaxed mb-5">
                Typography is one of the most powerful design tools, yet hosting custom fonts remains fragmented. FontsVerse solves this with a single platform where you upload once and get working embed code for any framework — HTML, CSS, React, Next.js, Vue, Angular, Flutter, and Android.
              </p>
              <p className="text-gray-500 text-[16px] leading-relaxed">
                Fonts are stored in your original format and served directly. No lock-in, no tracking, and the embed code always points to your actual file URL.
              </p>
            </div>
          </Reveal>
          <Reveal animation="right" delay={120}>
            <div className="rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/about-section1.jpg"
                alt="Letterpress typography"
                width={540}
                height={400}
                className="w-full object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Section 2: Built independently (image left, text right) ── */}
      <section className="py-20 bg-white">
        <div className="max-w-[1100px] mx-auto px-8 grid lg:grid-cols-2 gap-16 items-center">
          <Reveal animation="left" delay={0}>
            <div className="rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/about-section2.jpg"
                alt="Colorful letter blocks"
                width={540}
                height={400}
                className="w-full object-cover"
              />
            </div>
          </Reveal>
          <Reveal animation="right" delay={120}>
            <div>
              <h2 className="text-[48px] font-bold leading-tight mb-6">
                Built{" "}
                <span className="bg-clip-text text-transparent" style={{ backgroundImage: AMBER_GRAD }}>
                  independently
                </span>
              </h2>
              <p className="text-gray-600 text-[17px] leading-relaxed mb-5">
                FontsVerse is an independent project — not a corporate product or a funded startup. It exists because the problem of hosting and integrating custom fonts is genuinely annoying to solve, and nothing out there felt right.
              </p>
              <p className="text-gray-500 text-[16px] leading-relaxed">
                If it&apos;s useful to you, that&apos;s the whole point. Have feedback?{" "}
                <Link href="/contact" className="font-semibold hover:underline" style={{ color: "#FB8500" }}>
                  Reach out →
                </Link>
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-24 overflow-hidden" style={{ background: "#011520" }}>
        <Image src="/cta-bg.jpg" alt="" fill className="object-cover opacity-40" />
        {FLOATING_FONTS.map((f, i) => (
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
        <div className="relative text-center max-w-[700px] mx-auto px-8">
          <Reveal animation="up" delay={0}>
            <h2 className="text-[52px] font-bold text-white leading-tight mb-4">
              Start hosting your fonts today
            </h2>
          </Reveal>
          <Reveal animation="up" delay={120}>
            <p className="text-white/60 text-[18px] mb-8">Free forever for public fonts. No credit card required.</p>
          </Reveal>
          <Reveal animation="up" delay={220}>
            <Link href="/"
              className="inline-block px-10 py-4 rounded-[10px] text-[15px] font-semibold uppercase tracking-widest text-black hover:opacity-90 transition-opacity"
              style={{ backgroundImage: AMBER_GRAD }}>
              Browse Fonts →
            </Link>
          </Reveal>
        </div>
      </section>

      <Footer />

      {modal === "auth"    && <AuthModal onClose={close} />}
      {modal === "upload"  && <UploadModal onClose={close} onAuthRequired={() => setModal("auth")} />}
      {modal === "ad"      && <AdModal onClose={close} />}
      {modal === "account" && <AccountModal onClose={close} />}
      {modal === "admin"   && <AdminModal onClose={close} />}
    </div>
  );
}
