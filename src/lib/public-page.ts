import type { BusinessSegment } from "./service-suggestions";

export const pageModes = ["manual", "template"] as const;
export const legacyTemplateMap = { noir: "noir-atelier", editorial: "maison-editorial", botanical: "botanical-ritual", urban: "urban-signal" } as const;
export const pageTemplates = ["noir-atelier", "maison-editorial", "botanical-ritual", "clinical-luxe", "urban-signal"] as const;
export const legacyPageTemplates = Object.keys(legacyTemplateMap) as Array<keyof typeof legacyTemplateMap>;
export const pageSections = ["hero", "positioning", "services", "story", "differentials", "process", "professionals", "testimonials", "faq", "gallery", "booking", "businessHours", "location", "instagram", "footer"] as const;

export type PageMode = (typeof pageModes)[number];
export type PageTemplate = (typeof pageTemplates)[number];
export type LegacyPageTemplate = keyof typeof legacyTemplateMap;
export type PageSection = (typeof pageSections)[number];
export type PageTheme = "light" | "dark";
export type PageFont = "editorial" | "modern" | "classic";
export type ButtonShape = "soft" | "square" | "pill";
export type CardStyle = "flat" | "bordered" | "elevated";
export type Palette = Readonly<{ name: string; primary: string; secondary: string; button: string; background: string; ink: string }>;
export type MediaAsset = { url: string; path: string; alt: string };
export type Testimonial = { id: string; name: string; text: string; context: string };
export type FaqItem = { id: string; question: string; answer: string };
export type Differential = { id: string; title: string; description: string };

export type PublicPageConfig = {
  version: 2;
  mode: PageMode;
  template: PageTemplate;
  palette: string;
  theme: PageTheme;
  font: PageFont;
  buttonShape: ButtonShape;
  cardStyle: CardStyle;
  colors: { primary: string; secondary: string; button: string };
  content: {
    businessName: string; heroTitle: string; heroSubtitle: string; introduction: string; story: string;
    primaryButton: string; bookingNotice: string; footerText: string; seoTitle: string; seoDescription: string;
  };
  contact: { whatsapp: string; instagram: string; address: string };
  sections: Array<{ id: PageSection; visible: boolean }>;
  serviceOrder: string[];
  professionalOrder: string[];
  differentials: Differential[];
  testimonials: Testimonial[];
  faq: FaqItem[];
  professionalCredentials: Record<string, string>;
  media: {
    logoUrl: string; logoPath: string; coverUrl: string; coverPath: string; coverType: "image" | "video";
    coverPosterUrl: string; coverPosterPath: string; shareUrl: string; sharePath: string;
    gallery: MediaAsset[]; professionalPhotos: Record<string, { url: string; path: string }>;
  };
};

export const templatePalettes: Record<PageTemplate, Record<string, Palette>> = {
  "noir-atelier": {
    copper: { name: "Carvão e cobre", primary: "#171513", secondary: "#B87444", button: "#C78351", background: "#0E0E0D", ink: "#F3EBDD" },
    cream: { name: "Preto e creme", primary: "#111110", secondary: "#D7C9AE", button: "#E8D9BB", background: "#0B0B0A", ink: "#F6F0E5" },
    oxblood: { name: "Vinho e bronze", primary: "#211214", secondary: "#A96B4B", button: "#C47A52", background: "#120B0C", ink: "#F5ECE5" },
  },
  "maison-editorial": {
    rouge: { name: "Marfim e rouge", primary: "#6E2436", secondary: "#C1A183", button: "#6E2436", background: "#F8F3EA", ink: "#251F1D" },
    olive: { name: "Papel e oliva", primary: "#485044", secondary: "#B29B78", button: "#485044", background: "#F5F0E7", ink: "#242521" },
    ink: { name: "Tinta e blush", primary: "#253746", secondary: "#C08D83", button: "#253746", background: "#F7F0E9", ink: "#20272D" },
  },
  "botanical-ritual": {
    sage: { name: "Sálvia e areia", primary: "#405D50", secondary: "#B7AA8F", button: "#405D50", background: "#F2EEE4", ink: "#26352D" },
    clay: { name: "Argila e aveia", primary: "#805B4D", secondary: "#C9A68E", button: "#805B4D", background: "#F5EEE5", ink: "#3B2B25" },
    mineral: { name: "Mineral e musgo", primary: "#53645B", secondary: "#A5B0A2", button: "#53645B", background: "#EEF0E8", ink: "#29342E" },
  },
  "clinical-luxe": {
    terracotta: { name: "Marfim e terracota", primary: "#2C2D2B", secondary: "#B66346", button: "#9C4E36", background: "#F7F3EA", ink: "#232421" },
    graphite: { name: "Grafite e areia", primary: "#303331", secondary: "#B5A98E", button: "#3C5149", background: "#F4F1EA", ink: "#232725" },
    plum: { name: "Ameixa e pedra", primary: "#4A303A", secondary: "#BA917D", button: "#743F51", background: "#F7F1EC", ink: "#2D2528" },
  },
  "urban-signal": {
    electric: { name: "Preto e lima", primary: "#151716", secondary: "#C7F23A", button: "#C7F23A", background: "#F0F0EB", ink: "#151716" },
    cobalt: { name: "Preto e cobalto", primary: "#17191C", secondary: "#527BFF", button: "#527BFF", background: "#EFEFEB", ink: "#17191C" },
    orange: { name: "Asfalto e laranja", primary: "#1C1C1A", secondary: "#FF713D", button: "#FF713D", background: "#F0EEE7", ink: "#1C1C1A" },
  },
};

