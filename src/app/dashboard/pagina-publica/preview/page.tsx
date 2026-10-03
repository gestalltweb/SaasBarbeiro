import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PublicPageView } from "@/components/public-page-view";
import { loadPublicPageDashboardData } from "@/lib/public-page-dashboard";

export const metadata: Metadata = { title: "Prévia da página", robots: { index: false, follow: false } };

export default async function FullPagePreview() {
  const data = await loadPublicPageDashboardData();
  const booking = <div className="booking-card preview-booking"><strong>Agendamento real preservado</strong><p>Na página publicada, os clientes escolhem serviço, profissional, data e um horário realmente disponível.</p><button type="button" disabled>Confirmar agendamento</button></div>;
  return <div className="draft-preview-page"><header className="draft-preview-toolbar"><Link href="/dashboard/pagina-publica"><ArrowLeft size={16} /> Voltar ao editor</Link><div><strong>Prévia do rascunho</strong><span>Alterações ainda não publicadas · nenhuma reserva será criada aqui</span></div></header><PublicPageView business={data.business} services={data.services} professionals={data.professionals} businessHours={data.businessHours} config={data.draft} booking={booking} preview /></div>;
}
