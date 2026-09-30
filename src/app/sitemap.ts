import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv, hasSupabaseEnv } from "@/lib/supabase/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const pages: MetadataRoute.Sitemap = [{ url: base, changeFrequency: "weekly", priority: 1 }];
  if (!hasSupabaseEnv()) return pages;
  const { url, key } = getSupabaseEnv();
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data } = await supabase.from("businesses").select("slug, updated_at").eq("is_published", true);
  for (const business of data || []) pages.push({ url: `${base}/${business.slug}`, lastModified: business.updated_at, changeFrequency: "weekly", priority: .8 });
  return pages;
}
