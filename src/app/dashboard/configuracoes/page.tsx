import { SubmitButton } from "@/components/submit-button";
import type { Metadata } from "next";
import Link from "next/link";
import { Globe2, Settings } from "lucide-react";
import { StatusMessage } from "@/components/status-message";
import { requireBusiness } from "@/lib/dashboard";
import { getSiteUrl } from "@/lib/site-url";
import { updateBusinessSettings } from "../actions";
import { reactivateTemplateChangeNotice } from "../pagina-publica/actions";

export const metadata: Metadata = { title: "Configurações" };

export default async function SettingsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { business } = await requireBusiness();
  const params = await searchParams;
  return <div className="dashboard-body operational-page">
    <header className="page-title"><div><h1>Configurações</h1><p>Mantenha os dados administrativos e o endereço público do negócio.</p></div></header>
    <StatusMessage success={typeof params.sucesso === "string" ? params.sucesso : null} error={typeof params.erro === "string" ? params.erro : null} />
    <section className="settings-grid administrative-settings">
      <form className="settings-form" action={updateBusinessSettings}>
        <div className="panel-title"><Settings /><div><h2>Dados do negócio</h2><p>Informações oficiais usadas no painel e como padrão da página.</p></div></div>
        <div className="field"><label htmlFor="business-name">Nome</label><input id="business-name" name="name" defaultValue={business.name} maxLength={100} required /></div>
        <div className="field"><label htmlFor="business-description">Descrição</label><textarea id="business-description" name="description" defaultValue={business.description || ""} rows={4} maxLength={600} /></div>
        <div className="form-grid two"><div className="field"><label htmlFor="business-phone">Telefone</label><input id="business-phone" name="phone" defaultValue={business.phone || ""} maxLength={24} /></div><div className="field"><label htmlFor="business-instagram">Instagram</label><input id="business-instagram" name="instagram" defaultValue={business.instagram || ""} maxLength={80} placeholder="@seunegocio" /></div></div>
        <div className="field"><label htmlFor="business-address">Endereço</label><input id="business-address" name="address" defaultValue={business.address || ""} maxLength={240} /></div>
        <div className="field"><label htmlFor="business-slug">Endereço da página</label><div className="slug-field"><span>{getSiteUrl()}/</span><input id="business-slug" name="slug" defaultValue={business.slug} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required /></div><small>Use letras minúsculas, números e hífens.</small></div>
        <SubmitButton className="button" type="submit">Salvar configurações</SubmitButton>
      </form>
      <aside className="publish-panel"><div className="panel-title"><Globe2 /><div><h2>Aparência e publicação</h2><p>Agora ficam em uma área própria.</p></div></div><p className="settings-guidance">Escolha um modelo profissional ou monte a página manualmente, visualize o rascunho e publique sem alterar os dados desta tela.</p><Link className="button" href="/dashboard/pagina-publica">Abrir Página pública</Link><form action={reactivateTemplateChangeNotice}><SubmitButton className="text-button" type="submit">Reativar aviso de troca de modelo</SubmitButton></form></aside>
    </section>
  </div>;
}
