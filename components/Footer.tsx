"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white py-16 px-6" style={{ fontFamily: "Outfit, system-ui, sans-serif" }}>
      <div className="max-w-[1280px] mx-auto">
        <div className="flex justify-between gap-12 mb-12 flex-wrap">
          {/* Brand */}
          <div className="max-w-[440px]">
            <img src="/logo.svg" alt="FontsVerse" width={130} height={30} className="mb-8" />
            <p className="text-[16px] leading-[26px] text-[#666]">
              FontsVerse was built to give designers and developers a fast,
              framework-agnostic way to host, manage, and integrate custom
              typography — without vendor lock-in.
            </p>
          </div>

          {/* Nav columns */}
          <div className="flex gap-[100px] flex-wrap">
            <div>
              <p className="text-[18px] font-medium tracking-[1.8px] uppercase text-[#FB8500] mb-10">Browse</p>
              <div className="flex flex-col gap-5 text-[16px] font-light text-[#333]">
                <Link href="/fonts" className="hover:text-[#023047] transition-colors">Fonts</Link>
                <Link href="/packs" className="hover:text-[#023047] transition-colors">Font Packs</Link>
              </div>
            </div>
            <div>
              <p className="text-[18px] font-medium tracking-[1.8px] uppercase text-[#FB8500] mb-10">Support</p>
              <div className="flex flex-col gap-5 text-[16px] font-light text-[#333]">
                <Link href="/contact" className="hover:text-[#023047] transition-colors">Contact</Link>
                <Link href="/contact" className="hover:text-[#023047] transition-colors">Send us Feedback</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#e1e1e1] pt-8 flex justify-between items-center flex-wrap gap-3 text-[16px] font-light text-[#666]">
          <span>Copyright©2026 FontsVerse</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-[#023047] transition-colors">Privacy Policy</Link>
            <span>All rights reserved</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
