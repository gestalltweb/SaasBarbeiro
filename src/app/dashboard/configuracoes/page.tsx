import type { Metadata } from "next";
import Link from "next/link";
import { Check, Circle, ExternalLink, Globe2, Settings } from "lucide-react";
import { StatusMessage } from "@/components/status-message";
import { brand } from "@/lib/brand";
import { requireBusiness } from "@/lib/dashboard";
import { setBusinessPublished, updateBusinessSettings } from "../actions";

export const metadata: Metadata = { title: "Configurações" };

export default async function SettingsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { supabase, business } = await requireBusiness();
  const params = await searchParams;
  const [services, professionals, businessHours, professionalHours] = await Promise.all([
    supabase.from("services").select("id", { count: "exact", head: true }).eq("business_id", business.id).eq("is_active", true),
    supabase.from("professionals").select("id", { count: "exact", head: true }).eq("business_id", business.id).eq("is_active", true),
    supabase.from("business_hours").select("id", { count: "exact", head: true }).eq("business_id", business.id),
    supabase.from("professional_hours").select("id", { count: "exact", head: true }).eq("business_id", business.id),
  ]);
  const checklist = [
    { label: "Serviço ativo cadastrado", complete: Boolean(services.count), href: "/dashboard/servicos" },
    { label: "Profissional ativo cadastrado", complete: Boolean(professionals.count), href: "/dashboard/profissionais" },
    { label: "Expediente do negócio configurado", complete: Boolean(businessHours.count), href: "/dashboard/horarios" },
    { label: "Jornada de profissional configurada", complete: Boolean(professionalHours.count), href: "/dashboard/horarios" },
  ];
  const ready = checklist.every((item) => item.complete);

  return <div className="dashboard-body operational-page">
    <header className="page-title"><div><h1>Configurações</h1><p>Mantenha as informações públicas corretas e controle quando sua página entra no ar.</p></div></header>
    <StatusMessage success={typeof params.sucesso === "string" ? params.sucesso : null} error={typeof params.erro === "string" ? params.erro : null} />
    <section className="settings-grid"><form className="settings-form" action={updateBusinessSettings}><div className="panel-title"><Settings /><div><h2>Dados do negócio</h2><p>Essas informações aparecem na sua página pública.</p></div></div><div className="field"><label htmlFor="business-name">Nome</label><input id="business-name" name="name" defaultValue={business.name} maxLength={100} required /></div><div className="field"><label htmlFor="business-description">Descrição</label><textarea id="business-description" name="description" defaultValue={business.description || ""} rows={4} maxLength={600} /></div><div className="form-grid two"><div className="field"><label htmlFor="business-phone">Telefone</label><input id="business-phone" name="phone" defaultValue={business.phone || ""} maxLength={24} /></div><div className="field"><label htmlFor="business-instagram">Instagram</label><input id="business-instagram" name="instagram" defaultValue={business.instagram || ""} maxLength={80} placeholder="@seunegocio" /></div></div><div className="field"><label htmlFor="business-address">Endereço</label><input id="business-address" name="address" defaultValue={business.address || ""} maxLength={240} /></div><div className="field"><label htmlFor="business-slug">Endereço da página</label><div className="slug-field"><span>{brand.domain}/</span><input id="business-slug" name="slug" defaultValue={business.slug} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required /></div><small>Use letras minúsculas, números e hífens.</small></div><button className="button" type="submit">Salvar configurações</button></form>
      <aside className="publish-panel"><div className="panel-title"><Globe2 /><div><h2>Publicação</h2><p>Checklist calculado com os dados reais do negócio.</p></div></div><div className="checklist">{checklist.map((item) => <Link href={item.href} key={item.label} className={item.complete ? "complete" : ""}>{item.complete ? <Check /> : <Circle />}<span>{item.label}</span></Link>)}</div><div className={`publish-state ${business.is_published ? "live" : ""}`}><strong>{business.is_published ? "Sua página está publicada" : ready ? "Tudo pronto para publicar" : "Complete os itens pendentes"}</strong><p>{business.is_published ? "Clientes podem acessar o link e fazer reservas." : ready ? "Depois de publicar, seus horários disponíveis ficarão visíveis." : "A publicação será liberada quando a operação estiver configurada."}</p></div><form action={setBusinessPublished}><input type="hidden" name="publish" value={String(!business.is_published)} /><button className={`button ${business.is_published ? "button-secondary" : ""}`} type="submit" disabled={!business.is_published && !ready}>{business.is_published ? "Despublicar página" : "Publicar página"}</button></form>{business.is_published && <Link className="public-link" href={`/${business.slug}`} target="_blank">Abrir página pública <ExternalLink /></Link>}</aside>
    </section>
  </div>;
}
