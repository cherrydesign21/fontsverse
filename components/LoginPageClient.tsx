"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useNotif } from "@/context/NotifContext";

const AMBER_GRAD = "linear-gradient(145.93deg, #FFB703 5.03%, #FB8500 105.22%)";

const WORDS = [
  { t: "WELCOME",           s: 60, w: 600, c: "#ff961f", l: "18%", top: "40%" },
  { t: "Bienvenido",        s: 26, w: 700, c: "#ffcc93", l: "31%", top: "18%" },
  { t: "Siyalemukela",      s: 24, w: 700, c: "#f2ac5d", l: "13%", top: "18%" },
  { t: "Dobro požalovat'",  s: 32, w: 400, c: "#f2ac5d", l: "11%", top: "22%" },
  { t: "Salve",             s: 21, w: 400, c: "#fb8500", l: "22%", top: "22%" },
  { t: "Selamat Datang",    s: 23, w: 400, c: "#f2ac5d", l: "32%", top: "22%" },
  { t: "Yōkoso",            s: 30, w: 400, c: "#f2ac5d", l: "16%", top: "25%" },
  { t: "Hwangyong hamnida", s: 26, w: 600, c: "#ffcc93", l: "15%", top: "29%" },
  { t: "Baruch haba",       s: 19, w: 400, c: "#f2ac5d", l: "9%",  top: "31%" },
  { t: "Dobro požalovat'",  s: 27, w: 400, c: "#ffcc93", l: "30%", top: "29%" },
  { t: "Aloha",             s: 19, w: 600, c: "#fb8500", l: "9%",  top: "35%" },
  { t: "Welkom",            s: 23, w: 400, c: "#fb8500", l: "30%", top: "34%" },
  { t: "Shalom",            s: 24, w: 600, c: "#fb8500", l: "24%", top: "34%" },
  { t: "Välkommen",         s: 23, w: 400, c: "#f2ac5d", l: "16%", top: "38%" },
  { t: "Yin dee dtôn ráp",  s: 23, w: 400, c: "#fedcb6", l: "12%", top: "34%" },
  { t: "Kalós orísate",     s: 19, w: 400, c: "#fb8500", l: "9%",  top: "39%" },
  { t: "Tuloy ka",          s: 19, w: 400, c: "#fb8500", l: "24%", top: "39%" },
  { t: "Som svakôm",        s: 24, w: 400, c: "#ffcc93", l: "9%",  top: "43%" },
  { t: "Aspádzomai",        s: 21, w: 700, c: "#fb8500", l: "37%", top: "35%" },
  { t: "Dobro požalovat'",  s: 32, w: 400, c: "#ffcc93", l: "29%", top: "37%" },
  { t: "Mabuhay",           s: 30, w: 400, c: "#f2ac5d", l: "11%", top: "45%" },
  { t: "Hoşgeldiniz",       s: 24, w: 400, c: "#fb8500", l: "24%", top: "50%" },
  { t: "Hoan nghênh",       s: 21, w: 400, c: "#f2ac5d", l: "33%", top: "50%" },
  { t: "Selamat Datang",    s: 24, w: 600, c: "#ffcc93", l: "12%", top: "50%" },
  { t: "Willkommen",        s: 16, w: 600, c: "#ffcc93", l: "27%", top: "55%" },
  { t: "Benvenuto",         s: 24, w: 400, c: "#f2ac5d", l: "19%", top: "54%" },
  { t: "Bienvenido",        s: 19, w: 600, c: "#fb8500", l: "12%", top: "55%" },
  { t: "Tere tulemast",     s: 16, w: 600, c: "#fb8500", l: "20%", top: "59%" },
  { t: "Huānyíng guānglín", s: 21, w: 400, c: "#fedcb6", l: "27%", top: "58%" },
  { t: "Sbagôtôm",          s: 19, w: 400, c: "#fedcb6", l: "14%", top: "59%" },
  { t: "Bienvenue",         s: 34, w: 400, c: "#f2ac5d", l: "26%", top: "61%" },
  { t: "Vítej",             s: 28, w: 400, c: "#fb8500", l: "16%", top: "62%" },
  { t: "Kalós orísate",     s: 16, w: 400, c: "#ffcc93", l: "20%", top: "63%" },
  { t: "Hwangyong hamnida", s: 19, w: 600, c: "#f2ac5d", l: "20%", top: "70%" },
  { t: "Yin dee dtôn ráp",  s: 19, w: 400, c: "#fedcb6", l: "18%", top: "66%" },
  { t: "Velkomin",          s: 24, w: 700, c: "#fb8500", l: "28%", top: "66%" },
  { t: "Baruch haba",       s: 19, w: 400, c: "#fb8500", l: "23%", top: "75%" },
  { t: "Vitaj",             s: 18, w: 700, c: "#ffcc93", l: "24%", top: "79%" },
  { t: "Shushagatom",       s: 19, w: 700, c: "#fb8500", l: "35%", top: "47%" },
  { t: "Velkommen",         s: 29, w: 400, c: "#fb8500", l: "34%", top: "25%" },
  { t: "Svāgat",            s: 24, w: 400, c: "#f2ac5d", l: "35%", top: "42%" },
] as const;

