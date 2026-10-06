import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DashboardTutorial } from "./dashboard-tutorial";

const preference = vi.hoisted(() => vi.fn(async () => ({ ok: true })));
vi.mock("@/app/dashboard/tutorial-actions", () => ({ updateTutorialPreference: preference }));

afterEach(() => { cleanup(); preference.mockClear(); });

const steps = [
  { id: "services", title: "Serviços", description: "Cadastre seus serviços.", href: "/dashboard/servicos", complete: true },
  { id: "preview", title: "Prévia", description: "Confira a página.", href: "/dashboard/pagina-publica/preview" },
];

describe("dashboard tutorial", () => {
  it("allows a manual step and finishes the tutorial", async () => {
    render(<DashboardTutorial steps={steps} initialAcknowledged={[]} />);
    fireEvent.click(screen.getByRole("button", { name: "Entendi" }));
    expect(await screen.findByRole("button", { name: /Concluir tutorial/ })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: /Concluir tutorial/ }));
    expect(preference).toHaveBeenCalled();
  });

  it("asks before dismissing the tutorial", () => {
    render(<DashboardTutorial steps={steps} initialAcknowledged={[]} />);
    fireEvent.click(screen.getByRole("button", { name: "Dispensar tutorial" }));
    expect(screen.getByRole("alertdialog", { name: "Dispensar tutorial" })).toBeVisible();
  });
});
