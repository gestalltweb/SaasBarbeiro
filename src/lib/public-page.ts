import type { BusinessSegment } from "./service-suggestions";

export const pageModes = ["manual", "template"] as const;
export const publicSegments = ["barbershop", "hair_salon", "aesthetics", "other"] as const;
export const pageSections = ["hero", "positioning", "services", "story", "differentials", "process", "professionals", "testimonials", "faq", "gallery", "booking", "businessHours", "location", "instagram", "footer"] as const;
export const pageTemplates = [
  "heritage-barber", "noir-atelier", "urban-signal", "minimal-cut", "garage-club",
  "maison-editorial", "soft-glam", "color-studio", "minimal-beauty", "celebrity-hair",
  "botanical-ritual", "clinical-luxe", "skin-laboratory", "spa-serenity", "sculpt-studio",
  "professional-studio", "local-premium", "creative-portfolio", "modern-service", "personal-brand",
] as const;
export const legacyTemplateMap = { noir: "noir-atelier", editorial: "maison-editorial", botanical: "botanical-ritual", urban: "urban-signal" } as const;

export type PageMode = (typeof pageModes)[number];
export type PublicSegment = (typeof publicSegments)[number];
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
  version: 2; mode: PageMode; template: PageTemplate; palette: string; theme: PageTheme; font: PageFont; buttonShape: ButtonShape; cardStyle: CardStyle;
  colors: { primary: string; secondary: string; button: string };
  content: { businessName: string; heroTitle: string; heroSubtitle: string; introduction: string; story: string; primaryButton: string; bookingNotice: string; footerText: string; seoTitle: string; seoDescription: string };
  contact: { whatsapp: string; instagram: string; address: string };
  sections: Array<{ id: PageSection; visible: boolean }>;
  serviceOrder: string[]; professionalOrder: string[]; differentials: Differential[]; testimonials: Testimonial[]; faq: FaqItem[]; professionalCredentials: Record<string, string>;
  media: { logoUrl: string; logoPath: string; coverUrl: string; coverPath: string; coverType: "image" | "video"; coverPosterUrl: string; coverPosterPath: string; shareUrl: string; sharePath: string; gallery: MediaAsset[]; professionalPhotos: Record<string, { url: string; path: string }> };
};

type TemplateDefinition = { segment: PublicSegment; name: string; description: string; layout: string; theme: PageTheme; font: PageFont; buttonShape: ButtonShape; cardStyle: CardStyle; palette: Palette; order: PageSection[]; asset: string };
const allOrder = (first: PageSection[]) => [...first, ...pageSections.filter((section) => !first.includes(section))];
const palette = (name: string, primary: string, secondary: string, button: string, background: string, ink: string): Palette => ({ name, primary, secondary, button, background, ink });
const art = {
  barber: "/template-art/barbershop-heritage.png",
  noir: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSJ6GV87lzmsrrO2wRrDO0czdK/hf_20261001_193125_8a935e7a-9f8f-43d9-882a-d67c652ca008_min.webp",
  urban: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSJ6GV87lzmsrrO2wRrDO0czdK/hf_20261001_193226_26710b80-9996-4c97-a529-e5328c90dfe1_min.webp",
  salon: "/template-art/hair-salon-maison.png",
  maison: "/template-art/hair-salon-maison.png",
  aesthetic: "/template-art/aesthetics-botanical.png",
  botanical: "/template-art/aesthetics-botanical.png",
  clinical: "https://d8j0ntlcm91z4.cloudfront.net/user_3JSJ6GV87lzmsrrO2wRrDO0czdK/hf_20261001_193125_8ad9d6fa-122c-471d-8518-32c499e353b9_min.webp",
  neutral: "/template-art/other-professional.png",
};
const definition = (segment: PublicSegment, name: string, description: string, layout: string, theme: PageTheme, font: PageFont, buttonShape: ButtonShape, cardStyle: CardStyle, colors: Palette, first: PageSection[], asset: string): TemplateDefinition => ({ segment, name, description, layout, theme, font, buttonShape, cardStyle, palette: colors, order: allOrder(first), asset });

