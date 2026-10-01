import type { Metadata } from "next";
import { Clock3, Info, Plus, Scissors, Sparkles, Trash2 } from "lucide-react";
import { StatusMessage } from "@/components/status-message";
import { money, requireBusiness } from "@/lib/dashboard";
import { hasServiceSuggestions } from "@/lib/service-suggestions";
import { addSuggestedServices, deleteService, saveService, setServiceActive } from "../actions";

export const metadata: Metadata = { title: "Serviços" };

export default async function ServicesPage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { supabase, business } = await requireBusiness();
  const params = await searchParams;
  const { data: services, error } = await supabase
    .from("services")
    .select("*")
    .eq("business_id", business.id)
    .order("is_active", { ascending: false })
    .order("name");
  if (error) throw new Error("Não foi possível carregar os serviços.");

  const supportsSuggestions = hasServiceSuggestions(business.segment);

  return (
    <div className="dashboard-body operational-page">
      <header className="page-title">
        <div>
          <h1>Serviços</h1>
          <p>Defina o que seus clientes podem reservar, a duração e o valor de cada atendimento.</p>
        </div>
      </header>

      <StatusMessage
        success={typeof params.sucesso === "string" ? params.sucesso : null}
        error={typeof params.erro === "string" ? params.erro : null}
      />

      {supportsSuggestions ? (
        <section className="suggestion-callout" aria-labelledby="suggestion-title">
          <span className="suggestion-icon" aria-hidden="true"><Sparkles /></span>
          <div>
            <h2 id="suggestion-title">Sugestões para o seu segmento</h2>
            <p>Criamos alguns serviços comuns para o seu segmento. Revise os preços, as durações e mantenha apenas os serviços oferecidos pelo seu negócio.</p>
          </div>
          <form action={addSuggestedServices}>
            <button className="button button-secondary" type="submit">Adicionar serviços sugeridos</button>
          </form>
        </section>
      ) : (
        <section className="suggestion-callout quiet" aria-label="Serviços personalizados">
          <span className="suggestion-icon" aria-hidden="true"><Info /></span>
          <div>
            <h2>Serviços personalizados</h2>
            <p>Seu segmento não possui sugestões prontas. Cadastre abaixo os serviços específicos oferecidos pelo seu negócio.</p>
          </div>
        </section>
      )}

      <section className="split-workspace">
        <form className="editor-panel" action={saveService}>
          <div className="panel-title"><Plus /><div><h2>Novo serviço</h2><p>O serviço fica ativo assim que for criado.</p></div></div>
          <div className="field"><label htmlFor="service-name">Nome</label><input id="service-name" name="name" maxLength={100} required /></div>
          <div className="field"><label htmlFor="service-description">Descrição</label><textarea id="service-description" name="description" rows={3} maxLength={600} placeholder="Explique o que está incluído." /></div>
          <div className="form-grid two">
            <div className="field"><label htmlFor="duration">Duração</label><div className="input-suffix"><input id="duration" name="durationMinutes" type="number" min={5} max={720} step={5} defaultValue={30} required /><span>min</span></div></div>
            <div className="field"><label htmlFor="price">Preço</label><div className="input-prefix"><span>R$</span><input id="price" name="price" type="number" min={0} max={1000000} step="0.01" defaultValue="0.00" required /></div></div>
          </div>
          <button className="button" type="submit">Cadastrar serviço</button>
        </form>

        <section className="records-panel" aria-label="Serviços cadastrados">
          <div className="panel-title"><Scissors /><div><h2>{services?.length || 0} {services?.length === 1 ? "serviço" : "serviços"}</h2><p>Edite, pause ou exclua os serviços do negócio.</p></div></div>
          {!services?.length ? (
            <div className="empty-state"><Scissors /><h3>Cadastre seu primeiro serviço</h3><p>Ele será usado para calcular a duração dos horários disponíveis.</p></div>
          ) : (
            <div className="record-list">
              {services.map((service) => (
                <details className={`record-item ${service.is_active ? "is-active" : "is-paused"}`} key={service.id}>
                  <summary>
                    <span className="record-icon"><Scissors /></span>
                    <span><strong>{service.name}</strong><small><Clock3 /> {service.duration_minutes} min · {money(service.price_cents)}</small></span>
                    <span className={service.is_active ? "status-chip active" : "status-chip inactive"}>{service.is_active ? "Ativo" : "Pausado"}</span>
                  </summary>
                  <form className="inline-editor" action={saveService}>
                    <input type="hidden" name="id" value={service.id} />
                    <div className="field"><label htmlFor={`name-${service.id}`}>Nome</label><input id={`name-${service.id}`} name="name" defaultValue={service.name} maxLength={100} required /></div>
                    <div className="field"><label htmlFor={`description-${service.id}`}>Descrição</label><textarea id={`description-${service.id}`} name="description" defaultValue={service.description} rows={3} maxLength={600} /></div>
                    <div className="form-grid two">
                      <div className="field"><label htmlFor={`duration-${service.id}`}>Duração em minutos</label><input id={`duration-${service.id}`} name="durationMinutes" type="number" min={5} max={720} step={5} defaultValue={service.duration_minutes} required /></div>
                      <div className="field"><label htmlFor={`price-${service.id}`}>Preço em reais</label><input id={`price-${service.id}`} name="price" type="number" min={0} max={1000000} step="0.01" defaultValue={(service.price_cents / 100).toFixed(2)} required /></div>
                    </div>
                    <button className="button button-small" type="submit">Salvar alterações</button>
                  </form>
                  <div className="record-actions">
                    <form action={setServiceActive}><input type="hidden" name="id" value={service.id} /><input type="hidden" name="active" value={String(!service.is_active)} /><button className="text-button" type="submit">{service.is_active ? "Pausar serviço" : "Ativar serviço"}</button></form>
                    <form action={deleteService}><input type="hidden" name="id" value={service.id} /><button className="text-button danger" type="submit"><Trash2 /> Excluir</button></form>
                  </div>
                </details>
              ))}
            </div>
          )}
        </section>
      </section>
    </div>
  );
}
