import { describe, expect, it } from "vitest";
import { bookingSchema, businessSchema, professionalSchema, serviceSchema, unavailabilitySchema } from "./validations";

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

describe("operational schemas", () => {
  it("normaliza um serviço válido e rejeita duração fora do limite", () => {
    const valid = serviceSchema.parse({ name: "Corte", description: "", durationMinutes: "45", price: "59.90" });
    expect(valid.durationMinutes).toBe(45);
    expect(valid.price).toBe(59.9);
    expect(serviceSchema.safeParse({ name: "Corte", durationMinutes: 0, price: 10 }).success).toBe(false);
  });

  it("exige pelo menos um serviço para cada profissional", () => {
    expect(professionalSchema.safeParse({ name: "João", description: "", contact: "", serviceIds: [] }).success).toBe(false);
  });

  it("recusa indisponibilidade invertida", () => {
    expect(unavailabilitySchema.safeParse({
      professionalId: "7b74877b-c6cb-4e3e-876b-507e35c3fcb6",
      startsLocal: "2026-10-10T12:00",
      endsLocal: "2026-10-10T11:00",
      reason: "Folga",
    }).success).toBe(false);
  });

  it("valida os dados essenciais do agendamento público", () => {
    expect(bookingSchema.safeParse({
      slug: "barbearia-central",
      serviceId: "7b74877b-c6cb-4e3e-876b-507e35c3fcb6",
      professionalId: "343daffe-157c-4295-b992-0bd4219ab8e3",
      startsAt: "2026-10-10T12:00:00-03:00",
      clientName: "Cliente Teste",
      clientPhone: "11999999999",
      clientEmail: "cliente@example.com",
    }).success).toBe(true);
  });
});
