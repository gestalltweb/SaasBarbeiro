import "server-only";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";

export async function requireBusiness() {
  const { supabase, user } = await requireUser();
  const { data: membership, error } = await supabase
    .from("business_members")
    .select("role, businesses(id, name, slug, segment, description, phone, instagram, address, timezone, is_published)")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (error) throw new Error("Não foi possível carregar o negócio.");
  if (!membership?.businesses) redirect("/onboarding");

  const business = Array.isArray(membership.businesses)
    ? membership.businesses[0]
    : membership.businesses;

  return { supabase, user, membership, business };
}

export function money(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

export function dateTime(value: string, timezone = "America/Sao_Paulo") {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: timezone,
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function dateKey(value: string | Date, timezone = "America/Sao_Paulo") {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(value));
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}
