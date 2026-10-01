/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { AtSign, CalendarDays, Clock3, MapPin, Phone } from "lucide-react";
import { brand } from "@/lib/brand";
import { businessMonogram } from "@/lib/public-page";
import type { PublicTemplateProps } from "./types";

export const money = (cents: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
const weekdays = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
export const hasSection = (config: PublicTemplateProps["config"], id: string) => config.sections.some((section) => section.id === id && section.visible);

export function BrandMark({ config, name }: Pick<PublicTemplateProps, "config"> & { name: string }) {
  const monogram = businessMonogram(name);
  return <span className="pp-brand-mark">{config.media.logoUrl ? <img src={config.media.logoUrl} width={80} height={80} alt={`Logo de ${name}`} /> : monogram}</span>;
}

export function CoverMedia({ config, name, className = "" }: Pick<PublicTemplateProps, "config"> & { name: string; className?: string }) {
  if (config.media.coverUrl && config.media.coverType === "video") return <video className={className} muted loop playsInline autoPlay preload="metadata" poster={config.media.coverPosterUrl || undefined} aria-label={`Vídeo de apresentação de ${name}`}><source src={config.media.coverUrl} /></video>;
  if (config.media.coverUrl) return <img className={className} src={config.media.coverUrl} width={1600} height={1200} alt={`Ambiente e trabalho de ${name}`} />;
  return <div className={`pp-cover-fallback ${className}`} aria-label="Composição abstrata sem fotografia"><span>{businessMonogram(name)}</span><i /><b /></div>;
}

export function PrimaryCta({ config, compact = false }: Pick<PublicTemplateProps, "config"> & { compact?: boolean }) {
  return <a className={`pp-primary-cta ${compact ? "is-compact" : ""}`} href="#agendar"><CalendarDays aria-hidden="true" />{config.content.primaryButton}</a>;
}

export function ServiceList({ services, title = "Serviços", variant = "cards" }: Pick<PublicTemplateProps, "services"> & { title?: string; variant?: string }) {
  if (!services.length) return null;
  return <div className={`pp-services pp-services-${variant}`}><header><span>Seleção</span><h2>{title}</h2></header><div className="pp-service-list">{services.map((service, index) => <article key={service.id}><span className="pp-index">{String(index + 1).padStart(2, "0")}</span><div><h3>{service.name}</h3>{service.description && <p>{service.description}</p>}</div><div className="pp-service-meta"><strong>{money(service.price_cents)}</strong><small><Clock3 aria-hidden="true" />{service.duration_minutes} min</small></div></article>)}</div></div>;
}

export function ProfessionalList({ professionals, services, config, variant = "portraits", featured = false }: Pick<PublicTemplateProps, "professionals" | "services" | "config"> & { variant?: string; featured?: boolean }) {
  if (!professionals.length) return null;
  const serviceNames = new Map(services.map((service) => [service.id, service.name]));
  return <div className={`pp-professionals pp-professionals-${variant}`}><header><span>{featured ? "Perfil em destaque" : "Equipe"}</span><h2>Quem recebe você</h2></header><div className="pp-professional-list">{professionals.map((professional, index) => { const photo = config.media.professionalPhotos[professional.id]; const skills = professional.professional_services.map((item) => serviceNames.get(item.service_id)).filter(Boolean); const credential = config.professionalCredentials[professional.id]; return <article className={featured && index === 0 ? "is-featured" : ""} key={professional.id}><div className="pp-professional-photo">{photo ? <img src={photo.url} width={720} height={900} alt={`Foto de ${professional.name}`} /> : <span>{businessMonogram(professional.name)}</span>}</div><div><h3>{professional.name}</h3>{credential && <strong className="pp-credential">{credential}</strong>}{professional.description && <p>{professional.description}</p>}{skills.length > 0 && <small>{skills.join(" · ")}</small>}{professional.contact && <a href={professional.contact.includes("@") ? `mailto:${professional.contact}` : `tel:${professional.contact.replace(/\D/g, "")}`}>{professional.contact}</a>}</div></article>; })}</div></div>;
}

export function Gallery({ config, variant = "grid" }: Pick<PublicTemplateProps, "config"> & { variant?: string }) {
  if (!config.media.gallery.length) return null;
  return <section className={`pp-gallery pp-gallery-${variant}`} id="galeria"><header><span>Galeria</span><h2>Um olhar sobre nosso trabalho</h2></header><div>{config.media.gallery.map((image, index) => <img src={image.url} width={index % 3 === 0 ? 1000 : 700} height={index % 3 === 0 ? 800 : 900} loading="lazy" alt={image.alt || `Imagem ${index + 1} do negócio`} key={image.path || image.url} />)}</div></section>;
}

export function Testimonials({ config }: Pick<PublicTemplateProps, "config">) {
  if (!config.testimonials.length) return null;
  return <section className="pp-testimonials"><header><span>Experiências reais</span><h2>O que nossos clientes contam</h2></header><div>{config.testimonials.map((item) => <figure key={item.id}><blockquote>“{item.text}”</blockquote><figcaption><strong>{item.name}</strong>{item.context && <span>{item.context}</span>}</figcaption></figure>)}</div></section>;
}

export function Faq({ config }: Pick<PublicTemplateProps, "config">) {
  if (!config.faq.length) return null;
  return <section className="pp-faq" id="duvidas"><header><span>Informação clara</span><h2>Dúvidas frequentes</h2></header><div>{config.faq.map((item) => <details key={item.id}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div></section>;
}

export function Differentials({ config, title = "O que torna a experiência especial" }: Pick<PublicTemplateProps, "config"> & { title?: string }) {
  if (!config.differentials.length) return null;
  return <section className="pp-differentials"><header><span>Diferenciais</span><h2>{title}</h2></header><div>{config.differentials.map((item, index) => <article key={item.id}><span>{String(index + 1).padStart(2, "0")}</span><h3>{item.title}</h3><p>{item.description}</p></article>)}</div></section>;
}

export function Process({ config }: Pick<PublicTemplateProps, "config">) {
  const steps = config.differentials.slice(0, 3);
  if (!steps.length) return null;
  return <section className="pp-process"><header><span>Como funciona</span><h2>Uma experiência simples, do início ao fim</h2></header><ol>{steps.map((item, index) => <li key={item.id}><span>0{index + 1}</span><div><h3>{item.title}</h3><p>{item.description}</p></div></li>)}</ol></section>;
}

export function BusinessHours({ businessHours }: Pick<PublicTemplateProps, "businessHours">) {
  if (!businessHours.length) return null;
  const grouped = weekdays.map((day, index) => ({ day, periods: businessHours.filter((hour) => hour.day_of_week === index) })).filter((item) => item.periods.length);
  return <section className="pp-hours"><header><span>Agenda</span><h2>Horários de funcionamento</h2></header><dl>{grouped.map(({ day, periods }) => <div key={day}><dt>{day}</dt><dd>{periods.map((period) => `${period.start_time.slice(0, 5)}–${period.end_time.slice(0, 5)}`).join(" · ")}</dd></div>)}</dl></section>;
}

export function Location({ business, config }: Pick<PublicTemplateProps, "business" | "config">) {
  const address = config.contact.address || business.address || ""; const phone = config.contact.whatsapp || business.phone || ""; const instagram = config.contact.instagram.replace(/^@/, "");
  if (!address && !phone && !instagram) return null;
  return <section className="pp-location" id="localizacao"><header><MapPin aria-hidden="true" /><span>Contato e localização</span><h2>Vamos conversar</h2></header>{address && <p>{address}</p>}<div>{phone && <a href={`https://wa.me/${phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"><Phone aria-hidden="true" />WhatsApp</a>}{instagram && <a href={`https://instagram.com/${instagram}`} target="_blank" rel="noreferrer"><AtSign aria-hidden="true" />@{instagram}</a>}</div></section>;
}

export function Instagram({ config }: Pick<PublicTemplateProps, "config">) {
  const instagram = config.contact.instagram.replace(/^@/, ""); if (!instagram) return null;
  return <section className="pp-instagram"><span>Siga os bastidores</span><a href={`https://instagram.com/${instagram}`} target="_blank" rel="noreferrer">@{instagram}<AtSign aria-hidden="true" /></a></section>;
}

export function BookingSection({ config, booking, tone = "light" }: Pick<PublicTemplateProps, "config" | "booking"> & { tone?: string }) {
  return <section className={`pp-booking pp-booking-${tone}`} id="agendar"><div><span>Seu próximo horário</span><h2>Agende sem precisar ligar</h2><p>{config.content.bookingNotice}</p></div>{booking}</section>;
}

export function Footer({ business, config }: Pick<PublicTemplateProps, "business" | "config">) {
  const name = config.content.businessName || business.name;
  return <footer className="pp-footer"><div><BrandMark config={config} name={name} /><strong>{name}</strong></div><p>{config.content.footerText}</p><small>Página criada com <Link href="/">{brand.name}</Link></small></footer>;
}

export function MobileBookingCta({ config }: Pick<PublicTemplateProps, "config">) { return <a className="pp-mobile-cta" href="#agendar"><CalendarDays aria-hidden="true" />{config.content.primaryButton}</a>; }
