import type { Metadata } from "next";
import Link from "next/link";
import { AtSign, CalendarDays, Clock3, MapPin, Scissors, Star } from "lucide-react";
import { notFound } from "next/navigation";
import { brand } from "@/lib/brand";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

type PublicBusiness = { name: string; slug: string; description: string | null; address: string | null; instagram: string | null };

const demoBusiness: PublicBusiness = {
  name: "Barbearia Modelo",
  slug: "barbearia-modelo",
  description: "Cortes precisos, conversa boa e respeito pelo seu tempo. Um espaço de bairro com cuidado em cada detalhe.",
  address: "Centro · São Paulo, SP",
  instagram: "@barbeariamodelo",
};

const services = [
  { name: "Corte clássico", description: "Tesoura, máquina e acabamento", price: "R$ 45", duration: "40 min" },
  { name: "Corte + barba", description: "Experiência completa", price: "R$ 70", duration: "60 min" },
  { name: "Barba", description: "Toalha quente e acabamento", price: "R$ 35", duration: "30 min" },
];

async function getBusiness(slug: string): Promise<PublicBusiness | null> {
  if (slug === demoBusiness.slug) return demoBusiness;
  if (!hasSupabaseEnv()) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("businesses").select("name, slug, description, address, instagram").eq("slug", slug).eq("is_published", true).maybeSingle();
  return data;
}

type BusinessPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: BusinessPageProps): Promise<Metadata> {
  const { slug } = await params;
  const business = await getBusiness(slug);
  if (!business) return { title: "Página não encontrada", robots: { index: false, follow: false } };
  return { title: business.name, description: business.description || `Agende seu horário na ${business.name}.` };
}

export default async function PublicBusinessPage({ params }: BusinessPageProps) {
  const { slug } = await params;
  const business = await getBusiness(slug);
  if (!business) notFound();
  const isDemo = slug === demoBusiness.slug;

  return (
    <main className="business-page">
      {isDemo && <div className="demo-ribbon">Página demonstrativa · dados ilustrativos <Link href="/cadastro">Criar a minha</Link></div>}
      <header className="business-nav"><Link href={`/${slug}`} className="business-logo"><span>BM</span><strong>{business.name}</strong></Link><nav><a href="#servicos">Serviços</a><a href="#equipe">Equipe</a><a href="#localizacao">Localização</a></nav><a className="business-book-small" href="#agendar">Agendar horário</a></header>
      <section className="business-hero">
        <div className="business-hero-copy"><span className="business-open"><i /> Agenda aberta esta semana</span><h1>Seu estilo começa com <em>hora marcada.</em></h1><p>{business.description}</p><div><a className="business-book" href="#agendar"><CalendarDays size={18} /> Escolher um horário</a><a className="business-instagram" href="#localizacao"><AtSign size={17} /> {business.instagram || "Instagram"}</a></div></div>
        <div className="barber-visual" aria-label="Composição visual da barbearia"><span className="visual-arch" /><span className="visual-chair"><i /><b /><em /></span><span className="visual-type">Desde<br />2026</span></div>
      </section>

      <section className="business-services" id="servicos"><div className="business-section-title"><span>Nossos serviços</span><h2>Escolha seu próximo cuidado.</h2></div><div className="service-list">{services.map((service) => <article key={service.name}><span className="service-scissor"><Scissors /></span><div><h3>{service.name}</h3><p>{service.description}</p></div><div><strong>{service.price}</strong><small><Clock3 size={13} /> {service.duration}</small></div></article>)}</div></section>

      <section className="business-team" id="equipe"><div><span>Nossa equipe</span><h2>Experiência nas mãos certas.</h2><p>Escolha com quem você prefere agendar ou deixe a agenda encontrar o primeiro horário disponível.</p></div><div className="team-cards"><article><div className="team-portrait portrait-one"><span>JM</span></div><h3>João Martins</h3><p>Barbeiro · Cortes clássicos</p></article><article><div className="team-portrait portrait-two"><span>CR</span></div><h3>Carlos Rocha</h3><p>Barbeiro · Barba e acabamento</p></article></div></section>

      <section className="booking-section" id="agendar"><div className="booking-copy"><span>Agende agora</span><h2>Escolha um serviço para começar.</h2><p>Esta demonstração mostra a experiência que o cliente terá. A confirmação real será ativada quando serviços, profissionais e horários forem configurados.</p></div><div className="booking-options">{services.map((service, index) => <label key={service.name}><input type="radio" name="demo-service" defaultChecked={index === 0} /><span><b>{service.name}</b><small>{service.duration}</small></span><strong>{service.price}</strong></label>)}<button type="button" disabled>Continuar para os horários</button><small>Fluxo de demonstração — nenhum agendamento será criado.</small></div></section>

      <section className="business-location" id="localizacao"><div className="location-card"><MapPin /><span>Onde estamos</span><h2>{business.address || "Endereço em configuração"}</h2><p>Consulte o endereço completo e as orientações antes de sair de casa.</p></div><div className="location-pattern"><span><Star /> Atendimento com hora marcada</span></div></section>
      <footer className="business-footer"><div><span className="business-footer-logo">BM</span><strong>{business.name}</strong></div><p>Página criada com <Link href="/">{brand.name}</Link></p></footer>
    </main>
  );
}
