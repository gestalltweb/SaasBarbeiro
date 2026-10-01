import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Clock3 } from "lucide-react";
import { notFound } from "next/navigation";
import { PublicPageView, type PublicPageBusiness, type PublicPageBusinessHour, type PublicPageProfessional, type PublicPageService } from "@/components/public-page-view";
import { money } from "@/lib/dashboard";
import { buildPublicPageSeo, normalizePageConfig } from "@/lib/public-page";
import type { BusinessSegment } from "@/lib/service-suggestions";
import { publicBusinessUrl } from "@/lib/site-url";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { createBooking } from "./actions";

type PublicBusiness = PublicPageBusiness & { id: string; segment: BusinessSegment; is_published: boolean };

async function getPublicData(slug: string) {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createClient();
  const { data: business } = await supabase.from("businesses").select("id, name, slug, segment, description, address, phone, instagram, timezone, is_published").eq("slug", slug).eq("is_published", true).maybeSingle();
  if (!business) return null;
  const [{ data: services }, { data: professionals }, { data: businessHours }, configResult] = await Promise.all([
    supabase.from("services").select("id, name, description, price_cents, duration_minutes, is_active").eq("business_id", business.id).eq("is_active", true).order("name"),
    supabase.from("professionals").select("id, name, description, contact, is_active, professional_services(service_id)").eq("business_id", business.id).eq("is_active", true).order("name"),
    supabase.from("business_hours").select("day_of_week, start_time, end_time").eq("business_id", business.id).order("day_of_week").order("start_time"),
    supabase.rpc("get_public_page_config", { p_slug: slug }),
  ]);
  const typedBusiness = business as PublicBusiness;
  const config = normalizePageConfig(configResult.data, typedBusiness);
  return { supabase, business: typedBusiness, config, services: (services || []) as PublicPageService[], professionals: (professionals || []) as PublicPageProfessional[], businessHours: (businessHours || []) as PublicPageBusinessHour[] };
}

type BusinessPageProps = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: BusinessPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPublicData(slug);
  if (!data) return { title: "Página não encontrada", robots: { index: false, follow: false } };
  const seo = buildPublicPageSeo(data.config, data.business.name, publicBusinessUrl(slug));
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: seo.canonicalUrl },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: seo.canonicalUrl,
      type: "website",
      images: seo.imageUrl ? [{ url: seo.imageUrl }] : [],
    },
  };
}

export default async function PublicBusinessPage({ params, searchParams }: BusinessPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const data = await getPublicData(slug);
  if (!data) notFound();
  const { supabase, business, config, services, professionals, businessHours } = data;
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

  const booking = <div className="booking-card">
    {confirmation ? <div className="booking-confirmation" role="status"><CheckCircle2 /><h3>Agendamento recebido</h3><p>Seu horário para <strong>{confirmation.service_name}</strong> com <strong>{confirmation.professional_name}</strong> foi reservado para <strong>{new Intl.DateTimeFormat("pt-BR", { timeZone: business.timezone, dateStyle: "full", timeStyle: "short" }).format(new Date(confirmation.starts_at))}</strong>.</p><span>Status: {confirmation.status === "confirmed" ? "confirmado" : "aguardando confirmação do negócio"}</span><Link href={`/${slug}#agendar`}>Fazer outro agendamento</Link></div> : <>
      {typeof query.erro === "string" && <p className="form-message" role="alert">{query.erro}</p>}
      <form className="booking-step" method="get" action={`/${slug}`}>
        <div className="field"><label htmlFor="public-service">1. Serviço</label><select id="public-service" name="servico" defaultValue={selectedServiceId} required><option value="">Selecione um serviço</option>{services.map((service) => <option value={service.id} key={service.id}>{service.name} · {money(service.price_cents)}</option>)}</select></div>
        {selectedService && <><div className="field"><label htmlFor="public-professional">2. Profissional</label><select id="public-professional" name="profissional" defaultValue={selectedProfessionalId} required><option value="">Selecione um profissional</option>{eligibleProfessionals.map((professional) => <option value={professional.id} key={professional.id}>{professional.name}</option>)}</select></div><div className="field"><label htmlFor="public-date">3. Data</label><input id="public-date" name="data" type="date" min={today} max={latestDate} defaultValue={selectedDate} required /></div></>}
        <button className="public-primary-cta public-submit" type="submit">{selectedService ? "Ver horários disponíveis" : "Continuar"}</button>
      </form>
      {selectedService && selectedProfessional && selectedDate && <div className="slot-results"><h3>4. Escolha o horário</h3>{slots.length ? <form action={createBooking}><input type="hidden" name="slug" value={slug} /><input type="hidden" name="serviceId" value={selectedService.id} /><input type="hidden" name="professionalId" value={selectedProfessional.id} /><fieldset className="slot-grid"><legend className="sr-only">Horários disponíveis</legend>{slots.map((slot) => <label key={slot.slot_start}><input type="radio" name="startsAt" value={slot.slot_start} required /><span>{new Intl.DateTimeFormat("pt-BR", { timeZone: business.timezone, hour: "2-digit", minute: "2-digit" }).format(new Date(slot.slot_start))}</span></label>)}</fieldset><div className="client-fields"><div className="field"><label htmlFor="client-name">Seu nome</label><input id="client-name" name="clientName" maxLength={100} autoComplete="name" required /></div><div className="field"><label htmlFor="client-phone">Telefone</label><input id="client-phone" name="clientPhone" type="tel" maxLength={24} autoComplete="tel" required /></div><div className="field"><label htmlFor="client-email">E-mail <small>(opcional)</small></label><input id="client-email" name="clientEmail" type="email" maxLength={254} autoComplete="email" /></div></div><button className="public-primary-cta public-submit" type="submit">Confirmar agendamento</button><small className="privacy-note">Seus dados serão usados somente para organizar este atendimento.</small></form> : <div className="no-slots"><Clock3 /><strong>Nenhum horário disponível nesta data</strong><p>Escolha outro dia para consultar novas opções.</p></div>}</div>}
    </>}
  </div>;

  return <PublicPageView business={business} services={services} professionals={professionals} businessHours={businessHours} config={config} booking={booking} />;
}
