"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireBusiness } from "@/lib/dashboard";
import { applyTemplate, createDefaultPageConfig, pageModes, type PageMode, type PageTemplate } from "@/lib/public-page";
import type { BusinessSegment } from "@/lib/service-suggestions";
import { publicPageConfigSchema } from "@/lib/validations";

const path = "/dashboard/pagina-publica";

function destination(key: "sucesso" | "erro", message: string) {
  return `${path}?${key}=${encodeURIComponent(message)}`;
}

function fail(message: string): never { redirect(destination("erro", message)); }
function ok(message: string): never { revalidatePath(path); redirect(destination("sucesso", message)); }

function businessDefaults(business: { name: string; description: string | null; phone: string | null; instagram: string | null; address: string | null; segment: string }) {
  return { ...business, segment: business.segment as BusinessSegment };
}

function parseConfig(value: FormDataEntryValue | null, businessId: string) {
  let raw: unknown;
  try { raw = JSON.parse(String(value || "")); } catch { fail("A configuração enviada é inválida."); }
  const parsed = publicPageConfigSchema.safeParse(raw);
  if (!parsed.success) fail(parsed.error.issues[0]?.message || "Revise a configuração da página.");

  const paths = [parsed.data.media.logoPath, parsed.data.media.coverPath, parsed.data.media.coverPosterPath, parsed.data.media.sharePath,
    ...parsed.data.media.gallery.map((item) => item.path),
    ...Object.values(parsed.data.media.professionalPhotos).map((item) => item.path),
  ].filter(Boolean);
  if (paths.some((mediaPath) => !mediaPath.startsWith(`${businessId}/`))) fail("Uma das imagens não pertence a este negócio.");
  return parsed.data;
}

async function persistDraft(config: ReturnType<typeof publicPageConfigSchema.parse>) {
  const { supabase } = await requireBusiness();
  const { error } = await supabase.rpc("save_public_page_draft", { p_mode: config.mode, p_config: config });
  if (error) fail("Não foi possível salvar o rascunho. Aplique a migration mais recente do Supabase.");
}

function mediaPaths(config: unknown) {
  const parsed = publicPageConfigSchema.safeParse(config);
  if (!parsed.success) return [];
  return [parsed.data.media.logoPath, parsed.data.media.coverPath, parsed.data.media.coverPosterPath, parsed.data.media.sharePath,
    ...parsed.data.media.gallery.map((item) => item.path),
    ...Object.values(parsed.data.media.professionalPhotos).map((item) => item.path),
  ].filter(Boolean);
}

export async function choosePageMode(formData: FormData) {
  const mode = String(formData.get("mode") || "") as PageMode;
  if (!pageModes.includes(mode)) fail("Escolha uma forma válida de montar a página.");
  const { business } = await requireBusiness();
  const config = createDefaultPageConfig(businessDefaults(business), mode);
  await persistDraft(config);
  ok(mode === "manual" ? "Editor manual preparado." : "Modelos profissionais preparados.");
}

export async function savePublicPageDraft(formData: FormData) {
  const { business } = await requireBusiness();
  const config = parseConfig(formData.get("config"), business.id);
  await persistDraft(config);
  ok("Rascunho salvo. A página publicada não foi alterada.");
}

export async function autoSavePublicPageDraft(configJson: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const { supabase, business } = await requireBusiness();
    const parsed = publicPageConfigSchema.safeParse(JSON.parse(configJson));
    if (!parsed.success) return { ok: false, error: "Configuração inválida." };
    const paths = mediaPaths(parsed.data);
    if (paths.some((mediaPath) => !mediaPath.startsWith(`${business.id}/`))) return { ok: false, error: "Arquivo de outro negócio." };
    const { error } = await supabase.rpc("save_public_page_draft", { p_mode: parsed.data.mode, p_config: parsed.data });
    if (error) return { ok: false, error: "Não foi possível salvar." };
    revalidatePath(path);
    return { ok: true };
  } catch {
    return { ok: false, error: "Não foi possível salvar." };
  }
}

export async function saveAndPreviewPublicPage(formData: FormData) {
  const { business } = await requireBusiness();
  const config = parseConfig(formData.get("config"), business.id);
  await persistDraft(config);
  revalidatePath(`${path}/preview`);
  redirect(`${path}/preview`);
}

export async function publishPageChanges(formData: FormData) {
  const { supabase, business } = await requireBusiness();
  const config = parseConfig(formData.get("config"), business.id);
  const { data: previousPage } = await supabase.from("business_public_pages").select("published_config").eq("business_id", business.id).maybeSingle();
  const previousPaths = mediaPaths(previousPage?.published_config);
  const { error: saveError } = await supabase.rpc("save_public_page_draft", { p_mode: config.mode, p_config: config });
  if (saveError) fail("Não foi possível salvar as alterações antes da publicação.");
  const { error } = await supabase.rpc("publish_public_page");
  if (error) {
    const missing = error.message.includes("missing");
    fail(missing ? "Cadastre serviço, profissional e horários antes de publicar." : "Não foi possível publicar a página.");
  }
  const currentPaths = new Set(mediaPaths(config));
  const obsoletePaths = previousPaths.filter((mediaPath) => !currentPaths.has(mediaPath) && mediaPath.startsWith(`${business.id}/`));
  if (obsoletePaths.length) await supabase.storage.from("public-page-media").remove(obsoletePaths);
  revalidatePath(`/${business.slug}`);
  ok("Alterações publicadas com sucesso.");
}

export async function unpublishPublicPage() {
  const { supabase, business } = await requireBusiness();
  const { error } = await supabase.rpc("unpublish_public_page");
  if (error) fail("Não foi possível retirar a página do ar.");
  revalidatePath(`/${business.slug}`);
  ok("Página retirada do ar. Seu rascunho e a última versão publicada foram preservados.");
}

export async function restorePageDefault(formData: FormData) {
  const { business } = await requireBusiness();
  const current = parseConfig(formData.get("config"), business.id);
  const template = current.template as PageTemplate;
  const fresh = createDefaultPageConfig(businessDefaults(business), current.mode, template);
  const restored = current.mode === "template" ? applyTemplate(fresh, template) : { ...fresh, mode: "manual" as const };
  await persistDraft(restored);
  ok("A aparência e os textos padrão foram restaurados. Seus dados operacionais permanecem intactos.");
}
