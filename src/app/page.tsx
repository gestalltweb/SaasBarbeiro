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

const agenda = [
  { time: "09:00", name: "Marcos", service: "Corte", tone: "green" },
  { time: "10:00", name: "Horário livre", service: "Disponível online", tone: "free" },
  { time: "11:30", name: "Bruno", service: "Corte + barba", tone: "yellow" },
  { time: "14:00", name: "Rafael", service: "Barba", tone: "red" },
];

export default function Home() {
  return (
    <main>
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
          <h1>Seu negócio aberto para agendamentos. <em>O dia inteiro.</em></h1>
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
            <span><Check size={16} /> Cancele quando quiser</span>
          </div>
        </div>

        <div className="schedule-scene" aria-label="Exemplo visual de agenda organizada">
          <div className="schedule-topline">
            <div><span>Hoje</span><strong>Terça, 29 de setembro</strong></div>
            <span className="online-dot">Agenda online</span>
          </div>
          <div className="schedule-list">
            {agenda.map((item, index) => (
              <div className={`schedule-row schedule-${item.tone}`} key={item.time} style={{ "--delay": `${index * 130}ms` } as React.CSSProperties}>
                <time>{item.time}</time><span className="schedule-pin" />
                <div><strong>{item.name}</strong><span>{item.service}</span></div>
                {item.tone !== "free" && <Check size={17} />}
              </div>
            ))}
          </div>
          <div className="schedule-footer"><span>Exemplo visual de agenda</span><span>Atualização em tempo real</span></div>
        </div>
      </section>

      <section className="proof-strip" aria-label="Benefícios principais">
        <span><Link2 size={19} /> Um link para divulgar</span>
        <span><Clock3 size={19} /> Menos tempo no WhatsApp</span>
        <span><CalendarCheck size={19} /> Sem choque de horários</span>
        <span><ShieldCheck size={19} /> Dados de cada negócio isolados</span>
      </section>

      <section className="story-section page-shell" id="como-funciona">
        <div className="story-heading"><h2>Do Instagram para uma agenda confirmada.</h2><p>O caminho é curto para quem divulga e ainda mais curto para quem agenda.</p></div>
        <div className="journey">
          <article><span className="step-icon"><AtSign size={23} /></span><h3>Divulgue seu link</h3><p>Coloque sua página na bio, no Google ou envie diretamente pelo WhatsApp.</p></article>
          <span className="journey-arrow"><ArrowRight /></span>
          <article><span className="step-icon"><Users size={23} /></span><h3>Seu cliente escolhe</h3><p>Ele conhece seu trabalho, compara serviços e vê somente horários livres.</p></article>
          <span className="journey-arrow"><ArrowRight /></span>
          <article><span className="step-icon"><CalendarCheck size={23} /></span><h3>Você recebe organizado</h3><p>O agendamento entra na agenda do profissional, pronto para ser atendido.</p></article>
        </div>
      </section>

      <section className="showcase" id="recursos">
        <div className="page-shell showcase-grid">
          <div className="phone-frame">
            <div className="phone-browser"><span /><span>{getSiteUrl()}/barbearia-modelo</span></div>
            <div className="phone-cover"><span className="mini-logo">RB</span><p>Barbearia Modelo</p><h3>Seu estilo começa com hora marcada.</h3><div className="phone-location"><MapPin size={14} /> Centro · São Paulo</div></div>
            <div className="phone-services"><span>Serviços</span><div><strong>Corte clássico</strong><b>R$ 45</b><small>40 min</small></div><div><strong>Corte + barba</strong><b>R$ 70</b><small>60 min</small></div><button>Escolher um horário</button></div>
          </div>
          <div className="showcase-copy">
            <h2>Uma página que trabalha antes de você responder.</h2>
            <p>Sua identidade, seus serviços e sua disponibilidade real em uma experiência pensada para transformar visitas em horários marcados.</p>
            <ul><li><Check /> Link exclusivo para o seu negócio</li><li><Check /> Serviços, preços e duração</li><li><Check /> Profissionais e horários disponíveis</li><li><Check /> Localização e contato em um só lugar</li></ul>
            <Link className="inline-arrow" href="/cadastro">Criar minha página <ArrowRight size={18} /></Link>
          </div>
        </div>
      </section>

      <section className="dashboard-section page-shell">
        <div className="dashboard-copy"><h2>Seu dia inteiro, sem procurar conversa por conversa.</h2><p>Veja o que vem a seguir, organize a equipe e mantenha as informações do negócio atualizadas em um painel direto.</p><div className="feature-lines"><span><LayoutDashboard /> Visão clara da operação</span><span><CalendarCheck /> Agenda por profissional</span><span><Users /> Histórico dos seus clientes</span></div></div>
        <div className="dashboard-preview" aria-label="Prévia ilustrativa do painel administrativo">
          <div className="preview-sidebar"><span className="preview-mark">A</span><i /><i /><i /><i /></div>
          <div className="preview-content"><div className="preview-title"><div><small>Exemplo visual</small><strong>Sua agenda de hoje</strong></div><button>+ Novo horário</button></div><div className="preview-summary"><span><small>Agendamentos</small><b>—</b></span><span><small>Confirmados</small><b>—</b></span><span><small>Horários livres</small><b>—</b></span></div><div className="preview-table"><span>09:00</span><b>Cliente</b><small>Serviço</small><em>Confirmado</em><span>10:00</span><b>Cliente</b><small>Serviço</small><em>Confirmado</em><span>11:30</span><b>Cliente</b><small>Serviço</small><em className="pending">Pendente</em></div></div>
        </div>
      </section>

      <section className="plan-section page-shell" id="plano">
        <div className="plan-copy"><h2>Um plano simples para colocar sua agenda online.</h2><p>Comece com a página personalizada e tudo o que precisa para receber agendamentos. O valor será anunciado antes do lançamento comercial.</p></div>
        <div className="plan-board"><div><span>Plano inicial</span><strong>Agendamento + página personalizada</strong></div><ul><li><Check /> Página pública</li><li><Check /> Agenda online</li><li><Check /> Serviços e profissionais</li><li><Check /> Painel administrativo</li></ul><Link className="button" href="/cadastro">Criar minha conta <ArrowRight size={18} /></Link></div>
      </section>

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
