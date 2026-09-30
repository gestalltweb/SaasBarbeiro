import { z } from "zod";

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
  segment: z.enum(["barbershop", "hair_salon", "aesthetics", "other"]),
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
