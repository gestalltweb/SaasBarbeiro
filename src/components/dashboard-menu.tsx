"use client";

import { MoreHorizontal, X } from "lucide-react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

export function DashboardMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const close = (returnFocus = true) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") close(); };
    const onPointerDown = (event: MouseEvent) => {
      if (!panelRef.current?.contains(event.target as Node) && !triggerRef.current?.contains(event.target as Node)) close(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => { document.removeEventListener("keydown", onKeyDown); document.removeEventListener("mousedown", onPointerDown); };
  }, [open]);

  return <div className="dashboard-menu">
    <button ref={triggerRef} className="app-menu-trigger" type="button" aria-label="Abrir menu" aria-expanded={open} aria-controls={panelId} onClick={() => open ? close(false) : setOpen(true)}><MoreHorizontal /></button>
    {open && <div ref={panelRef} id={panelId} className="app-menu-popover" role="dialog" aria-label="Menu do painel">
      <header><strong>Navegação</strong><button type="button" aria-label="Fechar menu" onClick={() => close()}><X /></button></header>
      <div onClickCapture={(event) => { if ((event.target as HTMLElement).closest("a")) close(false); }}>{children}</div>
    </div>}
  </div>;
}
