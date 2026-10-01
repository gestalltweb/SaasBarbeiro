import type { BusinessSegment } from "./service-suggestions";

export const pageModes = ["manual", "template"] as const;
export const pageTemplates = ["noir", "editorial", "botanical", "urban"] as const;
export const pageSections = ["presentation", "services", "professionals", "gallery", "location", "contact", "booking", "footer"] as const;

export type PageMode = (typeof pageModes)[number];
export type PageTemplate = (typeof pageTemplates)[number];
export type PageSection = (typeof pageSections)[number];
export type PageTheme = "light" | "dark";
export type PageFont = "editorial" | "modern" | "classic";
export type ButtonShape = "soft" | "square" | "pill";
export type CardStyle = "flat" | "bordered" | "elevated";
export type Palette = Readonly<{ name: string; primary: string; secondary: string; button: string; background: string; ink: string }>;

export type PublicPageConfig = {
  version: 1;
  mode: PageMode;
  template: PageTemplate;
  palette: string;
  theme: PageTheme;
  font: PageFont;
  buttonShape: ButtonShape;
  cardStyle: CardStyle;
  colors: { primary: string; secondary: string; button: string };
  content: {
    businessName: string;
    heroTitle: string;
    heroSubtitle: string;
    introduction: string;
    primaryButton: string;
    bookingNotice: string;
    footerText: string;
    seoTitle: string;
    seoDescription: string;
  };
  contact: { whatsapp: string; instagram: string; address: string };
  sections: Array<{ id: PageSection; visible: boolean }>;
  serviceOrder: string[];
  professionalOrder: string[];
  media: {
    logoUrl: string;
    logoPath: string;
    coverUrl: string;
    coverPath: string;
    shareUrl: string;
    sharePath: string;
    gallery: Array<{ url: string; path: string; alt: string }>;
    professionalPhotos: Record<string, { url: string; path: string }>;
  };
};

export const templatePalettes: Record<PageTemplate, Record<string, Palette>> = {
  noir: {
    gold: { name: "Ouro clássico", primary: "#151412", secondary: "#C5A15A", button: "#C5A15A", background: "#0E0E0D", ink: "#F5F0E6" },
    platinum: { name: "Platina", primary: "#171A1C", secondary: "#BAC2C8", button: "#E3E7EA", background: "#101214", ink: "#F4F5F3" },
    burgundy: { name: "Vinho noturno", primary: "#1C1114", secondary: "#A95F6C", button: "#B86A76", background: "#120B0D", ink: "#F6EDEE" },
  },
  editorial: {
    wine: { name: "Creme e vinho", primary: "#6D2834", secondary: "#B88974", button: "#6D2834", background: "#F5EFE3", ink: "#2B2522" },
    olive: { name: "Papel e oliva", primary: "#4E5943", secondary: "#B19A68", button: "#4E5943", background: "#F3ECDD", ink: "#292A25" },
    ink: { name: "Tinta azul", primary: "#243B53", secondary: "#9B6B5B", button: "#243B53", background: "#F4EFE7", ink: "#202A31" },
  },
  botanical: {
    sage: { name: "Sálvia", primary: "#476657", secondary: "#A8B89F", button: "#476657", background: "#F1EEE4", ink: "#23352D" },
    clay: { name: "Argila", primary: "#876052", secondary: "#C6A18C", button: "#876052", background: "#F4EDE4", ink: "#3B2B25" },
    lagoon: { name: "Lagoa", primary: "#376A67", secondary: "#91B8AD", button: "#376A67", background: "#EDF3EE", ink: "#203836" },
  },
  urban: {
    copper: { name: "Grafite e cobre", primary: "#232629", secondary: "#B56F45", button: "#C27649", background: "#E9E6E0", ink: "#1B1E20" },
    electric: { name: "Concreto elétrico", primary: "#20252A", secondary: "#7C9BE8", button: "#5579D8", background: "#ECEEF0", ink: "#191D21" },
    moss: { name: "Asfalto e musgo", primary: "#252925", secondary: "#84946E", button: "#71815D", background: "#ECEBE5", ink: "#1E211D" },
  },
};

export const templateDetails: Record<PageTemplate, { name: string; description: string }> = {
  noir: { name: "Noir", description: "Luxo noturno, contraste alto e agendamento em evidência." },
  editorial: { name: "Editorial", description: "Catálogo elegante, tipografia expressiva e histórias da equipe." },
  botanical: { name: "Botânico", description: "Atmosfera calma, formas suaves e foco em bem-estar." },
  urban: { name: "Urbano", description: "Blocos fortes, navegação direta e presença contemporânea." },
};

export function recommendedTemplates(segment: BusinessSegment): PageTemplate[] {
  if (segment === "barbershop") return ["urban", "noir"];
  if (segment === "hair_salon") return ["editorial"];
  if (segment === "aesthetics") return ["botanical"];
  return [];
}

export function firstPalette(template: PageTemplate) {
  return Object.keys(templatePalettes[template])[0];
}

