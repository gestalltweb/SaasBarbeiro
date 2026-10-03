import { describe, expect, it } from "vitest";
import { filterFormUrl } from "./filter-form-url";

describe("availability and agenda navigation", () => {
  it("keeps all actual service, professional and date selections and returns to booking", () => {
    const form = new FormData();
    form.set("servico", "service-id");
    form.set("profissional", "professional-id");
    form.set("data", "2026-10-02");
    expect(filterFormUrl("/studio", form)).toBe("/studio?servico=service-id&profissional=professional-id&data=2026-10-02#agendar");
  });
  it("keeps filters encoded and does not add the booking anchor in the dashboard", () => {
    const form = new FormData();
    form.set("busca", "Ana & João");
    expect(filterFormUrl("/dashboard/clientes", form)).toBe("/dashboard/clientes?busca=Ana+%26+Jo%C3%A3o");
  });
});
