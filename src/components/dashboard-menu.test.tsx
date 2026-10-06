import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import Link from "next/link";
import { afterEach, describe, expect, it } from "vitest";
import { DashboardMenu } from "./dashboard-menu";

afterEach(cleanup);

describe("dashboard menu", () => {
  it("opens, closes with Escape, and returns focus to the trigger", () => {
    render(<DashboardMenu><Link href="/dashboard/agenda">Agenda</Link></DashboardMenu>);
    const trigger = screen.getByRole("button", { name: "Abrir menu" });
    fireEvent.click(trigger);
    expect(screen.getByRole("dialog", { name: "Menu do painel" })).toBeVisible();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Menu do painel" })).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it("closes when the close button is used", () => {
    render(<DashboardMenu><Link href="/dashboard/clientes">Clientes</Link></DashboardMenu>);
    fireEvent.click(screen.getByRole("button", { name: "Abrir menu" }));
    fireEvent.click(screen.getByRole("button", { name: "Fechar menu" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
