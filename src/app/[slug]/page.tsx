import type { Metadata } from "next";
import Link from "next/link";
import { AtSign, CalendarDays, CheckCircle2, Clock3, MapPin, Phone, Scissors, Star } from "lucide-react";
import { notFound } from "next/navigation";
import { brand } from "@/lib/brand";
import { money } from "@/lib/dashboard";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { createBooking } from "./actions";

type PublicBusiness = { id: string; name: string; slug: string; description: string | null; address: string | null; phone: string | null; instagram: string | null; timezone: string };
type PublicService = { id: string; name: string; description: string; price_cents: number; duration_minutes: number };
type PublicProfessional = { id: string; name: string; description: string; contact: string; professional_services: Array<{ service_id: string }> };

async function getPublicData(slug: string) {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createClient();
  const { data: business } = await supabase.from("businesses").select("id, name, slug, description, address, phone, instagram, timezone").eq("slug", slug).eq("is_published", true).maybeSingle();
  if (!business) return null;
  const [{ data: services }, { data: professionals }] = await Promise.all([
    supabase.from("services").select("id, name, description, price_cents, duration_minutes").eq("business_id", business.id).eq("is_active", true).order("name"),
    supabase.from("professionals").select("id, name, description, contact, professional_services(service_id)").eq("business_id", business.id).eq("is_active", true).order("name"),
  ]);
  return { supabase, business: business as PublicBusiness, services: (services || []) as PublicService[], professionals: (professionals || []) as PublicProfessional[] };
}

type BusinessPageProps = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: BusinessPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPublicData(slug);
  if (!data) return { title: "Página não encontrada", robots: { index: false, follow: false } };
  return { title: data.business.name, description: data.business.description || `Agende seu horário na ${data.business.name}.` };
}

