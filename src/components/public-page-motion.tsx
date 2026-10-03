"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

export function PublicPageMotion({ children, className, style, template, layout }: {
  children: ReactNode; className: string; style: CSSProperties; template: string; layout: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element || element.closest(".studio-preview-frame") || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const animations: Animation[] = [];
    const duration = ["signal", "garage", "clinical", "laboratory"].includes(layout) ? 220 : 380;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        if (typeof entry.target.animate === "function") animations.push(entry.target.animate([
          { opacity: .5, transform: "translateY(8px)" }, { opacity: 1, transform: "none" },
        ], { duration, easing: "ease-out" }));
        observer.unobserve(entry.target);
      });
    }, { threshold: .08 });
    element.querySelectorAll("main > section, main > div").forEach(section => observer.observe(section));
    return () => { observer.disconnect(); animations.forEach(animation => animation.cancel()); };
  }, [layout]);
  return <div ref={ref} className={className} data-template={template} style={style}>{children}</div>;
}