export const templateDetails: Record<PageTemplate, { name: string; description: string }> = {
  "noir-atelier": { name: "Noir Atelier", description: "Cinema, contraste e artesania para marcas masculinas premium." },
  "maison-editorial": { name: "Maison Editorial", description: "Uma revista de beleza com catálogo e lookbook assimétricos." },
  "botanical-ritual": { name: "Botanical Ritual", description: "Ritual, calma e textura natural para experiências de bem-estar." },
  "clinical-luxe": { name: "Clinical Luxe", description: "Precisão, processo e credibilidade para procedimentos avançados." },
  "urban-signal": { name: "Urban Signal", description: "Tipografia direta, blocos elétricos e agendamento imediato." },
};

export const templatePreviewAssets: Record<PageTemplate, { moodboard: string; barbershop: string; hairSalon: string; aesthetics: string }> = {
  "noir-atelier": {
    moodboard: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSJ6GV87lzmsrrO2wRrDO0czdK/hf_20261001_193125_8a935e7a-9f8f-43d9-882a-d67c652ca008_min.webp",
    barbershop: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSJ6GV87lzmsrrO2wRrDO0czdK/hf_20261001_193141_249de971-60cc-4389-927d-ce9b9926b0ec_min.webp",
    hairSalon: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSJ6GV87lzmsrrO2wRrDO0czdK/hf_20261001_193140_3ae61025-31ed-4c56-ab1c-33b766b400cf_min.webp",
    aesthetics: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSJ6GV87lzmsrrO2wRrDO0czdK/hf_20261001_193139_48be9199-cf04-4162-ac8a-dad10b61ef4b_min.webp",
  },
  "maison-editorial": {
    moodboard: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSJ6GV87lzmsrrO2wRrDO0czdK/hf_20261001_193125_e6992b83-acc0-4081-998f-77c4b9b8d7d5_min.webp",
    barbershop: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSJ6GV87lzmsrrO2wRrDO0czdK/hf_20261001_193139_738a1630-434c-415f-ba89-586be9cd0fbf_min.webp",
    hairSalon: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSJ6GV87lzmsrrO2wRrDO0czdK/hf_20261001_193140_9aaf94c9-7b3b-47a2-8d96-a8d8c4968f14_min.webp",
    aesthetics: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSJ6GV87lzmsrrO2wRrDO0czdK/hf_20261001_193227_3e1e596e-9880-4d4d-84de-dcb3d7b44205_min.webp",
  },
  "botanical-ritual": {
    moodboard: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSJ6GV87lzmsrrO2wRrDO0czdK/hf_20261001_193125_105b38f7-e269-4aff-af34-a6507396c79e_min.webp",
    barbershop: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSJ6GV87lzmsrrO2wRrDO0czdK/hf_20261001_193152_27ae1fa7-bc6f-4203-8692-05bb51784243_min.webp",
    hairSalon: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSJ6GV87lzmsrrO2wRrDO0czdK/hf_20261001_193152_87140476-774b-4c3e-9de6-69d65562e99f_min.webp",
    aesthetics: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSJ6GV87lzmsrrO2wRrDO0czdK/hf_20261001_193152_72918897-ddca-4b8c-94da-aa0e8aa83613_min.webp",
  },
  "clinical-luxe": {
    moodboard: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSJ6GV87lzmsrrO2wRrDO0czdK/hf_20261001_193125_8ad9d6fa-122c-471d-8518-32c499e353b9_min.webp",
    barbershop: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSJ6GV87lzmsrrO2wRrDO0czdK/hf_20261001_193152_a5cc988f-89b2-4447-ab4d-4dc092af24fb_min.webp",
    hairSalon: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSJ6GV87lzmsrrO2wRrDO0czdK/hf_20261001_193227_eb0e7d4d-eac2-4d3f-af05-35fda73a7c74_min.webp",
    aesthetics: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSJ6GV87lzmsrrO2wRrDO0czdK/hf_20261001_193227_9a00c681-68ba-4bfc-9c74-33b27ba950b5_min.webp",
  },
  "urban-signal": {
    moodboard: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSJ6GV87lzmsrrO2wRrDO0czdK/hf_20261001_193125_3906eb6e-f842-4a63-a3df-1eadb00f527b_min.webp",
    barbershop: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSJ6GV87lzmsrrO2wRrDO0czdK/hf_20261001_193226_26710b80-9996-4c97-a529-e5328c90dfe1_min.webp",
    hairSalon: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSJ6GV87lzmsrrO2wRrDO0czdK/hf_20261001_193227_896bd679-cef1-414f-90bf-acd2367cf80d_min.webp",
    aesthetics: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSJ6GV87lzmsrrO2wRrDO0czdK/hf_20261001_193227_21c44e19-75f6-4cd5-a29e-578b23375dc3_min.webp",
  },
};

