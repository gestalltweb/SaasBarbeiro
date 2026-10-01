import type { Metadata } from "next";
import { Blocks, LayoutTemplate, SlidersHorizontal, Sparkles } from "lucide-react";
import { StatusMessage } from "@/components/status-message";
import { loadPublicPageDashboardData } from "@/lib/public-page-dashboard";
import { publicBusinessUrl } from "@/lib/site-url";
import type { BusinessSegment } from "@/lib/service-suggestions";
import { choosePageMode } from "./actions";
import { PublicPageEditor } from "./public-page-editor";

export const metadata: Metadata = { title: "Página pública" };

export default async function PublicPageStudio({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const data = await loadPublicPageDashboardData();
  const params = await searchParams;
  const publishedAt = data.page?.published_at
    ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: data.business.timezone }).format(new Date(data.page.published_at))
    : null;
  const status = <StatusMessage success={typeof params.sucesso === "string" ? params.sucesso : null} error={typeof params.erro === "string" ? params.erro : null} />;

  if (!data.page?.mode) return <div className="dashboard-body wide-page">
    <header className="page-title"><div><h1>Página pública</h1><p>Escolha como deseja criar a vitrine que seus clientes acessarão.</p></div></header>
    {status}
    <section className="page-path-intro"><Sparkles /><div><h2>Como você prefere começar?</h2><p>Os dois caminhos usam os mesmos serviços, profissionais, horários e agendamento real. Você poderá trocar depois.</p></div></section>
    <section className="page-path-grid">
      <article><span><SlidersHorizontal /></span><h2>Quero montar minha página</h2><p>Personalize o modelo, as cores, os textos, as imagens e a organização das seções.</p><small>Mais controle visual, com alguns minutos de configuração.</small><form action={choosePageMode}><input type="hidden" name="mode" value="manual" /><button className="button button-secondary" type="submit">Começar personalização</button></form></article>
      <article className="recommended"><mark>Recomendado</mark><span><LayoutTemplate /></span><h2>Quero uma página pronta</h2><p>Escolha um modelo profissional, adicione sua marca e publique em poucos minutos.</p><small>Fluxo guiado, paletas testadas e fallback elegante sem imagens.</small><form action={choosePageMode}><input type="hidden" name="mode" value="template" /><button className="button" type="submit">Escolher modelo pronto</button></form></article>
    </section>
    <div className="path-safety-note"><Blocks /><p>Trocar o tipo de página nunca apaga serviços, profissionais, horários, clientes ou agendamentos.</p></div>
  </div>;

  return <div className="dashboard-body page-studio-page">
    <header className="page-title"><div><h1>Página pública</h1><p>Edite um rascunho, confira a prévia e publique quando estiver pronto.</p></div><div className="page-publication-state"><span className={data.business.is_published ? "status-live" : "status-draft"}>{data.business.is_published ? "Publicada" : "Rascunho"}</span>{publishedAt && <small>Última publicação em {publishedAt}</small>}</div></header>
    {status}
    <PublicPageEditor
      businessId={data.business.id}
      segment={data.business.segment as BusinessSegment}
      business={data.business}
      services={data.services}
      professionals={data.professionals}
      initialConfig={data.draft}
      publishedPaths={data.publishedPaths}
      isPublished={data.business.is_published}
      ready={data.ready}
      publicUrl={publicBusinessUrl(data.business.slug)}
    />
  </div>;
}
