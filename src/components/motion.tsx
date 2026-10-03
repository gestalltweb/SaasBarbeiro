"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      element?.classList.add("is-visible");
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        element.animate([{ opacity: 0, transform: "translateY(14px)" }, { opacity: 1, transform: "none" }], { duration: 380, easing: "cubic-bezier(.16,1,.3,1)" });
        element.querySelectorAll(".journey article, .booking-flow-grid article, .plan-board li").forEach((card, index) => {
          card.animate([{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }], { duration: 320, delay: index * 55, fill: "backwards", easing: "ease-out" });
        });
        observer.disconnect();
      }
    }, { threshold: 0.12, rootMargin: "0px 0px -32px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref} className={`motion-reveal ${className}`}>{children}</div>;
}

export function AnimatedNumber({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element || value <= 0 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / 550);
        element.textContent = String(Math.round(value * (1 - (1 - progress) ** 3)));
        if (progress < 1 && !document.hidden) frame = requestAnimationFrame(tick);
        else element.textContent = String(value);
      };
      frame = requestAnimationFrame(tick);
    });
    observer.observe(element);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); element.textContent = String(value); };
  }, [value]);
  return <span aria-label={String(value)}><span ref={ref} aria-hidden="true">{value}</span></span>;
}
