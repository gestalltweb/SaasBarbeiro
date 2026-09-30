"use server";

import { redirect } from "next/navigation";
import { bookingSchema } from "@/lib/validations";
import { createClient } from "@/lib/supabase/server";

export async function createBooking(formData: FormData) {
  const parsed = bookingSchema.safeParse({
    slug: formData.get("slug"),
    serviceId: formData.get("serviceId"),
    professionalId: formData.get("professionalId"),
    startsAt: formData.get("startsAt"),
    clientName: formData.get("clientName"),
    clientPhone: formData.get("clientPhone"),
    clientEmail: formData.get("clientEmail") || "",
  });

  const slug = String(formData.get("slug") || "");
  if (!parsed.success) {
    redirect(`/${encodeURIComponent(slug)}?erro=${encodeURIComponent(parsed.error.issues[0].message)}#agendar`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_public_appointment", {
    p_slug: parsed.data.slug,
    p_service_id: parsed.data.serviceId,
    p_professional_id: parsed.data.professionalId,
    p_starts_at: parsed.data.startsAt,
    p_client_name: parsed.data.clientName,
    p_client_phone: parsed.data.clientPhone,
    p_client_email: parsed.data.clientEmail,
  });

  if (error) {
    const message = error.message.includes("slot_unavailable")
      ? "Esse horário acabou de ser reservado. Escolha outro disponível."
      : "Não foi possível concluir o agendamento. Revise os dados e tente novamente.";
    redirect(`/${parsed.data.slug}?erro=${encodeURIComponent(message)}&servico=${parsed.data.serviceId}&profissional=${parsed.data.professionalId}#agendar`);
  }

  redirect(`/${parsed.data.slug}?confirmacao=${data}#agendar`);
}