const hiddenOptional: PageSection[] = ["gallery", "testimonials", "faq", "differentials", "story", "process", "instagram"];
const templateDefaults: Record<PageTemplate, { theme: PageTheme; font: PageFont; buttonShape: ButtonShape; cardStyle: CardStyle; sectionOrder: PageSection[] }> = {
  "noir-atelier": { theme: "dark", font: "classic", buttonShape: "square", cardStyle: "bordered", sectionOrder: ["hero", "positioning", "services", "story", "professionals", "gallery", "booking", "businessHours", "location", "instagram", "footer", "differentials", "process", "testimonials", "faq"] },
  "maison-editorial": { theme: "light", font: "editorial", buttonShape: "soft", cardStyle: "flat", sectionOrder: ["hero", "services", "gallery", "story", "positioning", "professionals", "testimonials", "booking", "instagram", "location", "businessHours", "footer", "differentials", "process", "faq"] },
  "botanical-ritual": { theme: "light", font: "editorial", buttonShape: "pill", cardStyle: "elevated", sectionOrder: ["hero", "positioning", "differentials", "services", "process", "professionals", "testimonials", "gallery", "booking", "location", "businessHours", "instagram", "footer", "story", "faq"] },
  "clinical-luxe": { theme: "light", font: "modern", buttonShape: "soft", cardStyle: "bordered", sectionOrder: ["hero", "positioning", "process", "services", "differentials", "professionals", "testimonials", "faq", "booking", "businessHours", "location", "footer", "story", "gallery", "instagram"] },
  "urban-signal": { theme: "dark", font: "modern", buttonShape: "square", cardStyle: "flat", sectionOrder: ["hero", "businessHours", "services", "booking", "professionals", "gallery", "instagram", "location", "footer", "positioning", "story", "differentials", "process", "testimonials", "faq"] },
};

export function resolveTemplate(value: unknown): PageTemplate | null {
  if (typeof value !== "string") return null;
  if (pageTemplates.includes(value as PageTemplate)) return value as PageTemplate;
  return legacyTemplateMap[value as LegacyPageTemplate] || null;
}
export function recommendedTemplates(segment: BusinessSegment): PageTemplate[] {
  if (segment === "barbershop" || segment === "tattoo_piercing" || segment === "auto_detailing") return ["noir-atelier", "urban-signal"];
  if (segment === "hair_salon") return ["maison-editorial"];
  if (segment === "aesthetics" || segment === "fitness_sports") return ["botanical-ritual", "clinical-luxe"];
  if (segment === "health_wellness") return ["clinical-luxe", "botanical-ritual"];
  if (segment === "pet_care") return ["botanical-ritual", "maison-editorial"];
  if (segment === "consulting_education") return ["maison-editorial", "urban-signal"];
  return [];
}
export function firstPalette(template: PageTemplate) { return Object.keys(templatePalettes[template])[0]; }
export function businessMonogram(name: string) { return name.trim().split(/\s+/).filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "AL"; }

