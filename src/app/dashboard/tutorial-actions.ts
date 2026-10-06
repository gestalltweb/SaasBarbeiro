"use server";

import { revalidatePath } from "next/cache";
import { requireBusiness } from "@/lib/dashboard";

type PreferencePayload = { acknowledgedSteps?: string[]; dismissed?: boolean; completed?: boolean };

export async function updateTutorialPreference(payload: PreferencePayload): Promise<{ ok: boolean; error?: string }> {
  const { supabase, business, user } = await requireBusiness();
  const values = {
    business_id: business.id,
    user_id: user.id,
    acknowledged_steps: payload.acknowledgedSteps,
    is_dismissed: payload.dismissed,
    is_completed: payload.completed,
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from("business_tutorial_preferences").upsert(values, { onConflict: "business_id,user_id" });
  if (error) return { ok: false, error: "Não foi possível salvar a preferência do tutorial." };
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function resetTutorialPreference() {
  const { supabase, business, user } = await requireBusiness();
  await supabase.from("business_tutorial_preferences").upsert({
    business_id: business.id, user_id: user.id, acknowledged_steps: [], is_dismissed: false, is_completed: false, updated_at: new Date().toISOString(),
  }, { onConflict: "business_id,user_id" });
  revalidatePath("/dashboard");
}
