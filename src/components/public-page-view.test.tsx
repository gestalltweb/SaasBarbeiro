import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PublicPageView } from "./public-page-view";
import { applyTemplate, createDefaultPageConfig, pageTemplates } from "@/lib/public-page";

const business = { name: "Studio Teste", slug: "studio-teste", description: "Descrição", phone: "", instagram: "", address: "", timezone: "America/Sao_Paulo", segment: "other" as const };
const activeService = { id: "10000000-0000-0000-0000-000000000001", name: "Serviço ativo", description: "", price_cents: 4000, duration_minutes: 30, is_active: true };
const pausedService = { ...activeService, id: "10000000-0000-0000-0000-000000000002", name: "Serviço pausado", is_active: false };
const activeProfessional = { id: "20000000-0000-0000-0000-000000000001", name: "Profissional ativo", description: "", contact: "", is_active: true, professional_services: [{ service_id: activeService.id }] };
const inactiveProfessional = { ...activeProfessional, id: "20000000-0000-0000-0000-000000000002", name: "Profissional inativo", is_active: false };
const hours = [{ day_of_week: 1, start_time: "09:00:00", end_time: "18:00:00" }];

describe("PublicPageView templates", () => {
  it.each(pageTemplates)("renders the independent %s template with real booking and mobile CTA", (template) => {
    const config = applyTemplate(createDefaultPageConfig(business), template);
    const html = renderToStaticMarkup(<PublicPageView business={business} services={[activeService]} professionals={[activeProfessional]} businessHours={hours} config={config} booking={<form><button type="submit">Confirmar agendamento</button></form>} />);
    expect(html).toContain(`data-template="${template}"`);
    expect(html).toContain("Confirmar agendamento");
    expect(html).toContain("pp-mobile-cta");
  });

  it("filters paused services and inactive professionals defensively", () => {
    const config = createDefaultPageConfig(business);
    const html = renderToStaticMarkup(<PublicPageView business={business} services={[activeService, pausedService]} professionals={[activeProfessional, inactiveProfessional]} businessHours={hours} config={config} booking={<span>Agendamento</span>} />);
    expect(html).toContain("Serviço ativo"); expect(html).not.toContain("Serviço pausado");
    expect(html).toContain("Profissional ativo"); expect(html).not.toContain("Profissional inativo");
  });

  it("hides optional empty sections and renders a fallback without images", () => {
    const config = createDefaultPageConfig(business); config.sections = config.sections.map((section) => ({ ...section, visible: true }));
    const html = renderToStaticMarkup(<PublicPageView business={business} services={[activeService]} professionals={[activeProfessional]} businessHours={hours} config={config} booking={<span>Agendamento</span>} />);
    expect(html).not.toContain("Experiências reais"); expect(html).not.toContain("Dúvidas frequentes"); expect(html).toContain("pp-cover-fallback");
  });

  it.each(pageTemplates)("renders every enabled content block in %s", (template) => {
    const config = applyTemplate(createDefaultPageConfig(business), template);
    config.content.story = "História verdadeira do negócio";
    config.differentials = [{ id: "30000000-0000-0000-0000-000000000001", title: "Diferencial real", description: "Descrição real" }];
    config.testimonials = [{ id: "40000000-0000-0000-0000-000000000001", name: "Cliente real", text: "Relato autorizado", context: "" }];
    config.faq = [{ id: "50000000-0000-0000-0000-000000000001", question: "Pergunta real?", answer: "Resposta real" }];
    config.sections = config.sections.map((section) => ({ ...section, visible: true }));
    const html = renderToStaticMarkup(<PublicPageView business={business} services={[activeService]} professionals={[activeProfessional]} businessHours={hours} config={config} booking={<span>Agendamento</span>} />);
    expect(html).toContain("História verdadeira do negócio");
    expect(html).toContain("Diferencial real");
    expect(html).toContain("Relato autorizado");
    expect(html).toContain("Pergunta real?");
  });
});
