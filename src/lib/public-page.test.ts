import { describe, expect, it } from "vitest";
import { applyTemplate, buildPublicPageSeo, businessMonogram, createDefaultPageConfig, recommendedTemplates, templatePalettes } from "./public-page";

const business = { name: "Barbearia Central", description: "Cuidado com estilo", phone: "11999999999", instagram: "@central", address: "Rua Um", segment: "barbershop" as const };

describe("public page configuration", () => {
  it("recommends templates by segment", () => {
    expect(recommendedTemplates("barbershop")).toEqual(["urban", "noir"]);
    expect(recommendedTemplates("hair_salon")).toEqual(["editorial"]);
    expect(recommendedTemplates("aesthetics")).toEqual(["botanical"]);
    expect(recommendedTemplates("other")).toEqual([]);
  });

  it("provides three palettes for every template", () => {
    expect(Object.values(templatePalettes).every((palettes) => Object.keys(palettes).length >= 3)).toBe(true);
  });

  it("creates a two-letter monogram when there is no logo", () => {
    expect(businessMonogram("Barbearia Central")).toBe("BC");
    expect(businessMonogram("Studio")).toBe("S");
  });

  it("changes visual mode without removing operational ordering", () => {
    const initial = { ...createDefaultPageConfig(business), serviceOrder: ["service-1"], professionalOrder: ["professional-1"] };
    const changed = applyTemplate(initial, "noir", "gold");
    expect(changed.template).toBe("noir");
    expect(changed.serviceOrder).toEqual(["service-1"]);
    expect(changed.professionalOrder).toEqual(["professional-1"]);
  });

  it("has a visual fallback when no cover is uploaded", () => {
    expect(createDefaultPageConfig(business).media.coverUrl).toBe("");
  });

  it("builds metadata from the selected published configuration", () => {
    const config = createDefaultPageConfig(business);
    config.content.seoTitle = "Título publicado";
    config.content.seoDescription = "Descrição publicada";
    config.media.shareUrl = "https://example.com/share.webp";
    expect(buildPublicPageSeo(config, business.name, "https://example.com/barbearia")).toEqual({
      title: "Título publicado", description: "Descrição publicada", canonicalUrl: "https://example.com/barbearia", imageUrl: "https://example.com/share.webp",
    });
  });
});