export function businessMonogram(name: string) {
  return name.trim().split(/\s+/).filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "AL";
}

type BusinessDefaults = { name: string; description?: string | null; phone?: string | null; instagram?: string | null; address?: string | null; segment: BusinessSegment };

export function createDefaultPageConfig(business: BusinessDefaults, mode: PageMode = "template", selectedTemplate?: PageTemplate): PublicPageConfig {
  const template = selectedTemplate || recommendedTemplates(business.segment)[0] || "editorial";
  const palette = firstPalette(template);
  const colors = templatePalettes[template][palette];
  return {
    version: 1,
    mode,
    template,
    palette,
    theme: template === "noir" || template === "urban" ? "dark" : "light",
    font: template === "editorial" || template === "botanical" ? "editorial" : "modern",
    buttonShape: template === "botanical" ? "pill" : template === "urban" ? "square" : "soft",
    cardStyle: template === "noir" ? "elevated" : template === "editorial" ? "flat" : "bordered",
    colors: { primary: colors.primary, secondary: colors.secondary, button: colors.button },
    content: {
      businessName: business.name,
      heroTitle: business.name,
      heroSubtitle: business.description || "Atendimento profissional com horário marcado.",
      introduction: `Conheça ${business.name}, nossos serviços e a equipe preparada para receber você.`,
      primaryButton: "Agendar horário",
      bookingNotice: "Escolha o serviço, o profissional e o melhor horário disponível.",
      footerText: `© ${new Date().getFullYear()} ${business.name}.`,
      seoTitle: `${business.name} | Agendamento online`,
      seoDescription: business.description || `Agende seu horário na ${business.name}.`,
    },
    contact: { whatsapp: business.phone || "", instagram: business.instagram || "", address: business.address || "" },
    sections: pageSections.map((id) => ({ id, visible: id !== "gallery" })),
    serviceOrder: [],
    professionalOrder: [],
    media: { logoUrl: "", logoPath: "", coverUrl: "", coverPath: "", shareUrl: "", sharePath: "", gallery: [], professionalPhotos: {} },
  };
}

export function normalizePageConfig(value: unknown, business: BusinessDefaults): PublicPageConfig {
  const fallback = createDefaultPageConfig(business);
  if (!value || typeof value !== "object") return fallback;
  const input = value as Partial<PublicPageConfig>;
  const template = pageTemplates.includes(input.template as PageTemplate) ? input.template as PageTemplate : fallback.template;
  const palette = input.palette && templatePalettes[template][input.palette] ? input.palette : firstPalette(template);
  return {
    ...fallback,
    ...input,
    version: 1,
    mode: pageModes.includes(input.mode as PageMode) ? input.mode as PageMode : fallback.mode,
    template,
    palette,
    colors: { ...fallback.colors, ...(input.colors || {}) },
    content: { ...fallback.content, ...(input.content || {}) },
    contact: { ...fallback.contact, ...(input.contact || {}) },
    sections: Array.isArray(input.sections) ? input.sections.filter((section) => pageSections.includes(section.id)) : fallback.sections,
    serviceOrder: Array.isArray(input.serviceOrder) ? input.serviceOrder.filter((id): id is string => typeof id === "string") : [],
    professionalOrder: Array.isArray(input.professionalOrder) ? input.professionalOrder.filter((id): id is string => typeof id === "string") : [],
    media: {
      ...fallback.media,
      ...(input.media || {}),
      gallery: Array.isArray(input.media?.gallery) ? input.media.gallery : [],
      professionalPhotos: input.media?.professionalPhotos && typeof input.media.professionalPhotos === "object" ? input.media.professionalPhotos : {},
    },
  };
}

export function applyTemplate(config: PublicPageConfig, template: PageTemplate, palette = firstPalette(template)): PublicPageConfig {
  const colors = templatePalettes[template][palette];
  return {
    ...config,
    mode: "template",
    template,
    palette,
    theme: template === "noir" || template === "urban" ? "dark" : "light",
    font: template === "editorial" || template === "botanical" ? "editorial" : "modern",
    buttonShape: template === "botanical" ? "pill" : template === "urban" ? "square" : "soft",
    cardStyle: template === "noir" ? "elevated" : template === "editorial" ? "flat" : "bordered",
    colors: { primary: colors.primary, secondary: colors.secondary, button: colors.button },
  };
}

export function orderForPublic<T extends { id: string }>(items: T[], order: string[]) {
  const positions = new Map(order.map((id, index) => [id, index]));
  return [...items].sort((a, b) => (positions.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (positions.get(b.id) ?? Number.MAX_SAFE_INTEGER));
}

export function buildPublicPageSeo(config: PublicPageConfig, businessName: string, canonicalUrl: string) {
  return {
    title: config.content.seoTitle || businessName,
    description: config.content.seoDescription,
    canonicalUrl,
    imageUrl: config.media.shareUrl || config.media.coverUrl || "",
  };
}