type BusinessDefaults = { name: string; description?: string | null; phone?: string | null; instagram?: string | null; address?: string | null; segment: BusinessSegment };
export function createDefaultPageConfig(business: BusinessDefaults, mode: PageMode = "template", selectedTemplate?: PageTemplate): PublicPageConfig {
  const template = selectedTemplate || recommendedTemplates(business.segment)[0] || "maison-editorial";
  const palette = firstPalette(template); const colors = templatePalettes[template][palette]; const defaults = templateDefaults[template];
  return {
    version: 2, mode, template, palette, theme: defaults.theme, font: defaults.font, buttonShape: defaults.buttonShape, cardStyle: defaults.cardStyle,
    colors: { primary: colors.primary, secondary: colors.secondary, button: colors.button },
    content: { businessName: business.name, heroTitle: business.name, heroSubtitle: business.description || "Atendimento profissional com horário marcado.", introduction: `Conheça ${business.name}, nossos serviços e a equipe preparada para receber você.`, story: "", primaryButton: "Agendar horário", bookingNotice: "Escolha o serviço, o profissional e o melhor horário disponível.", footerText: `© ${new Date().getFullYear()} ${business.name}.`, seoTitle: `${business.name} | Agendamento online`, seoDescription: business.description || `Agende seu horário na ${business.name}.` },
    contact: { whatsapp: business.phone || "", instagram: business.instagram || "", address: business.address || "" },
    sections: defaults.sectionOrder.map((id) => ({ id, visible: !hiddenOptional.includes(id) })),
    serviceOrder: [], professionalOrder: [], differentials: [], testimonials: [], faq: [], professionalCredentials: {},
    media: { logoUrl: "", logoPath: "", coverUrl: "", coverPath: "", coverType: "image", coverPosterUrl: "", coverPosterPath: "", shareUrl: "", sharePath: "", gallery: [], professionalPhotos: {} },
  };
}

function migrateLegacySections(input: unknown, fallback: PublicPageConfig["sections"]) {
  if (!Array.isArray(input)) return fallback;
  const map: Record<string, PageSection> = { presentation: "hero", contact: "location" }; const seen = new Set<PageSection>();
  const migrated = input.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const raw = String((entry as { id?: unknown }).id || ""); const id = map[raw] || raw as PageSection;
    if (!pageSections.includes(id) || seen.has(id)) return [];
    seen.add(id); return [{ id, visible: Boolean((entry as { visible?: unknown }).visible) }];
  });
  for (const section of fallback) if (!seen.has(section.id)) migrated.push(section);
  return migrated;
}

export function normalizePageConfig(value: unknown, business: BusinessDefaults): PublicPageConfig {
  const raw = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const template = resolveTemplate(raw.template) || recommendedTemplates(business.segment)[0] || "maison-editorial";
  const fallback = createDefaultPageConfig(business, pageModes.includes(raw.mode as PageMode) ? raw.mode as PageMode : "template", template);
  const input = raw as Partial<PublicPageConfig>; const palette = input.palette && templatePalettes[template][input.palette] ? input.palette : firstPalette(template);
  return { ...fallback, ...input, version: 2, template, palette, mode: pageModes.includes(input.mode as PageMode) ? input.mode as PageMode : fallback.mode,
    colors: { ...fallback.colors, ...(input.colors || {}) }, content: { ...fallback.content, ...(input.content || {}) }, contact: { ...fallback.contact, ...(input.contact || {}) },
    sections: migrateLegacySections(input.sections, fallback.sections),
    serviceOrder: Array.isArray(input.serviceOrder) ? input.serviceOrder.filter((id): id is string => typeof id === "string") : [], professionalOrder: Array.isArray(input.professionalOrder) ? input.professionalOrder.filter((id): id is string => typeof id === "string") : [],
    differentials: Array.isArray(input.differentials) ? input.differentials : [], testimonials: Array.isArray(input.testimonials) ? input.testimonials : [], faq: Array.isArray(input.faq) ? input.faq : [], professionalCredentials: input.professionalCredentials && typeof input.professionalCredentials === "object" ? input.professionalCredentials : {},
    media: { ...fallback.media, ...(input.media || {}), gallery: Array.isArray(input.media?.gallery) ? input.media.gallery : [], professionalPhotos: input.media?.professionalPhotos && typeof input.media.professionalPhotos === "object" ? input.media.professionalPhotos : {} },
  };
}

export function applyTemplate(config: PublicPageConfig, template: PageTemplate, palette = firstPalette(template)): PublicPageConfig {
  const colors = templatePalettes[template][palette]; const defaults = templateDefaults[template]; const visibility = new Map(config.sections.map((section) => [section.id, section.visible]));
  return { ...config, mode: "template", template, palette, theme: defaults.theme, font: defaults.font, buttonShape: defaults.buttonShape, cardStyle: defaults.cardStyle, colors: { primary: colors.primary, secondary: colors.secondary, button: colors.button }, sections: defaults.sectionOrder.map((id) => ({ id, visible: visibility.get(id) ?? false })) };
}
export function orderForPublic<T extends { id: string }>(items: T[], order: string[]) { const positions = new Map(order.map((id, index) => [id, index])); return [...items].sort((a, b) => (positions.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (positions.get(b.id) ?? Number.MAX_SAFE_INTEGER)); }
export function buildPublicPageSeo(config: PublicPageConfig, businessName: string, canonicalUrl: string) { return { title: config.content.seoTitle || businessName, description: config.content.seoDescription, canonicalUrl, imageUrl: config.media.shareUrl || config.media.coverPosterUrl || config.media.coverUrl || "" }; }
