import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  Check,
  Clock3,
  AtSign,
  LayoutDashboard,
  Link2,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { brand } from "@/lib/brand";
import { getSiteUrl } from "@/lib/site-url";
import { Reveal } from "@/components/motion";
import { BookingDemo } from "@/components/booking-demo";


export default function Home() {
  return (
    <main className="marketing-page">
      <header className="site-header">
        <Link className="brand" href="/" aria-label={`${brand.name}, início`}>
          <span className="brand-mark" aria-hidden="true">A</span>
          <span>{brand.name}</span>
        </Link>
        <nav className="desktop-nav" aria-label="Navegação principal">
          <a href="#como-funciona">Como funciona</a>
          <a href="#recursos">Recursos</a>
          <a href="#plano">Plano</a>
        </nav>
        <div className="header-actions">
          <Link className="text-link" href="/entrar">Entrar</Link>
          <Link className="button button-small" href="/cadastro">
            Criar minha página <ArrowRight size={16} />
          </Link>
          <Link className="mobile-menu" href="/cadastro" aria-label="Criar minha página">
            <ArrowRight size={22} />
          </Link>
        </div>
      </header>

      <section className="hero page-shell">
        <div className="hero-copy">
          <div className="hero-note"><Sparkles size={16} /> Sua agenda e seu site, juntos</div>
          <h1><span className="word-reveal" style={{ "--word-delay": "0ms" } as React.CSSProperties}>Sua</span> <span className="word-reveal" style={{ "--word-delay": "70ms" } as React.CSSProperties}>página</span> <span className="word-reveal" style={{ "--word-delay": "140ms" } as React.CSSProperties}>e sua agenda,</span> <em><span className="word-reveal" style={{ "--word-delay": "210ms" } as React.CSSProperties}>no mesmo lugar.</span></em></h1>
          <p>
            Tenha uma página profissional com seus serviços, sua identidade e
            horários disponíveis. Seu cliente escolhe e agenda sem mandar mensagem.
          </p>
          <div className="hero-actions">
            <Link className="button" href="/cadastro">Começar agora <ArrowRight size={18} /></Link>
            <Link className="button button-secondary" href="#como-funciona">Conhecer o processo</Link>
          </div>
          <div className="trust-line">
            <span><Check size={16} /> Configuração guiada</span>
            <span><Check size={16} /> Feito para celular</span>
            <span><Check size={16} /> Serviços, equipe e horários</span>
          </div>
        </div>

        <BookingDemo />
      </section>

      <section className="proof-strip" aria-label="Benefícios principais">
        <span><Link2 size={19} /> Um link para divulgar</span>
        <span><Clock3 size={19} /> Menos tempo no WhatsApp</span>
        <span><CalendarCheck size={19} /> Sem choque de horários</span>
        <span><ShieldCheck size={19} /> Dados de cada negócio isolados</span>
      </section>

      <Reveal className="motion-section"><section className="booking-flow page-shell" aria-labelledby="booking-flow-title">
        <div className="story-heading"><h2 id="booking-flow-title">Veja um agendamento acontecer.</h2><p>O cliente escolhe o que precisa, encontra um horário e envia a reserva pela sua página.</p></div>
        <div className="booking-flow-grid">
          <article><span className="flow-index">01</span><strong>Serviço</strong><small>Atendimento individual</small></article>
          <span className="journey-arrow"><ArrowRight /></span>
          <article><span className="flow-index">02</span><strong>Profissional</strong><small>Quem vai atender</small></article>
          <span className="journey-arrow"><ArrowRight /></span>
          <article><span className="flow-index">03</span><strong>Horário</strong><small>Terça, 29 de setembro · 10:00</small></article>
          <span className="journey-arrow"><ArrowRight /></span>
          <article className="flow-result"><span className="flow-index">04</span><strong>Reserva criada</strong><small>Entra na agenda como pendente</small></article>
        </div>
      </section></Reveal>

      <Reveal className="motion-section"><section className="story-section page-shell" id="como-funciona">
        <div className="story-heading"><h2>Menos mensagens para combinar um horário.</h2><p>O caminho é curto para quem divulga e ainda mais curto para quem agenda.</p></div>
        <div className="journey">
          <article><span className="step-icon"><AtSign size={23} /></span><h3>Divulgue seu link</h3><p>Coloque sua página na bio, no Google ou envie diretamente pelo WhatsApp.</p></article>
          <span className="journey-arrow"><ArrowRight /></span>
          <article><span className="step-icon"><Users size={23} /></span><h3>Seu cliente escolhe</h3><p>Ele conhece seu trabalho, compara serviços e vê somente horários livres.</p></article>
          <span className="journey-arrow"><ArrowRight /></span>
          <article><span className="step-icon"><CalendarCheck size={23} /></span><h3>Você recebe organizado</h3><p>A reserva entra na agenda do profissional como pendente, para você confirmar e atender.</p></article>
        </div>
      </section></Reveal>

      <Reveal className="motion-section"><section className="showcase" id="recursos">
        <div className="page-shell showcase-grid">
          <div className="phone-frame">
            <div className="phone-browser" aria-label="Página ilustrativa; preços e serviços de exemplo"><span /><span>{getSiteUrl()}/seu-negocio</span></div>
            <div className="phone-cover"><span className="mini-logo">SN</span><p>Seu Negócio</p><h3>Seu atendimento começa com hora marcada.</h3><div className="phone-location"><MapPin size={14} /> Centro · São Paulo</div></div>
            <div className="phone-services"><span>Serviços</span><div><strong>Atendimento individual</strong><b>Seu preço</b><small>Sua duração</small></div><div><strong>Sessão personalizada</strong><b>Seu preço</b><small>Sua duração</small></div><Link href="#booking-flow-title">Experimentar o agendamento</Link></div>
          </div>
          <div className="showcase-copy">
            <h2>Uma página que trabalha antes de você responder.</h2>
            <p>Sua identidade, seus serviços e sua disponibilidade real em uma experiência pensada para transformar visitas em horários marcados.</p>
            <ul><li><Check /> Link exclusivo para o seu negócio</li><li><Check /> Serviços, preços e duração</li><li><Check /> Profissionais e horários disponíveis</li><li><Check /> Localização e contato em um só lugar</li></ul>
            <Link className="inline-arrow" href="/cadastro">Criar minha página <ArrowRight size={18} /></Link>
          </div>
        </div>
      </section></Reveal>

      <Reveal className="motion-section"><section className="dashboard-section page-shell">
        <div className="dashboard-copy"><h2>Seu dia inteiro, sem procurar conversa por conversa.</h2><p>Veja o que vem a seguir, organize a equipe e mantenha as informações do negócio atualizadas em um painel direto.</p><div className="feature-lines"><span><LayoutDashboard /> Visão clara da operação</span><span><CalendarCheck /> Agenda por profissional</span><span><Users /> Histórico dos seus clientes</span></div></div>
        <div className="dashboard-preview" aria-label="Prévia ilustrativa do painel administrativo">
          <div className="preview-sidebar"><span className="preview-mark">A</span><i /><i /><i /><i /></div>
          <div className="preview-content"><div className="preview-title"><div><small>Exemplo visual</small><strong>Sua agenda de hoje</strong></div><Link href="/cadastro">Criar minha agenda</Link></div><div className="preview-summary"><span><small>Agendamentos</small><b>—</b></span><span><small>Confirmados</small><b>—</b></span><span><small>Horários livres</small><b>—</b></span></div><div className="preview-table"><span>09:00</span><b>Cliente</b><small>Serviço</small><em>Confirmado</em><span>10:00</span><b>Cliente</b><small>Serviço</small><em>Confirmado</em><span>11:30</span><b>Cliente</b><small>Serviço</small><em className="pending">Pendente</em></div></div>
        </div>
      </section></Reveal>

      <Reveal className="motion-section"><section className="plan-section page-shell" id="plano">
        <div className="plan-copy"><h2>Um plano simples para colocar sua agenda online.</h2><p>Comece com a página personalizada e tudo o que precisa para receber agendamentos. O valor será anunciado antes do lançamento comercial.</p></div>
        <div className="plan-board"><div><span>Plano inicial</span><strong>Agendamento + página personalizada</strong></div><ul><li><Check /> Página pública</li><li><Check /> Agenda online</li><li><Check /> Serviços e profissionais</li><li><Check /> Painel administrativo</li></ul><Link className="button" href="/cadastro">Criar minha conta <ArrowRight size={18} /></Link></div>
      </section></Reveal>

      <Reveal><section className="marketing-faq page-shell" id="duvidas"><div className="story-heading"><h2>Antes de começar.</h2><p>O que você precisa saber sobre sua página e sua agenda.</p></div>
        <details><summary>Serve apenas para barbearias?</summary><p>Não. O Agenda Local atende barbearias, salões, estética e outros negócios que trabalham com hora marcada.</p></details>
        <details><summary>Como os horários ficam disponíveis?</summary><p>A disponibilidade considera o serviço, a jornada do profissional, o expediente do negócio, os bloqueios e os agendamentos existentes.</p></details>
        <details><summary>Meu cliente precisa criar uma conta?</summary><p>Não. Ele escolhe o atendimento e informa seus dados de contato na página pública do negócio.</p></details>
        <details><summary>A página é publicada assim que eu cadastro?</summary><p>Não. Configure serviços, profissionais e horários, revise o rascunho e publique manualmente quando estiver pronto.</p></details>
        <details><summary>Qual é o preço?</summary><p>O valor do plano ainda não foi definido. Será informado antes do lançamento comercial.</p></details>
      </section></Reveal>
      <section className="final-cta"><div className="page-shell final-cta-inner"><div><h2>Seu próximo cliente pode agendar sozinho.</h2><p>Crie sua conta e comece a montar a página do seu negócio.</p></div><Link className="button button-light" href="/cadastro">Começar agora <ArrowRight size={18} /></Link></div></section>

      <footer className="site-footer page-shell">
        <div><Link className="brand" href="/"><span className="brand-mark">A</span><span>{brand.name}</span></Link><p>{brand.description}</p></div>
        <div><strong>Produto</strong><a href="#como-funciona">Como funciona</a><a href="#recursos">Recursos</a><a href="#plano">Plano</a></div>
        <div><strong>Acesso</strong><Link href="/entrar">Entrar</Link><Link href="/cadastro">Criar conta</Link></div>
        <p className="footer-note">© 2026 {brand.name}. Projeto em desenvolvimento.</p>
      </footer>
    </main>
  );
}