export const templateDefinitions: Record<PageTemplate, TemplateDefinition> = {
  "heritage-barber": definition("barbershop","Heritage Barber","Madeira, couro e menu clássico.","heritage","dark","classic","square","bordered",palette("Cobre e couro","#161311","#B8814C","#D3995B","#100E0D","#F2E6D8"),["hero","services","professionals","gallery","booking"],art.barber),
  "noir-atelier": definition("barbershop","Noir Atelier","Luz dramática e atendimento premium.","noir","dark","editorial","square","bordered",palette("Carvão e cobre","#171513","#B87444","#C78351","#0E0E0D","#F3EBDD"),["hero","positioning","services","story","professionals","gallery","booking"],art.noir),
  "urban-signal": definition("barbershop","Urban Signal","Blocos diretos para uma agenda rápida.","signal","dark","modern","square","flat",palette("Asfalto e elétrico","#151716","#B6FF36","#B6FF36","#111313","#F3F6F1"),["hero","businessHours","services","booking","professionals"],art.urban),
  "minimal-cut": definition("barbershop","Minimal Cut","Espaço, precisão e serviços objetivos.","minimal","light","modern","soft","flat",palette("Areia e preto","#1D2020","#A6A095","#222525","#F5F2ED","#202322"),["hero","services","booking","gallery","professionals"],art.barber),
  "garage-club": definition("barbershop","Garage Club","Industrial, retrô e cheio de presença.","garage","dark","modern","square","bordered",palette("Óxido e aço","#1B1C1D","#B53B35","#C94C40","#141516","#F0ECE5"),["hero","gallery","services","professionals","booking"],art.urban),
  "maison-editorial": definition("hair_salon","Maison Editorial","Uma revista de beleza em formato de página.","maison","light","editorial","soft","flat",palette("Marfim e rouge","#6E2436","#C1A183","#6E2436","#F8F3EA","#251F1D"),["hero","services","gallery","story","professionals","booking"],art.maison),
  "soft-glam": definition("hair_salon","Soft Glam","Leveza, luxo e detalhes delicados.","soft","light","editorial","pill","elevated",palette("Rosa mineral","#715660","#D8BFC1","#835D68","#FBF7F5","#302A2C"),["hero","professionals","services","testimonials","booking"],art.salon),
  "color-studio": definition("hair_salon","Color Studio","Cor, portfólio e agenda em primeiro plano.","color","dark","modern","soft","flat",palette("Índigo e coral","#27224D","#FF7A6A","#FF7A6A","#16172B","#FFF7F3"),["hero","gallery","services","booking","professionals"],art.salon),
  "minimal-beauty": definition("hair_salon","Minimal Beauty","Catálogo claro para uma marca refinada.","minimal-beauty","light","modern","soft","bordered",palette("Preto e pérola","#252525","#AEA89D","#252525","#FBFAF7","#202020"),["hero","services","professionals","booking","gallery"],art.salon),
  "celebrity-hair": definition("hair_salon","Celebrity Hair","Campanha, resultados e especialistas em destaque.","campaign","dark","editorial","square","elevated",palette("Vinho e flash","#4B1F31","#F0C9B7","#E9A987","#1A1116","#FFF7F1"),["hero","professionals","gallery","services","booking"],art.maison),
  "botanical-ritual": definition("aesthetics","Botanical Ritual","Cuidado sensorial em ritmo calmo.","botanical","light","editorial","pill","elevated",palette("Sálvia e areia","#405D50","#B7AA8F","#405D50","#F2EEE4","#26352D"),["hero","positioning","differentials","services","professionals","booking"],art.botanical),
  "clinical-luxe": definition("aesthetics","Clinical Luxe","Precisão, processo e segurança.","clinical","light","modern","soft","bordered",palette("Marfim e terracota","#2C2D2B","#B66346","#9C4E36","#F7F3EA","#232421"),["hero","process","services","professionals","faq","booking"],art.clinical),
  "skin-laboratory": definition("aesthetics","Skin Laboratory","Informação objetiva para cuidados avançados.","laboratory","dark","modern","soft","bordered",palette("Azul profundo","#13354D","#46C7E8","#46C7E8","#081B29","#EAF9FF"),["hero","services","differentials","professionals","faq","booking"],art.aesthetic),
  "spa-serenity": definition("aesthetics","Spa Serenity","Pausa, textura e presença suave.","serenity","light","editorial","pill","flat",palette("Névoa e sálvia","#5B776F","#D9D1C4","#5B776F","#F6F3EE","#304139"),["hero","story","services","testimonials","booking","gallery"],art.botanical),
  "sculpt-studio": definition("aesthetics","Sculpt Studio","Procedimentos corporais com direção precisa.","sculpt","dark","modern","square","bordered",palette("Grafite e cobre","#202427","#E49A76","#E49A76","#101315","#F6F0EA"),["hero","services","process","professionals","booking"],art.aesthetic),
  "professional-studio": definition("other","Professional Studio","Uma presença segura para serviços especializados.","professional","dark","modern","soft","bordered",palette("Azul noturno","#163147","#56C2FF","#56C2FF","#09131D","#F3F9FF"),["hero","services","professionals","booking","location"],art.neutral),
  "local-premium": definition("other","Local Premium","Proximidade e qualidade em uma página clara.","local","light","classic","soft","elevated",palette("Azul e areia","#294A5E","#B7A98F","#294A5E","#F5F2EC","#1D2A31"),["hero","location","services","testimonials","booking"],art.neutral),
  "creative-portfolio": definition("other","Creative Portfolio","Portfólio visual com ação direta.","portfolio","dark","editorial","square","flat",palette("Uva elétrica","#3A2B55","#A991FF","#A991FF","#15121D","#FAF7FF"),["hero","gallery","story","services","booking"],art.neutral),
  "modern-service": definition("other","Modern Service","Organização, clareza e conversão.","service","dark","modern","soft","bordered",palette("Ciano técnico","#173947","#38D8FF","#38D8FF","#081317","#EFFCFF"),["hero","businessHours","services","booking","professionals"],art.neutral),
  "personal-brand": definition("other","Personal Brand","Uma página direta para especialistas independentes.","personal","light","editorial","pill","flat",palette("Ameixa e creme","#4E3A48","#D1B8A1","#4E3A48","#FAF6F0","#30252B"),["hero","story","professionals","services","booking"],art.neutral),
};

