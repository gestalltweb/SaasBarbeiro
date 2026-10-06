import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Reveal } from "./motion";
import { StartTimeline } from "./marketing-experience";

type ObserverRecord = {
  callback: IntersectionObserverCallback;
  options?: IntersectionObserverInit;
  elements: Set<Element>;
};

const observers: ObserverRecord[] = [];
const animationControls = { cancel: vi.fn(), pause: vi.fn(), play: vi.fn(), playState: "running" };
const animate = vi.fn(() => animationControls as unknown as Animation);

function send(record: ObserverRecord, target: Element, isIntersecting: boolean) {
  act(() => record.callback([{ target, isIntersecting } as IntersectionObserverEntry], {} as IntersectionObserver));
}

beforeEach(() => {
  vi.useFakeTimers();
  observers.length = 0;
  animate.mockClear();
  animationControls.cancel.mockClear();
  animationControls.pause.mockClear();
  animationControls.play.mockClear();
  animationControls.playState = "running";
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false })));
  Object.defineProperty(document, "hidden", { configurable: true, value: false });
  vi.stubGlobal("IntersectionObserver", class {
    record: ObserverRecord;
    constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
      this.record = { callback, options, elements: new Set() };
      observers.push(this.record);
    }
    observe = (element: Element) => this.record.elements.add(element);
    unobserve = (element: Element) => this.record.elements.delete(element);
    disconnect = () => this.record.elements.clear();
    takeRecords = () => [];
  });
  Object.defineProperty(Element.prototype, "animate", { configurable: true, value: animate });
});

afterEach(() => {
  cleanup();
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  Reflect.deleteProperty(Element.prototype, "animate");
});

describe("landing page motion", () => {
  it("starts early, does not duplicate while visible, and replays after leaving", () => {
    render(<main className="marketing-v2"><Reveal><section><div className="v2-section-heading"><h2>Movimento</h2><p>Descrição</p></div></section></Reveal></main>);
    const heading = screen.getByRole("heading", { name: "Movimento" });
    const observer = observers[0];

    expect(observer.options).toMatchObject({ threshold: 0.01, rootMargin: "0px 0px 18% 0px" });
    send(observer, heading, true);
    send(observer, heading, true);
    expect(animate).toHaveBeenCalledTimes(1);
    const firstOptions = (animate.mock.calls[0] as unknown as [Keyframe[], KeyframeAnimationOptions])[1];
    expect(firstOptions).toMatchObject({ duration: 1000 });

    send(observer, heading, false);
    act(() => vi.advanceTimersByTime(181));
    send(observer, heading, true);
    expect(animate).toHaveBeenCalledTimes(2);
  });

  it("re-arms the setup timeline after it has genuinely left the viewport", () => {
    const { container } = render(<StartTimeline />);
    const timeline = container.querySelector(".start-timeline")!;
    const observer = observers[0];

    send(observer, timeline, true);
    expect(timeline).toHaveClass("timeline-active");
    send(observer, timeline, false);
    act(() => vi.advanceTimersByTime(181));
    expect(timeline).not.toHaveClass("timeline-active");
    send(observer, timeline, true);
    expect(timeline).toHaveClass("timeline-active");
  });

  it("pauses an active entrance while the tab is hidden without replaying a finished entrance", () => {
    render(<main className="marketing-v2"><Reveal><section><div className="v2-section-heading"><h2>Pausa segura</h2></div></section></Reveal></main>);
    const heading = screen.getByRole("heading", { name: "Pausa segura" });
    send(observers[0], heading, true);

    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    expect(animationControls.pause).toHaveBeenCalledTimes(1);

    Object.defineProperty(document, "hidden", { configurable: true, value: false });
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    expect(animationControls.play).toHaveBeenCalledTimes(1);
    expect(animate).toHaveBeenCalledTimes(1);

    animationControls.playState = "finished";
    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    Object.defineProperty(document, "hidden", { configurable: true, value: false });
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    expect(animationControls.play).toHaveBeenCalledTimes(1);
  });

  it("shows content immediately when reduced motion is requested", () => {
    vi.mocked(window.matchMedia).mockReturnValue({ matches: true } as MediaQueryList);
    render(<main className="marketing-v2"><Reveal><div className="v2-section-heading"><h2>Sem movimento</h2></div></Reveal></main>);
    expect(screen.getByRole("heading", { name: "Sem movimento" })).toBeVisible();
    expect(observers).toHaveLength(0);
    expect(animate).not.toHaveBeenCalled();
  });
});
