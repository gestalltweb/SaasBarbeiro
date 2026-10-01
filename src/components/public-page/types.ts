import type { PublicPageConfig } from "@/lib/public-page";

export type PublicPageBusiness = { name: string; slug: string; description: string | null; address: string | null; phone: string | null; instagram: string | null; timezone: string };
export type PublicPageService = { id: string; name: string; description: string; price_cents: number; duration_minutes: number; is_active?: boolean };
export type PublicPageProfessional = { id: string; name: string; description: string; contact: string; is_active?: boolean; professional_services: Array<{ service_id: string }> };
export type PublicPageBusinessHour = { day_of_week: number; start_time: string; end_time: string };
export type PublicTemplateProps = {
  business: PublicPageBusiness;
  services: PublicPageService[];
  professionals: PublicPageProfessional[];
  businessHours: PublicPageBusinessHour[];
  config: PublicPageConfig;
  booking: React.ReactNode;
  preview?: boolean;
};