export const templateDetails = Object.fromEntries(Object.entries(templateDefinitions).map(([id, item]) => [id, { name: item.name, description: item.description, segment: item.segment, layout: item.layout }])) as Record<PageTemplate, Pick<TemplateDefinition, "name" | "description" | "segment" | "layout">>;
export const templatePalettes = Object.fromEntries(Object.entries(templateDefinitions).map(([id, item]) => [id, { default: item.palette }])) as unknown as Record<PageTemplate, Record<string, Palette>>;
export const templatePreviewAssets = Object.fromEntries(Object.entries(templateDefinitions).map(([id, item]) => [id, { moodboard: item.asset, hero: item.asset }])) as Record<PageTemplate, { moodboard: string; hero: string }>;
const hiddenOptional: PageSection[] = ["gallery","testimonials","faq","differentials","story","process","instagram"];
export function toPublicSegment(segment: BusinessSegment): PublicSegment { return publicSegments.includes(segment as PublicSegment) ? segment as PublicSegment : "other"; }
export function templatesForSegment(segment: BusinessSegment): PageTemplate[] { const publicSegment=toPublicSegment(segment); return pageTemplates.filter((template) => templateDefinitions[template].segment === publicSegment); }
export function resolveTemplate(value: unknown, segment?: BusinessSegment): PageTemplate | null { if (typeof value !== "string") return null; const template=pageTemplates.includes(value as PageTemplate) ? value as PageTemplate : legacyTemplateMap[value as LegacyPageTemplate]; if (!template) return null; return !segment || templateDefinitions[template].segment === toPublicSegment(segment) ? template : templatesForSegment(segment)[0]; }
export function recommendedTemplates(segment: BusinessSegment): PageTemplate[] { return templatesForSegment(segment); }
export function firstPalette(template: PageTemplate) { void template; return "default"; }
export function businessMonogram(name: string) { return name.trim().split(/\s+/).filter(Boolean).map((part) => part[0]).join("").slice(0,2).toUpperCase() || "AL"; }
type BusinessDefaults = { name: string; description?: string | null; phone?: string | null; instagram?: string | null; address?: string | null; segment: BusinessSegment };
export function createDefaultPageConfig(business: BusinessDefaults, mode: PageMode = "template", selectedTemplate?: PageTemplate): PublicPageConfig { const template=selectedTemplate && templatesForSegment(business.segment).includes(selectedTemplate) ? selectedTemplate : templatesForSegment(business.segment)[0]; const item=templateDefinitions[template]; return {version:2,mode,template,palette:"default",theme:item.theme,font:item.font,buttonShape:item.buttonShape,cardStyle:item.cardStyle,colors:{primary:item.palette.primary,secondary:item.palette.secondary,button:item.palette.button},content:{businessName:business.name,heroTitle:business.name,heroSubtitle:business.description || "Atendimento profissional com horário marcado.",introduction:`Conheça ${business.name}, nossos serviços e a equipe preparada para receber você.`,story:"",primaryButton:"Agendar horário",bookingNotice:"Escolha o serviço, o profissional e o melhor horário disponível.",footerText:`© ${new Date().getFullYear()} ${business.name}.`,seoTitle:`${business.name} | Agendamento online`,seoDescription:business.description || `Agende seu horário na ${business.name}.`},contact:{whatsapp:business.phone || "",instagram:business.instagram || "",address:business.address || ""},sections:item.order.map((id)=>({id,visible:!hiddenOptional.includes(id)})),serviceOrder:[],professionalOrder:[],differentials:[],testimonials:[],faq:[],professionalCredentials:{},media:{logoUrl:"",logoPath:"",coverUrl:"",coverPath:"",coverType:"image",coverPosterUrl:"",coverPosterPath:"",shareUrl:"",sharePath:"",gallery:[],professionalPhotos:{}}}; }
function migrateLegacySections(input: unknown, fallback: PublicPageConfig["sections"]) { if (!Array.isArray(input)) return fallback; const seen=new Set<PageSection>(); const migrated=input.flatMap((entry)=>{if(!entry || typeof entry !=="object") return [];const raw=String((entry as {id?:unknown}).id || "");const id=(raw==="presentation"?"hero":raw==="contact"?"location":raw) as PageSection;if(!pageSections.includes(id)||seen.has(id)) return [];seen.add(id);return [{id,visible:Boolean((entry as {visible?:unknown}).visible)}];});for(const section of fallback)if(!seen.has(section.id))migrated.push(section);return migrated; }
export function normalizePageConfig(value: unknown,business: BusinessDefaults): PublicPageConfig { const raw=value && typeof value==="object"?value as Record<string,unknown>:{};const template=resolveTemplate(raw.template,business.segment)||templatesForSegment(business.segment)[0];const fallback=createDefaultPageConfig(business,pageModes.includes(raw.mode as PageMode)?raw.mode as PageMode:"template",template);const input=raw as Partial<PublicPageConfig>;return {...fallback,...input,version:2,template,palette:"default",mode:pageModes.includes(input.mode as PageMode)?input.mode as PageMode:fallback.mode,colors:{...fallback.colors,...(input.colors||{})},content:{...fallback.content,...(input.content||{})},contact:{...fallback.contact,...(input.contact||{})},sections:migrateLegacySections(input.sections,fallback.sections),serviceOrder:Array.isArray(input.serviceOrder)?input.serviceOrder.filter((id):id is string=>typeof id==="string"):[],professionalOrder:Array.isArray(input.professionalOrder)?input.professionalOrder.filter((id):id is string=>typeof id==="string"):[],differentials:Array.isArray(input.differentials)?input.differentials:[],testimonials:Array.isArray(input.testimonials)?input.testimonials:[],faq:Array.isArray(input.faq)?input.faq:[],professionalCredentials:input.professionalCredentials&&typeof input.professionalCredentials==="object"?input.professionalCredentials:{},media:{...fallback.media,...(input.media||{}),gallery:Array.isArray(input.media?.gallery)?input.media.gallery:[],professionalPhotos:input.media?.professionalPhotos&&typeof input.media.professionalPhotos==="object"?input.media.professionalPhotos:{}}}; }
export function applyTemplate(config: PublicPageConfig,template: PageTemplate): PublicPageConfig {const item=templateDefinitions[template];const visible=new Map(config.sections.map((section)=>[section.id,section.visible]));return {...config,mode:"template",template,palette:"default",theme:item.theme,font:item.font,buttonShape:item.buttonShape,cardStyle:item.cardStyle,colors:{primary:item.palette.primary,secondary:item.palette.secondary,button:item.palette.button},sections:item.order.map((id)=>({id,visible:visible.get(id)??!hiddenOptional.includes(id)}))};}
export function orderForPublic<T extends {id:string}>(items:T[],order:string[]){const positions=new Map(order.map((id,index)=>[id,index]));return [...items].sort((a,b)=>(positions.get(a.id)??Number.MAX_SAFE_INTEGER)-(positions.get(b.id)??Number.MAX_SAFE_INTEGER));}
export function buildPublicPageSeo(config:PublicPageConfig,businessName:string,canonicalUrl:string){return{title:config.content.seoTitle||businessName,description:config.content.seoDescription,canonicalUrl,imageUrl:config.media.shareUrl||config.media.coverPosterUrl||config.media.coverUrl||""};}
