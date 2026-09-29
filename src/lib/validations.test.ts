import { describe, expect, it } from "vitest";
import { businessSchema } from "./validations";

describe("businessSchema", () => {
  it("aceita um slug público seguro", () => {
    expect(
      businessSchema.safeParse({
        name: "Barbearia do João",
        slug: "barbearia-do-joao",
        segment: "barbershop",
      }).success,
    ).toBe(true);
  });

  it.each(["../admin", "Com Espaço", "acentuação", "slug--duplo"])(
    "recusa o slug %s",
    (slug) => {
      expect(
        businessSchema.safeParse({
          name: "Negócio",
          slug,
          segment: "other",
        }).success,
      ).toBe(false);
    },
  );
});