export default async function PublicBusinessPage({ params, searchParams }: BusinessPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const data = await getPublicData(slug);
  if (!data) notFound();
  const { supabase, business, services, professionals } = data;
  const selectedServiceId = typeof query.servico === "string" ? query.servico : "";
  const selectedProfessionalId = typeof query.profissional === "string" ? query.profissional : "";
  const selectedDate = typeof query.data === "string" ? query.data : "";
  const selectedService = services.find((service) => service.id === selectedServiceId);
  const eligibleProfessionals = selectedService ? professionals.filter((professional) => professional.professional_services.some((link) => link.service_id === selectedService.id)) : [];
  const selectedProfessional = eligibleProfessionals.find((professional) => professional.id === selectedProfessionalId);
  let slots: Array<{ slot_start: string }> = [];
  if (selectedService && selectedProfessional && /^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
    const result = await supabase.rpc("get_available_slots", { p_slug: slug, p_service_id: selectedService.id, p_professional_id: selectedProfessional.id, p_date: selectedDate });
    slots = result.data || [];
  }
  const confirmationToken = typeof query.confirmacao === "string" ? query.confirmacao : "";
  const { data: confirmationRows } = confirmationToken ? await supabase.rpc("get_booking_confirmation", { p_token: confirmationToken }) : { data: null };
  const confirmation = confirmationRows?.[0];
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: business.timezone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const maxDate = new Date(); maxDate.setDate(maxDate.getDate() + 90);
  const latestDate = new Intl.DateTimeFormat("en-CA", { timeZone: business.timezone, year: "numeric", month: "2-digit", day: "2-digit" }).format(maxDate);
  const initials = business.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const instagram = business.instagram?.replace(/^@/, "");

  return <main className="business-page">
    <header className="business-nav"><Link href={`/${slug}`} className="business-logo"><span>{initials}</span><strong>{business.name}</strong></Link><nav><a href="#servicos">Serviços</a><a href="#equipe">Equipe</a><a href="#localizacao">Localização</a></nav><a className="business-book-small" href="#agendar">Agendar horário</a></header>
    <section className="business-hero"><div className="business-hero-copy"><span className="business-open"><i /> Agendamento online</span><h1>Seu cuidado começa com <em>hora marcada.</em></h1><p>{business.description || `Escolha um serviço e reserve seu horário na ${business.name}.`}</p><div><a className="business-book" href="#agendar"><CalendarDays /> Escolher um horário</a>{instagram && <a className="business-instagram" href={`https://instagram.com/${instagram}`} target="_blank" rel="noreferrer"><AtSign /> @{instagram}</a>}</div></div><div className="barber-visual" aria-hidden="true"><span className="visual-arch" /><span className="visual-chair"><i /><b /><em /></span><span className="visual-type">Agenda<br />online</span></div></section>

    <section className="business-services" id="servicos"><div className="business-section-title"><span>Serviços</span><h2>Escolha seu próximo cuidado.</h2></div>{services.length ? <div className="service-list">{services.map((service) => <article key={service.id}><span className="service-scissor"><Scissors /></span><div><h3>{service.name}</h3><p>{service.description || "Atendimento com hora marcada."}</p></div><div><strong>{money(service.price_cents)}</strong><small><Clock3 /> {service.duration_minutes} min</small></div></article>)}</div> : <div className="public-empty">Nenhum serviço disponível para agendamento.</div>}</section>

    <section className="business-team" id="equipe"><div><span>Equipe</span><h2>Experiência nas mãos certas.</h2><p>Escolha quem realizará seu atendimento e consulte os horários realmente disponíveis.</p></div>{professionals.length ? <div className="team-cards">{professionals.map((professional, index) => <article key={professional.id}><div className={`team-portrait ${index % 2 ? "portrait-two" : "portrait-one"}`}><span>{professional.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</span></div><h3>{professional.name}</h3><p>{professional.description || professional.contact || "Profissional da equipe"}</p></article>)}</div> : <div className="public-empty dark">Nenhum profissional disponível.</div>}</section>

    <section className="booking-section" id="agendar"><div className="booking-copy"><span>Agende agora</span><h2>Encontre o melhor horário.</h2><p>Escolha o serviço, o profissional e a data. A disponibilidade é atualizada com a agenda real do negócio.</p></div><div className="booking-card">
      {confirmation ? <div className="booking-confirmation" role="status"><CheckCircle2 /><h3>Agendamento recebido</h3><p>Seu horário para <strong>{confirmation.service_name}</strong> com <strong>{confirmation.professional_name}</strong> foi reservado para <strong>{new Intl.DateTimeFormat("pt-BR", { timeZone: business.timezone, dateStyle: "full", timeStyle: "short" }).format(new Date(confirmation.starts_at))}</strong>.</p><span>Status: {confirmation.status === "confirmed" ? "confirmado" : "aguardando confirmação do negócio"}</span><Link href={`/${slug}#agendar`}>Fazer outro agendamento</Link></div> : <>
        {typeof query.erro === "string" && <p className="form-message" role="alert">{query.erro}</p>}
        <form className="booking-step" method="get" action={`/${slug}`}><div className="field"><label htmlFor="public-service">1. Serviço</label><select id="public-service" name="servico" defaultValue={selectedServiceId} required><option value="">Selecione um serviço</option>{services.map((service) => <option value={service.id} key={service.id}>{service.name} · {money(service.price_cents)}</option>)}</select></div>{selectedService && <><div className="field"><label htmlFor="public-professional">2. Profissional</label><select id="public-professional" name="profissional" defaultValue={selectedProfessionalId} required><option value="">Selecione um profissional</option>{eligibleProfessionals.map((professional) => <option value={professional.id} key={professional.id}>{professional.name}</option>)}</select></div><div className="field"><label htmlFor="public-date">3. Data</label><input id="public-date" name="data" type="date" min={today} max={latestDate} defaultValue={selectedDate} required /></div></>}<button className="business-book public-submit" type="submit">{selectedService ? "Ver horários disponíveis" : "Continuar"}</button></form>
        {selectedService && selectedProfessional && selectedDate && <div className="slot-results"><h3>4. Escolha o horário</h3>{slots.length ? <form action={createBooking}><input type="hidden" name="slug" value={slug} /><input type="hidden" name="serviceId" value={selectedService.id} /><input type="hidden" name="professionalId" value={selectedProfessional.id} /><fieldset className="slot-grid"><legend className="sr-only">Horários disponíveis</legend>{slots.map((slot) => <label key={slot.slot_start}><input type="radio" name="startsAt" value={slot.slot_start} required /><span>{new Intl.DateTimeFormat("pt-BR", { timeZone: business.timezone, hour: "2-digit", minute: "2-digit" }).format(new Date(slot.slot_start))}</span></label>)}</fieldset><div className="client-fields"><div className="field"><label htmlFor="client-name">Seu nome</label><input id="client-name" name="clientName" maxLength={100} autoComplete="name" required /></div><div className="field"><label htmlFor="client-phone">Telefone</label><input id="client-phone" name="clientPhone" type="tel" maxLength={24} autoComplete="tel" required /></div><div className="field"><label htmlFor="client-email">E-mail <small>(opcional)</small></label><input id="client-email" name="clientEmail" type="email" maxLength={254} autoComplete="email" /></div></div><button className="business-book public-submit" type="submit">Confirmar agendamento</button><small className="privacy-note">Seus dados serão usados somente para organizar este atendimento.</small></form> : <div className="no-slots"><Clock3 /><strong>Nenhum horário disponível nesta data</strong><p>Escolha outro dia para consultar novas opções.</p></div>}</div>}
      </>}
    </div></section>

    <section className="business-location" id="localizacao"><div className="location-card"><MapPin /><span>Onde estamos</span><h2>{business.address || "Consulte o endereço com o estabelecimento"}</h2>{business.phone && <p><Phone /> {business.phone}</p>}</div><div className="location-pattern"><span><Star /> Atendimento com hora marcada</span></div></section>
    <footer className="business-footer"><div><span className="business-footer-logo">{initials}</span><strong>{business.name}</strong></div><p>Página criada com <Link href="/">{brand.name}</Link></p></footer>
  </main>;
}
