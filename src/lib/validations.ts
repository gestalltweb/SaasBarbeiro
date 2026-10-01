import { z } from "zod";
import { businessSegments } from "./service-suggestions";
import { pageModes, pageSections, pageTemplates } from "./public-page";

export const authSchema = z.object({
  email: z.email("Informe um e-mail válido.").trim().toLowerCase(),
  password: z
    .string()
    .min(8, "A senha precisa ter pelo menos 8 caracteres.")
    .max(72, "A senha pode ter no máximo 72 caracteres."),
});

export const signupSchema = authSchema.extend({
  name: z.string().trim().min(2, "Informe seu nome.").max(80),
});

export const businessSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do negócio.").max(100),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "O link precisa ter pelo menos 3 caracteres.")
    .max(60)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use apenas letras minúsculas, números e hífens.",
    ),
  segment: z.enum(businessSegments),
});

export type BusinessInput = z.infer<typeof businessSchema>;

const optionalText = (maximum: number) => z.string().trim().max(maximum).default("");

export const serviceSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().trim().min(2, "Informe o nome do serviço.").max(100),
  description: optionalText(600),
  durationMinutes: z.coerce.number().int().min(5, "A duração mínima é de 5 minutos.").max(720),
  price: z.coerce.number().min(0, "O preço não pode ser negativo.").max(1_000_000),
});

export const professionalSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().trim().min(2, "Informe o nome do profissional.").max(100),
  description: optionalText(600),
  contact: optionalText(120),
  serviceIds: z.array(z.uuid()).min(1, "Selecione pelo menos um serviço."),
});

export const businessSettingsSchema = businessSchema.omit({ segment: true }).extend({
  description: optionalText(600),
  phone: optionalText(24),
  instagram: optionalText(80),
  address: optionalText(240),
});

export const bookingSchema = z.object({
  slug: businessSchema.shape.slug,
  serviceId: z.uuid("Selecione um serviço."),
  professionalId: z.uuid("Selecione um profissional."),
  startsAt: z.iso.datetime({ offset: true }),
  clientName: z.string().trim().min(2, "Informe seu nome.").max(100),
  clientPhone: z.string().trim().min(8, "Informe um telefone válido.").max(24),
  clientEmail: z.union([z.literal(""), z.email("Informe um e-mail válido.")]).default(""),
});

export const unavailabilitySchema = z.object({
  professionalId: z.uuid("Selecione um profissional."),
  startsLocal: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Informe o início."),
  endsLocal: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Informe o término."),
  reason: optionalText(240),
}).refine((value) => value.startsLocal < value.endsLocal, { message: "O término precisa ser posterior ao início." });

const shortText = (maximum: number) => z.string().trim().max(maximum);
const mediaItemSchema = z.object({ url: z.union([z.literal(""), z.url()]), path: shortText(500), alt: shortText(120) });

export const publicPageConfigSchema = z.object({
  version: z.literal(2),
  mode: z.enum(pageModes),
  template: z.enum(pageTemplates),
  palette: shortText(40),
  theme: z.enum(["light", "dark"]),
  font: z.enum(["editorial", "modern", "classic"]),
  buttonShape: z.enum(["soft", "square", "pill"]),
  cardStyle: z.enum(["flat", "bordered", "elevated"]),
  colors: z.object({
    primary: z.string().regex(/^#[0-9a-f]{6}$/i),
    secondary: z.string().regex(/^#[0-9a-f]{6}$/i),
    button: z.string().regex(/^#[0-9a-f]{6}$/i),
  }),
  content: z.object({
    businessName: shortText(100),
    heroTitle: shortText(120), heroSubtitle: shortText(240), introduction: shortText(800),
    story: shortText(2400),
    primaryButton: shortText(40), bookingNotice: shortText(300), footerText: shortText(240),
    seoTitle: shortText(70), seoDescription: shortText(170),
  }),
  contact: z.object({ whatsapp: shortText(24), instagram: shortText(80), address: shortText(240) }),
  sections: z.array(z.object({ id: z.enum(pageSections), visible: z.boolean() })).length(pageSections.length),
  serviceOrder: z.array(z.uuid()).max(200),
  professionalOrder: z.array(z.uuid()).max(200),
  differentials: z.array(z.object({ id: z.uuid(), title: shortText(80), description: shortText(300) })).max(8),
  testimonials: z.array(z.object({ id: z.uuid(), name: shortText(80), text: shortText(600), context: shortText(120) })).max(12),
  faq: z.array(z.object({ id: z.uuid(), question: shortText(180), answer: shortText(1000) })).max(12),
  professionalCredentials: z.record(z.string(), shortText(240)),
  media: z.object({
    logoUrl: z.union([z.literal(""), z.url()]), logoPath: shortText(500),
    coverUrl: z.union([z.literal(""), z.url()]), coverPath: shortText(500),
    coverType: z.enum(["image", "video"]),
    coverPosterUrl: z.union([z.literal(""), z.url()]), coverPosterPath: shortText(500),
    shareUrl: z.union([z.literal(""), z.url()]), sharePath: shortText(500),
    gallery: z.array(mediaItemSchema).max(12),
    professionalPhotos: z.record(z.string(), z.object({ url: z.url(), path: shortText(500) })),
  }),
}).superRefine((config, context) => {
  if (new Set(config.sections.map((section) => section.id)).size !== pageSections.length) {
    context.addIssue({ code: "custom", message: "A ordem das seções é inválida." });
  }
});
