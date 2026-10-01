"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireBusiness } from "@/lib/dashboard";
import { hasServiceSuggestions, serviceSuggestions, type SuggestedService } from "@/lib/service-suggestions";
import {
  businessSettingsSchema,
  professionalSchema,
  serviceSchema,
  unavailabilitySchema,
} from "@/lib/validations";

function target(path: string, key: "sucesso" | "erro", message: string) {
  return `${path}?${key}=${encodeURIComponent(message)}`;
}

function fail(path: string, message: string): never {
  redirect(target(path, "erro", message));
}

function ok(path: string, message: string): never {
  revalidatePath("/dashboard", "layout");
  redirect(target(path, "sucesso", message));
}

export async function saveService(formData: FormData) {
  const path = "/dashboard/servicos";
  const rawPrice = String(formData.get("price") || "").replace(",", ".");
  const parsed = serviceSchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    description: formData.get("description") || "",
    durationMinutes: formData.get("durationMinutes"),
    price: rawPrice,
  });
  if (!parsed.success) fail(path, parsed.error.issues[0].message);

  const { supabase, business } = await requireBusiness();
  const values = {
    business_id: business.id,
    name: parsed.data.name,
    description: parsed.data.description,
    duration_minutes: parsed.data.durationMinutes,
    price_cents: Math.round(parsed.data.price * 100),
  };
  const query = parsed.data.id
    ? supabase.from("services").update(values).eq("id", parsed.data.id).eq("business_id", business.id)
    : supabase.from("services").insert(values);
  const { error } = await query;
  if (error) fail(path, "Não foi possível salvar o serviço.");
  ok(path, parsed.data.id ? "Serviço atualizado." : "Serviço cadastrado.");
}

export async function setServiceActive(formData: FormData) {
  const path = "/dashboard/servicos";
  const id = String(formData.get("id") || "");
  const active = formData.get("active") === "true";
  const { supabase, business } = await requireBusiness();
  const { error } = await supabase.from("services").update({ is_active: active }).eq("id", id).eq("business_id", business.id);
  if (error) fail(path, "Não foi possível alterar o serviço.");
  ok(path, active ? "Serviço ativado." : "Serviço pausado.");
}

export async function deleteService(formData: FormData) {
  const path = "/dashboard/servicos";
  const { supabase, business } = await requireBusiness();
  const { error } = await supabase.from("services").delete().eq("id", String(formData.get("id") || "")).eq("business_id", business.id);
  if (error) fail(path, "Esse serviço possui histórico. Desative-o para preservá-lo.");
  ok(path, "Serviço excluído.");
}

export async function addSuggestedServices() {
  const path = "/dashboard/servicos";
  const { supabase, business } = await requireBusiness();
  if (!hasServiceSuggestions(business.segment)) {
    fail(path, "Não existem sugestões prontas para este segmento. Cadastre seus serviços personalizados.");
  }

  let added = 0;
  const { data, error } = await supabase.rpc("add_suggested_services");
  if (!error && typeof data === "number") {
    added = data;
  }

  if (added === 0 && business.segment in serviceSuggestions) {
    const suggestions = (serviceSuggestions as Record<string, readonly SuggestedService[]>)[business.segment] || [];
    if (suggestions.length > 0) {
      const { data: existing } = await supabase
        .from("services")
        .select("name, suggestion_key")
        .eq("business_id", business.id);

      const existingKeys = new Set(existing?.map((s) => s.suggestion_key).filter(Boolean));
      const existingNames = new Set(existing?.map((s) => s.name.toLowerCase().trim()));

      const toInsert = suggestions
        .filter((s) => !existingKeys.has(s.key) && !existingNames.has(s.name.toLowerCase().trim()))
        .map((s) => ({
          business_id: business.id,
          suggestion_key: s.key,
          name: s.name,
          description: s.description,
          duration_minutes: s.durationMinutes,
          price_cents: s.priceCents,
        }));

      if (toInsert.length > 0) {
        const { error: insertError } = await supabase.from("services").insert(toInsert);
        if (!insertError) {
          added = toInsert.length;
        }
      }
    }
  }

  if (added === 0) ok(path, "Todos os serviços sugeridos já estão cadastrados.");
  ok(path, `${added} ${added === 1 ? "serviço sugerido adicionado" : "serviços sugeridos adicionados"}.`);
}

