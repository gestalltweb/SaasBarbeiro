/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { AtSign, CalendarDays, Clock3, MapPin, Phone } from "lucide-react";
import { brand } from "@/lib/brand";
import { businessMonogram, orderForPublic, templatePalettes, type PublicPageConfig } from "@/lib/public-page";

function money(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

export type PublicPageBusiness = { name: string; slug: string; description: string | null; address: string | null; phone: string | null; instagram: string | null; timezone: string };
export type PublicPageService = { id: string; name: string; description: string; price_cents: number; duration_minutes: number };
export type PublicPageProfessional = { id: string; name: string; description: string; contact: string; professional_services: Array<{ service_id: string }> };

type Props = {
  business: PublicPageBusiness;
  services: PublicPageService[];
  professionals: PublicPageProfessional[];
  config: PublicPageConfig;
  booking: React.ReactNode;
  preview?: boolean;
};

function Cover({ config, monogram }: { config: PublicPageConfig; monogram: string }) {
  if (config.media.coverUrl) return <img className="public-cover-image" src={config.media.coverUrl} alt="Imagem de capa do negócio" />;
  return <div className="public-cover-fallback" aria-label="Composição visual do modelo"><span>{monogram}</span><i /><b /></div>;
}

function Logo({ config, name, monogram }: { config: PublicPageConfig; name: string; monogram: string }) {
  return <span className="public-brand-mark">{config.media.logoUrl ? <img src={config.media.logoUrl} alt={`Logo de ${name}`} /> : monogram}</span>;
}

export function PublicPageView({ business, services, professionals, config, booking, preview = false }: Props) {
  const predefined = templatePalettes[config.template]?.[config.palette];
  const palette = config.mode === "manual" ? {
    primary: config.colors.primary, secondary: config.colors.secondary, button: config.colors.button,
    background: config.theme === "dark" ? "#171918" : "#F4F0E8", ink: config.theme === "dark" ? "#F8F4EA" : "#182A2D",
  } : predefined;
  const displayName = config.content.businessName || business.name;
  const monogram = businessMonogram(displayName);
  const publicServices = orderForPublic(services, config.serviceOrder);
  const publicProfessionals = orderForPublic(professionals, config.professionalOrder);
  const visible = new Map(config.sections.map((section) => [section.id, section.visible]));
  const instagram = config.contact.instagram.replace(/^@/, "");
  const phone = config.contact.whatsapp || business.phone || "";
  const address = config.contact.address || business.address || "";
  const style = {
    "--page-primary": palette.primary,
    "--page-secondary": palette.secondary,
    "--page-button": palette.button,
    "--page-bg": palette.background,
    "--page-ink": palette.ink,
  } as React.CSSProperties;

  const sections: Record<string, React.ReactNode> = {
    presentation: <section className="public-template-hero" key="presentation">
      <div className="public-template-hero-copy">
        {config.template === "editorial" && <span className="editorial-caption">Agenda · cuidado · presença</span>}
        {config.template === "urban" && <span className="urban-label">Agendamento online</span>}
        <h1>{config.content.heroTitle || displayName}</h1>
        <p>{config.content.heroSubtitle}</p>
        <div className="public-template-actions"><a className="public-primary-cta" href="#agendar"><CalendarDays /> {config.content.primaryButton}</a>{instagram && <a href={`https://instagram.com/${instagram}`} target="_blank" rel="noreferrer"><AtSign /> @{instagram}</a>}</div>
      </div>
      <div className="public-template-cover"><Cover config={config} monogram={monogram} /></div>
    </section>,
    services: <section className="public-template-services" id="servicos" key="services">
      <header><h2>Serviços</h2><p>{config.content.introduction}</p></header>
      {publicServices.length ? <div className="public-service-grid">{publicServices.map((service, index) => <article key={service.id}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{service.name}</h3><p>{service.description || "Atendimento com hora marcada."}</p></div><div><strong>{money(service.price_cents)}</strong><small><Clock3 /> {service.duration_minutes} min</small></div></article>)}</div> : <div className="public-empty">Nenhum serviço disponível.</div>}
    </section>,
    professionals: <section className="public-template-team" id="equipe" key="professionals">
      <header><h2>Profissionais</h2><p>Conheça quem cuida de cada atendimento.</p></header>
      {publicProfessionals.length ? <div className="public-team-grid">{publicProfessionals.map((professional) => { const photo = config.media.professionalPhotos[professional.id]; return <article key={professional.id}><div className="public-professional-photo">{photo ? <img src={photo.url} alt={`Foto de ${professional.name}`} /> : <span>{businessMonogram(professional.name)}</span>}</div><h3>{professional.name}</h3><p>{professional.description || professional.contact || "Profissional da equipe"}</p></article>; })}</div> : <div className="public-empty">Nenhum profissional disponível.</div>}
    </section>,
    gallery: <section className="public-template-gallery" key="gallery"><header><h2>Galeria</h2><p>Um pouco do nosso espaço e do nosso trabalho.</p></header>{config.media.gallery.length ? <div>{config.media.gallery.map((image) => <img src={image.url} alt={image.alt || "Foto do negócio"} key={image.path} />)}</div> : <div className="public-empty">Adicione imagens para apresentar seu trabalho.</div>}</section>,
    location: <section className="public-template-location" id="localizacao" key="location"><MapPin /><div><h2>Onde estamos</h2><p>{address || "Consulte o endereço com o estabelecimento."}</p></div></section>,
    contact: <section className="public-template-contact" key="contact"><div><h2>Fale com a gente</h2><p>Confirme informações e tire suas dúvidas antes do atendimento.</p></div><div>{phone && <a href={`https://wa.me/${phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"><Phone /> WhatsApp</a>}{instagram && <a href={`https://instagram.com/${instagram}`} target="_blank" rel="noreferrer"><AtSign /> Instagram</a>}</div></section>,
    booking: <section className="public-template-booking" id="agendar" key="booking"><div className="public-booking-intro"><h2>Agende seu horário</h2><p>{config.content.bookingNotice}</p></div>{booking}</section>,
    footer: <footer className="public-template-footer" key="footer"><div><Logo config={config} name={displayName} monogram={monogram} /><strong>{displayName}</strong></div><p>{config.content.footerText}</p><small>Página criada com <Link href="/">{brand.name}</Link></small></footer>,
  };

  return <main className={`public-page-studio template-${config.template} mode-${config.mode} theme-${config.theme} font-${config.font} buttons-${config.buttonShape} cards-${config.cardStyle} ${preview ? "is-preview" : ""}`} style={style}>
    {preview && <div className="preview-ribbon">Prévia do rascunho · clientes não veem estas alterações</div>}
    <header className="public-template-nav"><a href="#top" className="public-template-logo"><Logo config={config} name={displayName} monogram={monogram} /><strong>{displayName}</strong></a><nav>{visible.get("services") && <a href="#servicos">Serviços</a>}{visible.get("professionals") && <a href="#equipe">Equipe</a>}{visible.get("location") && <a href="#localizacao">Localização</a>}</nav>{visible.get("booking") && <a href="#agendar" className="public-nav-cta">{config.content.primaryButton}</a>}</header>
    <div id="top" />
    {config.sections.filter((section) => visible.get(section.id)).map((section) => sections[section.id])}
    {visible.get("booking") && <a className="public-mobile-cta" href="#agendar"><CalendarDays /> {config.content.primaryButton}</a>}
  </main>;
}
