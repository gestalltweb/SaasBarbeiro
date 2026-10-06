import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { HeroVideo } from "./hero-video";

afterEach(() => {
  cleanup();
});

describe("hero banner", () => {
  it("renders the static poster immediately", () => {
    const { container } = render(<HeroVideo />);

    expect(container.querySelector("video")).toBeNull();
    expect(container.querySelector("img")?.getAttribute("src")).toContain("other-professional.png");
  });
});
