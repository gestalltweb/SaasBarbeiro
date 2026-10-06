import { AnimatedNumber } from "@/components/motion";
import { DashboardTutorial, type TutorialStep } from "@/components/dashboard-tutorial";
import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, CheckCircle2, Clock3, Users } from "lucide-react";
import { dateKey, dateTime, requireBusiness } from "@/lib/dashboard";

export const metadata: Metadata = { title: "Painel" };

export default async function DashboardPage() {
  const { supabase, user, business } = await requireBusiness();
  const firstName = String(user.user_metadata.full_name || "").split(" ")[0] || "por aqui";
  const [servicesResult, professionalsResult, hoursResult, professionalHoursResult, clientsResult, appointmentsResult, publicPageResult, tutorialResult] = await Promise.all([
    supabase.from("services").select("id", { count: "exact", head: true }).eq("business_id", business.id).eq("is_active", true),
    supabase.from("professionals").select("id", { count: "exact", head: true }).eq("business_id", business.id).eq("is_active", true),
    supabase.from("business_hours").select("id", { count: "exact", head: true }).eq("business_id", business.id),
    supabase.from("professional_hours").select("id", { count: "exact", head: true }).eq("business_id", business.id),
    supabase.from("clients").select("id", { count: "exact", head: true }).eq("business_id", business.id),
    supabase.from("appointments").select("id, starts_at, status, clients(name), services(name), professionals(name)").eq("business_id", business.id).neq("status", "cancelled").order("starts_at").limit(100),
    supabase.from("business_public_pages").select("draft_config, published_config").eq("business_id", business.id).maybeSingle(),
    supabase.from("business_tutorial_preferences").select("acknowledged_steps, is_dismissed, is_completed").eq("business_id", business.id).eq("user_id", user.id).maybeSingle(),
  ]);
  const today = dateKey(new Date(), business.timezone);
  const appointments = appointmentsResult.data || [];
  const todayAppointments = appointments.filter((item) => dateKey(item.starts_at, business.timezone) === today);
  const next = appointments.find((item) => new Date(item.starts_at) > new Date());
  const draft = publicPageResult.data?.draft_config as { media?: { logoUrl?: string; coverUrl?: string }; content?: { headline?: string } } | null;
  const tutorial = tutorialResult.data;
  const tutorialSteps: TutorialStep[] = [
    { id: "business", title: "Configurações do negócio", description: "Revise nome, contato, endereço e o link do seu negócio.", href: "/dashboard/configuracoes", complete: Boolean(business.name && business.slug && business.phone) },
    { id: "services", title: "Serviços", description: "Defina o que seus clientes podem reservar.", href: "/dashboard/servicos", complete: Boolean(servicesResult.count) },
    { id: "professionals", title: "Profissionais", description: "Associe cada profissional aos serviços que realiza.", href: "/dashboard/profissionais", complete: Boolean(professionalsResult.count) },
    { id: "business-hours", title: "Expediente", description: "Informe os horários de funcionamento do negócio.", href: "/dashboard/horarios", complete: Boolean(hoursResult.count) },
    { id: "professional-hours", title: "Jornadas da equipe", description: "Configure quando cada profissional atende.", href: "/dashboard/horarios", complete: Boolean(professionalHoursResult.count) },
    { id: "unavailability", title: "Indisponibilidades", description: "Use bloqueios para proteger horários específicos.", href: "/dashboard/horarios" },
    { id: "customize", title: "Personalização da página", description: "Escolha um modelo e ajuste a identidade da sua página.", href: "/dashboard/pagina-publica", complete: Boolean(draft?.content?.headline || draft?.media?.logoUrl || draft?.media?.coverUrl) },
    { id: "preview", title: "Prévia do rascunho", description: "Confira as alterações antes de publicar.", href: "/dashboard/pagina-publica/preview" },
    { id: "publish", title: "Publicação", description: "Publique quando serviços, equipe e horários estiverem prontos.", href: "/dashboard/pagina-publica", complete: business.is_published },
    { id: "share", title: "Compartilhamento do link", description: "Copie o endereço exclusivo para divulgar onde preferir.", href: "/dashboard/pagina-publica", complete: business.is_published },
    { id: "agenda-clients", title: "Agenda e clientes", description: "Acompanhe reservas e o histórico criado automaticamente.", href: "/dashboard/agenda", complete: Boolean(clientsResult.count) },
  ];

  return (
    <div className="dashboard-body"><div className="welcome-row"><div><p>Olá, {firstName}</p><h1>Sua agenda, clara e pronta para o dia.</h1></div><span className={business.is_published ? "status-live" : "status-draft"}>{business.is_published ? "Página publicada" : "Página em rascunho"}</span></div>
      {!tutorial?.is_dismissed && !tutorial?.is_completed && <DashboardTutorial steps={tutorialSteps} initialAcknowledged={tutorial?.acknowledged_steps || []} />}
      <section className="dashboard-grid"><Link className="dashboard-stat-card" href="/dashboard/agenda" aria-label="Abrir agenda diária"><CalendarDays /><span>Agendamentos hoje</span><strong><AnimatedNumber value={todayAppointments.length} /></strong><small>Abrir agenda diária</small></Link><Link className="dashboard-stat-card" href={next ? `/dashboard/agenda?date=${dateKey(next.starts_at, business.timezone)}` : "/dashboard/agenda"} aria-label="Abrir agenda do próximo horário"><Clock3 /><span>Próximo horário</span><strong>{next ? new Intl.DateTimeFormat("pt-BR", { timeZone: business.timezone, hour: "2-digit", minute: "2-digit" }).format(new Date(next.starts_at)) : "—"}</strong><small>{next ? `${dateTime(next.starts_at, business.timezone)} · ${(Array.isArray(next.clients) ? next.clients[0] : next.clients)?.name || "Cliente"}` : "Nenhum atendimento futuro"}</small></Link><Link className="dashboard-stat-card" href="/dashboard/clientes" aria-label="Abrir lista de clientes"><Users /><span>Clientes</span><strong><AnimatedNumber value={clientsResult.count || 0} /></strong><small>Ver lista e histórico</small></Link></section>
      {todayAppointments.length ? <section className="agenda-preview"><div className="section-heading"><div><h2>Hoje</h2><p>Os atendimentos do dia em ordem de horário.</p></div><Link href="/dashboard/agenda">Ver agenda completa</Link></div>{todayAppointments.slice(0, 5).map((appointment) => <article key={appointment.id}><time>{new Intl.DateTimeFormat("pt-BR", { timeZone: business.timezone, hour: "2-digit", minute: "2-digit" }).format(new Date(appointment.starts_at))}</time><div><strong>{(Array.isArray(appointment.clients) ? appointment.clients[0] : appointment.clients)?.name}</strong><span>{(Array.isArray(appointment.services) ? appointment.services[0] : appointment.services)?.name} · {(Array.isArray(appointment.professionals) ? appointment.professionals[0] : appointment.professionals)?.name}</span></div><span className={`status-chip ${appointment.status}`}>{appointment.status === "pending" ? "Pendente" : appointment.status === "confirmed" ? "Confirmado" : "Concluído"}</span></article>)}</section> : <section className="empty-agenda"><div className="empty-calendar"><CheckCircle2 /></div><div><h2>Nenhum atendimento para hoje.</h2><p>Quando um cliente reservar pela página pública, o compromisso aparecerá aqui automaticamente.</p></div></section>}
    </div>
  );
}