export default function LoginPageClient() {
  const router   = useRouter();
  const { signIn } = useAuth();
  const { notify } = useNotif();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Email and password are required."); return; }
    setLoading(true);
    const { error: err } = await signIn(email.trim(), password);
    setLoading(false);
    if (err) { setError(err); return; }
    notify("Welcome back! 👋");
    router.push("/");
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "Outfit, system-ui, sans-serif" }}>

      {/* ── Left: Word cloud ── */}
      <div className="hidden lg:block w-[50%] relative bg-[#faf1dd] overflow-hidden">
        {WORDS.map((w, i) => (
          <span key={i} style={{
            position: "absolute",
            top:        w.top,
            left:       w.l,
            fontSize:   w.s,
            fontWeight: w.w,
            color:      w.c,
            whiteSpace: "nowrap",
            lineHeight: 1.2,
          }}>{w.t}</span>
        ))}
      </div>

      {/* ── Right: Login form ── */}
      <div className="flex-1 bg-white flex items-center justify-center p-8 min-h-screen">
        <div className="w-full max-w-[454px]">

          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Link href="/">
              <Image src="/logo.svg" alt="FontsVerse" width={160} height={27} priority />
            </Link>
          </div>

          <h1 className="text-[36px] font-semibold text-[#1b1818] text-center tracking-[-0.36px] mb-8">
            Log In
          </h1>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-[14px] font-medium text-[#101928]">Email</label>
              <input
                type="email" required
                placeholder="you@domain.com"
                value={email} onChange={e => { setEmail(e.target.value); setError(""); }}
                className="h-[56px] px-4 rounded-[15px] text-[14px] font-medium outline-none transition-all"
                style={{ border: "1px solid #e3e3e3", borderBottomWidth: 2, background: "#fff" }}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className="text-[14px] font-medium text-[#101928]">Password</label>
              <input
                type="password" required
                placeholder="••••••••"
                value={password} onChange={e => { setPassword(e.target.value); setError(""); }}
                className="h-[56px] px-4 rounded-[15px] text-[14px] font-medium outline-none transition-all"
                style={{ border: "1px solid #e3e3e3", borderBottomWidth: 2, background: "#fff" }}
              />
              <p className="text-[14px] font-medium text-[#bcbcbc]">Must be at least 8 characters</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-red-500 text-[13px]">⚠ {error}</p>
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="h-[60px] rounded-[8px] text-[14px] font-semibold uppercase tracking-[1.4px] text-black transition-opacity hover:opacity-90 disabled:opacity-60 mt-2"
              style={{ backgroundImage: AMBER_GRAD }}>
              {loading ? "Signing in…" : "Log In"}
            </button>
          </form>

          <p className="text-center text-[14px] mt-6 text-black">
            No account?{" "}
            <Link href="/signup" className="text-[#eb5017] font-semibold hover:underline">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