export async function saveProfessional(formData: FormData) {
  const path = "/dashboard/profissionais";
  const parsed = professionalSchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    description: formData.get("description") || "",
    contact: formData.get("contact") || "",
    serviceIds: formData.getAll("serviceIds"),
  });
  if (!parsed.success) fail(path, parsed.error.issues[0].message);

  const { supabase, business } = await requireBusiness();
  let professionalId = parsed.data.id;
  if (professionalId) {
    const { error } = await supabase.from("professionals").update({
      name: parsed.data.name,
      description: parsed.data.description,
      contact: parsed.data.contact,
    }).eq("id", professionalId).eq("business_id", business.id);
    if (error) fail(path, "Não foi possível atualizar o profissional.");
  } else {
    const { data, error } = await supabase.from("professionals").insert({
      business_id: business.id,
      name: parsed.data.name,
      description: parsed.data.description,
      contact: parsed.data.contact,
    }).select("id").single();
    if (error || !data) fail(path, "Não foi possível cadastrar o profissional.");
    professionalId = data.id;
  }

  const { error: deleteError } = await supabase.from("professional_services").delete().eq("professional_id", professionalId).eq("business_id", business.id);
  if (deleteError) fail(path, "O profissional foi salvo, mas os serviços não puderam ser atualizados.");
  const { error: linkError } = await supabase.from("professional_services").insert(
    parsed.data.serviceIds.map((serviceId) => ({ business_id: business.id, professional_id: professionalId, service_id: serviceId })),
  );
  if (linkError) fail(path, "O profissional foi salvo, mas os serviços selecionados são inválidos.");
  ok(path, parsed.data.id ? "Profissional atualizado." : "Profissional cadastrado.");
}

export async function setProfessionalActive(formData: FormData) {
  const path = "/dashboard/profissionais";
  const { supabase, business } = await requireBusiness();
  const active = formData.get("active") === "true";
  const { error } = await supabase.from("professionals").update({ is_active: active }).eq("id", String(formData.get("id") || "")).eq("business_id", business.id);
  if (error) fail(path, "Não foi possível alterar o profissional.");
  ok(path, active ? "Profissional ativado." : "Profissional pausado.");
}

export async function deleteProfessional(formData: FormData) {
  const path = "/dashboard/profissionais";
  const { supabase, business } = await requireBusiness();
  const { error } = await supabase.from("professionals").delete().eq("id", String(formData.get("id") || "")).eq("business_id", business.id);
  if (error) fail(path, "Esse profissional possui histórico. Desative-o para preservá-lo.");
  ok(path, "Profissional excluído.");
}

type IntervalRow = { business_id: string; day_of_week: number; start_time: string; end_time: string };

function readWeek(formData: FormData, businessId: string) {
  const rows: IntervalRow[] = [];
  for (let day = 0; day < 7; day += 1) {
    if (formData.get(`day-${day}-enabled`) !== "on") continue;
    const start = String(formData.get(`day-${day}-start`) || "");
    const end = String(formData.get(`day-${day}-end`) || "");
    const breakStart = String(formData.get(`day-${day}-break-start`) || "");
    const breakEnd = String(formData.get(`day-${day}-break-end`) || "");
    if (!/^\d{2}:\d{2}$/.test(start) || !/^\d{2}:\d{2}$/.test(end) || start >= end) throw new Error(`Horário inválido no dia ${day}.`);
    if (breakStart || breakEnd) {
      if (!breakStart || !breakEnd || breakStart <= start || breakEnd >= end || breakStart >= breakEnd) throw new Error(`Intervalo inválido no dia ${day}.`);
      rows.push({ business_id: businessId, day_of_week: day, start_time: start, end_time: breakStart });
      rows.push({ business_id: businessId, day_of_week: day, start_time: breakEnd, end_time: end });
    } else {
      rows.push({ business_id: businessId, day_of_week: day, start_time: start, end_time: end });
    }
  }
  return rows;
}

