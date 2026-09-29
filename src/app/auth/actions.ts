"use server";

import { redirect } from "next/navigation";
import { authSchema, signupSchema } from "@/lib/validations";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

function messageUrl(path: string, key: "erro" | "mensagem", message: string) {
  return `${path}?${key}=${encodeURIComponent(message)}`;
}

export async function signIn(formData: FormData) {
  if (!hasSupabaseEnv()) redirect(messageUrl("/entrar", "erro", "Conecte o projeto ao Supabase antes de entrar."));

  const parsed = authSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) redirect(messageUrl("/entrar", "erro", parsed.error.issues[0].message));

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) redirect(messageUrl("/entrar", "erro", "E-mail ou senha incorretos."));
  redirect("/dashboard");
}

export async function signUp(formData: FormData) {
  if (!hasSupabaseEnv()) redirect(messageUrl("/cadastro", "erro", "Conecte o projeto ao Supabase antes de criar uma conta."));

  const parsed = signupSchema.safeParse({ name: formData.get("name"), email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) redirect(messageUrl("/cadastro", "erro", parsed.error.issues[0].message));

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { full_name: parsed.data.name } },
  });

  if (error) redirect(messageUrl("/cadastro", "erro", error.message));
  if (!data.session) redirect(messageUrl("/entrar", "mensagem", "Conta criada. Confirme seu e-mail para continuar."));
  redirect("/onboarding");
}

export async function signOut() {
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}
