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
