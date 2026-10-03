import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BookingDemo } from "./booking-demo";
import { DashboardFrame } from "./dashboard-frame";

const navigation = vi.hoisted(() => ({ pathname: "/dashboard" }));
vi.mock("next/navigation", () => ({ usePathname: () => navigation.pathname }));

beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", class { observe() {} disconnect() {} unobserve() {} });
  vi.stubGlobal("matchMedia", () => ({ matches: true }));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("product preview and demo", () => {
  it("shows only the actual draft page at the full preview route", () => {
    navigation.pathname = "/dashboard/pagina-publica/preview";
    render(<DashboardFrame navigation={<span>Sidebar</span>} topbar={<span>Topbar</span>} mobileNavigation={<span>Mobile nav</span>}><h1>Draft content</h1></DashboardFrame>);
    expect(screen.getByText("Draft content")).toBeVisible();
    expect(screen.queryByText("Sidebar")).toBeNull();
    expect(screen.queryByText("Topbar")).toBeNull();
    expect(screen.queryByText("Mobile nav")).toBeNull();
  });
  it("preserves navigation on normal dashboard routes", () => {
    navigation.pathname = "/dashboard/servicos";
    render(<DashboardFrame navigation={<span>Sidebar</span>} topbar={<span>Topbar</span>} mobileNavigation={<span>Mobile nav</span>}><h1>Services</h1></DashboardFrame>);
    expect(screen.getByText("Sidebar")).toBeVisible();
    expect(screen.getByText("Topbar")).toBeVisible();
  });
  it("allows an accessible booking walkthrough without creating a reservation", () => {
    render(<BookingDemo />);
    fireEvent.click(screen.getByRole("button", { name: "Sessão personalizada" }));
    expect(screen.getByRole("button", { name: "Sessão personalizada" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    fireEvent.click(screen.getByRole("button", { name: "09:00" }));
    expect(screen.getByRole("button", { name: "09:00" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    fireEvent.click(screen.getByRole("button", { name: "Enviar reserva de exemplo" }));
    expect(screen.getByRole("heading", { name: "Reserva enviada" })).toBeVisible();
    expect(screen.getByText(/reserva pendente/)).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Ver novamente" }));
    expect(screen.getByRole("heading", { name: "Escolha o serviço" })).toBeVisible();
  });
});
