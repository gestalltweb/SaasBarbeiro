import Link from "next/link";
import { ArrowRight, BellRing, CalendarCheck, Check, MessageCircleMore } from "lucide-react";
import { brand } from "@/lib/brand";
import { Reveal } from "@/components/motion";
import { BookingDemo } from "@/components/booking-demo";
import { DashboardExplorer, MarketingFaq, PhonePreview, StartTimeline, TimeComparison } from "@/components/marketing-experience";
import { HeroVideo } from "@/components/hero-video";

export default function Home() {
  return (
    <main className="marketing-page marketing-v2">
      <header className="site-header">
        <Link className="brand" href="/" aria-label={`${brand.name}, início`}><span className="brand-mark" aria-hidden="true">A</span><span>{brand.name}</span></Link>
        <nav className="desktop-nav" aria-label="Navegação principal"><a href="#como-funciona">Como funciona</a><a href="#recursos">Recursos</a><a href="#plano">Plano</a></nav>
        <div className="header-actions"><Link className="text-link" href="/entrar">Entrar</Link><Link className="button button-small" href="/cadastro">Criar minha página <ArrowRight size={16} /></Link><Link className="mobile-menu" href="/cadastro" aria-label="Criar minha página"><ArrowRight size={22} /></Link></div>
      </header>

      <section className="v2-hero" aria-label="Demonstração do Agenda Local">
        <HeroVideo />
        <div className="v2-hero-content page-shell">
          <div className="v2-intro-copy">
            <h1 id="home-title"><span className="hero-line-mask"><span>Seu cliente agenda.</span></span><span className="hero-line-mask"><span>Você cuida do negócio.</span></span></h1>
            <p>Reúna sua página profissional, serviços, equipe e disponibilidade em um só lugar. O cliente encontra um horário livre e envia a reserva sem depender de uma conversa.</p>
            <div className="hero-actions"><Link className="button" href="/cadastro">Criar minha página <ArrowRight size={18} /></Link><a className="button button-secondary" href="#como-funciona">Ver como funciona</a></div>
            <div className="trust-line"><span><Check size={16} /> Configuração guiada</span><span><Check size={16} /> Feito para celular</span><span><Check size={16} /> Publicação sob seu controle</span></div>
          </div>
        </div>
      </section>

      <Reveal className="motion-section"><section className="v2-section v2-problem page-shell" aria-labelledby="problem-title">
        <div className="v2-section-heading"><h2 id="problem-title">O atendimento não deveria parar para organizar a agenda.</h2><p>No dia a dia, uma reserva simples pode se espalhar por várias mensagens e interromper o trabalho.</p></div>
        <div className="problem-list">
          <article><BellRing /><div><h3>Interrupções durante o atendimento</h3><p>Responder enquanto atende quebra o ritmo e exige atenção em dois lugares.</p></div></article>
          <article><MessageCircleMore /><div><h3>Troca de mensagens sobre horários</h3><p>Serviço, profissional e disponibilidade precisam ser combinados a cada conversa.</p></div></article>
          <article><CalendarCheck /><div><h3>Reservas espalhadas nas conversas</h3><p>Quando a informação fica no chat, acompanhar o dia se torna mais difícil.</p></div></article>
        </div>
      </section></Reveal>

      <Reveal className="motion-section"><section className="v2-section v2-booking" id="como-funciona" aria-labelledby="booking-title">
        <div className="page-shell v2-split">
          <div className="v2-section-heading"><h2 id="booking-title">Como funciona para o cliente.</h2><p>Um caminho curto da página do negócio até a reserva recebida na sua agenda.</p><ul className="plain-checks"><li><Check /> Abre o link divulgado</li><li><Check /> Escolhe atendimento e horário</li><li><Check /> Informa os dados de contato</li><li><Check /> Envia a reserva como pendente</li></ul></div>
          <BookingDemo />
        </div>
      </section></Reveal>

      <Reveal className="motion-section"><section className="v2-section v2-start page-shell" aria-labelledby="start-title">
        <div className="v2-section-heading"><h2 id="start-title">Como você começa.</h2><p>Quatro etapas deixam a estrutura pronta para receber reservas com as regras do seu negócio.</p></div>
        <StartTimeline />
      </section></Reveal>

      <Reveal className="motion-section"><section className="v2-section v2-comparison" aria-labelledby="time-title"><div className="page-shell v2-split">
        <div className="v2-section-heading"><h2 id="time-title">Mais tempo para atender.</h2><p>Compare o trabalho de combinar tudo por mensagens com o caminho que o cliente percorre sozinho na página.</p></div>
        <TimeComparison />
      </div></section></Reveal>

      <Reveal className="motion-section"><section className="v2-section v2-dashboard page-shell" id="recursos" aria-labelledby="organized-title">
        <div className="v2-section-heading"><h2 id="organized-title">Seu negócio organizado.</h2><p>Use as abas para conhecer o papel de cada área do painel.</p></div>
        <DashboardExplorer />
      </section></Reveal>

      <Reveal className="motion-section"><section className="v2-section v2-public-page" aria-labelledby="public-title"><div className="page-shell v2-split">
        <div className="v2-section-heading"><h2 id="public-title">Sua página profissional.</h2><p>Identidade, serviços, equipe, localização e agendamento aparecem em uma experiência feita para o celular.</p><Link className="inline-arrow" href="/cadastro">Montar minha página <ArrowRight size={18} /></Link></div>
        <PhonePreview />
      </div></section></Reveal>

      <Reveal className="motion-section"><section className="v2-section v2-plan page-shell" id="plano" aria-labelledby="plan-title">
        <div className="v2-section-heading centered"><h2 id="plan-title">Preço e o que está incluído.</h2><p>O valor será apresentado antes do lançamento comercial.</p></div>
        <div className="v2-plan-card"><span>Plano inicial</span><h3>Agendamento + página personalizada</h3><strong>Valor anunciado em breve</strong><ul><li><Check /> Página pública do negócio</li><li><Check /> Agenda online sem conflito de horários</li><li><Check /> Serviços, profissionais e disponibilidade</li><li><Check /> Painel administrativo e histórico de clientes</li></ul><Link className="button" href="/cadastro">Criar minha conta <ArrowRight size={18} /></Link></div>
      </section></Reveal>

      <Reveal className="motion-section"><section className="v2-section v2-faq page-shell" id="duvidas" aria-labelledby="faq-title"><div className="v2-section-heading"><h2 id="faq-title">Dúvidas frequentes.</h2><p>Respostas diretas sobre sua página e sua agenda.</p></div><MarketingFaq /></section></Reveal>

      <Reveal className="motion-section"><section className="v2-final-cta"><div className="page-shell"><div><h2>Prepare sua página e comece a receber agendamentos.</h2><p>Configure o negócio, revise o resultado e publique quando estiver pronto.</p></div><Link className="button" href="/cadastro">Começar agora <ArrowRight size={18} /></Link></div></section></Reveal>

      <footer className="site-footer page-shell"><div><Link className="brand" href="/"><span className="brand-mark">A</span><span>{brand.name}</span></Link><p>{brand.description}</p></div><div><strong>Produto</strong><a href="#como-funciona">Como funciona</a><a href="#recursos">Recursos</a><a href="#plano">Plano</a></div><div><strong>Acesso</strong><Link href="/entrar">Entrar</Link><Link href="/cadastro">Criar conta</Link></div><p className="footer-note">© 2026 {brand.name}. Projeto em desenvolvimento.</p></footer>
    </main>
  );
}
