"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Clock3, Globe2, LayoutDashboard, Scissors, UserRound, Users } from "lucide-react";

const items = [
  { href: "/dashboard", label: "Visão geral", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/dashboard/clientes", label: "Clientes", icon: Users },
  { href: "/dashboard/servicos", label: "Serviços", icon: Scissors },
  { href: "/dashboard/profissionais", label: "Profissionais", icon: UserRound },
  { href: "/dashboard/horarios", label: "Horários", icon: Clock3 },
  { href: "/dashboard/pagina-publica", label: "Página pública", icon: Globe2 },
];

export function DashboardNav() {
  const pathname = usePathname();
  return <nav aria-label="Menu do painel">{items.map(({ href, label, icon: Icon, exact }) => {
    const active = exact ? pathname === href : pathname.startsWith(href);
    return <Link className={active ? "active" : undefined} href={href} key={href}><Icon /> <span>{label}</span></Link>;
  })}</nav>;
}

export function MobileDashboardNav() {
  const pathname = usePathname();
  const mobileItems = [items[0], items[1], items[3], items[4], items[6]];
  return <nav className="mobile-app-nav" aria-label="Menu móvel do painel">{mobileItems.map(({ href, label, icon: Icon, exact }) => {
    const active = exact ? pathname === href : pathname.startsWith(href);
    return <Link className={active ? "active" : undefined} href={href} key={href}><Icon /><span>{label}</span></Link>;
  })}</nav>;
}
