import type { Metadata } from "next";
import { CalendarDays, Check, CheckCheck, Filter, X } from "lucide-react";
import { StatusMessage } from "@/components/status-message";
import { dateKey, requireBusiness } from "@/lib/dashboard";
import { updateAppointmentStatus } from "../actions";

export const metadata: Metadata = { title: "Agenda" };

const statusLabels: Record<string, string> = { pending: "Pendente", confirmed: "Confirmado", cancelled: "Cancelado", completed: "Concluído" };

export default async function AgendaPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { supabase, business } = await requireBusiness();
  const params = await searchParams;
  const selectedDate = typeof params.data === "string" ? params.data : dateKey(new Date(), business.timezone);
  const professionalId = typeof params.profissional === "string" ? params.profissional : "";
  const status = typeof params.status === "string" ? params.status : "";
  let query = supabase.from("appointments").select("id, starts_at, ends_at, status, clients(id, name, phone, email), services(name, duration_minutes, price_cents), professionals(id, name)").eq("business_id", business.id).order("starts_at").limit(300);
  if (professionalId) query = query.eq("professional_id", professionalId);
  if (status) query = query.eq("status", status);
  const [{ data: appointments, error }, { data: professionals }] = await Promise.all([
    query,
    supabase.from("professionals").select("id, name").eq("business_id", business.id).order("name"),
  ]);
  if (error) throw new Error("Não foi possível carregar a agenda.");
  const dayAppointments = (appointments || []).filter((appointment) => dateKey(appointment.starts_at, business.timezone) === selectedDate);

  return <div className="dashboard-body operational-page">
    <header className="page-title"><div><h1>Agenda</h1><p>Acompanhe o dia, confirme reservas e conclua os atendimentos realizados.</p></div></header>
    <StatusMessage success={typeof params.sucesso === "string" ? params.sucesso : null} error={typeof params.erro === "string" ? params.erro : null} />
    <form className="filter-bar" method="get"><Filter /><label><span>Data</span><input type="date" name="data" defaultValue={selectedDate} /></label><label><span>Profissional</span><select name="profissional" defaultValue={professionalId}><option value="">Todos</option>{professionals?.map((professional) => <option value={professional.id} key={professional.id}>{professional.name}</option>)}</select></label><label><span>Status</span><select name="status" defaultValue={status}><option value="">Todos</option><option value="pending">Pendente</option><option value="confirmed">Confirmado</option><option value="completed">Concluído</option><option value="cancelled">Cancelado</option></select></label><button className="button button-small" type="submit">Aplicar filtros</button></form>
    <section className="agenda-day"><div className="section-heading"><div><h2>{new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC", dateStyle: "full" }).format(new Date(`${selectedDate}T12:00:00Z`))}</h2><p>{dayAppointments.length} {dayAppointments.length === 1 ? "atendimento" : "atendimentos"}</p></div><CalendarDays /></div>
      {!dayAppointments.length ? <div className="empty-state"><CalendarDays /><h3>Nenhum atendimento encontrado</h3><p>Altere os filtros ou compartilhe sua página pública para receber novas reservas.</p></div> : <div className="appointment-list">{dayAppointments.map((appointment) => {
        const client = Array.isArray(appointment.clients) ? appointment.clients[0] : appointment.clients;
        const service = Array.isArray(appointment.services) ? appointment.services[0] : appointment.services;
        const professional = Array.isArray(appointment.professionals) ? appointment.professionals[0] : appointment.professionals;
        return <article className="appointment-row" key={appointment.id}><time><strong>{new Intl.DateTimeFormat("pt-BR", { timeZone: business.timezone, hour: "2-digit", minute: "2-digit" }).format(new Date(appointment.starts_at))}</strong><span>{service?.duration_minutes} min</span></time><div className="appointment-main"><strong>{client?.name}</strong><span>{service?.name} com {professional?.name}</span><small>{client?.phone}{client?.email ? ` · ${client.email}` : ""}</small></div><span className={`status-chip ${appointment.status}`}>{statusLabels[appointment.status]}</span><div className="appointment-actions">{appointment.status === "pending" && <form action={updateAppointmentStatus}><input type="hidden" name="id" value={appointment.id} /><input type="hidden" name="status" value="confirmed" /><button type="submit" title="Confirmar"><Check /> Confirmar</button></form>}{["pending", "confirmed"].includes(appointment.status) && <><form action={updateAppointmentStatus}><input type="hidden" name="id" value={appointment.id} /><input type="hidden" name="status" value="completed" /><button type="submit" title="Concluir"><CheckCheck /> Concluir</button></form><form action={updateAppointmentStatus}><input type="hidden" name="id" value={appointment.id} /><input type="hidden" name="status" value="cancelled" /><button className="danger" type="submit" title="Cancelar"><X /> Cancelar</button></form></>}</div></article>;
      })}</div>}
    </section>
  </div>;
}
