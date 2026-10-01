import { describe, expect, it } from "vitest";
import { applyTemplate, buildPublicPageSeo, businessMonogram, createDefaultPageConfig, normalizePageConfig, pageTemplates, recommendedTemplates, resolveTemplate, templatePalettes } from "./public-page";

const business = { name: "Barbearia Central", description: "Cuidado com estilo", phone: "11999999999", instagram: "@central", address: "Rua Um", segment: "barbershop" as const };

describe("public page configuration v2", () => {
  it("recommends the right independent templates by segment", () => {
    expect(recommendedTemplates("barbershop")).toEqual(["noir-atelier", "urban-signal"]);
    expect(recommendedTemplates("hair_salon")).toEqual(["maison-editorial"]);
    expect(recommendedTemplates("aesthetics")).toEqual(["botanical-ritual", "clinical-luxe"]);
    expect(recommendedTemplates("health_wellness")).toEqual(["clinical-luxe", "botanical-ritual"]);
    expect(recommendedTemplates("pet_care")).toEqual(["botanical-ritual", "maison-editorial"]);
    expect(recommendedTemplates("fitness_sports")).toEqual(["botanical-ritual", "clinical-luxe"]);
    expect(recommendedTemplates("tattoo_piercing")).toEqual(["noir-atelier", "urban-signal"]);
    expect(recommendedTemplates("consulting_education")).toEqual(["maison-editorial", "urban-signal"]);
    expect(recommendedTemplates("auto_detailing")).toEqual(["noir-atelier", "urban-signal"]);
    expect(recommendedTemplates("other")).toEqual([]);
  });

  it.each([["noir", "noir-atelier"], ["editorial", "maison-editorial"], ["botanical", "botanical-ritual"], ["urban", "urban-signal"]])("maps legacy template %s to %s", (legacy, current) => {
    expect(resolveTemplate(legacy)).toBe(current);
    expect(normalizePageConfig({ ...createDefaultPageConfig(business), template: legacy }, business).template).toBe(current);
  });

  it("provides five templates and three palettes for each", () => {
    expect(pageTemplates).toHaveLength(5);
    expect(Object.values(templatePalettes).every((palettes) => Object.keys(palettes).length === 3)).toBe(true);
  });

  it("changes presentation without modifying operational order or authored content", () => {
    const initial = { ...createDefaultPageConfig(business), serviceOrder: ["service-1"], professionalOrder: ["professional-1"], testimonials: [{ id: crypto.randomUUID(), name: "Ana", text: "Relato real", context: "" }] };
    const changed = applyTemplate(initial, "clinical-luxe", "terracotta");
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
