import { BotanicalRitualTemplate } from "./public-page/templates/botanical-ritual";
import { ClinicalLuxeTemplate } from "./public-page/templates/clinical-luxe";
import { MaisonEditorialTemplate } from "./public-page/templates/maison-editorial";
import { NoirAtelierTemplate } from "./public-page/templates/noir-atelier";
import { UrbanSignalTemplate } from "./public-page/templates/urban-signal";
import type { PublicPageBusiness, PublicPageBusinessHour, PublicPageProfessional, PublicPageService, PublicTemplateProps } from "./public-page/types";
import { orderForPublic, templatePalettes } from "@/lib/public-page";

export type { PublicPageBusiness, PublicPageBusinessHour, PublicPageProfessional, PublicPageService };

const templates = {
  "noir-atelier": NoirAtelierTemplate,
  "maison-editorial": MaisonEditorialTemplate,
  "botanical-ritual": BotanicalRitualTemplate,
  "clinical-luxe": ClinicalLuxeTemplate,
  "urban-signal": UrbanSignalTemplate,
};

export function PublicPageView(props: PublicTemplateProps) {
  const palette = props.config.mode === "manual" ? {
    primary: props.config.colors.primary, secondary: props.config.colors.secondary, button: props.config.colors.button,
    background: props.config.theme === "dark" ? "#171918" : "#F4F0E8", ink: props.config.theme === "dark" ? "#F8F4EA" : "#182A2D",
  } : templatePalettes[props.config.template][props.config.palette] || Object.values(templatePalettes[props.config.template])[0];
  const Template = templates[props.config.template];
  const services = orderForPublic(props.services.filter((service) => service.is_active !== false), props.config.serviceOrder);
  const professionals = orderForPublic(props.professionals.filter((professional) => professional.is_active !== false), props.config.professionalOrder);
  const style = { "--page-primary": palette.primary, "--page-secondary": palette.secondary, "--page-button": palette.button, "--page-bg": palette.background, "--page-ink": palette.ink } as React.CSSProperties;
  return <div className={`public-page-shell buttons-${props.config.buttonShape} cards-${props.config.cardStyle}`} data-template={props.config.template} style={style}><Template {...props} services={services} professionals={professionals} /></div>;
}
