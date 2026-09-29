"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { businessSchema } from "@/lib/validations";

export async function createBusiness(formData: FormData) {
  const { supabase } = await requireUser();
  const parsed = businessSchema.safeParse({ name: formData.get("name"), slug: formData.get("slug"), segment: formData.get("segment") });
  if (!parsed.success) redirect(`/onboarding?erro=${encodeURIComponent(parsed.error.issues[0].message)}`);

  const { error } = await supabase.rpc("create_business", {
    business_name: parsed.data.name,
    business_slug: parsed.data.slug,
    business_segment: parsed.data.segment,
  });

  if (error) {
    const message = error.code === "23505" ? "Esse link já está em uso. Escolha outro." : "Não foi possível criar o negócio. Tente novamente.";
    redirect(`/onboarding?erro=${encodeURIComponent(message)}`);
  }
  redirect("/dashboard");
}
