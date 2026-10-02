import { describe, expect, it } from "vitest";
import { applyTemplate, buildPublicPageSeo, businessMonogram, createDefaultPageConfig, normalizePageConfig, pageTemplates, recommendedTemplates, resolveTemplate, templatePalettes } from "./public-page";

const business = { name: "Barbearia Central", description: "Cuidado com estilo", phone: "11999999999", instagram: "@central", address: "Rua Um", segment: "barbershop" as const };

describe("public page configuration v2", () => {
  it("recommends the right independent templates by segment", () => {
    expect(recommendedTemplates("barbershop")).toHaveLength(5);
    expect(recommendedTemplates("hair_salon")).toHaveLength(5);
    expect(recommendedTemplates("aesthetics")).toHaveLength(5);
    expect(recommendedTemplates("other")).toHaveLength(5);
    expect(recommendedTemplates("barbershop")).toContain("heritage-barber");
  });

  it.each([["noir", "noir-atelier"], ["editorial", "maison-editorial"], ["botanical", "botanical-ritual"], ["urban", "urban-signal"]])("keeps legacy template %s resolvable", (legacy, current) => {
    expect(resolveTemplate(legacy)).toBe(current);
    expect(recommendedTemplates(business.segment)).toContain(normalizePageConfig({ ...createDefaultPageConfig(business), template: legacy }, business).template);
  });

  it("provides twenty templates and a professional default palette for each", () => {
    expect(pageTemplates).toHaveLength(20);
    expect(Object.values(templatePalettes).every((palettes) => Object.keys(palettes).length === 1)).toBe(true);
  });

  it("changes presentation without modifying operational order or authored content", () => {
    const initial = { ...createDefaultPageConfig(business), serviceOrder: ["service-1"], professionalOrder: ["professional-1"], testimonials: [{ id: crypto.randomUUID(), name: "Ana", text: "Relato real", context: "" }] };
    const changed = applyTemplate(initial, "clinical-luxe");
    expect(changed.serviceOrder).toEqual(initial.serviceOrder);
    expect(changed.professionalOrder).toEqual(initial.professionalOrder);
    expect(changed.testimonials).toEqual(initial.testimonials);
  });

  it("keeps an image-free visual fallback and two-letter monograms", () => {
    expect(createDefaultPageConfig(business).media.coverUrl).toBe("");
    expect(businessMonogram("Barbearia Central")).toBe("BC");
  });

  it("builds metadata from the published configuration", () => {
    const config = createDefaultPageConfig(business); config.content.seoTitle = "Título publicado"; config.content.seoDescription = "Descrição publicada"; config.media.shareUrl = "https://example.com/share.webp";
    expect(buildPublicPageSeo(config, business.name, "https://example.com/barbearia")).toEqual({ title: "Título publicado", description: "Descrição publicada", canonicalUrl: "https://example.com/barbearia", imageUrl: "https://example.com/share.webp" });
  });
});
