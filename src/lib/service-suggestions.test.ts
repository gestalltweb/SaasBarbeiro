import { describe, expect, it } from "vitest";
import { serviceSuggestions } from "./service-suggestions";

describe("serviceSuggestions", () => {
  it.each([
    ["barbershop", ["Corte masculino", "Barba", "Corte e barba", "Acabamento/Pezinho", "Corte infantil", "Sobrancelha"]],
    ["hair_salon", ["Corte feminino", "Escova", "Hidratação", "Coloração", "Manicure", "Pedicure"]],
    ["aesthetics", ["Limpeza de pele", "Design de sobrancelhas", "Depilação facial", "Massagem relaxante", "Drenagem linfática", "Procedimento personalizado"]],
  ] as const)("defines the correct set for %s", (segment, expectedNames) => {
    expect(serviceSuggestions[segment].map((service) => service.name)).toEqual(expectedNames);
  });

  it("does not suggest services for other", () => {
    expect(serviceSuggestions.other).toEqual([]);
  });

  it("stores all suggested prices as integer cents", () => {
    const prices = Object.values(serviceSuggestions).flat().map((service) => service.priceCents);
    expect(prices.every((price) => Number.isInteger(price) && price >= 0)).toBe(true);
    expect(serviceSuggestions.barbershop[0].priceCents).toBe(4_000);
    expect(serviceSuggestions.hair_salon[3].priceCents).toBe(15_000);
    expect(serviceSuggestions.aesthetics[4].priceCents).toBe(12_000);
  });
});
