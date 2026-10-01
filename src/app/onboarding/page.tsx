import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { brand } from "@/lib/brand";
import { segmentOptions } from "@/lib/service-suggestions";
import { createBusiness } from "./actions";

export const metadata: Metadata = { title: "Configure seu negócio" };

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireUser();
  const params = await searchParams;
  const error = typeof params.erro === "string" ? params.erro : null;

  return (
    <main className="onboarding-page">
      <header className="onboarding-header"><Link className="brand" href="/"><span className="brand-mark">A</span><span>{brand.name}</span></Link><span>Primeiros passos</span></header>
      <section className="onboarding-layout page-shell">
        <aside className="onboarding-aside"><Link href="/"><ArrowLeft size={17} /> Voltar ao site</Link><h1>Vamos criar a casa digital do seu negócio.</h1><p>Começamos com o essencial. Você poderá completar os detalhes e personalizar a página dentro do painel.</p><ol><li className="active"><span>1</span><div><b>Identificação</b><small>Nome, segmento e link</small></div></li><li><span>2</span><div><b>Informações</b><small>Depois, no painel</small></div></li><li><span>3</span><div><b>Publicação</b><small>Quando estiver tudo pronto</small></div></li></ol></aside>
        <div className="onboarding-form-card"><span className="progress-text">Etapa 1 de 3</span><h2>Conte sobre seu negócio</h2><p>Essas informações criam sua área segura e reservam o endereço da sua página.</p>{error && <p className="form-message" role="alert">{error}</p>}<form className="form-stack" action={createBusiness}><div className="field"><label htmlFor="name">Nome do negócio</label><input id="name" name="name" placeholder="Ex.: Barbearia do João" required /></div><div className="field"><label htmlFor="segment">Segmento</label><select id="segment" name="segment" defaultValue="barbershop">{segmentOptions.map((segment) => <option key={segment.value} value={segment.value}>{segment.label}</option>)}</select><small>Usaremos o segmento para criar sugestões editáveis de serviços.</small></div><div className="field"><label htmlFor="slug">Link da sua página</label><div className="slug-field"><span>{brand.domain}/</span><input id="slug" name="slug" placeholder="meu-negocio" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required /></div><small>Use letras minúsculas, números e hífens.</small></div><button className="button" type="submit">Criar meu negócio <Check size={18} /></button></form></div>
      </section>
    </main>
  );
}