export async function saveBusinessHours(formData: FormData) {
  const path = "/dashboard/horarios";
  const { supabase, business } = await requireBusiness();
  let rows: IntervalRow[];
  try { rows = readWeek(formData, business.id); } catch (error) { fail(path, error instanceof Error ? error.message : "Revise os horários."); }
  if (!rows.length) fail(path, "Configure pelo menos um dia de funcionamento.");
  const { error: deleteError } = await supabase.from("business_hours").delete().eq("business_id", business.id);
  if (deleteError) fail(path, "Não foi possível atualizar o expediente.");
  const { error } = await supabase.from("business_hours").insert(rows);
  if (error) fail(path, "Não foi possível salvar o expediente.");
  ok(path, "Horário do negócio atualizado.");
}

export async function saveProfessionalHours(formData: FormData) {
  const path = "/dashboard/horarios";
  const { supabase, business } = await requireBusiness();
  const professionalId = String(formData.get("professionalId") || "");
  let baseRows: IntervalRow[];
  try { baseRows = readWeek(formData, business.id); } catch (error) { fail(path, error instanceof Error ? error.message : "Revise os horários."); }
  if (!baseRows.length) fail(path, "Configure pelo menos um dia para o profissional.");
  const rows = baseRows.map((row) => ({ ...row, professional_id: professionalId }));
  const { error: deleteError } = await supabase.from("professional_hours").delete().eq("business_id", business.id).eq("professional_id", professionalId);
  if (deleteError) fail(path, "Não foi possível atualizar a jornada.");
  const { error } = await supabase.from("professional_hours").insert(rows);
  if (error) fail(path, "Não foi possível salvar a jornada do profissional.");
  ok(path, "Horário do profissional atualizado.");
}

export async function createUnavailability(formData: FormData) {
  const path = "/dashboard/horarios";
  const parsed = unavailabilitySchema.safeParse({
    professionalId: formData.get("professionalId"),
    startsLocal: formData.get("startsLocal"),
    endsLocal: formData.get("endsLocal"),
    reason: formData.get("reason") || "",
  });
  if (!parsed.success) fail(path, parsed.error.issues[0].message);
  const { supabase, business } = await requireBusiness();
  const { error } = await supabase.rpc("create_unavailability_local", {
    p_business_id: business.id,
    p_professional_id: parsed.data.professionalId,
    p_starts_local: parsed.data.startsLocal.replace("T", " "),
    p_ends_local: parsed.data.endsLocal.replace("T", " "),
    p_reason: parsed.data.reason,
  });
  if (error) fail(path, "Não foi possível criar a indisponibilidade.");
  ok(path, "Indisponibilidade adicionada.");
}

export async function deleteUnavailability(formData: FormData) {
  const path = "/dashboard/horarios";
  const { supabase, business } = await requireBusiness();
  const { error } = await supabase.from("unavailabilities").delete().eq("id", String(formData.get("id") || "")).eq("business_id", business.id);
  if (error) fail(path, "Não foi possível remover a indisponibilidade.");
  ok(path, "Indisponibilidade removida.");
}

export async function updateAppointmentStatus(formData: FormData) {
  const path = "/dashboard/agenda";
  const status = String(formData.get("status") || "");
  if (!["confirmed", "cancelled", "completed"].includes(status)) fail(path, "Status inválido.");
  const { supabase, business } = await requireBusiness();
  const { error } = await supabase.from("appointments").update({ status }).eq("id", String(formData.get("id") || "")).eq("business_id", business.id);
  if (error) fail(path, "Não foi possível atualizar o atendimento.");
  ok(path, "Atendimento atualizado.");
}

export async function updateBusinessSettings(formData: FormData) {
  const path = "/dashboard/configuracoes";
  const parsed = businessSettingsSchema.safeParse({
    name: formData.get("name"), slug: formData.get("slug"),
    description: formData.get("description") || "", phone: formData.get("phone") || "",
    instagram: formData.get("instagram") || "", address: formData.get("address") || "",
  });
  if (!parsed.success) fail(path, parsed.error.issues[0].message);
  const { supabase, business } = await requireBusiness();
  const { error } = await supabase.from("businesses").update(parsed.data).eq("id", business.id);
  if (error?.code === "23505") fail(path, "Esse endereço de página já está em uso.");
  if (error) fail(path, "Não foi possível atualizar as configurações.");
  ok(path, "Configurações atualizadas.");
}
