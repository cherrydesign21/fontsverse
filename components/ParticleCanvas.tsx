"use client";
import { useEffect, useRef } from "react";

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    let W = 0, H = 0;
    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const chars =
      "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz0123456789@#&Ω∆∑π";
    const fonts = ["serif", "monospace", "cursive", "fantasy"];

    interface Particle {
      x: number; y: number; ch: string; font: string;
      size: number; speed: number; drift: number; opacity: number; hue: number;
    }

    function makeParticle(init = false): Particle {
      return {
        x: Math.random() * W,
        y: init ? Math.random() * H : H + 20,
        ch: chars[Math.floor(Math.random() * chars.length)],
        font: fonts[Math.floor(Math.random() * fonts.length)],
        size: Math.random() * 18 + 10,
        speed: Math.random() * 0.45 + 0.1,
        drift: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.07 + 0.02,
        hue: Math.random() * 80 + 200,
      };
    }

    let particles: Particle[] = Array.from({ length: 130 }, () => makeParticle(true));
    let raf: number;

    const loop = () => {
      ctx.clearRect(0, 0, W, H);
      particles = particles.map((p) => {
        p.y -= p.speed;
        p.x += p.drift;
        if (p.y < -20) return makeParticle(false);
        return p;
      });
      particles.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = `hsl(${p.hue},55%,45%)`;
        ctx.font = `${p.size}px ${p.font}`;
        ctx.fillText(p.ch, p.x, p.y);
        ctx.restore();
      });
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}
