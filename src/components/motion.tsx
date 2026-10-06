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
    // Landing elements enter independently and re-arm only after fully leaving the observed area.
    if (element.closest(".marketing-v2")) {
      const targets = Array.from(element.querySelectorAll(
        ".v2-intro h1, .v2-intro-copy > p, .v2-intro-copy .hero-actions, .v2-intro-copy .trust-line, .v2-section-heading h2, .v2-section-heading > p, .plain-checks li, .problem-list article, .booking-demo, .comparison-panel, .dashboard-tabs, .dashboard-browser, .dashboard-benefit, .inline-arrow, .phone-device, .phone-story > ul li, .v2-plan-card, .v2-plan-card li, .faq-list, .v2-final-cta h2, .v2-final-cta p, .v2-final-cta .button",
      ));
      type MotionState = { inside: boolean; armed: boolean; animation: Animation | null; rearmTimer: number | null; pausedByVisibility: boolean };
      const states = new Map<Element, MotionState>();

      function staggerDelay(target: Element) {
        const group = target.closest(".problem-list, .plain-checks, .phone-story > ul, .v2-plan-card > ul");
        if (!group) return target.matches(".v2-section-heading > p") ? 120 : 0;
        const index = Array.from(group.children).indexOf(target);
        return Math.max(0, Math.min(index, 3)) * 130;
      }

      function play(target: Element) {
        const state = states.get(target);
        if (!state || !state.armed || document.hidden) return;
        state.armed = false;
        state.animation?.cancel();
        const primary = target.matches(".v2-intro h1, .v2-section-heading h2, .v2-final-cta h2");
        const card = target.matches(".problem-list article, .plain-checks li, .phone-story > ul li, .v2-plan-card li");
        const plan = target.matches(".v2-plan-card");
        const lateral = target.matches(".problem-list article") && !window.matchMedia("(max-width: 700px)").matches;
        const transform = plan ? "scale(.96) translateY(16px)" : lateral ? "translateX(36px)" : `translateY(${primary ? 34 : card ? 22 : 28}px)`;
        state.animation = target.animate(
          [
            { opacity: 0, transform, filter: "blur(5px) brightness(.82)" },
            { opacity: 1, transform: "none", filter: "blur(0) brightness(1)" },
          ],
          {
            duration: primary ? 1000 : plan ? 900 : card ? 760 : 840,
            delay: staggerDelay(target),
            fill: "backwards",
            easing: "cubic-bezier(.22,1,.36,1)",
          },
        );
      }

      targets.forEach(target => states.set(target, { inside: false, armed: true, animation: null, rearmTimer: null, pausedByVisibility: false }));
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          const target = entry.target;
          const state = states.get(target);
          if (!state) return;
          if (entry.isIntersecting) {
            state.inside = true;
            if (state.rearmTimer !== null) window.clearTimeout(state.rearmTimer);
            state.rearmTimer = null;
            play(target);
            return;
          }
          state.inside = false;
          if (state.rearmTimer !== null) window.clearTimeout(state.rearmTimer);
          state.rearmTimer = window.setTimeout(() => {
            if (state.inside) return;
            state.animation?.cancel();
            state.animation = null;
            state.armed = true;
            state.rearmTimer = null;
          }, 180);
        });
      }, { threshold: 0.01, rootMargin: "0px 0px 18% 0px" });
      targets.forEach(target => observer.observe(target));

      const handleVisibility = () => {
        states.forEach((state, target) => {
          if (document.hidden) {
            if (state.animation?.playState === "running") {
              state.animation.pause();
              state.pausedByVisibility = true;
            }
          } else {
            if (state.pausedByVisibility) state.animation?.play();
            state.pausedByVisibility = false;
            if (state.inside) play(target);
          }
        });
      };
      document.addEventListener("visibilitychange", handleVisibility);
      return () => {
        observer.disconnect();
        document.removeEventListener("visibilitychange", handleVisibility);
        states.forEach(state => {
          if (state.rearmTimer !== null) window.clearTimeout(state.rearmTimer);
          state.animation?.cancel();
        });
      };
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        element.animate([{ opacity: 0, transform: "translateY(14px)" }, { opacity: 1, transform: "none" }], { duration: 380, easing: "cubic-bezier(.16,1,.3,1)" });
        element.querySelectorAll(".journey article, .booking-flow-grid article, .plan-board li, .problem-list article, .v2-plan-card li").forEach((card, index) => {
          const mobile = window.matchMedia("(max-width: 700px)").matches;
          card.animate([{ opacity: 0, transform: mobile ? "translateY(18px)" : "translateX(20px)" }, { opacity: 1, transform: "none" }], { duration: 360, delay: index * 70, fill: "backwards", easing: "cubic-bezier(.16,1,.3,1)" });
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
