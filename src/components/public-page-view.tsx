import { BotanicalRitualTemplate } from "./public-page/templates/botanical-ritual";
import { ClinicalLuxeTemplate } from "./public-page/templates/clinical-luxe";
import { MaisonEditorialTemplate } from "./public-page/templates/maison-editorial";
import { NoirAtelierTemplate } from "./public-page/templates/noir-atelier";
import { UrbanSignalTemplate } from "./public-page/templates/urban-signal";
import type { PublicPageBusiness, PublicPageBusinessHour, PublicPageProfessional, PublicPageService, PublicTemplateProps } from "./public-page/types";
import { orderForPublic, templateDefinitions, templatePalettes, type PageTemplate } from "@/lib/public-page";

export type { PublicPageBusiness, PublicPageBusinessHour, PublicPageProfessional, PublicPageService };

const templates: Partial<Record<PageTemplate, React.ComponentType<PublicTemplateProps>>> = {
  "noir-atelier": NoirAtelierTemplate,
  "maison-editorial": MaisonEditorialTemplate,
  "botanical-ritual": BotanicalRitualTemplate,
  "clinical-luxe": ClinicalLuxeTemplate,
  "urban-signal": UrbanSignalTemplate,
};

const layoutTemplate: Record<string, React.ComponentType<PublicTemplateProps>> = {
  heritage: NoirAtelierTemplate, noir: NoirAtelierTemplate, signal: UrbanSignalTemplate, minimal: MaisonEditorialTemplate, garage: UrbanSignalTemplate,
  maison: MaisonEditorialTemplate, soft: BotanicalRitualTemplate, color: UrbanSignalTemplate, "minimal-beauty": ClinicalLuxeTemplate, campaign: MaisonEditorialTemplate,
  botanical: BotanicalRitualTemplate, clinical: ClinicalLuxeTemplate, laboratory: ClinicalLuxeTemplate, serenity: BotanicalRitualTemplate, sculpt: ClinicalLuxeTemplate,
  professional: ClinicalLuxeTemplate, local: MaisonEditorialTemplate, portfolio: UrbanSignalTemplate, service: UrbanSignalTemplate, personal: BotanicalRitualTemplate,
};

export function PublicPageView(props: PublicTemplateProps) {
  const defaultPalette = templatePalettes[props.config.template][props.config.palette] || Object.values(templatePalettes[props.config.template])[0];
  const hasCustomIdentity = ["primary", "secondary", "button"].some((key) => props.config.colors[key as keyof typeof props.config.colors] !== defaultPalette[key as "primary" | "secondary" | "button"]);
  const palette = props.config.mode === "manual" || hasCustomIdentity ? {
    primary: props.config.colors.primary, secondary: props.config.colors.secondary, button: props.config.colors.button,
    background: defaultPalette.background, ink: defaultPalette.ink,
  } : defaultPalette;
  const Template = templates[props.config.template] || layoutTemplate[templateDefinitions[props.config.template].layout];
  const services = orderForPublic(props.services.filter((service) => service.is_active !== false), props.config.serviceOrder);
  const professionals = orderForPublic(props.professionals.filter((professional) => professional.is_active !== false), props.config.professionalOrder);
  const style = { "--page-primary": palette.primary, "--page-secondary": palette.secondary, "--page-button": palette.button, "--page-bg": palette.background, "--page-ink": palette.ink } as React.CSSProperties;
  return <div className={`public-page-shell buttons-${props.config.buttonShape} cards-${props.config.cardStyle}`} data-template={props.config.template} style={style}><Template {...props} services={services} professionals={professionals} /></div>;
}
