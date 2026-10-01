import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, CheckCircle2, Clock3, Users } from "lucide-react";
import { dateKey, dateTime, requireBusiness } from "@/lib/dashboard";

export const metadata: Metadata = { title: "Painel" };

export default async function DashboardPage() {
  const { supabase, user, business } = await requireBusiness();
  const firstName = String(user.user_metadata.full_name || "").split(" ")[0] || "por aqui";
  const [servicesResult, professionalsResult, hoursResult, professionalHoursResult, clientsResult, appointmentsResult] = await Promise.all([
    supabase.from("services").select("id", { count: "exact", head: true }).eq("business_id", business.id).eq("is_active", true),
    supabase.from("professionals").select("id", { count: "exact", head: true }).eq("business_id", business.id).eq("is_active", true),
    supabase.from("business_hours").select("id", { count: "exact", head: true }).eq("business_id", business.id),
    supabase.from("professional_hours").select("id", { count: "exact", head: true }).eq("business_id", business.id),
    supabase.from("clients").select("id", { count: "exact", head: true }).eq("business_id", business.id),
    supabase.from("appointments").select("id, starts_at, status, clients(name), services(name), professionals(name)").eq("business_id", business.id).neq("status", "cancelled").order("starts_at").limit(100),
  ]);
  const checklist = [Boolean(servicesResult.count), Boolean(professionalsResult.count), Boolean(hoursResult.count && professionalHoursResult.count)];
  const completed = checklist.filter(Boolean).length;
  const today = dateKey(new Date(), business.timezone);
  const appointments = appointmentsResult.data || [];
  const todayAppointments = appointments.filter((item) => dateKey(item.starts_at, business.timezone) === today);
  const next = appointments.find((item) => new Date(item.starts_at) > new Date());

  return (
    <div className="dashboard-body"><div className="welcome-row"><div><p>Olá, {firstName}</p><h1>Sua agenda, clara e pronta para o dia.</h1></div><span className={business.is_published ? "status-live" : "status-draft"}>{business.is_published ? "Página publicada" : "Página em rascunho"}</span></div>
      <section className="activation-panel"><div><h2>{completed === 3 ? "Seu negócio está pronto para receber agendamentos." : "Complete a configuração e publique seu link."}</h2><p>{completed === 3 ? "Revise sua página pública e acompanhe os próximos atendimentos por aqui." : "Cadastre serviços, profissionais e horários. O painel libera a publicação assim que os três passos estiverem completos."}</p><Link className="inline-light-link" href={completed === 3 ? "/dashboard/pagina-publica" : !checklist[0] ? "/dashboard/servicos" : !checklist[1] ? "/dashboard/profissionais" : "/dashboard/horarios"}>{completed === 3 ? "Gerenciar página pública" : "Continuar configuração"}</Link></div><div className="activation-progress"><strong>{completed} de 3</strong><div><i style={{ width: `${(completed / 3) * 100}%` }} /></div><small>Etapas concluídas</small></div></section>
      <section className="dashboard-grid"><article><CalendarDays /><span>Agendamentos hoje</span><strong>{todayAppointments.length}</strong><small><Link href="/dashboard/agenda">Abrir agenda diária</Link></small></article><article><Clock3 /><span>Próximo horário</span><strong>{next ? new Intl.DateTimeFormat("pt-BR", { timeZone: business.timezone, hour: "2-digit", minute: "2-digit" }).format(new Date(next.starts_at)) : "—"}</strong><small>{next ? `${dateTime(next.starts_at, business.timezone)} · ${(Array.isArray(next.clients) ? next.clients[0] : next.clients)?.name || "Cliente"}` : "Nenhum atendimento futuro"}</small></article><article><Users /><span>Clientes</span><strong>{clientsResult.count || 0}</strong><small><Link href="/dashboard/clientes">Ver lista e histórico</Link></small></article></section>
      {todayAppointments.length ? <section className="agenda-preview"><div className="section-heading"><div><h2>Hoje</h2><p>Os atendimentos do dia em ordem de horário.</p></div><Link href="/dashboard/agenda">Ver agenda completa</Link></div>{todayAppointments.slice(0, 5).map((appointment) => <article key={appointment.id}><time>{new Intl.DateTimeFormat("pt-BR", { timeZone: business.timezone, hour: "2-digit", minute: "2-digit" }).format(new Date(appointment.starts_at))}</time><div><strong>{(Array.isArray(appointment.clients) ? appointment.clients[0] : appointment.clients)?.name}</strong><span>{(Array.isArray(appointment.services) ? appointment.services[0] : appointment.services)?.name} · {(Array.isArray(appointment.professionals) ? appointment.professionals[0] : appointment.professionals)?.name}</span></div><span className={`status-chip ${appointment.status}`}>{appointment.status === "pending" ? "Pendente" : appointment.status === "confirmed" ? "Confirmado" : "Concluído"}</span></article>)}</section> : <section className="empty-agenda"><div className="empty-calendar"><CheckCircle2 /></div><div><h2>Nenhum atendimento para hoje.</h2><p>Quando um cliente reservar pela página pública, o compromisso aparecerá aqui automaticamente.</p></div></section>}
    </div>
  );
}
