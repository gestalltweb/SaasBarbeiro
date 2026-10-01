import { AtSign } from "lucide-react";
import { BrandMark, BookingSection, BusinessHours, CoverMedia, Differentials, Faq, Footer, Gallery, hasSection, Instagram, Location, MobileBookingCta, PrimaryCta, Process, ProfessionalList, ServiceList, Testimonials } from "../../shared";
import type { PublicTemplateProps } from "../../types";
import styles from "./styles.module.css";

export function NoirAtelierTemplate(props: PublicTemplateProps) {
  const { business, config, services, professionals, businessHours, booking } = props;
  const name = config.content.businessName || business.name;
  const sections: Record<string, React.ReactNode> = {
    hero: <section className={styles.hero} key="hero"><CoverMedia config={config} name={name} className={styles.cover} /><div className={styles.scrim} /><div className={styles.heroCopy}><span>Atelier · precisão · presença</span><h1>{config.content.heroTitle}</h1><p>{config.content.heroSubtitle}</p><PrimaryCta config={config} /></div><small className={styles.scroll}>Explore o atelier ↓</small></section>,
    positioning: config.content.introduction ? <section className={styles.positioning} key="positioning"><span>Nosso ofício</span><h2>{config.content.introduction}</h2></section> : null,
    services: <section className={styles.services} id="servicos" key="services"><ServiceList services={services} title="Menu do atelier" variant="menu" /></section>,
    story: config.content.story ? <section className={styles.manifesto} key="story"><span>Manifesto</span><blockquote>{config.content.story}</blockquote></section> : null,
    differentials: <div className={styles.darkSection} key="differentials"><Differentials config={config} /></div>,
    process: <div className={styles.darkSection} key="process"><Process config={config} /></div>,
    professionals: <section className={styles.team} id="equipe" key="professionals"><ProfessionalList professionals={professionals} services={services} config={config} variant="editorial" /></section>,
    testimonials: <div className={styles.darkSection} key="testimonials"><Testimonials config={config} /></div>,
    faq: <div className={styles.darkSection} key="faq"><Faq config={config} /></div>,
    gallery: <div className={styles.gallery} key="gallery"><Gallery config={config} variant="mosaic" /></div>,
    booking: <div className={styles.booking} key="booking"><BookingSection config={config} booking={booking} /></div>,
    businessHours: <div className={styles.info} key="businessHours"><BusinessHours businessHours={businessHours} /></div>,
    location: <div className={styles.info} key="location"><Location business={business} config={config} /></div>,
    instagram: <div className={styles.social} key="instagram"><Instagram config={config} /></div>,
    footer: <Footer business={business} config={config} key="footer" />,
  };
  return <main className={styles.page} id="top"><header className={styles.nav}><a href="#top"><BrandMark config={config} name={name} /><strong>{name}</strong></a><nav><a href="#servicos">Serviços</a><a href="#equipe">Equipe</a>{config.contact.instagram && <a aria-label="Instagram" href={`https://instagram.com/${config.contact.instagram.replace(/^@/, "")}`}><AtSign /></a>}</nav><PrimaryCta config={config} compact /></header>{props.preview && <div className="preview-ribbon">Prévia do rascunho · clientes não veem estas alterações</div>}{config.sections.filter((section) => section.visible).map((section) => sections[section.id])}{hasSection(config, "booking") && <MobileBookingCta config={config} />}</main>;
}
