import { SubmitButton } from "@/components/submit-button";
import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Trash2, UserRound } from "lucide-react";
import { StatusMessage } from "@/components/status-message";
import { requireBusiness } from "@/lib/dashboard";
import { deleteProfessional, saveProfessional, setProfessionalActive } from "../actions";

export const metadata: Metadata = { title: "Profissionais" };

function ServiceChecks({ services, selected = [] }: { services: Array<{ id: string; name: string }>; selected?: string[] }) {
  return <fieldset className="check-field"><legend>Serviços realizados</legend>{services.map((service) => <label key={service.id}><input type="checkbox" name="serviceIds" value={service.id} defaultChecked={selected.includes(service.id)} /><span>{service.name}</span></label>)}</fieldset>;
}

export default async function ProfessionalsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { supabase, business } = await requireBusiness();
  const params = await searchParams;
  const [{ data: services }, { data: professionals, error }] = await Promise.all([
    supabase.from("services").select("id, name").eq("business_id", business.id).eq("is_active", true).order("name"),
    supabase.from("professionals").select("*, professional_services(service_id)").eq("business_id", business.id).order("is_active", { ascending: false }).order("name"),
  ]);
  if (error) throw new Error("Não foi possível carregar os profissionais.");
  const availableServices = services || [];

  return <div className="dashboard-body operational-page">
    <header className="page-title"><div><h1>Profissionais</h1><p>Organize sua equipe e escolha quais serviços cada pessoa atende.</p></div></header>
    <StatusMessage success={typeof params.sucesso === "string" ? params.sucesso : null} error={typeof params.erro === "string" ? params.erro : null} />
    {!availableServices.length ? <div className="callout"><strong>Cadastre um serviço primeiro.</strong><p>Todo profissional precisa estar associado a pelo menos um serviço ativo.</p><Link href="/dashboard/servicos">Ir para serviços</Link></div> : <section className="split-workspace">
      <form className="editor-panel" action={saveProfessional}>
        <div className="panel-title"><Plus /><div><h2>Novo profissional</h2><p>Adicione quem receberá os agendamentos.</p></div></div>
        <div className="field"><label htmlFor="professional-name">Nome</label><input id="professional-name" name="name" maxLength={100} required /></div>
        <div className="field"><label htmlFor="professional-description">Descrição</label><textarea id="professional-description" name="description" rows={3} maxLength={600} placeholder="Especialidade ou breve apresentação." /></div>
        <div className="field"><label htmlFor="professional-contact">Contato</label><input id="professional-contact" name="contact" maxLength={120} placeholder="Telefone, WhatsApp ou e-mail" /></div>
        <ServiceChecks services={availableServices} />
        <SubmitButton className="button" type="submit">Cadastrar profissional</SubmitButton>
      </form>
      <section className="records-panel"><div className="panel-title"><UserRound /><div><h2>{professionals?.length || 0} {professionals?.length === 1 ? "profissional" : "profissionais"}</h2><p>Edite dados, serviços ou disponibilidade.</p></div></div>
        {!professionals?.length ? <div className="empty-state"><UserRound /><h3>Sua equipe aparecerá aqui</h3><p>Cadastre o primeiro profissional para configurar a jornada de trabalho.</p></div> : <div className="record-list">{professionals.map((professional) => {
          const selected = (professional.professional_services || []).map((item: { service_id: string }) => item.service_id);
          return <details className="record-item" key={professional.id}><summary><span className="avatar-initials">{professional.name.split(" ").map((part: string) => part[0]).join("").slice(0, 2).toUpperCase()}</span><span><strong>{professional.name}</strong><small>{selected.length} {selected.length === 1 ? "serviço associado" : "serviços associados"}</small></span><span className={professional.is_active ? "status-chip active" : "status-chip inactive"}>{professional.is_active ? "Ativo" : "Pausado"}</span></summary><form className="inline-editor" action={saveProfessional}><input type="hidden" name="id" value={professional.id} /><div className="field"><label htmlFor={`professional-name-${professional.id}`}>Nome</label><input id={`professional-name-${professional.id}`} name="name" defaultValue={professional.name} maxLength={100} required /></div><div className="field"><label htmlFor={`professional-description-${professional.id}`}>Descrição</label><textarea id={`professional-description-${professional.id}`} name="description" defaultValue={professional.description} rows={3} maxLength={600} /></div><div className="field"><label htmlFor={`professional-contact-${professional.id}`}>Contato</label><input id={`professional-contact-${professional.id}`} name="contact" defaultValue={professional.contact} maxLength={120} /></div><ServiceChecks services={availableServices} selected={selected} /><SubmitButton className="button button-small" type="submit">Salvar alterações</SubmitButton></form><div className="record-actions"><form action={setProfessionalActive}><input type="hidden" name="id" value={professional.id} /><input type="hidden" name="active" value={String(!professional.is_active)} /><SubmitButton className="text-button" type="submit">{professional.is_active ? "Pausar profissional" : "Ativar profissional"}</SubmitButton></form><form action={deleteProfessional}><input type="hidden" name="id" value={professional.id} /><SubmitButton className="text-button danger" type="submit"><Trash2 /> Excluir</SubmitButton></form></div></details>;
        })}</div>}
      </section>
    </section>}
  </div>;
}
