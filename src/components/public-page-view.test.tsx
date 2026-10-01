import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PublicPageView } from "./public-page-view";
import { applyTemplate, createDefaultPageConfig, type PageTemplate } from "@/lib/public-page";

const business = { name: "Studio Teste", slug: "studio-teste", description: "Descrição", phone: "", instagram: "", address: "", timezone: "America/Sao_Paulo", segment: "other" as const };
const service = { id: "10000000-0000-0000-0000-000000000001", name: "Serviço", description: "", price_cents: 4000, duration_minutes: 30 };
const professional = { id: "20000000-0000-0000-0000-000000000001", name: "Profissional", description: "", contact: "", professional_services: [{ service_id: service.id }] };

describe("PublicPageView", () => {
  it.each(["noir", "editorial", "botanical", "urban"] as PageTemplate[])("keeps the booking flow in the %s template", (template) => {
    const config = applyTemplate(createDefaultPageConfig(business), template);
    const html = renderToStaticMarkup(<PublicPageView business={business} services={[service]} professionals={[professional]} config={config} booking={<form data-testid="booking"><button type="submit">Confirmar agendamento</button></form>} />);
    expect(html).toContain(`template-${template}`);
    expect(html).toContain("Confirmar agendamento");
    expect(html).toContain("public-mobile-cta");
  });
});
