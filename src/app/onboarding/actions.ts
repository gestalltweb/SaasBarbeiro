"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { businessSchema } from "@/lib/validations";
import { serviceSuggestions, type SuggestedService } from "@/lib/service-suggestions";

export async function createBusiness(formData: FormData) {
  const { supabase } = await requireUser();
  const parsed = businessSchema.safeParse({ name: formData.get("name"), slug: formData.get("slug"), segment: formData.get("segment") });
  if (!parsed.success) redirect(`/onboarding?erro=${encodeURIComponent(parsed.error.issues[0].message)}`);

  let { data: created, error } = await supabase.rpc("create_business", {
    business_name: parsed.data.name,
    business_slug: parsed.data.slug,
    business_segment: parsed.data.segment,
  });

  if (error && (error.message.includes("enum") || error.code === "22P02")) {
    const fallback = await supabase.rpc("create_business", {
      business_name: parsed.data.name,
      business_slug: parsed.data.slug,
      business_segment: "other",
    });
    created = fallback.data;
    error = fallback.error;
  }

  if (error) {
    const message = error.code === "23505" ? "Esse link já está em uso. Escolha outro." : "Não foi possível criar o negócio. Tente novamente.";
    redirect(`/onboarding?erro=${encodeURIComponent(message)}`);
  }

  try {
    const businessId = (created as { id?: string })?.id;
    if (businessId && parsed.data.segment in serviceSuggestions) {
      const suggestions = (serviceSuggestions as Record<string, readonly SuggestedService[]>)[parsed.data.segment] || [];
      if (suggestions.length > 0) {
        const { count } = await supabase.from("services").select("id", { count: "exact", head: true }).eq("business_id", businessId);
        if ((count ?? 0) === 0) {
          await supabase.from("services").insert(
            suggestions.map((s) => ({
              business_id: businessId,
              suggestion_key: s.key,
              name: s.name,
              description: s.description,
              duration_minutes: s.durationMinutes,
              price_cents: s.priceCents,
            }))
          );
        }
      }
    }
  } catch {
    // Non-blocking
  }

  redirect("/dashboard");
}
