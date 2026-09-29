import "server-only";
import { redirect } from "next/navigation";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function requireUser() {
  if (!hasSupabaseEnv()) redirect("/entrar?config=pendente");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/entrar");
  return { supabase, user };
}
