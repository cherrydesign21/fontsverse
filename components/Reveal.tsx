"use client";
import { useEffect, useRef, ReactNode, CSSProperties } from "react";

type Animation = "up" | "down" | "left" | "right" | "scale" | "fade";

interface Props {
  children: ReactNode;
  animation?: Animation;
  delay?: number;
  className?: string;
  style?: CSSProperties;
  threshold?: number;
}

export default function Reveal({
  children,
  animation = "up",
  delay = 0,
  className = "",
  style,
  threshold = 0.1,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay) el.style.transitionDelay = `${delay}ms`;
          el.classList.add("in-view");
          obs.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [delay, threshold]);

  return (
    <div ref={ref} className={`reveal reveal-${animation} ${className}`} style={style}>
      {children}
    </div>
  );
}
