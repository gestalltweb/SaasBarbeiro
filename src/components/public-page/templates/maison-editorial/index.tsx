import { BrandMark, BookingSection, BusinessHours, CoverMedia, Differentials, Faq, Footer, Gallery, hasSection, Instagram, Location, MobileBookingCta, PrimaryCta, ProfessionalList, ServiceList, Testimonials } from "../../shared";
import type { PublicTemplateProps } from "../../types";
import styles from "./styles.module.css";

export function MaisonEditorialTemplate(props: PublicTemplateProps) {
  const { business, config, services, professionals, businessHours, booking } = props; const name = config.content.businessName || business.name;
  const sections: Record<string, React.ReactNode> = {
    hero:<section className={styles.hero} key="hero"><div className={styles.heroImage}><CoverMedia config={config} name={name} /></div><div className={styles.heroCopy}><span>Edição atual · beleza com autoria</span><h1>{config.content.heroTitle}</h1><p>{config.content.heroSubtitle}</p><PrimaryCta config={config}/></div><b>01</b></section>,
    services:<section className={styles.catalog} id="servicos" key="services"><ServiceList services={services} title="Seleção da maison" variant="catalog"/></section>,
    gallery:<div className={styles.lookbook} id="galeria" key="gallery"><Gallery config={config} variant="lookbook"/></div>,
    story:config.content.story?<section className={styles.story} key="story"><div><span>Nossa história</span><h2>Uma assinatura construída em cada detalhe.</h2></div><p>{config.content.story}</p></section>:null,
    positioning:config.content.introduction?<section className={styles.pullquote} key="positioning"><p>{config.content.introduction}</p></section>:null,
    professionals:<section className={styles.team} id="equipe" key="professionals"><ProfessionalList professionals={professionals} services={services} config={config} featured variant="profiles"/></section>,
    testimonials:<div className={styles.testimonials} key="testimonials"><Testimonials config={config}/></div>,
    differentials:<div className={styles.paper} key="differentials"><Differentials config={config}/></div>,
    faq:<div className={styles.paper} key="faq"><Faq config={config}/></div>,
    booking:<div className={styles.booking} key="booking"><BookingSection config={config} booking={booking}/></div>,
    instagram:<div className={styles.instagram} key="instagram"><Instagram config={config}/></div>,
    businessHours:<div className={styles.info} key="businessHours"><BusinessHours businessHours={businessHours}/></div>,
    location:<div className={styles.info} key="location"><Location business={business} config={config}/></div>,
    footer:<Footer business={business} config={config} key="footer"/>,
  };
  return <main className={styles.page} id="top"><header className={styles.nav}><a href="#top"><BrandMark config={config} name={name}/><strong>{name}</strong></a><nav><a href="#servicos">Catálogo</a><a href="#galeria">Lookbook</a><a href="#equipe">Equipe</a></nav><PrimaryCta config={config} compact/></header>{props.preview&&<div className="preview-ribbon">Prévia do rascunho · clientes não veem estas alterações</div>}{config.sections.filter(s=>s.visible).map(s=>sections[s.id])}{hasSection(config,"booking")&&<MobileBookingCta config={config}/>}</main>;
}
