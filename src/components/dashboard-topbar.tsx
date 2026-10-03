"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { usePathname } from "next/navigation";

const pageLabels: Array<[string, string]> = [
  ["/dashboard/agenda", "Agenda"],
  ["/dashboard/clientes", "Clientes"],
  ["/dashboard/servicos", "Serviços"],
  ["/dashboard/profissionais", "Profissionais"],
  ["/dashboard/horarios", "Horários"],
  ["/dashboard/pagina-publica", "Página pública"],
  ["/dashboard/configuracoes", "Configurações"],
];

export function DashboardTopbar({ businessName, slug, isPublished }: { businessName: string; slug: string; isPublished: boolean }) {
  const pathname = usePathname();
  const currentPage = pageLabels.find(([path]) => pathname.startsWith(path))?.[1] || "Visão geral";
  const monogram = businessName.trim().split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  return <header className="app-topbar">
    <div className="topbar-page-context"><small>Painel</small><strong>{currentPage}</strong></div>
    <div className="topbar-business-context">
      <span className="business-monogram" aria-hidden="true">{monogram || "AL"}</span>
      <div><small>{businessName}</small><span className={isPublished ? "business-page-status is-live" : "business-page-status"}><i />{isPublished ? "Página publicada" : "Página em rascunho"}</span></div>
      <Link href={isPublished ? `/${slug}` : "/dashboard/pagina-publica/preview"} target="_blank">{isPublished ? "Ver página publicada" : "Ver rascunho"} <ExternalLink size={15} /></Link>
    </div>
  </header>;
}
