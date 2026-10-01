import "server-only";

import { requireBusiness } from "./dashboard";
import { normalizePageConfig, type PublicPageConfig } from "./public-page";
import type { BusinessSegment } from "./service-suggestions";

export async function loadPublicPageDashboardData() {
  const { supabase, business } = await requireBusiness();
  const [pageResult, servicesResult, professionalsResult, businessHours, professionalHours] = await Promise.all([
    supabase.from("business_public_pages").select("mode, draft_config, published_config, published_at").eq("business_id", business.id).maybeSingle(),
    supabase.from("services").select("id, name, description, price_cents, duration_minutes").eq("business_id", business.id).eq("is_active", true).order("name"),
    supabase.from("professionals").select("id, name, description, contact, professional_services(service_id)").eq("business_id", business.id).eq("is_active", true).order("name"),
    supabase.from("business_hours").select("id", { count: "exact", head: true }).eq("business_id", business.id),
    supabase.from("professional_hours").select("id", { count: "exact", head: true }).eq("business_id", business.id),
  ]);
  if (pageResult.error) throw new Error("Aplique a migration do estúdio de página pública no Supabase antes de usar este recurso.");
  if (servicesResult.error || professionalsResult.error) throw new Error("Não foi possível carregar os dados da página.");

  const defaults = { ...business, segment: business.segment as BusinessSegment };
  const page = pageResult.data;
  const draft = normalizePageConfig(page?.draft_config, defaults);
  const published = page?.published_config ? normalizePageConfig(page.published_config, defaults) : null;
  const paths = (config: PublicPageConfig | null) => config ? [config.media.logoPath, config.media.coverPath, config.media.sharePath, ...config.media.gallery.map((item) => item.path), ...Object.values(config.media.professionalPhotos).map((item) => item.path)].filter(Boolean) : [];

  return {
    supabase,
    business,
    page,
    draft,
    published,
    publishedPaths: paths(published),
    services: servicesResult.data || [],
    professionals: professionalsResult.data || [],
    ready: Boolean(servicesResult.data?.length && professionalsResult.data?.length && businessHours.count && professionalHours.count),
  };
}
