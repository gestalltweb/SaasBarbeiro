import type { Metadata } from "next";
import Link from "next/link";
import { CalendarOff, Clock3, Trash2, UserRound } from "lucide-react";
import { StatusMessage } from "@/components/status-message";
import { dateTime, requireBusiness } from "@/lib/dashboard";
import { createUnavailability, deleteUnavailability, saveBusinessHours, saveProfessionalHours } from "../actions";

export const metadata: Metadata = { title: "Horários" };

const week = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
type Hour = { day_of_week: number; start_time: string; end_time: string };

function dayValue(hours: Hour[], day: number) {
  const rows = hours.filter((row) => row.day_of_week === day).sort((a, b) => a.start_time.localeCompare(b.start_time));
  return {
    enabled: rows.length > 0,
    start: rows[0]?.start_time.slice(0, 5) || "09:00",
    end: rows.at(-1)?.end_time.slice(0, 5) || "18:00",
    breakStart: rows.length > 1 ? rows[0].end_time.slice(0, 5) : "",
    breakEnd: rows.length > 1 ? rows[1].start_time.slice(0, 5) : "",
  };
}

function WeekEditor({ hours }: { hours: Hour[] }) {
  return <div className="week-editor">{week.map((label, day) => {
    const value = dayValue(hours, day);
    return <div className="day-row" key={label}><label className="day-toggle"><input type="checkbox" name={`day-${day}-enabled`} defaultChecked={value.enabled} /><span><strong>{label}</strong><small>{value.enabled ? "Atendimento" : "Folga"}</small></span></label><div className="time-fields"><label><span>Início</span><input type="time" name={`day-${day}-start`} defaultValue={value.start} /></label><label><span>Fim</span><input type="time" name={`day-${day}-end`} defaultValue={value.end} /></label><label><span>Intervalo</span><input type="time" name={`day-${day}-break-start`} defaultValue={value.breakStart} aria-label={`Início do intervalo de ${label}`} /></label><label><span>Retorno</span><input type="time" name={`day-${day}-break-end`} defaultValue={value.breakEnd} aria-label={`Fim do intervalo de ${label}`} /></label></div></div>;
  })}</div>;
}

export default async function HoursPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { supabase, business } = await requireBusiness();
  const params = await searchParams;
  const [businessHoursResult, professionalsResult, professionalHoursResult, unavailabilityResult] = await Promise.all([
    supabase.from("business_hours").select("day_of_week, start_time, end_time").eq("business_id", business.id).order("day_of_week").order("start_time"),
    supabase.from("professionals").select("id, name, is_active").eq("business_id", business.id).order("name"),
    supabase.from("professional_hours").select("professional_id, day_of_week, start_time, end_time").eq("business_id", business.id).order("day_of_week").order("start_time"),
    supabase.from("unavailabilities").select("id, professional_id, starts_at, ends_at, reason, professionals(name)").eq("business_id", business.id).gte("ends_at", new Date().toISOString()).order("starts_at").limit(50),
  ]);
  if (businessHoursResult.error || professionalsResult.error || professionalHoursResult.error || unavailabilityResult.error) throw new Error("Não foi possível carregar os horários.");
  const professionals = professionalsResult.data || [];
  const professionalHours = professionalHoursResult.data || [];

  return <div className="dashboard-body operational-page wide-page">
    <header className="page-title"><div><h1>Horários</h1><p>O cliente só verá horários dentro do expediente, da jornada do profissional e fora dos bloqueios.</p></div></header>
    <StatusMessage success={typeof params.sucesso === "string" ? params.sucesso : null} error={typeof params.erro === "string" ? params.erro : null} />
    <section className="schedule-editor-section"><div className="section-heading"><div><h2>Expediente do negócio</h2><p>Use o intervalo para almoço ou pausas fixas. Desmarque um dia para mantê-lo fechado.</p></div><Clock3 /></div><form action={saveBusinessHours}><WeekEditor hours={businessHoursResult.data || []} /><button className="button" type="submit">Salvar expediente</button></form></section>

    <section className="schedule-editor-section"><div className="section-heading"><div><h2>Jornada dos profissionais</h2><p>Cada profissional precisa de horários próprios para aparecer na agenda pública.</p></div><UserRound /></div>{!professionals.length ? <div className="empty-state compact"><UserRound /><h3>Nenhum profissional cadastrado</h3><p>Cadastre sua equipe antes de configurar as jornadas.</p><Link href="/dashboard/profissionais">Ir para profissionais</Link></div> : <div className="professional-schedules">{professionals.map((professional) => <details className="schedule-details" key={professional.id}><summary><span className="avatar-initials">{professional.name.split(" ").map((part: string) => part[0]).join("").slice(0, 2)}</span><span><strong>{professional.name}</strong><small>{professional.is_active ? "Profissional ativo" : "Profissional pausado"}</small></span><span>Configurar jornada</span></summary><form action={saveProfessionalHours}><input type="hidden" name="professionalId" value={professional.id} /><WeekEditor hours={professionalHours.filter((hour) => hour.professional_id === professional.id)} /><button className="button button-small" type="submit">Salvar jornada de {professional.name}</button></form></details>)}</div>}</section>

    <section className="split-workspace blockers-section"><form className="editor-panel" action={createUnavailability}><div className="panel-title"><CalendarOff /><div><h2>Nova indisponibilidade</h2><p>Bloqueie folgas, compromissos ou períodos excepcionais.</p></div></div><div className="field"><label htmlFor="block-professional">Profissional</label><select id="block-professional" name="professionalId" required><option value="">Selecione</option>{professionals.map((professional) => <option value={professional.id} key={professional.id}>{professional.name}</option>)}</select></div><div className="form-grid two"><div className="field"><label htmlFor="block-start">Início</label><input id="block-start" type="datetime-local" name="startsLocal" required /></div><div className="field"><label htmlFor="block-end">Término</label><input id="block-end" type="datetime-local" name="endsLocal" required /></div></div><div className="field"><label htmlFor="block-reason">Motivo</label><input id="block-reason" name="reason" maxLength={240} placeholder="Ex.: Férias ou compromisso" /></div><button className="button" type="submit">Adicionar bloqueio</button></form><section className="records-panel"><div className="panel-title"><CalendarOff /><div><h2>Próximos bloqueios</h2><p>Períodos que não geram horários disponíveis.</p></div></div>{!unavailabilityResult.data?.length ? <div className="empty-state compact"><CalendarOff /><h3>Nenhum bloqueio futuro</h3><p>A agenda seguirá as jornadas semanais configuradas.</p></div> : <div className="record-list">{unavailabilityResult.data.map((item) => <article className="simple-record" key={item.id}><div><strong>{(Array.isArray(item.professionals) ? item.professionals[0] : item.professionals)?.name}</strong><span>{dateTime(item.starts_at, business.timezone)} até {dateTime(item.ends_at, business.timezone)}</span><small>{item.reason || "Indisponibilidade"}</small></div><form action={deleteUnavailability}><input type="hidden" name="id" value={item.id} /><button className="icon-button danger" type="submit" aria-label="Remover indisponibilidade"><Trash2 /></button></form></article>)}</div>}</section></section>
  </div>;
}
